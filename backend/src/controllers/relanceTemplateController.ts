import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import { suggestRelance } from '../services/relanceTemplateService'

const paramsSchema = z.object({ id: z.string() })

export async function suggestRelanceController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params)
    const userId = req.user!.userId
    const message = await suggestRelance(userId, id)
    res.json({ message })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}
