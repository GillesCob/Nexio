import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'
import { authMiddleware } from '../authMiddleware'
import { AppError } from '../errorMiddleware'

function makeReq(authorization?: string): Request {
  return { headers: authorization === undefined ? {} : { authorization } } as unknown as Request
}

describe('authMiddleware', () => {
  const res = {} as Response

  it("refuse (401) sans en-tête Authorization", () => {
    const next = jest.fn()
    expect(() => authMiddleware(makeReq(), res, next)).toThrow(AppError)
    expect(next).not.toHaveBeenCalled()
  })

  it("refuse (401) si l'en-tête n'est pas de type Bearer", () => {
    const next = jest.fn()
    try {
      authMiddleware(makeReq('Basic abc'), res, next)
      throw new Error('aurait dû lever')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
    }
    expect(next).not.toHaveBeenCalled()
  })

  it('refuse (401) un token mal formé', () => {
    const next = jest.fn()
    expect(() => authMiddleware(makeReq('Bearer pas.un.jwt'), res, next)).toThrow('Invalid or expired token')
    expect(next).not.toHaveBeenCalled()
  })

  it('refuse (401) un token expiré', () => {
    const token = jwt.sign({ userId: 'u1', role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: -10 })
    const next = jest.fn()
    expect(() => authMiddleware(makeReq(`Bearer ${token}`), res, next)).toThrow('Invalid or expired token')
  })

  it('refuse un token signé avec un autre secret', () => {
    const token = jwt.sign({ userId: 'u1', role: 'ADMIN' }, 'autre-secret')
    const next = jest.fn()
    expect(() => authMiddleware(makeReq(`Bearer ${token}`), res, next)).toThrow(AppError)
  })

  it("refuse un token 'alg: none'", () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify({ userId: 'u1', role: 'ADMIN' })).toString('base64url')
    const next = jest.fn()
    expect(() => authMiddleware(makeReq(`Bearer ${header}.${body}.`), res, next)).toThrow(AppError)
  })

  it('accepte un token valide, renseigne req.user et appelle next()', () => {
    const token = jwt.sign({ userId: 'u1', role: 'USER' }, process.env.JWT_SECRET!)
    const req = makeReq(`Bearer ${token}`)
    const next = jest.fn()
    authMiddleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toMatchObject({ userId: 'u1', role: 'USER' })
  })
})
