import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as statsService from '@/services/statsService'

export const LINKEDIN_SNAPSHOTS_QUERY_KEY = ['stats', 'linkedin'] as const
export const LINKEDIN_REMINDER_QUERY_KEY = ['stats', 'linkedin', 'reminder'] as const
export const CONTACT_STATS_QUERY_KEY = ['stats', 'contacts'] as const

export function useLinkedInSnapshots() {
  return useQuery({
    queryKey: LINKEDIN_SNAPSHOTS_QUERY_KEY,
    queryFn: statsService.getLinkedInSnapshots,
  })
}

export function useLinkedInReminder() {
  return useQuery({
    queryKey: LINKEDIN_REMINDER_QUERY_KEY,
    queryFn: statsService.getLinkedInReminder,
  })
}

export function usePostLinkedInSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rawText: string) => statsService.postLinkedInSnapshot(rawText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKEDIN_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: LINKEDIN_REMINDER_QUERY_KEY })
    },
  })
}

export function useContactStats() {
  return useQuery({
    queryKey: CONTACT_STATS_QUERY_KEY,
    queryFn: statsService.getContactStats,
  })
}
