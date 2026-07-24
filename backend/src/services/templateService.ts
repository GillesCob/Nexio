import { prisma } from '../lib/prisma'
import { templates } from '../data/templates'
import { relanceTemplates } from '../data/relanceTemplates'
import { VIDEO_LINKS } from '../data/videoLinks'
import { selectTemplate } from './templateSelector'
import { AppError } from '../middlewares/errorMiddleware'

function fillTemplate(body: string, vars: Record<string, string | null>): string {
  let result = body
  for (const [key, value] of Object.entries(vars)) {
    if (value === null) continue
    result = result.split(`{{${key}}}`).join(value)
  }
  return result
}

// Élision "de" -> "d'" devant un nom commençant par une voyelle (Axians -> d'Axians, Bordeaux -> de Bordeaux)
function withDe(name: string | null): string | null {
  if (!name) return null
  return /^[aeiouyàâäéèêëïîôöùûüAEIOUYÀÂÄÉÈÊËÏÎÔÖÙÛÜ]/.test(name) ? `d'${name}` : `de ${name}`
}

export async function suggestTemplate(userId: string, contactId: string): Promise<string> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { companyRef: true },
  })

  if (!contact || contact.userId !== userId) throw new AppError(404, 'Contact not found')

  const templateId = selectTemplate({
    flux: contact.flux,
    contactedAt: contact.contactedAt,
    relanceCount: contact.relanceCount,
  })

  if (!templateId) {
    if (contact.flux && contact.relanceCount === 1) {
      throw new AppError(
        400,
        "Dernier message (clôture) mis en pause jusqu'au 6 septembre, retour de congés estivaux — rien à générer avant."
      )
    }
    throw new AppError(
      400,
      "Ce contact n'a pas encore été classifié (flux manquant), impossible de choisir un template automatiquement. Mets à jour les infos entreprise pour déclencher la classification."
    )
  }

  const template = [...templates, ...relanceTemplates].find((t) => t.id === templateId)
  if (!template) {
    throw new AppError(500, `Template "${templateId}" introuvable.`)
  }

  const firstName = contact.name.split(' ')[0]
  const companyName = contact.companyRef?.name ?? contact.company ?? 'votre entreprise'
  const lastContactDate = contact.contactedAt
    ? contact.contactedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
    : null
  const videoLink = contact.flux ? VIDEO_LINKS[contact.flux] ?? null : null

  return fillTemplate(template.body, {
    firstName,
    companyName,
    location: contact.location,
    locationWithDe: withDe(contact.location),
    companyNameWithDe: withDe(companyName),
    lastContactDate,
    videoLink,
  })
}
