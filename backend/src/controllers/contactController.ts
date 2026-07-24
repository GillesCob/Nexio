import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import * as contactService from '../services/contactService'

const contactStatusSchema = z.enum([
  'to_contact',
  'to_message',
  'contacted',
  'replied',
  'meeting_scheduled',
  'follow_up',
  'closed',
])

const createContactSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  status: contactStatusSchema.optional(),
  notes: z.string().optional(),
  jobOfferId: z.string().optional(),
  companyId: z.string().optional(),
  contactedAt: z.string().optional(),
})

// 'unknown' non inclus : réservé au résultat IA, un choix manuel est toujours tranché.
const fluxSchema = z.enum(['1a', '1b', '2', '3', '4'])
const closeReasonSchema = z.enum(['not_interested', 'not_now'])

const updateContactSchema = createContactSchema.partial().extend({
  flux: fluxSchema.optional(),
  closeReason: closeReasonSchema.optional(),
  remindAt: z.string().optional(),
})

const paramsSchema = z.object({ id: z.string() })

function handleZod(err: unknown, next: NextFunction) {
  if (err instanceof z.ZodError) {
    next(new AppError(400, err.errors[0].message))
  } else {
    next(err)
  }
}

export async function createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = createContactSchema.parse(req.body)
    const { contact, outcome, needsCompanyInfo } = await contactService.createContact(userId, data)

    if (!contact) {
      // outcome "ambiguous" : plusieurs contacts partagent ce nom, rien touché volontairement
      res.status(409).json({
        name: data.name,
        outcome,
        needsCompanyInfo,
        message: `Plusieurs contacts nommés "${data.name}" déjà en base — à résoudre manuellement dans Nexio, rien n'a été modifié.`,
      })
      return
    }

    res.status(outcome === 'created' ? 201 : 200).json({ ...contact, outcome, needsCompanyInfo })
  } catch (err) {
    handleZod(err, next)
  }
}

export async function getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const contacts = await contactService.getContacts(userId)
    res.json(contacts)
  } catch (err) {
    next(err)
  }
}

export async function getContactById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const contact = await contactService.getContactById(userId, id)
    res.json(contact)
  } catch (err) {
    handleZod(err, next)
  }
}

export async function updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const data = updateContactSchema.parse(req.body)
    const contact = await contactService.updateContact(userId, id, data)
    res.json(contact)
  } catch (err) {
    handleZod(err, next)
  }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    await contactService.deleteContact(userId, id)
    res.status(204).send()
  } catch (err) {
    handleZod(err, next)
  }
}

export async function touchContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { id } = paramsSchema.parse(req.params)
    const contact = await contactService.touchContact(userId, id)
    res.json(contact)
  } catch (err) {
    handleZod(err, next)
  }
}
