import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as contactService from '@/services/contactService'
import type { ICreateContactPayload, IUpdateContactPayload } from '@/types/contact'

export const CONTACTS_QUERY_KEY = ['contacts'] as const

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: contactService.getContacts,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ICreateContactPayload) => contactService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateContactPayload }) =>
      contactService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}

export function useExtractContact() {
  return useMutation({
    mutationFn: (rawText: string) => contactService.extractContact(rawText),
  })
}

export function useExtractCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rawText, contactId }: { rawText: string; contactId?: string }) =>
      contactService.extractCompany(rawText, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}

export function useSuggestTemplate() {
  return useMutation({
    mutationFn: (contactId: string) => contactService.suggestTemplate(contactId),
  })
}

export function useScoreContact() {
  return useMutation({
    mutationFn: (data: { name: string; jobTitle?: string; company?: string; location?: string }) =>
      contactService.scoreContact(data),
  })
}

export const RELANCES_QUERY_KEY = ['contacts', 'relances'] as const

export function useGetRelances() {
  return useQuery({
    queryKey: RELANCES_QUERY_KEY,
    queryFn: contactService.getRelances,
  })
}

export const messagesQueryKey = (contactId: string) =>
  ['contacts', contactId, 'messages'] as const

export function useCreateMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contactId, content }: { contactId: string; content: string }) =>
      contactService.createMessage(contactId, content),
    onSuccess: (_data, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: messagesQueryKey(contactId) })
    },
  })
}

export function useGetMessages(contactId: string) {
  return useQuery({
    queryKey: messagesQueryKey(contactId),
    queryFn: () => contactService.getMessages(contactId),
    enabled: !!contactId,
  })
}

export function useSuggestRelance() {
  return useMutation({
    mutationFn: (contactId: string) => contactService.suggestRelance(contactId),
  })
}

export function useAutoPromote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contactService.autoPromote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}

export function useTouchContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactService.touchContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELANCES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    },
  })
}
