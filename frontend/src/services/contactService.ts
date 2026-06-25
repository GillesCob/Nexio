import { apiClient } from '@/lib/axiosClient'
import type { ICompany, IContact, ICreateContactPayload, IExtractedContact, IMessage, IRelanceContact, IRelanceResult, IScoreResult, IUpdateContactPayload } from '@/types/contact'

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

export async function extractContact(rawText: string): Promise<IExtractedContact> {
  const response = await apiClient.post<IExtractedContact>('/contacts/extract', { rawText })
  return response.data
}

export async function extractCompany(rawText: string, contactId?: string): Promise<ICompany> {
  const response = await apiClient.post<ICompany>('/companies/extract', { rawText, contactId })
  return response.data
}

export async function suggestTemplate(contactId: string): Promise<{ message: string }> {
  const response = await apiClient.get<{ message: string }>(`/contacts/${contactId}/suggest-template`)
  return response.data
}

export async function scoreContact(data: {
  name: string
  jobTitle?: string
  company?: string
  location?: string
}): Promise<IScoreResult> {
  const response = await apiClient.post<IScoreResult>('/contacts/score', data)
  return response.data
}

export async function createMessage(contactId: string, content: string): Promise<IMessage> {
  const response = await apiClient.post<IMessage>(`/contacts/${contactId}/messages`, { content })
  return response.data
}

export async function getMessages(contactId: string): Promise<IMessage[]> {
  const response = await apiClient.get<IMessage[]>(`/contacts/${contactId}/messages`)
  return response.data
}

export async function getRelances(): Promise<IRelanceResult> {
  const response = await apiClient.get<IRelanceResult>('/contacts/relances')
  return response.data
}

export async function touchContact(id: string): Promise<IContact> {
  const response = await apiClient.patch<IContact>(`/contacts/${id}/touch`)
  return response.data
}

export async function suggestRelance(contactId: string): Promise<{ message: string }> {
  const response = await apiClient.get<{ message: string }>(`/contacts/${contactId}/suggest-relance`)
  return response.data
}

export async function autoPromote(): Promise<{ promoted: number }> {
  const response = await apiClient.post<{ promoted: number }>('/contacts/auto-promote')
  return response.data
}
