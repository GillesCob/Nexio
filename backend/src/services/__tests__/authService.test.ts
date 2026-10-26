import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    passwordResetToken: { deleteMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
  },
}))
jest.mock('../../lib/email', () => ({ sendPasswordResetEmail: jest.fn() }))

import { prisma } from '../../lib/prisma'
import { sendPasswordResetEmail } from '../../lib/email'
import * as authService from '../authService'
import { AppError } from '../../middlewares/errorMiddleware'

const db = prisma as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock }
  passwordResetToken: { deleteMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; delete: jest.Mock }
}

async function rejection(p: Promise<unknown>): Promise<AppError> {
  try {
    await p
  } catch (err) {
    return err as AppError
  }
  throw new Error("aurait dû être rejeté")
}

beforeEach(() => {
  jest.resetAllMocks()
})

describe('authService.login', () => {
  it("connecte un utilisateur valide, renvoie les tokens et stocke le refresh token hashé (jamais en clair)", async () => {
    const hash = await argon2.hash('motdepasse1')
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.fr', role: 'USER', password: hash })
    db.user.update.mockResolvedValue({})

    const result = await authService.login('a@b.fr', 'motdepasse1')

    expect(result.user).toEqual({ id: 'u1', email: 'a@b.fr', role: 'USER' })
    expect((jwt.verify(result.accessToken, process.env.JWT_SECRET!) as jwt.JwtPayload).userId).toBe('u1')
    const stored = db.user.update.mock.calls[0][0].data.refreshToken as string
    expect(stored).not.toBe(result.refreshToken)
    expect(await argon2.verify(stored, result.refreshToken)).toBe(true)
  })

  it("refuse un email inconnu avec le même message qu'un mauvais mot de passe (401, pas d'énumération)", async () => {
    db.user.findUnique.mockResolvedValue(null)
    const unknown = await rejection(authService.login('x@y.fr', 'motdepasse1'))

    const hash = await argon2.hash('autre-mot-de-passe')
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.fr', role: 'USER', password: hash })
    const wrong = await rejection(authService.login('a@b.fr', 'motdepasse1'))

    expect(unknown.statusCode).toBe(401)
    expect(wrong.statusCode).toBe(401)
    expect(unknown.message).toBe(wrong.message)
    expect(db.user.update).not.toHaveBeenCalled()
  })
})

describe('authService.register', () => {
  it("refuse un email déjà utilisé (409) sans rien créer", async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1' })
    const err = await rejection(authService.register('a@b.fr', 'motdepasse1'))
    expect(err.statusCode).toBe(409)
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it("stocke le mot de passe hashé avec argon2, jamais en clair", async () => {
    db.user.findUnique.mockResolvedValue(null)
    db.user.create.mockImplementation(async ({ data }: { data: { email: string; password: string } }) => ({
      id: 'u2', email: data.email, role: 'USER', password: data.password,
    }))
    db.user.update.mockResolvedValue({})
    await authService.register('n@b.fr', 'motdepasse1')
    const stored = db.user.create.mock.calls[0][0].data.password as string
    expect(stored).not.toBe('motdepasse1')
    expect(await argon2.verify(stored, 'motdepasse1')).toBe(true)
  })
})

describe('authService.refresh', () => {
  it("refuse un refresh token invalide ou signé avec le mauvais secret (401)", async () => {
    const bad = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET!)
    expect((await rejection(authService.refresh(bad))).statusCode).toBe(401)
    expect((await rejection(authService.refresh('nimportequoi'))).statusCode).toBe(401)
  })

  it("refuse si l'utilisateur n'a plus de refresh token stocké (après logout)", async () => {
    const token = jwt.sign({ userId: 'u1' }, process.env.JWT_REFRESH_SECRET!)
    db.user.findUnique.mockResolvedValue({ id: 'u1', refreshToken: null })
    expect((await rejection(authService.refresh(token))).statusCode).toBe(401)
  })

  it("refuse un refresh token valide mais différent de celui stocké (rotation, ancien token)", async () => {
    const current = jwt.sign({ userId: 'u1', n: 'courant' }, process.env.JWT_REFRESH_SECRET!)
    const old = jwt.sign({ userId: 'u1', n: 'ancien' }, process.env.JWT_REFRESH_SECRET!)
    db.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER', email: 'a@b.fr', refreshToken: await argon2.hash(current) })
    expect((await rejection(authService.refresh(old))).statusCode).toBe(401)
  })

  it("émet un nouvel access token pour le refresh token stocké", async () => {
    const token = jwt.sign({ userId: 'u1' }, process.env.JWT_REFRESH_SECRET!)
    db.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER', email: 'a@b.fr', refreshToken: await argon2.hash(token) })
    const result = await authService.refresh(token)
    expect((jwt.verify(result.accessToken, process.env.JWT_SECRET!) as jwt.JwtPayload).userId).toBe('u1')
    expect(result.user.email).toBe('a@b.fr')
  })
})

