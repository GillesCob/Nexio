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

// Housekeeping declenche au chargement du dashboard : promeut les contacts "Contacte" stagnants
// vers "A relancer", et ferme les "Echange en cours" qui n'ont plus bouge depuis trop longtemps.
export async function autoPromoteToFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const [promoted, closed] = await Promise.all([
      relanceService.autoPromoteToFollowUp(userId),
      relanceService.autoCloseStaleReplied(userId),
    ])
    res.json({ promoted, closed })
  } catch (err) {
    next(err)
  }
}
