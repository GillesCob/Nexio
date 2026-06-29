import { prisma } from '../lib/prisma'
import { RELANCE_CONFIG } from '../data/relanceConfig'

export async function getContactStats(userId: string) {
  const contacts = await prisma.contact.findMany({ where: { userId } })

  const byStatus = {
    to_contact: 0,
    contacted: 0,
    replied: 0,
    meeting_scheduled: 0,
    follow_up: 0,
    closed: 0,
  }

  for (const contact of contacts) {
    byStatus[contact.status]++
  }

  const totalApproached =
    byStatus.contacted +
    byStatus.replied +
    byStatus.meeting_scheduled +
    byStatus.follow_up +
    byStatus.closed

  const responseRate =
    totalApproached > 0
      ? ((byStatus.replied + byStatus.meeting_scheduled) / totalApproached) * 100
      : 0

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RELANCE_CONFIG.followUpDelayDays)

  const pendingFollowUps = contacts.filter(
    (c) => c.status === 'follow_up' && c.updatedAt < cutoff
  ).length

  return {
    byStatus,
    responseRate: Math.round(responseRate * 10) / 10,
    pendingFollowUps,
  }
}
