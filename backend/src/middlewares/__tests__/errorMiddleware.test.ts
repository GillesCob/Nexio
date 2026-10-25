import type { Request, Response } from 'express'
import { AppError, errorMiddleware } from '../errorMiddleware'

function makeRes() {
  const res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

describe('errorMiddleware', () => {
  it("renvoie le code et le message d'une AppError", () => {
    const res = makeRes()
    errorMiddleware(new AppError(404, 'Contact not found'), {} as Request, res as unknown as Response, jest.fn())
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' })
  })

  it("masque le détail d'une erreur inattendue (500 générique, pas de fuite de message interne)", () => {
    const res = makeRes()
    errorMiddleware(new Error('secret: connexion postgres://user:pwd@host'), {} as Request, res as unknown as Response, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' })
  })
})
