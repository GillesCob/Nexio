import Groq from "groq-sdk";

interface IExtractedContact {
  name: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
}

export async function extractContactFromText(rawText: string): Promise<IExtractedContact> {
  console.log("extractContactFromText appelé avec:", rawText?.slice(0, 100));

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur de données LinkedIn. Analyse ce texte et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces clés : name (string, obligatoire), company (string ou null), linkedinUrl (string ou null), jobTitle (string ou null).

Texte LinkedIn :
${rawText}`,
      },
    ],
  });

  console.log("Réponse brute Groq:", message.choices[0].message.content);

  const raw = message.choices[0].message.content ?? "";

  try {
    return JSON.parse(raw) as IExtractedContact;
  } catch (e) {
    console.error("JSON.parse échoué. Réponse reçue:", raw);
    throw new Error("Parsing JSON échoué");
  }
}
