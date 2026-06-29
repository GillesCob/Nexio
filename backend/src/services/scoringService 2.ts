import Groq from "groq-sdk";
import { SCORING_CRITERIA } from "../data/scoringCriteria";

interface IScoringInput {
  name: string;
  jobTitle?: string;
  company?: string;
  location?: string;
}

export interface IScoringResult {
  compatible: boolean;
  reasons: string[];
}

export async function scoreContact(input: IScoringInput): Promise<IScoringResult> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un assistant de qualification de prospects LinkedIn pour Gilles, développeur web en reconversion (React, Node.js, TypeScript) qui cherche un emploi.

Analyse ce profil et détermine s'il correspond aux critères de ciblage.

PROFIL :
Nom : ${input.name}
Poste : ${input.jobTitle ?? "inconnu"}
Entreprise : ${input.company ?? "inconnue"}
Localisation : ${input.location ?? "inconnue"}

CRITÈRES DE COMPATIBILITÉ :
- Départements cibles : ${SCORING_CRITERIA.targetDepartments.join(", ")}
- Régions cibles : ${SCORING_CRITERIA.targetRegions.join(", ")}
- Profils recherchés : ${SCORING_CRITERIA.targetProfiles.join(", ")}
- Profils exclus : ${SCORING_CRITERIA.excludedProfiles.join(", ")}

Retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces deux clés :
- compatible : boolean (true si le profil correspond, false sinon)
- reasons : string[] (liste de 1 à 3 raisons courtes en français justifiant la décision)`,
      },
    ],
  });

  const raw = message.choices[0].message.content ?? "";
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned) as IScoringResult;
  } catch {
    throw new Error("Parsing JSON échoué");
  }
}
