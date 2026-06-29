import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import { extractJobOfferFromText } from '../services/extractJobOfferService'
import * as jobOfferService from '../services/jobOfferService'
import { scoreJobOfferStack } from '../services/stackScoreService'

const jobOfferStatusSchema = z.enum([
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
  'accepted',
])

const extractSchema = z.object({ rawText: z.string().min(1) })

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  stack: z.array(z.string()).optional(),
  salary: z.string().nullable().optional(),
  remote: z.boolean().optional(),
  location: z.string().nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal('')),
  status: jobOfferStatusSchema.optional(),
})

const paramsSchema = z.object({ id: z.string() })

function handleZod(err: unknown, next: NextFunction) {
  if (err instanceof z.ZodError) {
    next(new AppError(400, err.errors[0].message))
  } else {
    next(err)
  }
}

export async function extractAndCreateJobOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const { rawText } = extractSchema.parse(req.body)
    const extracted = await extractJobOfferFromText(rawText)
    const jobOffer = await jobOfferService.createJobOffer(userId, extracted)
    await scoreJobOfferStack(jobOffer.id, jobOffer.stack)
    const scored = await jobOfferService.getJobOfferById(userId, jobOffer.id)
    res.status(201).json(scored)
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else if (err instanceof Error && err.message === 'Parsing JSON échoué') {
      next(new AppError(422, 'Impossible de parser la réponse du modèle'))
    } else {
      next(err)
    }
  }
}

export async function getJobOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const jobOffers = await jobOfferService.getJobOffers(userId)
    res.json(jobOffers)
  } catch (err) {
    next(err)
  }
}

export async function updateJobOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const data = updateSchema.parse(req.body)
    const jobOffer = await jobOfferService.updateJobOffer(userId, id, data)
    res.json(jobOffer)
  } catch (err) {
    handleZod(err, next)
  }
}

export async function deleteJobOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    await jobOfferService.deleteJobOffer(userId, id)
    res.status(204).send()
  } catch (err) {
    handleZod(err, next)
  }
}

export async function scoreJobOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const jobOffer = await jobOfferService.getJobOfferById(userId, id)
    await scoreJobOfferStack(id, jobOffer.stack)
    const updated = await jobOfferService.getJobOfferById(userId, id)
    res.json(updated)
  } catch (err) {
    handleZod(err, next)
  }
}
