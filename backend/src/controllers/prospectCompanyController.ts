import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import * as prospectCompanyService from '../services/prospectCompanyService'

const createSchema = z.object({
  name: z.string().min(1),
  zone: z.string().min(1).optional(),
  sector: z.string().min(1).optional(),
  note: z.number().int().min(0).max(10).optional(),
  why: z.string().min(1).optional(),
})

const paramsSchema = z.object({ id: z.string() })

export async function createProspectCompany(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = createSchema.parse(req.body)
    const prospectCompany = await prospectCompanyService.createProspectCompany(userId, data)
    res.status(201).json(prospectCompany)
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}

export async function getProspectCompanies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const prospectCompanies = await prospectCompanyService.getProspectCompanies(userId)
    res.json(prospectCompanies)
  } catch (err) {
    next(err)
  }
}

export async function deleteProspectCompany(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    await prospectCompanyService.deleteProspectCompany(userId, id)
    res.status(204).send()
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}
