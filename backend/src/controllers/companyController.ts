import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import { extractCompanyFromText } from '../services/extractCompanyService'
import { prisma } from '../lib/prisma'

const extractSchema = z.object({ rawText: z.string().min(1) })

export async function extractCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rawText } = extractSchema.parse(req.body)
    const extracted = await extractCompanyFromText(rawText)
    const company = await prisma.company.create({ data: extracted })
    res.status(201).json(company)
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else if (err instanceof SyntaxError) {
      next(new AppError(422, 'Impossible de parser la réponse du modèle'))
    } else {
      next(err)
    }
  }
}
