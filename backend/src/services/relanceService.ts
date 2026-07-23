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

export async function autoPromoteToFollowUp(userId: string): Promise<number> {
  const contactedCutoff = new Date(
    Date.now() - RELANCE_CONFIG.contactedDelayDays * 24 * 60 * 60 * 1000
  )
  const result = await prisma.contact.updateMany({
    where: {
      userId,
      status: 'contacted',
      OR: [
        { contactedAt: { lt: contactedCutoff } },
        { contactedAt: null, updatedAt: { lt: contactedCutoff } },
      ],
    },
    data: { status: 'follow_up' },
  })
  return result.count
}

// Une carte "Echange en cours" ne doit pas y rester indefiniment si l'echange s'est eteint :
// fermeture automatique apres repliedCloseDelayDays de silence (le rappel toCheckReplied
// s'affiche deja a repliedDelayDays, cf getRelances).
export async function autoCloseStaleReplied(userId: string): Promise<number> {
  const closeCutoff = new Date(
    Date.now() - RELANCE_CONFIG.repliedCloseDelayDays * 24 * 60 * 60 * 1000
  )
  const staleContacts = await prisma.contact.findMany({
    where: { userId, status: 'replied', updatedAt: { lt: closeCutoff } },
    select: { id: true, notes: true },
  })

  const closeNote = 'Fermé automatiquement, plus de nouvelles après relance.'
  await Promise.all(
    staleContacts.map((c) =>
      prisma.contact.update({
        where: { id: c.id },
        data: {
          status: 'closed',
          notes: c.notes ? `${c.notes}\n\n${closeNote}` : closeNote,
        },
      })
    )
  )

  return staleContacts.length
}
