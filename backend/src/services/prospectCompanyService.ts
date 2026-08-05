import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'

interface ICreateProspectCompanyData {
  name: string
  zone?: string | null
  sector?: string | null
  note?: number | null
  why?: string | null
}

async function assertOwnership(userId: string, prospectCompanyId: string) {
  const prospectCompany = await prisma.prospectCompany.findUnique({
    where: { id: prospectCompanyId },
  })
  if (!prospectCompany || prospectCompany.userId !== userId) {
    throw new AppError(404, 'Prospect company not found')
  }
  return prospectCompany
}

export async function createProspectCompany(userId: string, data: ICreateProspectCompanyData) {
  return prisma.prospectCompany.create({ data: { ...data, userId } })
}

export async function getProspectCompanies(userId: string) {
  return prisma.prospectCompany.findMany({
    where: { userId, excludedAt: null },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteProspectCompany(userId: string, prospectCompanyId: string) {
  await assertOwnership(userId, prospectCompanyId)
  await prisma.prospectCompany.update({
    where: { id: prospectCompanyId },
    data: { excludedAt: new Date() },
  })
}
