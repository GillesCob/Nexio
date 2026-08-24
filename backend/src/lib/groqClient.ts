import Groq, { APIError } from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

const FALLBACK_MODEL = "openai/gpt-oss-20b";
// Une fois le modèle principal détecté en rate-limit, on le saute directement pendant ce délai
// au lieu de le retenter (et payer l'aller-retour perdu) à chaque appel — sous forte charge, ça
// doublait le temps de réponse de chaque extraction. Ré-essayé automatiquement passé ce délai,
// pas besoin de redéployer si le quota se libère entre-temps.
const PRIMARY_COOLDOWN_MS = 10 * 60_000;

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

let primaryRateLimitedUntil = 0;

// Incident du 24/08 : "llama-3.3-70b-versatile" (et son ancien fallback
// "llama-3.1-8b-instant") retirés du catalogue Groq, 400 "model_not_found" sur CHAQUE appel,
// jamais rattrapé car ce garde-fou ne réagissait qu'aux 429 (rate-limit), pas aux modèles
// indisponibles/renommés. Élargi pour aussi basculer sur le fallback dans ce cas : un modèle
// qui disparaît à nouveau du catalogue Groq degrade proprement au lieu de casser silencieusement
// toutes les fonctionnalités IA de l'app (extraction, scoring, classification, stats LinkedIn...).
function isModelUnavailable(err: unknown): boolean {
  return (
    err instanceof APIError &&
    err.status === 400 &&
    typeof (err as { error?: { code?: string } }).error?.code === "string" &&
    (err as { error?: { code?: string } }).error!.code === "model_not_found"
  );
}

export async function createChatCompletion(params: ChatCompletionCreateParamsNonStreaming) {
  const isPrimaryModel = params.model !== FALLBACK_MODEL;

  if (isPrimaryModel && Date.now() < primaryRateLimitedUntil) {
    return client.chat.completions.create({ ...params, model: FALLBACK_MODEL });
  }

  try {
    return await client.chat.completions.create(params);
  } catch (err) {
    if (err instanceof APIError && (err.status === 429 || isModelUnavailable(err)) && isPrimaryModel) {
      const reason = err.status === 429 ? "rate limité (429)" : "modèle indisponible (model_not_found)";
      console.error(
        `[groqClient] ${params.model} ${reason}, fallback vers ${FALLBACK_MODEL} (sauté directement pendant ${PRIMARY_COOLDOWN_MS / 1000}s)`
      );
      primaryRateLimitedUntil = Date.now() + PRIMARY_COOLDOWN_MS;
      return client.chat.completions.create({ ...params, model: FALLBACK_MODEL });
    }
    throw err;
  }
}
