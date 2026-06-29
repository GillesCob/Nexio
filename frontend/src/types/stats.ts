export interface ILinkedInSnapshot {
  id: string
  weekLabel: string
  impressions: number
  impressionsVariation: number
  followers: number
  followersVariation: number
  profileViews: number
  profileViewsVariation: number
  searchAppearances: number
  searchAppearancesVariation: number
  postsCount: number
  commentsCount: number
  createdAt: string
}

export interface ILinkedInReminder {
  shouldRemind: boolean
  daysSinceLastSnapshot: number | null
}

export interface IContactStatsByStatus {
  to_contact: number
  contacted: number
  replied: number
  meeting_scheduled: number
  follow_up: number
  closed: number
}

export interface IContactStats {
  byStatus: IContactStatsByStatus
  responseRate: number
  pendingFollowUps: number
}
