// Droits d'accès : un utilisateur ne lit, ne modifie et ne supprime jamais les données d'un autre.
// Prisma est mocké (test unitaire des gardes d'ownership). Le vrai test sur base PostgreSQL
// de test reste à faire (conteneur requis), cf rapport de la session autonome du 26/10.
jest.mock('../../lib/prisma', () => ({
  prisma: {
    contact: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    jobOffer: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn(), create: jest.fn() },
    message: { findMany: jest.fn(), create: jest.fn() },
    company: { findUnique: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}))
jest.mock('../fluxClassifier', () => ({ classifyContactFlux: jest.fn() }))

import { prisma } from '../../lib/prisma'
import * as contactService from '../contactService'
import * as jobOfferService from '../jobOfferService'
import * as messageService from '../messageService'

const db = prisma as unknown as Record<string, Record<string, jest.Mock>>

async function statusOf(p: Promise<unknown>): Promise<number | undefined> {
  try {
    await p
  } catch (err) {
    return (err as { statusCode?: number }).statusCode
  }
  return undefined
}

beforeEach(() => jest.resetAllMocks())

describe('contactService : ownership', () => {
  const foreign = { id: 'c1', userId: 'autre', name: 'X', companyRef: null }

  it.each([
    ['getContactById', () => contactService.getContactById('moi', 'c1')],
    ['updateContact', () => contactService.updateContact('moi', 'c1', { notes: 'x' })],
    ['deleteContact', () => contactService.deleteContact('moi', 'c1')],
    ['touchContact', () => contactService.touchContact('moi', 'c1')],
  ])("%s sur un contact d'un autre utilisateur : 404, aucune écriture", async (_nom, action) => {
    db.contact.findUnique.mockResolvedValue(foreign)
    expect(await statusOf(action())).toBe(404)
    expect(db.contact.update).not.toHaveBeenCalled()
    expect(db.contact.delete).not.toHaveBeenCalled()
  })

  it.each([
    ['getContactById', () => contactService.getContactById('moi', 'inconnu')],
    ['updateContact', () => contactService.updateContact('moi', 'inconnu', { notes: 'x' })],
    ['deleteContact', () => contactService.deleteContact('moi', 'inconnu')],
  ])('%s sur un contact inexistant : 404', async (_nom, action) => {
    db.contact.findUnique.mockResolvedValue(null)
    expect(await statusOf(action())).toBe(404)
  })

  it('getContacts filtre sur userId', async () => {
    db.contact.findMany.mockResolvedValue([])
    await contactService.getContacts('moi')
    expect(db.contact.findMany.mock.calls[0][0].where).toEqual({ userId: 'moi' })
  })

  it('deleteContact supprime son propre contact', async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'moi' })
    db.contact.delete.mockResolvedValue({})
    await contactService.deleteContact('moi', 'c1')
    expect(db.contact.delete).toHaveBeenCalledWith({ where: { id: 'c1' } })
  })

  it('createContact rattache toujours le contact créé au userId courant', async () => {
    db.contact.findMany.mockResolvedValue([])
    db.contact.create.mockImplementation(async ({ data }: { data: object }) => ({ id: 'n1', ...data }))
    db.company.findFirst.mockResolvedValue(null)
    const { outcome, contact } = await contactService.createContact('moi', { name: 'Alice' })
    expect(outcome).toBe('created')
    expect(contact).toMatchObject({ userId: 'moi', name: 'Alice' })
  })

  it("createContact : la recherche de doublon est limitée aux contacts du même utilisateur", async () => {
    db.contact.findFirst.mockResolvedValue(null)
    db.contact.findMany.mockResolvedValue([])
    db.contact.create.mockResolvedValue({ id: 'n1', userId: 'moi', company: null })
    db.company.findFirst.mockResolvedValue(null)
    await contactService.createContact('moi', { name: 'Alice', linkedinUrl: 'https://linkedin.com/in/alice' })
    expect(db.contact.findFirst.mock.calls[0][0].where).toMatchObject({ userId: 'moi' })
    expect(db.contact.findMany.mock.calls[0][0].where).toEqual({ userId: 'moi' })
  })

  it("createContact : deux contacts de même nom normalisé (emoji ignorés) = ambigu, rien n'est créé", async () => {
    db.contact.findMany.mockResolvedValue([
      { id: 'a', name: 'Alice Martin' },
      { id: 'b', name: 'Alice Martin 👩‍💻' },
    ])
    const result = await contactService.createContact('moi', { name: 'alice  martin' })
    expect(result).toEqual({ contact: null, outcome: 'ambiguous', needsCompanyInfo: false })
    expect(db.contact.create).not.toHaveBeenCalled()
  })

  it("createContact : un contact existant au nom normalisé identique est enrichi, pas dupliqué", async () => {
    db.contact.findMany.mockResolvedValue([{ id: 'a', name: '👨‍💻 Alice Martin' }])
    db.contact.findUnique.mockResolvedValue({ id: 'a', userId: 'moi', name: 'Alice Martin', company: null, jobTitle: null, location: null, linkedinUrl: null, companyRef: null })
    db.contact.update.mockImplementation(async ({ data }: { data: object }) => ({ id: 'a', userId: 'moi', company: null, ...data }))
    db.company.findFirst.mockResolvedValue(null)
    const { outcome } = await contactService.createContact('moi', { name: 'Alice Martin', jobTitle: 'CTO' })
    expect(outcome).toBe('enriched')
    expect(db.contact.create).not.toHaveBeenCalled()
  })
})

