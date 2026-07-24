import Groq, { APIError } from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

const FALLBACK_MODEL = "llama-3.1-8b-instant";
// Une fois le modèle principal détecté en rate-limit, on le saute directement pendant ce délai
// au lieu de le retenter (et payer l'aller-retour perdu) à chaque appel — sous forte charge, ça
// doublait le temps de réponse de chaque extraction. Ré-essayé automatiquement passé ce délai,
// pas besoin de redéployer si le quota se libère entre-temps.
const PRIMARY_COOLDOWN_MS = 10 * 60_000;

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

let primaryRateLimitedUntil = 0;

export async function createChatCompletion(params: ChatCompletionCreateParamsNonStreaming) {
  const isPrimaryModel = params.model !== FALLBACK_MODEL;

  if (isPrimaryModel && Date.now() < primaryRateLimitedUntil) {
    return client.chat.completions.create({ ...params, model: FALLBACK_MODEL });
  }

  try {
    return await client.chat.completions.create(params);
  } catch (err) {
    if (err instanceof APIError && err.status === 429 && isPrimaryModel) {
      console.error(
        `[groqClient] ${params.model} rate limité (429), fallback vers ${FALLBACK_MODEL} (sauté directement pendant ${PRIMARY_COOLDOWN_MS / 1000}s)`
      );
      primaryRateLimitedUntil = Date.now() + PRIMARY_COOLDOWN_MS;
      return client.chat.completions.create({ ...params, model: FALLBACK_MODEL });
    }
    throw err;
  }
}
