import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import {
  extractLinkedInSnapshot,
  saveLinkedInSnapshot,
  getLinkedInSnapshots,
  getLinkedInReminder,
} from '../services/linkedinSnapshotService'
import { getContactStats } from '../services/contactStatsService'

const rawTextSchema = z.object({ rawText: z.string().min(1) })

export async function postLinkedInSnapshot(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rawText } = rawTextSchema.parse(req.body)
    const userId = req.user!.userId
    const extracted = await extractLinkedInSnapshot(rawText)
    const snapshot = await saveLinkedInSnapshot(userId, extracted)
    res.status(201).json(snapshot)
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}

export async function getLinkedInSnapshotsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const snapshots = await getLinkedInSnapshots(userId)
    res.json(snapshots)
  } catch (err) {
    next(err)
  }
}

export async function getLinkedInReminderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const reminder = await getLinkedInReminder(userId)
    res.json(reminder)
  } catch (err) {
    next(err)
  }
}

export async function getContactStatsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId
    const stats = await getContactStats(userId)
    res.json(stats)
  } catch (err) {
    next(err)
  }
}
