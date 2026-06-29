import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import { scoreContact } from '../services/scoringService'

const scoreSchema = z.object({
  name: z.string().min(1),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
})

export async function scoreContactController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = scoreSchema.parse(req.body)
    const result = await scoreContact(data)
    res.json(result)
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
