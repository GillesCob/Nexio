import Groq from 'groq-sdk'
import { prisma } from '../lib/prisma'
import { MY_STACK } from '../data/myStack'

interface IStackScore {
  score: number
  matches: string[]
  gaps: string[]
  comment: string
}

export async function scoreJobOfferStack(jobOfferId: string, stack: string[]): Promise<void> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const message = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Tu es un évaluateur de correspondance entre une offre d'emploi et le profil d'un développeur. Retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec exactement ces clés :
- score : nombre entier entre 0 et 10 représentant la correspondance globale
- matches : tableau de strings listant les technologies de l'annonce que le développeur maîtrise
- gaps : tableau de strings listant les technologies de l'annonce que le développeur ne maîtrise pas
- comment : string, une phrase d'évaluation synthétique en français

Stack de l'annonce : ${JSON.stringify(stack)}

Stack du développeur :
- Maîtrise principale (core) : ${JSON.stringify(MY_STACK.core)}
- Connaît bien (known) : ${JSON.stringify(MY_STACK.known)}
- En cours d'apprentissage (learning) : ${JSON.stringify(MY_STACK.learning)}`,
      },
    ],
  })

  const raw = message.choices[0].message.content ?? ''
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned) as IStackScore

  await prisma.jobOffer.update({
    where: { id: jobOfferId },
    data: {
      score: Math.round(parsed.score),
      scoreMatches: parsed.matches ?? [],
      scoreGaps: parsed.gaps ?? [],
      scoreComment: parsed.comment ?? null,
    },
  })
}
