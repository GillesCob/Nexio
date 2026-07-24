import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'
import { FLUX_CONFIG } from '../data/fluxConfig'

async function assertContactOwnership(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact || contact.userId !== userId) {
    throw new AppError(404, 'Contact not found')
  }
  return contact
}

export async function createMessage(userId: string, contactId: string, content: string) {
  const contact = await assertContactOwnership(userId, contactId)
  // contactedAt déjà renseigné = ce nouveau message est une relance (pas le 1er contact) : incrémenter
  // relanceCount, sinon selectTemplate() renvoie indéfiniment la même version faute de progression.
  const isRelance = contact.contactedAt !== null
  const newRelanceCount = isRelance ? contact.relanceCount + 1 : contact.relanceCount

  // Un contact qui vient d'atteindre la relance finale pendant la pause estivale (cf
  // templateSelector.SUMMER_PAUSE_UNTIL) n'a plus rien à recevoir avant le 6 septembre : le
  // fermer directement plutôt que le laisser trainer en "Contacté" avec un bouton qui échoue.
  // Réouverture programmée comme "Pas pour le moment", mais vers "A relancer" et pas "Message à
  // envoyer" (cf autoReopenScheduled) puisque la relance elle-même a déjà été envoyée.
  const entersSummerPause = isRelance && newRelanceCount === 1 && new Date() < FLUX_CONFIG.SUMMER_PAUSE_UNTIL

  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { contactId, content } }),
    prisma.contact.update({
      where: { id: contactId },
      data: {
        status: entersSummerPause ? 'closed' : 'contacted',
        contactedAt: new Date(),
        ...(isRelance ? { relanceCount: { increment: 1 } } : {}),
        ...(entersSummerPause
          ? { closeReason: 'not_now', remindAt: FLUX_CONFIG.SUMMER_PAUSE_UNTIL }
          : {}),
      },
    }),
  ])
  return message
}

export async function getMessages(userId: string, contactId: string) {
  await assertContactOwnership(userId, contactId)
  return prisma.message.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
}
