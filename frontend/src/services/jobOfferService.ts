import { apiClient } from '@/lib/axiosClient'
import type { IJobOffer } from '@/types/jobOffer'

export async function extractJobOffer(rawText: string): Promise<IJobOffer> {
  const response = await apiClient.post<IJobOffer>('/job-offers/extract', { rawText })
  return response.data
}

export async function getJobOffers(): Promise<IJobOffer[]> {
  const response = await apiClient.get<IJobOffer[]>('/job-offers')
  return response.data
}

export async function updateJobOffer(
  id: string,
  data: Partial<Omit<IJobOffer, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IJobOffer> {
  const response = await apiClient.patch<IJobOffer>(`/job-offers/${id}`, data)
  return response.data
}

export async function deleteJobOffer(id: string): Promise<void> {
  await apiClient.delete(`/job-offers/${id}`)
}
