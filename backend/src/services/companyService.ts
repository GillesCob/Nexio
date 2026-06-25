import { Prisma } from '@prisma/client'
import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'
import { extractCompanyFromText } from './extractCompanyService'
import { classifyContactFlux } from './fluxClassifier'

export async function enrichCompany(companyId: string, rawText: string) {
  const extracted = await extractCompanyFromText(rawText)

  let company
  try {
    company = await prisma.company.update({
      where: { id: companyId },
      data: extracted,
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Company not found')
    }
    throw err
  }

  if (!company.description || !company.sector) {
    return company
  }

  const companyDescription = company.description
  const companySector = company.sector

  const unclassifiedContacts = await prisma.contact.findMany({
    where: { companyId, flux: null },
  })

  if (unclassifiedContacts.length === 0) {
    return company
  }

  await Promise.all(
    unclassifiedContacts.map(async (contact) => {
      try {
        const classification = await classifyContactFlux({
          jobTitle: contact.jobTitle ?? null,
          companyName: company.name,
          companyDescription,
          companySector,
        })
        if (classification.flux !== 'unknown') {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { flux: classification.flux, fluxConfidence: classification.confidence },
          })
        }
      } catch (err) {
        console.error(`[companyService] classifyContactFlux failed for contact ${contact.id}:`, err)
      }
    })
  )

  return company
}
