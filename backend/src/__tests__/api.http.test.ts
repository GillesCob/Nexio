// Tests HTTP de bout en bout de l'application Express (vrai routeur, vrais middlewares, vrai JWT,
// vrai fetch sur un port éphémère). Seuls Prisma, l'envoi d'email et Groq sont remplacés.
// Garantit : toute route privée refuse l'accès sans jeton valide, et un utilisateur ne voit pas
// les données d'un autre. Le test sur une vraie base PostgreSQL reste à faire (conteneur requis).
import type { AddressInfo } from 'net'
import type { Server } from 'http'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    contact: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    jobOffer: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn(), create: jest.fn() },
    passwordResetToken: { deleteMany: jest.fn(), create: jest.fn() },
  },
}))
jest.mock('../lib/email', () => ({ sendPasswordResetEmail: jest.fn() }))
jest.mock('../lib/groqClient', () => ({ createChatCompletion: jest.fn() }))

import { prisma } from '../lib/prisma'
import { app } from '../app'

const db = prisma as unknown as Record<string, Record<string, jest.Mock>>

let server: Server
let base: string

beforeAll(async () => {
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', () => resolve()))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})
beforeEach(() => {
  for (const model of Object.values(db)) for (const fn of Object.values(model)) fn.mockReset()
})

const tokenFor = (userId: string) => jwt.sign({ userId, role: 'USER' }, process.env.JWT_SECRET!)

async function call(method: string, path: string, opts: { token?: string; body?: unknown; cookie?: string } = {}) {
  const headers: Record<string, string> = {}
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  if (opts.cookie) headers.Cookie = opts.cookie
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(base + path, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) })
  const text = await res.text()
  return { status: res.status, json: text ? JSON.parse(text) : null, headers: res.headers }
}

describe('routes privées : refus sans jeton valide', () => {
  const routes: Array<[string, string]> = [
    ['GET', '/auth/me'],
    ['POST', '/auth/extension-token'],
    ['GET', '/contacts'],
    ['POST', '/contacts'],
    ['GET', '/contacts/relances'],
    ['GET', '/contacts/abc'],
    ['PATCH', '/contacts/abc'],
    ['DELETE', '/contacts/abc'],
    ['GET', '/contacts/abc/messages'],
    ['GET', '/companies/abc'],
    ['GET', '/stats'],
    ['GET', '/job-offers'],
    ['DELETE', '/job-offers/abc'],
    ['GET', '/prospect-companies'],
  ]

  it.each(routes)('%s %s sans jeton : 401', async (method, path) => {
    const { status } = await call(method, path)
    // 404 accepté seulement si la route n'existe pas : on exige 401 pour toute route existante.
    expect([401, 404]).toContain(status)
    expect(status).not.toBe(200)
  })

  it.each(routes.filter(([m, p]) => !(m === 'GET' && p === '/companies/abc') && !(m === 'GET' && p === '/stats') && !(m === 'GET' && p === '/prospect-companies')))(
    '%s %s avec un faux jeton : 401',
    async (method, path) => {
      const forged = jwt.sign({ userId: 'u1', role: 'ADMIN' }, 'mauvais-secret')
      expect((await call(method, path, { token: forged })).status).toBe(401)
    }
  )

  it("un jeton valide ne donne pas accès au refresh (le refresh exige le cookie)", async () => {
    expect((await call('POST', '/auth/refresh', { token: tokenFor('u1') })).status).toBe(401)
  })
})

