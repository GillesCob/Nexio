// Version déterministe (Groq mocké) : vérifie ce qui est du ressort du code, c'est-à-dire
// (1) le prompt envoyé au modèle contient les règles et les données du contact,
// (2) le nettoyage/parse/validation de la réponse et les replis, (3) le comportement attendu
// quand le modèle répond conformément aux 4 cas réels du 11/08.
// Le comportement du modèle lui-même est vérifié par fluxClassifier.live.test.ts (RUN_GROQ_LIVE=1).
jest.mock('../../lib/groqClient', () => ({ createChatCompletion: jest.fn() }))

import { createChatCompletion } from '../../lib/groqClient'
import { classifyContactFlux } from '../fluxClassifier'

const mockCompletion = createChatCompletion as jest.Mock

function reply(content: string | null) {
  mockCompletion.mockResolvedValue({ choices: [{ message: { content } }] })
}

const base = { jobTitle: 'Account Executive', companyName: 'Numericoach', companyDescription: 'ESN', companySector: 'Services numériques (ESN)' }

let errorSpy: jest.SpyInstance
beforeEach(() => {
  mockCompletion.mockReset()
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(() => errorSpy.mockRestore())

describe('classifyContactFlux : prompt', () => {
  it("injecte titre, entreprise, description et secteur du contact dans le prompt", async () => {
    reply('{"flux":"4","confidence":0.9,"reasoning":"ok","alternatives":[]}')
    await classifyContactFlux(base)
    const prompt = mockCompletion.mock.calls[0][0].messages[0].content as string
    expect(prompt).toContain('Job title : Account Executive')
    expect(prompt).toContain("Nom de l'entreprise : Numericoach")
    expect(prompt).toContain('Description : ESN')
    expect(prompt).toContain('Secteur : Services numériques (ESN)')
    expect(prompt).not.toMatch(/\{(jobTitle|companyName|companyDescription|companySector)\}/)
  })

  it("remplace les champs null par 'non renseigné'", async () => {
    reply('{"flux":"unknown","confidence":0.1,"reasoning":"x","alternatives":[]}')
    await classifyContactFlux({ jobTitle: null, companyName: null, companyDescription: null, companySector: null })
    const prompt = mockCompletion.mock.calls[0][0].messages[0].content as string
    expect(prompt.match(/non renseigné/g)).toHaveLength(4)
  })

  it("garde le resserrement du flux 4 du 11/08 : double condition ESN réelle ET titre commercial, titre technique jamais flux 4", async () => {
    reply('{"flux":"2","confidence":0.8,"reasoning":"x","alternatives":[]}')
    await classifyContactFlux(base)
    const prompt = mockCompletion.mock.calls[0][0].messages[0].content as string
    expect(prompt).toContain('QUE si les deux conditions suivantes sont vraies EN MÊME TEMPS')
    expect(prompt).toContain("n'est PAS une ESN")
    expect(prompt).toMatch(/Tech Lead.*JAMAIS flux 4/s)
  })

  it("demande assez de tokens pour ne pas couper le JSON (regression du 02/09 : 256 trop court)", async () => {
    reply('{"flux":"2","confidence":0.8,"reasoning":"x","alternatives":[]}')
    await classifyContactFlux(base)
    expect(mockCompletion.mock.calls[0][0].max_tokens).toBeGreaterThanOrEqual(768)
  })
})

describe('classifyContactFlux : réponse du modèle', () => {
  it.each([
    ['Marius Bordier (coopérative agricole, titre technique)', 'Responsable Power Platform', '2'],
    ['Robert Bidoz (bureau d\'études VRD)', 'Responsable Région OCCITANIE', '2'],
    ['Hugo Eribon (ESN, titre technique)', 'Tech Lead', '2'],
  ])('%s : une réponse flux 2 est restituée telle quelle, jamais flux 4', async (_nom, jobTitle, flux) => {
    reply(JSON.stringify({ flux, confidence: 0.85, reasoning: 'ok', alternatives: [] }))
    const r = await classifyContactFlux({ ...base, jobTitle })
    expect(r.flux).toBe(flux)
    expect(r.flux).not.toBe('4')
  })

  it('Christopher Heintz (ESN, titre commercial) : flux 4 restitué (contrôle positif)', async () => {
    reply('{"flux":"4","confidence":0.95,"reasoning":"ok","alternatives":[]}')
    expect((await classifyContactFlux(base)).flux).toBe('4')
  })

  it('accepte une réponse enveloppée dans des balises markdown', async () => {
    reply('```json\n{"flux":"1a","confidence":0.7,"reasoning":"r","alternatives":["1b"]}\n```')
    const r = await classifyContactFlux(base)
    expect(r).toEqual({ flux: '1a', confidence: 0.7, reasoning: 'r', alternatives: ['1b'] })
  })

  it("replie sur 'unknown' / parse_error si la réponse n'est pas du JSON", async () => {
    reply('Je pense que flux 4')
    expect(await classifyContactFlux(base)).toMatchObject({ flux: 'unknown', confidence: 0, reasoning: 'parse_error' })
  })

  it("replie sur parse_error si le contenu est null (modèle muet)", async () => {
    reply(null)
    expect(await classifyContactFlux(base)).toMatchObject({ flux: 'unknown', reasoning: 'parse_error' })
  })

  it.each([
    ['flux hors liste', '{"flux":"3","confidence":0.5,"reasoning":"x","alternatives":[]}'],
    ['confiance supérieure à 1', '{"flux":"2","confidence":1.5,"reasoning":"x","alternatives":[]}'],
    ['confiance négative', '{"flux":"2","confidence":-0.1,"reasoning":"x","alternatives":[]}'],
    ['champ manquant', '{"flux":"2","confidence":0.5}'],
    ['plus de 2 alternatives', '{"flux":"2","confidence":0.5,"reasoning":"x","alternatives":["1a","1b","4"]}'],
  ])("replie sur validation_error : %s", async (_nom, json) => {
    reply(json)
    expect(await classifyContactFlux(base)).toMatchObject({ flux: 'unknown', confidence: 0, reasoning: 'validation_error' })
  })

  it("propage une erreur réseau/API du client (le fallback est géré par l'appelant)", async () => {
    mockCompletion.mockRejectedValue(new Error('réseau'))
    await expect(classifyContactFlux(base)).rejects.toThrow('réseau')
  })
})
