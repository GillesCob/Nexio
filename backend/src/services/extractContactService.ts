import { createChatCompletion } from "../lib/groqClient";

interface IExtractedContact {
  name: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  location?: string;
}

export async function extractContactFromText(rawText: string): Promise<IExtractedContact> {
  console.log("extractContactFromText appelé avec:", rawText?.slice(0, 100));

  const message = await createChatCompletion({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Tu es un extracteur de données LinkedIn. Analyse ce texte et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces clés : name (string, obligatoire), company (string ou null), linkedinUrl (string ou null), jobTitle (string ou null), location (string ou null, la ville uniquement, ex. "Casablanca" et non "Casablanca, Casablanca-Settat, Maroc").

Texte LinkedIn :
${rawText}`,
      },
    ],
  });

  console.log("Réponse brute Groq:", message.choices[0].message.content);

  const raw = message.choices[0].message.content ?? "";
  const cleaned = raw
    .replace(/```[\w]*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as IExtractedContact;
  } catch (e) {
    console.error("JSON.parse échoué. Réponse reçue:", raw);
    throw new SyntaxError("Parsing JSON échoué");
  }
}
