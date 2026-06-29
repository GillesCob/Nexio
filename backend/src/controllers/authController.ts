import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as authService from '../services/authService'
import { AppError } from '../middlewares/errorMiddleware'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  userId: z.string(),
  newPassword: z.string().min(8),
})

export async function register(_req: Request, res: Response, _next: NextFunction): Promise<void> {
  // TODO: re-enable when multi-tenant is ready
  res.status(403).json({
    error: 'Registration is disabled',
    message: 'Public registration is currently disabled. Demo account is available via the login page.',
  })
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const { accessToken, refreshToken, user } = await authService.login(email, password)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({ accessToken, user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      next(new AppError(401, 'No refresh token'))
      return
    }
    const result = await authService.refresh(refreshToken)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId
    if (userId) await authService.logout(userId)
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const user = await authService.me(userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(email)
    res.json({ message: 'If this email exists, a reset link has been sent.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, userId, newPassword } = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(token, userId, newPassword)
    res.json({ message: 'Password reset successfully.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, err.errors[0].message))
    } else {
      next(err)
    }
  }
}
