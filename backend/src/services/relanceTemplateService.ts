import Groq from 'groq-sdk'
import { prisma } from '../lib/prisma'
import { relanceTemplates } from '../data/relanceTemplates'
import { AppError } from '../middlewares/errorMiddleware'

export async function suggestRelance(userId: string, contactId: string): Promise<string> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { companyRef: true },
  })

  if (!contact || contact.userId !== userId) throw new AppError(404, 'Contact not found')

  const firstName = contact.name.split(' ')[0]
  const companyName = contact.companyRef?.name ?? 'votre entreprise'

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const message = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Tu es un assistant de prospection LinkedIn. Voici le profil du contact :
- Prénom : ${firstName}
- Poste : ${contact.jobTitle ?? 'inconnu'}
- Entreprise : ${contact.companyRef?.name ?? 'inconnue'}
- Secteur entreprise : ${contact.companyRef?.sector ?? 'inconnu'}
- Taille entreprise : ${contact.companyRef?.size ?? 'inconnue'}

Voici les templates de relance disponibles (au format JSON) :
${JSON.stringify(relanceTemplates)}

Choisis le template le plus adapté au profil du contact. Retourne UNIQUEMENT le body du template choisi, avec {{firstName}} remplacé par "${firstName}" et {{companyName}} remplacé par "${companyName}". Aucune explication, aucun markdown.`,
      },
    ],
  })

  return message.choices[0].message.content ?? ''
}
