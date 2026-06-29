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
  await assertContactOwnership(userId, contactId)
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { contactId, content } }),
    prisma.contact.update({ where: { id: contactId }, data: { status: 'contacted' } }),
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
