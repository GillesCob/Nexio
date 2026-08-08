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
  // contactedAt = null signifie qu'aucun message n'a jamais été réellement généré pour ce contact
  // (cf templateSelector.ts, qui ne renvoie le 1er message que si contactedAt est null) : le
  // promouvoir en follow_up ferait générer une relance qui affiche en fait le 1er contact,
  // incohérence détectée le 08/08 sur Morgane Boitel. Ne promouvoir que les contacts réellement
  // déjà messagés.
  const result = await prisma.contact.updateMany({
    where: {
      userId,
      status: 'contacted',
      contactedAt: { lt: contactedCutoff },
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

// "Pas pour le moment" (closeReason=not_now) programme une réouverture a remindAt. Deux cas
// distincts selon relanceCount : un contact jamais relancé (0) repart sur un message frais
// ("Message a envoyer"), un contact deja relance au moins une fois (>=1, ex. bloque par la pause
// estivale sur la relance finale, cf messageService.createMessage) reprend directement le fil
// existant ("A relancer"), pas une remise a zero.
export async function autoReopenScheduled(userId: string): Promise<number> {
  const due = await prisma.contact.findMany({
    where: { userId, status: 'closed', closeReason: 'not_now', remindAt: { lte: new Date() } },
    select: { id: true, relanceCount: true },
  })

  await Promise.all(
    due.map((c) =>
      prisma.contact.update({
        where: { id: c.id },
        data: {
          status: c.relanceCount >= 1 ? 'follow_up' : 'to_message',
          closeReason: null,
          remindAt: null,
        },
      })
    )
  )

  return due.length
}
