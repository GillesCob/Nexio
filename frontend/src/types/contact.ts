export type ContactStatus =
  | 'to_contact'
  | 'to_message'
  | 'contacted'
  | 'replied'
  | 'meeting_scheduled'
  | 'follow_up'
  | 'closed'

export interface ICompany {
  id: string
  name: string
  description?: string
  sector?: string
  size?: string
  linkedinUrl?: string
  createdAt: string
  updatedAt: string
}

export type FluxCode = '1a' | '1b' | '2' | '3' | '4'

export type ContactCloseReason = 'not_interested' | 'not_now'

export interface IContact {
  id: string
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
  location?: string
  status: ContactStatus
  notes?: string
  jobOfferId?: string
  companyId?: string
  companyRef?: ICompany
  flux?: FluxCode
  fluxConfidence?: number
  closeReason?: ContactCloseReason
  remindAt?: string
  createdAt: string
  updatedAt: string
}

export interface ICreateContactPayload {
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
  location?: string
  status?: ContactStatus
  notes?: string
  jobOfferId?: string
  contactedAt?: string
}

export interface IUpdateContactPayload {
  name?: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
  location?: string
  status?: ContactStatus
  notes?: string
  jobOfferId?: string
  flux?: FluxCode
  closeReason?: ContactCloseReason
  remindAt?: string
}

export interface IExtractedContact {
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
  location?: string
}

export interface IScoreResult {
  compatible: boolean
  reasons: string[]
}

export interface IMessage {
  id: string
  content: string
  createdAt: string
}

export interface IRelanceContact extends IContact {
  daysSinceUpdate: number
}

export interface IRelanceResult {
  toFollowUp: IRelanceContact[]
  toCheckReplied: IRelanceContact[]
}
