import { apiClient } from '@/lib/axiosClient'
import type { IContactStats, ILinkedInReminder, ILinkedInSnapshot } from '@/types/stats'

export async function postLinkedInSnapshot(rawText: string): Promise<ILinkedInSnapshot> {
  const response = await apiClient.post<ILinkedInSnapshot>('/stats/linkedin', { rawText })
  return response.data
}

export async function getLinkedInSnapshots(): Promise<ILinkedInSnapshot[]> {
  const response = await apiClient.get<ILinkedInSnapshot[]>('/stats/linkedin')
  return response.data
}

export async function getLinkedInReminder(): Promise<ILinkedInReminder> {
  const response = await apiClient.get<ILinkedInReminder>('/stats/linkedin/reminder')
  return response.data
}

export async function getContactStats(): Promise<IContactStats> {
  const response = await apiClient.get<IContactStats>('/stats/contacts')
  return response.data
}
