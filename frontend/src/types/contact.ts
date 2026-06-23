export type ContactStatus =
  | 'to_contact'
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

export interface IContact {
  id: string
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
  status: ContactStatus
  notes?: string
  jobOfferId?: string
  companyId?: string
  companyRef?: ICompany
  createdAt: string
  updatedAt: string
}

export interface ICreateContactPayload {
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
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
  status?: ContactStatus
  notes?: string
  jobOfferId?: string
}

export interface IExtractedContact {
  name: string
  company?: string
  linkedinUrl?: string
  jobTitle?: string
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
  toRelanceContacted: IRelanceContact[]
}
