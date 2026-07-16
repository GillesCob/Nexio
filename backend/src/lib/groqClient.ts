import Groq, { APIError } from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

const FALLBACK_MODEL = "llama-3.1-8b-instant";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function createChatCompletion(params: ChatCompletionCreateParamsNonStreaming) {
  try {
    return await client.chat.completions.create(params);
  } catch (err) {
    if (err instanceof APIError && err.status === 429 && params.model !== FALLBACK_MODEL) {
      console.error(`[groqClient] ${params.model} rate limité (429), fallback vers ${FALLBACK_MODEL}`);
      return client.chat.completions.create({ ...params, model: FALLBACK_MODEL });
    }
    throw err;
  }
}