describe('contactService.updateContact : règles métier', () => {
  const mine = { id: 'c1', userId: 'moi', updatedAt: new Date('2026-01-01'), contactedAt: null }

  it("passer le statut à 'contacted' pour la première fois renseigne contactedAt", async () => {
    db.contact.findUnique.mockResolvedValue(mine)
    db.contact.update.mockResolvedValue({})
    await contactService.updateContact('moi', 'c1', { status: 'contacted' })
    expect(db.contact.update.mock.calls[0][0].data.contactedAt).toBeInstanceOf(Date)
  })

  it("sortir de 'closed' efface closeReason et remindAt", async () => {
    db.contact.findUnique.mockResolvedValue(mine)
    db.contact.update.mockResolvedValue({})
    await contactService.updateContact('moi', 'c1', { status: 'replied' })
    expect(db.contact.update.mock.calls[0][0].data).toMatchObject({ closeReason: null, remindAt: null })
  })

  it("un flux choisi à la main force fluxConfidence à 1", async () => {
    db.contact.findUnique.mockResolvedValue(mine)
    db.contact.update.mockResolvedValue({})
    await contactService.updateContact('moi', 'c1', { flux: '2' })
    expect(db.contact.update.mock.calls[0][0].data).toMatchObject({ flux: '2', fluxConfidence: 1 })
  })
})

describe('jobOfferService : ownership', () => {
  it.each([
    ['getJobOfferById', () => jobOfferService.getJobOfferById('moi', 'o1')],
    ['updateJobOffer', () => jobOfferService.updateJobOffer('moi', 'o1', { title: 'x' })],
    ['deleteJobOffer', () => jobOfferService.deleteJobOffer('moi', 'o1')],
  ])("%s sur l'offre d'un autre : 404, aucune écriture", async (_nom, action) => {
    db.jobOffer.findUnique.mockResolvedValue({ id: 'o1', userId: 'autre' })
    expect(await statusOf(action())).toBe(404)
    expect(db.jobOffer.update).not.toHaveBeenCalled()
    expect(db.jobOffer.delete).not.toHaveBeenCalled()
  })

  it('getJobOffers filtre sur userId et createJobOffer force le userId courant (même si data en fournit un autre)', async () => {
    db.jobOffer.findMany.mockResolvedValue([])
    await jobOfferService.getJobOffers('moi')
    expect(db.jobOffer.findMany.mock.calls[0][0].where).toEqual({ userId: 'moi' })

    db.jobOffer.create.mockResolvedValue({})
    await jobOfferService.createJobOffer('moi', { title: 't', company: 'c', ...({ userId: 'autre' } as object) })
    expect(db.jobOffer.create.mock.calls[0][0].data.userId).toBe('moi')
  })
})

describe('messageService : ownership et progression des relances', () => {
  it.each([
    ['createMessage', () => messageService.createMessage('moi', 'c1', 'salut')],
    ['getMessages', () => messageService.getMessages('moi', 'c1')],
  ])("%s sur le contact d'un autre : 404, aucune écriture", async (_nom, action) => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'autre', contactedAt: null, relanceCount: 0 })
    expect(await statusOf(action())).toBe(404)
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(db.message.findMany).not.toHaveBeenCalled()
  })

  it("le premier message passe le contact en 'contacted' sans incrémenter relanceCount", async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'moi', contactedAt: null, relanceCount: 0 })
    db.message.create.mockReturnValue('create')
    db.contact.update.mockReturnValue('update')
    db.$transaction.mockResolvedValue([{ id: 'm1' }])
    await messageService.createMessage('moi', 'c1', 'salut')
    const data = db.contact.update.mock.calls[0][0].data
    expect(data.status).toBe('contacted')
    expect(data.relanceCount).toBeUndefined()
  })

  it("un message sur un contact déjà contacté est une relance : relanceCount incrémenté", async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'moi', contactedAt: new Date(), relanceCount: 0 })
    db.message.create.mockReturnValue('create')
    db.contact.update.mockReturnValue('update')
    db.$transaction.mockResolvedValue([{ id: 'm1' }])
    await messageService.createMessage('moi', 'c1', 'relance')
    expect(db.contact.update.mock.calls[0][0].data.relanceCount).toEqual({ increment: 1 })
  })

  it("la relance finale (2e) ferme le contact avec closeReason 'not_now' et sans remindAt", async () => {
    db.contact.findUnique.mockResolvedValue({ id: 'c1', userId: 'moi', contactedAt: new Date(), relanceCount: 1 })
    db.message.create.mockReturnValue('create')
    db.contact.update.mockReturnValue('update')
    db.$transaction.mockResolvedValue([{ id: 'm1' }])
    await messageService.createMessage('moi', 'c1', 'derniere')
    const data = db.contact.update.mock.calls[0][0].data
    expect(data).toMatchObject({ status: 'closed', closeReason: 'not_now' })
    expect(data.remindAt).toBeUndefined()
  })
})
