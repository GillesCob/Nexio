import Groq from "groq-sdk";
import { prisma } from "../lib/prisma";
import { STATS_CONFIG } from "../data/statsConfig";

interface IExtractedSnapshot {
  weekLabel: string;
  impressions: number;
  followers: number;
  profileViews: number;
  searchAppearances: number;
  postsCount: number;
  commentsCount: number;
}

export async function extractLinkedInSnapshot(rawText: string): Promise<IExtractedSnapshot> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur de statistiques LinkedIn. Analyse ce texte issu de la page analytics LinkedIn et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces clés :
- weekLabel (string, ex: "17 juin–23 juin") : la période de la semaine si mentionnée, sinon null
- impressions (number) : nombre d'impressions
- followers (number) : nombre d'abonnés
- profileViews (number) : nombre de vues du profil
- searchAppearances (number) : nombre d'apparitions dans les recherches
- postsCount (number) : nombre de posts publiés sur la période
- commentsCount (number) : nombre de commentaires reçus sur la période

Ignore tout pourcentage ou variation affiché à côté de ces chiffres sur la page LinkedIn, ne retourne que les valeurs brutes ci-dessus. Si une valeur est absente du texte, utilise 0.

Texte LinkedIn :
${rawText}`,
      },
    ],
  });

  const raw = message.choices[0].message.content ?? "";
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as IExtractedSnapshot;
  } catch {
    throw new Error("Parsing JSON échoué");
  }
}

export async function saveLinkedInSnapshot(userId: string, data: IExtractedSnapshot) {
  // Variations calculées par Nexio par rapport au dernier snapshot enregistré (évolution
  // réelle semaine à semaine), plutôt que de recopier le pourcentage affiché par LinkedIn
  // (qui compare à une période que Gilles ne maîtrise pas et jugée peu pertinente).
  const previous = await prisma.linkedInSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return prisma.linkedInSnapshot.create({
    data: {
      userId,
      weekLabel: data.weekLabel ?? "",
      impressions: data.impressions,
      impressionsVariation: data.impressions - (previous?.impressions ?? data.impressions),
      followers: data.followers,
      followersVariation: data.followers - (previous?.followers ?? data.followers),
      profileViews: data.profileViews,
      profileViewsVariation: data.profileViews - (previous?.profileViews ?? data.profileViews),
      searchAppearances: data.searchAppearances,
      searchAppearancesVariation:
        data.searchAppearances - (previous?.searchAppearances ?? data.searchAppearances),
      postsCount: data.postsCount,
      commentsCount: data.commentsCount,
    },
  });
}

export async function getLinkedInSnapshots(userId: string) {
  return prisma.linkedInSnapshot.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLinkedInReminder(userId: string): Promise<{
  shouldRemind: boolean;
  daysSinceLastSnapshot: number | null;
}> {
  const latest = await prisma.linkedInSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return { shouldRemind: true, daysSinceLastSnapshot: null };
  }

  const daysSince = Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return {
    shouldRemind: daysSince > STATS_CONFIG.linkedinSnapshotReminderDays,
    daysSinceLastSnapshot: daysSince,
  };
}
