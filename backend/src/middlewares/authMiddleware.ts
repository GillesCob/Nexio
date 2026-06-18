import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorMiddleware'
import type { ITokenPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'Unauthorized')
  }

  const token = authorization.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload
    req.user = payload
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}
