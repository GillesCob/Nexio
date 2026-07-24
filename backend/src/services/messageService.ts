import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'

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
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { contactId, content } }),
    prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'contacted',
        contactedAt: new Date(),
        ...(isRelance ? { relanceCount: { increment: 1 } } : {}),
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
