import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { APIError } from 'groq-sdk'
import { AppError } from '../middlewares/errorMiddleware'
import { extractCompanyFromText } from '../services/extractCompanyService'
import * as companyService from '../services/companyService'
import { prisma } from '../lib/prisma'

const extractSchema = z.object({ rawText: z.string().min(1), contactId: z.string().optional() })
const enrichParamsSchema = z.object({ id: z.string() })
const enrichBodySchema = z.object({ rawText: z.string().min(1) })
const updateParamsSchema = z.object({ id: z.string() })
const updateBodySchema = z.object({
  sector: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
})

function toGroqAppError(err: APIError): AppError {
  if (err.status !== 429) {
    return new AppError(502, "Erreur du service d'extraction IA, réessaie.")
  }

  // Le corps de l'erreur Groq contient le quota réel ("Used X, Limit Y", délai avant retry) :
  // plus utile qu'un message générique pour savoir si ça vaut le coup de réessayer maintenant.
  const raw = (err as { error?: { error?: { message?: string } } }).error?.error?.message
  return new AppError(429, raw ? `Quota Groq atteint : ${raw}` : 'Quota Groq quotidien atteint, réessaie plus tard.')
}

export async function extractCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rawText, contactId } = extractSchema.parse(req.body)
    const extracted = await extractCompanyFromText(rawText)

    const existing = await prisma.company.findFirst({
      where: { name: { equals: extracted.name, mode: 'insensitive' } },
    })

    const company = existing
      ? await prisma.company.update({ where: { id: existing.id }, data: extracted })
      : await prisma.company.create({ data: extracted })

    if (contactId) {
      await companyService.linkAndClassifyContact(company, contactId)
    }

    // Secteur manquant = classification de flux impossible en aval, en silence sinon : signalé
    // explicitement pour que Gilles sache qu'il doit le compléter à la main (PATCH /companies/:id).
    const warning = company.sector ? undefined : 'Secteur non détecté par l\'IA, à compléter manuellement pour permettre la classification.'

    res.status(existing ? 200 : 201).json({ ...company, warning })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else if (err instanceof SyntaxError) {
      next(new AppError(422, 'Impossible de parser la réponse du modèle'))
    } else if (err instanceof APIError) {
      next(toGroqAppError(err))
    } else {
      next(err)
    }
  }
}

export async function enrichCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = enrichParamsSchema.parse(req.params)
    const { rawText } = enrichBodySchema.parse(req.body)
    const company = await companyService.enrichCompany(id, rawText)
    const warning = company.sector ? undefined : 'Secteur non détecté par l\'IA, à compléter manuellement pour permettre la classification.'
    res.json({ ...company, warning })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else if (err instanceof APIError) {
      next(toGroqAppError(err))
    } else {
      next(err)
    }
  }
}

// Édition manuelle (secteur en priorité) : quand l'IA a oublié un champ ou qu'on veut le
// corriger directement, sans repasser par une extraction Groq. Reclassifie automatiquement les
// contacts de cette entreprise encore sans flux si le secteur vient d'être renseigné.
export async function updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = updateParamsSchema.parse(req.params)
    const data = updateBodySchema.parse(req.body)
    const company = await companyService.updateCompany(id, data)
    res.json(company)
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}
