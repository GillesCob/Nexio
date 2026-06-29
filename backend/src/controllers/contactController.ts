import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorMiddleware'
import * as contactService from '../services/contactService'

const contactStatusSchema = z.enum([
  'to_contact',
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
  status: contactStatusSchema.optional(),
  notes: z.string().optional(),
  jobOfferId: z.string().optional(),
  companyId: z.string().optional(),
  contactedAt: z.string().optional(),
})

const updateContactSchema = createContactSchema.partial()

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
    const contact = await contactService.createContact(userId, data)
    res.status(201).json(contact)
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
