import { prisma } from "../lib/prisma";
import { extractJobOfferFromText } from "./extractJobOfferService";
import { scoreJobOfferStack } from "./stackScoreService";
import { SCORING_CRITERIA } from "../data/scoringCriteria";

interface INormalizedOffer {
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  salary: string | null;
  url: string | null;
  rawText: string;
}

export interface IJobSearchResult {
  created: number;
  skippedExisting: number;
  skippedInvalid: number;
  sourceErrors: string[];
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function getFranceTravailToken(): Promise<string> {
  const clientId = process.env.FRANCETRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCETRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("FRANCETRAVAIL_CLIENT_ID / FRANCETRAVAIL_CLIENT_SECRET manquants.");
  }

  const res = await fetch(
    "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "api_offresdemploiv2 o2dsoffre",
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`France Travail auth échouée : HTTP ${res.status} — ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

async function searchFranceTravail(motsCles: string): Promise<INormalizedOffer[]> {
  const token = await getFranceTravailToken();
  const departmentBatches = chunk(SCORING_CRITERIA.targetDepartments, 5); // max 5 départements/requête
  const allResults: INormalizedOffer[] = [];

  for (const batch of departmentBatches) {
    const params = new URLSearchParams({
      motsCles,
      departement: batch.join(","),
      range: "0-49",
    });

    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok && res.status !== 206) {
      throw new Error(`France Travail search échouée : HTTP ${res.status} — ${await res.text()}`);
    }
    const json = (await res.json()) as { resultats?: unknown[] };
    const results = json.resultats ?? [];

    for (const raw of results) {
      const r = raw as {
        intitule?: string;
        entreprise?: { nom?: string };
        description?: string;
        lieuTravail?: { libelle?: string };
        salaire?: { libelle?: string };
        origineOffre?: { urlOrigine?: string };
      };
      allResults.push({
        title: r.intitule ?? "",
        company: r.entreprise?.nom ?? "Entreprise non mentionnée",
        description: r.description ?? null,
        location: r.lieuTravail?.libelle ?? null,
        salary: r.salaire?.libelle ?? null,
        url: r.origineOffre?.urlOrigine ?? null,
        rawText: [r.intitule, r.entreprise?.nom, r.lieuTravail?.libelle, r.description]
          .filter(Boolean)
          .join("\n\n"),
      });
    }
  }

  return allResults;
}

async function searchAdzuna(motsCles: string): Promise<INormalizedOffer[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("ADZUNA_APP_ID / ADZUNA_APP_KEY manquants.");
  }

  const cities = ["Bordeaux", "Pau", "Bayonne", "Mont-de-Marsan"];
  const allResults: INormalizedOffer[] = [];

  for (const city of cities) {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: motsCles,
      where: city,
      results_per_page: "20",
    });

    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/fr/search/1?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Adzuna (${city}) échoué : HTTP ${res.status} — ${await res.text()}`);
    }
    const json = (await res.json()) as { results?: unknown[] };
    const results = json.results ?? [];

    for (const raw of results) {
      const r = raw as {
        title?: string;
        company?: { display_name?: string };
        description?: string;
        location?: { display_name?: string };
        salary_min?: number;
        salary_max?: number;
        redirect_url?: string;
      };
      allResults.push({
        title: r.title ?? "",
        company: r.company?.display_name ?? "Entreprise non mentionnée",
        description: r.description ?? null,
        location: r.location?.display_name ?? null,
        salary:
          r.salary_min || r.salary_max
            ? `${Math.round(r.salary_min ?? 0)}-${Math.round(r.salary_max ?? 0)}€`
            : null,
        url: r.redirect_url ?? null,
        rawText: [r.title, r.company?.display_name, r.location?.display_name, r.description]
          .filter(Boolean)
          .join("\n\n"),
      });
    }
  }

  return allResults;
}

export async function searchAndImportJobOffers(
  userId: string,
  motsCles = "développeur fullstack"
): Promise<IJobSearchResult> {
  const sources: { name: string; fn: (motsCles: string) => Promise<INormalizedOffer[]> }[] = [
    { name: "France Travail", fn: searchFranceTravail },
    { name: "Adzuna", fn: searchAdzuna },
  ];

  let created = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;
  const sourceErrors: string[] = [];

  for (const source of sources) {
    let offers: INormalizedOffer[];
    try {
      offers = await source.fn(motsCles);
    } catch (e) {
      sourceErrors.push(`${source.name}: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    for (const offer of offers) {
      if (offer.url) {
        const existing = await prisma.jobOffer.findFirst({ where: { userId, url: offer.url } });
        if (existing) {
          skippedExisting++;
          continue;
        }
      }

      try {
        const extracted = await extractJobOfferFromText(offer.rawText);
        const jobOffer = await prisma.jobOffer.create({
          data: {
            title: extracted.title || offer.title,
            company: extracted.company || offer.company,
            description: extracted.description ?? offer.description,
            stack: extracted.stack ?? [],
            salary: extracted.salary ?? offer.salary,
            remote: extracted.remote ?? false,
            location: extracted.location ?? offer.location,
            url: offer.url,
            userId,
          },
        });
        await scoreJobOfferStack(jobOffer.id, jobOffer.stack);
        created++;
      } catch (e) {
        skippedInvalid++;
        void e;
      }
    }
  }

  return { created, skippedExisting, skippedInvalid, sourceErrors };
}
