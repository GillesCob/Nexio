import { apiClient } from '@/lib/axiosClient'
import type { IContact, ICreateContactPayload, IUpdateContactPayload } from '@/types/contact'

export async function createContact(data: ICreateContactPayload): Promise<IContact> {
  const response = await apiClient.post<IContact>('/contacts', data)
  return response.data
}

export async function getContacts(): Promise<IContact[]> {
  const response = await apiClient.get<IContact[]>('/contacts')
  return response.data
}

export async function getContactById(id: string): Promise<IContact> {
  const response = await apiClient.get<IContact>(`/contacts/${id}`)
  return response.data
}

export async function updateContact(id: string, data: IUpdateContactPayload): Promise<IContact> {
  const response = await apiClient.patch<IContact>(`/contacts/${id}`, data)
  return response.data
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contacts/${id}`)
}
