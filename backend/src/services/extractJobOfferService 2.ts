import Groq from "groq-sdk";

interface IExtractedJobOffer {
  title: string;
  company: string;
  description?: string | null;
  stack: string[];
  salary?: string | null;
  remote: boolean;
  location?: string | null;
  url?: string | null;
}

export async function extractJobOfferFromText(rawText: string): Promise<IExtractedJobOffer> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur d'annonces d'emploi. Analyse ce texte et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces clés : title (string, obligatoire), company (string, obligatoire — si absent du texte mettre "Entreprise non mentionnée"), description (string ou null), stack (tableau de strings, peut être vide), salary (string ou null), remote (boolean), location (string ou null), url (string ou null).

Texte de l'annonce :
${rawText}`,
      },
    ],
  });

  const raw = message.choices[0].message.content ?? "";
  console.log("Réponse brute Groq:", raw);
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
  console.log("Cleaned:", cleaned);

  try {
    const parsed = JSON.parse(cleaned) as IExtractedJobOffer;
    if (!parsed.title || !parsed.company) {
      throw new Error("Champs obligatoires manquants (title, company)");
    }
    return parsed;
  } catch (e) {
    throw new Error("Parsing JSON échoué");
  }
}
