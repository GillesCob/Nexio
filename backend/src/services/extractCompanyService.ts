import Groq from "groq-sdk";
import { z } from "zod";

interface IExtractedCompany {
  name: string;
  sector?: string | null;
  size?: string | null;
  description?: string | null;
  linkedinUrl?: string | null;
  companyType: "ESN" | "ENTERPRISE" | "UNKNOWN";
}

const groqResponseSchema = z.object({
  name: z.string(),
  sector: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  companyType: z.enum(["ESN", "ENTERPRISE", "UNKNOWN"]).catch("UNKNOWN"),
});

export async function extractCompanyFromText(rawText: string): Promise<IExtractedCompany> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur de données LinkedIn entreprise. Retourne UNIQUEMENT un objet JSON valide (sans markdown) avec ces clés : name (string, obligatoire), sector (string ou null), size (string ou null), description (string ou null), linkedinUrl (string ou null), companyType (string, obligatoire).

Classe aussi cette entreprise selon son type :
- "ESN" si c'est clairement une société de services numériques, ingénierie informatique, conseil IT, prestation, infogérance, intégration. Mots-clés type "consulting", "services", "intégrateur", "ESN", "expertise IT", "consultants", "missions client", "régie", "forfait".
- "ENTERPRISE" si c'est une entreprise classique avec son propre métier (industrie, finance, commerce, santé, retail, immobilier, etc.) qui recrute pour ses besoins internes.
- "UNKNOWN" si tu ne peux pas trancher avec les infos disponibles.

Texte LinkedIn :
${rawText}`,
      },
    ],
  });

  const raw = message.choices[0].message.content ?? "";
  const cleaned = raw
    .replace(/```[\w]*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Parsing JSON échoué");
  }

  return groqResponseSchema.parse(parsed);
}
