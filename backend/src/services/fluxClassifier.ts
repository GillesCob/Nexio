import Groq from 'groq-sdk'
import { z } from 'zod'

export interface IFluxClassifierInput {
  jobTitle: string | null
  companyName: string | null
  companyDescription: string | null
  companySector: string | null
}

export interface IFluxClassifierResult {
  flux: '1a' | '1b' | '2' | '3' | '4' | 'unknown'
  confidence: number
  reasoning: string
  alternatives: Array<'1a' | '1b' | '2' | '3' | '4'>
}

const FLUX_CODES = ['1a', '1b', '2', '3', '4'] as const

const CLASSIFICATION_PROMPT = `Tu es un classificateur de profils LinkedIn pour de la prospection emploi.

À partir des infos suivantes, classe le contact dans UN des 5 flux :
- 1a : RH/Talent Acquisition/Chargé de recrutement travaillant dans une ESN (entreprise de services numériques, conseil IT, prestation)
- 1b : RH/Talent Acquisition/Chargé de recrutement travaillant dans une entreprise classique (recrutement interne pour ses propres équipes)
- 2 : CTO, VP Engineering, Head of Tech, Directeur technique
- 3 : Lead Dev, Tech Lead, Engineering Manager (encadrement technique sans être CTO)
- 4 : Business Manager, Directeur de projets ESN, Account Manager dans une ESN

Si tu n'as pas assez d'infos pour trancher, retourne "unknown".
Si tu hésites entre deux flux, retourne le plus probable mais signale les alternatives.

Réponds UNIQUEMENT en JSON, sans markdown ni texte autour :
{"flux": "...", "confidence": 0.X, "reasoning": "...", "alternatives": [...]}

Voici les infos du contact :
Job title : {jobTitle}
Nom de l'entreprise : {companyName}
Description : {companyDescription}
Secteur : {companySector}`

const fluxResultSchema = z.object({
  flux: z.union([z.enum(FLUX_CODES), z.literal('unknown')]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  alternatives: z.array(z.enum(FLUX_CODES)).max(2),
})

const FALLBACK_PARSE_ERROR: IFluxClassifierResult = {
  flux: 'unknown',
  confidence: 0,
  reasoning: 'parse_error',
  alternatives: [],
}

const FALLBACK_VALIDATION_ERROR: IFluxClassifierResult = {
  flux: 'unknown',
  confidence: 0,
  reasoning: 'validation_error',
  alternatives: [],
}

export async function classifyContactFlux(input: IFluxClassifierInput): Promise<IFluxClassifierResult> {
  const prompt = CLASSIFICATION_PROMPT
    .replace('{jobTitle}', input.jobTitle ?? 'non renseigné')
    .replace('{companyName}', input.companyName ?? 'non renseigné')
    .replace('{companyDescription}', input.companyDescription ?? 'non renseigné')
    .replace('{companySector}', input.companySector ?? 'non renseigné')

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const message = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.choices[0].message.content ?? ''
  const cleaned = raw
    .replace(/```[\w]*\n?/g, '')
    .replace(/```/g, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('[fluxClassifier] JSON.parse failed:', { raw, err })
    return FALLBACK_PARSE_ERROR
  }

  const result = fluxResultSchema.safeParse(parsed)
  if (!result.success) {
    console.error('[fluxClassifier] Zod validation failed:', { parsed, errors: result.error.errors })
    return FALLBACK_VALIDATION_ERROR
  }

  if (result.data.alternatives.length > 0) {
    console.error('[fluxClassifier] Alternatives detected:', {
      flux: result.data.flux,
      confidence: result.data.confidence,
      alternatives: result.data.alternatives,
    })
  }

  return result.data as IFluxClassifierResult
}
