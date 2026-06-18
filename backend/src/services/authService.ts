import argon2 from 'argon2'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { generateAccessToken, generateRefreshToken } from '../lib/jwt'
import { sendPasswordResetEmail } from '../lib/email'
import { AppError } from '../middlewares/errorMiddleware'
import type { ITokenPayload } from '../types'

interface IAuthResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
}

export async function register(email: string, password: string): Promise<IAuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AppError(409, 'Email already in use')

  const hashedPassword = await argon2.hash(password)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  const accessToken = generateAccessToken(user.id, user.role)
  const refreshToken = generateRefreshToken(user.id)
  const hashedRefreshToken = await argon2.hash(refreshToken)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  })

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } }
}

export async function login(email: string, password: string): Promise<IAuthResult> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new AppError(401, 'Invalid credentials')

  const passwordMatch = await argon2.verify(user.password, password)
  if (!passwordMatch) throw new AppError(401, 'Invalid credentials')

  const accessToken = generateAccessToken(user.id, user.role)
  const refreshToken = generateRefreshToken(user.id)
  const hashedRefreshToken = await argon2.hash(refreshToken)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  })

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } }
}

export async function refresh(
  refreshTokenFromCookie: string
): Promise<{ accessToken: string; user: { id: string; email: string; role: string } }> {
  let payload: ITokenPayload
  try {
    payload = jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET!) as ITokenPayload
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user?.refreshToken) throw new AppError(401, 'Refresh token not found')

  const tokenMatch = await argon2.verify(user.refreshToken, refreshTokenFromCookie)
  if (!tokenMatch) throw new AppError(401, 'Invalid refresh token')

  const accessToken = generateAccessToken(user.id, user.role)

  return { accessToken, user: { id: user.id, email: user.email, role: user.role } }
}

export async function logout(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  })
}

export async function me(userId: string): Promise<{ id: string; email: string; role: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })
  if (!user) throw new AppError(404, 'User not found')
  return user
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = await argon2.hash(rawToken)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { token: hashedToken, userId: user.id, expiresAt },
  })

  const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${rawToken}&userId=${user.id}`
  await sendPasswordResetEmail(email, resetUrl)
}

export async function resetPassword(
  rawToken: string,
  userId: string,
  newPassword: string
): Promise<void> {
  const record = await prisma.passwordResetToken.findFirst({ where: { userId } })
  if (!record) throw new AppError(400, 'Invalid or expired reset token')

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } })
    throw new AppError(400, 'Reset token has expired')
  }

  const tokenMatch = await argon2.verify(record.token, rawToken)
  if (!tokenMatch) throw new AppError(400, 'Invalid or expired reset token')

  const hashedPassword = await argon2.hash(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  await prisma.passwordResetToken.delete({ where: { id: record.id } })
}
