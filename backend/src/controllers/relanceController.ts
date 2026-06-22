import { NextFunction, Request, Response } from 'express'
import * as relanceService from '../services/relanceService'

export async function getRelances(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const relances = await relanceService.getRelances(userId)
    res.json(relances)
  } catch (err) {
    next(err)
  }
}