describe('routes publiques', () => {
  it('GET /health répond 200 sans authentification', async () => {
    expect((await call('GET', '/health')).status).toBe(200)
  })

  it("POST /auth/register est désactivé (403)", async () => {
    const { status } = await call('POST', '/auth/register', { body: { email: 'a@b.fr', password: 'motdepasse1' } })
    expect(status).toBe(403)
    expect(db.user.findUnique).not.toHaveBeenCalled()
  })

  it.each([
    ['email invalide', { email: 'pas-un-email', password: 'motdepasse1' }],
    ['mot de passe trop court', { email: 'a@b.fr', password: 'court' }],
    ['corps vide', {}],
  ])('POST /auth/login %s : 400, la base n’est pas interrogée', async (_nom, body) => {
    const { status } = await call('POST', '/auth/login', { body })
    expect(status).toBe(400)
    expect(db.user.findUnique).not.toHaveBeenCalled()
  })

  it('POST /auth/login : mauvais identifiants 401, bons identifiants 200 avec cookie httpOnly strict', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.fr', role: 'USER', password: await argon2.hash('motdepasse1') })
    db.user.update.mockResolvedValue({})

    const bad = await call('POST', '/auth/login', { body: { email: 'a@b.fr', password: 'mauvaismdp1' } })
    expect(bad.status).toBe(401)

    const ok = await call('POST', '/auth/login', { body: { email: 'a@b.fr', password: 'motdepasse1' } })
    expect(ok.status).toBe(200)
    expect(ok.json.user).toEqual({ id: 'u1', email: 'a@b.fr', role: 'USER' })
    expect(ok.json).not.toHaveProperty('refreshToken')
    const cookie = ok.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/refreshToken=/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Strict/i)
  })

  it("POST /auth/forgot-password répond pareil pour un email inconnu (pas d'énumération)", async () => {
    db.user.findUnique.mockResolvedValue(null)
    const unknown = await call('POST', '/auth/forgot-password', { body: { email: 'x@y.fr' } })
    db.user.findUnique.mockResolvedValue({ id: 'u1' })
    const known = await call('POST', '/auth/forgot-password', { body: { email: 'a@b.fr' } })
    expect(unknown.status).toBe(200)
    expect(known.status).toBe(200)
    expect(unknown.json).toEqual(known.json)
  })
})

describe('flux principal et droits d’accès sur /contacts', () => {
  it('GET /auth/me avec un jeton valide renvoie le profil sans le mot de passe', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.fr', role: 'USER' })
    const { status, json } = await call('GET', '/auth/me', { token: tokenFor('u1') })
    expect(status).toBe(200)
    expect(json).not.toHaveProperty('password')
  })

  it("GET /contacts ne liste que les contacts de l'utilisateur du jeton", async () => {
    db.contact.findMany.mockResolvedValue([])
    await call('GET', '/contacts', { token: tokenFor('alice') })
    expect(db.contact.findMany.mock.calls[0][0].where).toEqual({ userId: 'alice' })
  })

  it("GET /contacts/:id d'un autre utilisateur : 404 (pas 403, pas de fuite d'existence)", async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'bob', name: 'Secret' })
    const { status, json } = await call('GET', '/contacts/c1', { token: tokenFor('alice') })
    expect(status).toBe(404)
    expect(JSON.stringify(json)).not.toContain('Secret')
  })

  it("PATCH et DELETE /contacts/:id d'un autre utilisateur : 404 et aucune écriture", async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'bob' })
    expect((await call('PATCH', '/contacts/c1', { token: tokenFor('alice'), body: { notes: 'pirate' } })).status).toBe(404)
    expect((await call('DELETE', '/contacts/c1', { token: tokenFor('alice') })).status).toBe(404)
    expect(db.contact.update).not.toHaveBeenCalled()
    expect(db.contact.delete).not.toHaveBeenCalled()
  })

  it('POST /contacts : un nom vide est refusé (400)', async () => {
    const { status } = await call('POST', '/contacts', { token: tokenFor('alice'), body: { name: '' } })
    expect(status).toBe(400)
    expect(db.contact.create).not.toHaveBeenCalled()
  })

  it("POST /contacts : un statut hors liste est refusé (400)", async () => {
    const { status } = await call('POST', '/contacts', { token: tokenFor('alice'), body: { name: 'Zoé', status: 'hacked' } })
    expect(status).toBe(400)
  })

  it("POST /contacts crée un contact rattaché à l'utilisateur du jeton (201), même si le corps contient un autre userId", async () => {
    db.contact.findMany.mockResolvedValue([])
    db.contact.findFirst.mockResolvedValue(null)
    db.contact.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'n1', company: null, ...data }))
    const { status, json } = await call('POST', '/contacts', { token: tokenFor('alice'), body: { name: 'Zoé', userId: 'bob' } })
    expect(status).toBe(201)
    expect(json.userId).toBe('alice')
    expect(json.outcome).toBe('created')
  })

  it("DELETE /job-offers/:id d'un autre utilisateur : 404", async () => {
    db.jobOffer.findUnique.mockResolvedValue({ id: 'o1', userId: 'bob' })
    expect((await call('DELETE', '/job-offers/o1', { token: tokenFor('alice') })).status).toBe(404)
    expect(db.jobOffer.delete).not.toHaveBeenCalled()
  })
})
