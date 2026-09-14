import { AppError } from '../middlewares/errorMiddleware'
import { prisma } from '../lib/prisma'

interface ICreateProspectCompanyData {
  name: string
  zone?: string | null
  sector?: string | null
  note?: number | null
  why?: string | null
}

// "bim" exclu : quasi tous les noms de la liste de prospection BIM le contiennent,
// le garder ferait matcher n'importe quelle paire de boites BIM entre elles.
const COMPANY_MATCH_STOPWORDS = new Set([
  'bim', 'conseil', 'ingenierie', 'cabinet', 'groupe', 'group', 'sas', 'sarl', 'sa',
  'france', 'national', 'international', 'bureau', 'etudes', 'etude', 'service',
  'services', 'solutions', 'management', 'consulting', 'geometres', 'geometre',
  'experts', 'expert',
])

function compactAll(name: string) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function compactCore(name: string) {
  const words = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0 && !COMPANY_MATCH_STOPWORDS.has(word))
  return words.join('')
}

// Heuristique de rapprochement entre le nom libre d'un ProspectCompany et le nom libre
// (souvent abrege/varie) d'un Contact.company : identiques une fois compactes, ou coeur
// significatif (mots-outils retires) de l'un contenu dans l'autre. Seuil de 4 caracteres
// pour eviter qu'un coeur trop court (ex. "sy") ne matche par hasard n'importe quoi.
function companiesMatch(a: string, b: string) {
  const rawA = compactAll(a)
  const rawB = compactAll(b)
  if (rawA && rawB && rawA === rawB) return true
  const coreA = compactCore(a)
  const coreB = compactCore(b)
  if (!coreA || !coreB) return false
  if (Math.min(coreA.length, coreB.length) < 4) return false
  return coreA === coreB || coreA.includes(coreB) || coreB.includes(coreA)
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
  const [prospectCompanies, contacts] = await Promise.all([
    prisma.prospectCompany.findMany({
      where: { userId, excludedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contact.findMany({
      where: { userId, company: { not: null } },
      select: { company: true },
    }),
  ])

  const contactCompanies = contacts
    .map((contact) => contact.company)
    .filter((company): company is string => !!company)

  return prospectCompanies.filter(
    (prospectCompany) => !contactCompanies.some((company) => companiesMatch(prospectCompany.name, company))
  )
}

export async function deleteProspectCompany(userId: string, prospectCompanyId: string) {
  await assertOwnership(userId, prospectCompanyId)
  await prisma.prospectCompany.update({
    where: { id: prospectCompanyId },
    data: { excludedAt: new Date() },
  })
}
