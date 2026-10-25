// groq-sdk est mocké : aucun appel réseau, aucune clé requise.
const create = jest.fn()

class MockAPIError extends Error {
  constructor(public status: number, public error?: { code?: string }) {
    super(`APIError ${status}`)
  }
}

jest.mock('groq-sdk', () => {
  const Groq = jest.fn().mockImplementation(() => ({ chat: { completions: { create } } }))
  return { __esModule: true, default: Groq, APIError: MockAPIError }
})

const PRIMARY = 'openai/gpt-oss-120b'
const FALLBACK = 'openai/gpt-oss-20b'
const params = (model: string) => ({ model, messages: [{ role: 'user' as const, content: 'x' }] })

let createChatCompletion: typeof import('../groqClient').createChatCompletion
let errorSpy: jest.SpyInstance

beforeEach(() => {
  jest.resetModules()
  create.mockReset()
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  createChatCompletion = require('../groqClient').createChatCompletion
})
afterEach(() => {
  errorSpy.mockRestore()
  jest.useRealTimers()
})

describe('groqClient.createChatCompletion', () => {
  it('appelle le modèle demandé quand tout va bien', async () => {
    create.mockResolvedValue({ ok: true })
    await createChatCompletion(params(PRIMARY))
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0].model).toBe(PRIMARY)
  })

  it("bascule sur le modèle de repli après un 429 puis saute le modèle principal pendant le délai", async () => {
    create.mockRejectedValueOnce(new MockAPIError(429)).mockResolvedValue({ ok: true })
    await createChatCompletion(params(PRIMARY))
    expect(create.mock.calls.map((c) => c[0].model)).toEqual([PRIMARY, FALLBACK])

    create.mockClear()
    await createChatCompletion(params(PRIMARY))
    expect(create.mock.calls.map((c) => c[0].model)).toEqual([FALLBACK])
  })

  it('retente le modèle principal une fois le délai de 10 minutes écoulé', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-26T10:00:00Z'))
    create.mockRejectedValueOnce(new MockAPIError(429)).mockResolvedValue({ ok: true })
    await createChatCompletion(params(PRIMARY))
    create.mockClear()

    jest.setSystemTime(new Date('2026-10-26T10:11:00Z'))
    await createChatCompletion(params(PRIMARY))
    expect(create.mock.calls.map((c) => c[0].model)).toEqual([PRIMARY])
  })

  it("bascule aussi sur le repli si le modèle a disparu du catalogue (400 model_not_found, incident du 24/08)", async () => {
    create.mockRejectedValueOnce(new MockAPIError(400, { code: 'model_not_found' })).mockResolvedValue({ ok: true })
    await createChatCompletion(params(PRIMARY))
    expect(create.mock.calls.map((c) => c[0].model)).toEqual([PRIMARY, FALLBACK])
  })

  it("ne masque pas les autres erreurs : un 400 autre ou un 500 est propagé sans repli", async () => {
    create.mockRejectedValue(new MockAPIError(400, { code: 'invalid_request' }))
    await expect(createChatCompletion(params(PRIMARY))).rejects.toMatchObject({ status: 400 })
    create.mockReset()
    create.mockRejectedValue(new MockAPIError(500))
    await expect(createChatCompletion(params(PRIMARY))).rejects.toMatchObject({ status: 500 })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it("un 429 sur le modèle de repli lui-même est propagé (pas de boucle)", async () => {
    create.mockRejectedValue(new MockAPIError(429))
    await expect(createChatCompletion(params(FALLBACK))).rejects.toMatchObject({ status: 429 })
    expect(create).toHaveBeenCalledTimes(1)
  })
})
