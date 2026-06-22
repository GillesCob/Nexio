import { prisma } from '../lib/prisma'
import { RELANCE_CONFIG } from '../data/relanceConfig'

interface IRelanceContact {
  id: string
  name: string
  company?: string | null
  linkedinUrl?: string | null
  jobTitle?: string | null
  status: string
  notes?: string | null
  jobOfferId?: string | null
  companyId?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  daysSinceUpdate: number
}

export interface IRelanceResult {
  toFollowUp: IRelanceContact[]
  toCheckReplied: IRelanceContact[]
}

function mapWithDays(contacts: Omit<IRelanceContact, 'daysSinceUpdate'>[]): IRelanceContact[] {
  return contacts.map((c) => ({
    ...c,
    daysSinceUpdate: Math.floor(
      (Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }))
}

export async function getRelances(userId: string): Promise<IRelanceResult> {
  const followUpCutoff = new Date(
    Date.now() - RELANCE_CONFIG.followUpDelayDays * 24 * 60 * 60 * 1000
  )
  const repliedCutoff = new Date(
    Date.now() - RELANCE_CONFIG.repliedDelayDays * 24 * 60 * 60 * 1000
  )

  const [followUpContacts, repliedContacts] = await Promise.all([
    prisma.contact.findMany({
      where: { userId, status: 'follow_up', updatedAt: { lt: followUpCutoff } },
      orderBy: { updatedAt: 'asc' },
    }),
    prisma.contact.findMany({
      where: { userId, status: 'replied', updatedAt: { lt: repliedCutoff } },
      orderBy: { updatedAt: 'asc' },
    }),
  ])

  return {
    toFollowUp: mapWithDays(followUpContacts),
    toCheckReplied: mapWithDays(repliedContacts),
  }
}
