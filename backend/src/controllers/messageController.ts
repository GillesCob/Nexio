import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import * as messageService from '../services/messageService'

const paramsSchema = z.object({ id: z.string() })
const createMessageSchema = z.object({ content: z.string().min(1) })

function handleZod(err: unknown, next: NextFunction) {
  if (err instanceof z.ZodError) {
    next(new AppError(400, err.errors[0].message))
  } else {
    next(err)
  }
}

export async function createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const { content } = createMessageSchema.parse(req.body)
    const message = await messageService.createMessage(userId, id, content)
    res.status(201).json(message)
  } catch (err) {
    handleZod(err, next)
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const messages = await messageService.getMessages(userId, id)
    res.json(messages)
  } catch (err) {
    handleZod(err, next)
  }
}
