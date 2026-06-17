export type JobOfferStatus =
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'

export interface IJobOffer {
  id: string
  title: string
  company: string
  description?: string
  stack: string[]
  salary?: string
  remote: boolean
  location?: string
  url?: string
  status: JobOfferStatus
  createdAt: string
  updatedAt: string
}

export interface ICreateJobOfferPayload {
  title: string
  company: string
  description?: string
  stack?: string[]
  salary?: string
  remote?: boolean
  location?: string
  url?: string
  status?: JobOfferStatus
}
