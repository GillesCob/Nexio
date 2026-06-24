import Groq from "groq-sdk";

interface IExtractedCompany {
  name: string;
  sector?: string;
  size?: string;
  description?: string;
  linkedinUrl?: string;
}

export async function extractCompanyFromText(rawText: string): Promise<IExtractedCompany> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur de données LinkedIn entreprise. Retourne UNIQUEMENT un objet JSON valide (sans markdown) avec ces clés : name (string, obligatoire), sector (string ou null), size (string ou null), description (string ou null), linkedinUrl (string ou null).

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

  try {
    return JSON.parse(cleaned) as IExtractedCompany;
  } catch {
    throw new Error("Parsing JSON échoué");
  }
}
