import { apiClient } from '@/lib/axiosClient'
import type { IProspectCompany } from '@/types/prospectCompany'

export async function getProspectCompanies(): Promise<IProspectCompany[]> {
  const response = await apiClient.get<IProspectCompany[]>('/prospect-companies')
  return response.data
}

export async function deleteProspectCompany(id: string): Promise<void> {
  await apiClient.delete(`/prospect-companies/${id}`)
}
