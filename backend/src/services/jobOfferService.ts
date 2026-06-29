import { JobOfferStatus } from '@prisma/client'
import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'

interface ICreateJobOfferData {
  title: string
  company: string
  description?: string | null
  stack?: string[]
  salary?: string | null
  remote?: boolean
  location?: string | null
  url?: string | null
  status?: JobOfferStatus
}

interface IUpdateJobOfferData {
  title?: string
  company?: string
  description?: string | null
  stack?: string[]
  salary?: string | null
  remote?: boolean
  location?: string | null
  url?: string | null
  status?: JobOfferStatus
}

async function assertOwnership(userId: string, jobOfferId: string) {
  const jobOffer = await prisma.jobOffer.findUnique({ where: { id: jobOfferId } })
  if (!jobOffer || jobOffer.userId !== userId) {
    throw new AppError(404, 'Job offer not found')
  }
  return jobOffer
}

export async function createJobOffer(userId: string, data: ICreateJobOfferData) {
  return prisma.jobOffer.create({ data: { ...data, userId } })
}

export async function getJobOfferById(userId: string, jobOfferId: string) {
  return assertOwnership(userId, jobOfferId)
}

export async function getJobOffers(userId: string) {
  return prisma.jobOffer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateJobOffer(userId: string, jobOfferId: string, data: IUpdateJobOfferData) {
  await assertOwnership(userId, jobOfferId)
  return prisma.jobOffer.update({ where: { id: jobOfferId }, data })
}

export async function deleteJobOffer(userId: string, jobOfferId: string) {
  await assertOwnership(userId, jobOfferId)
  await prisma.jobOffer.delete({ where: { id: jobOfferId } })
}
