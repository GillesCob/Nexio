export type ContactStatus =
  | 'to_contact'
  | 'contacted'
  | 'replied'
  | 'meeting_scheduled'
  | 'follow_up'
  | 'closed'

export interface IContact {
  id: string
  name: string
  company?: string
  linkedinUrl?: string
  status: ContactStatus
  notes?: string
  jobOfferId?: string
  createdAt: string
  updatedAt: string
}

export interface ICreateContactPayload {
  name: string
  company?: string
  linkedinUrl?: string
  status?: ContactStatus
  notes?: string
  jobOfferId?: string
}
