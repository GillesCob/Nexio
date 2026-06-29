import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import { suggestTemplate } from '../services/templateService'

const paramsSchema = z.object({ id: z.string() })

export async function suggestTemplateController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params)
    const userId = req.user!.userId
    const message = await suggestTemplate(userId, id)
    res.json({ message })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}