describe('authService.logout et me', () => {
  it("logout efface le refresh token stocké", async () => {
    db.user.update.mockResolvedValue({})
    await authService.logout('u1')
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { refreshToken: null } })
  })

  it("me renvoie 404 pour un utilisateur supprimé", async () => {
    db.user.findUnique.mockResolvedValue(null)
    expect((await rejection(authService.me('u1'))).statusCode).toBe(404)
  })

  it("me ne sélectionne jamais le mot de passe", async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.fr', role: 'USER' })
    await authService.me('u1')
    expect(db.user.findUnique.mock.calls[0][0].select).toEqual({ id: true, email: true, role: true })
  })
})

describe('authService.forgotPassword', () => {
  it("ne révèle pas l'existence d'un email inconnu : retourne sans erreur ni email envoyé", async () => {
    db.user.findUnique.mockResolvedValue(null)
    await expect(authService.forgotPassword('x@y.fr')).resolves.toBeUndefined()
    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it("stocke le token de réinitialisation hashé et envoie le lien avec le token en clair, valable 15 minutes", async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1' })
    const before = Date.now()
    await authService.forgotPassword('a@b.fr')
    const created = db.passwordResetToken.create.mock.calls[0][0].data
    const url = (sendPasswordResetEmail as jest.Mock).mock.calls[0][1] as string
    const raw = new URL(url).searchParams.get('token')!
    expect(created.token).not.toBe(raw)
    expect(await argon2.verify(created.token, raw)).toBe(true)
    expect(new URL(url).searchParams.get('userId')).toBe('u1')
    const ttl = created.expiresAt.getTime() - before
    expect(ttl).toBeGreaterThan(14 * 60 * 1000)
    expect(ttl).toBeLessThanOrEqual(15 * 60 * 1000 + 1000)
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } })
  })
})

describe('authService.resetPassword', () => {
  it("refuse sans enregistrement de token (400)", async () => {
    db.passwordResetToken.findFirst.mockResolvedValue(null)
    expect((await rejection(authService.resetPassword('t', 'u1', 'nouveaumdp1'))).statusCode).toBe(400)
  })

  it("refuse et supprime un token expiré", async () => {
    db.passwordResetToken.findFirst.mockResolvedValue({ id: 'r1', token: 'x', expiresAt: new Date(Date.now() - 1000) })
    const err = await rejection(authService.resetPassword('t', 'u1', 'nouveaumdp1'))
    expect(err.statusCode).toBe(400)
    expect(db.passwordResetToken.delete).toHaveBeenCalledWith({ where: { id: 'r1' } })
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it("refuse un mauvais token sans changer le mot de passe", async () => {
    db.passwordResetToken.findFirst.mockResolvedValue({ id: 'r1', token: await argon2.hash('bon'), expiresAt: new Date(Date.now() + 60000) })
    expect((await rejection(authService.resetPassword('mauvais', 'u1', 'nouveaumdp1'))).statusCode).toBe(400)
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it("change le mot de passe (hashé) et consomme le token avec le bon token", async () => {
    db.passwordResetToken.findFirst.mockResolvedValue({ id: 'r1', token: await argon2.hash('bon'), expiresAt: new Date(Date.now() + 60000) })
    db.user.update.mockResolvedValue({})
    await authService.resetPassword('bon', 'u1', 'nouveaumdp1')
    const stored = db.user.update.mock.calls[0][0].data.password as string
    expect(await argon2.verify(stored, 'nouveaumdp1')).toBe(true)
    expect(db.passwordResetToken.delete).toHaveBeenCalledWith({ where: { id: 'r1' } })
  })
})
