import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as jobOfferService from '@/services/jobOfferService'
import type { IJobOffer } from '@/types/jobOffer'

export const JOB_OFFERS_QUERY_KEY = ['job-offers'] as const

export function useJobOffers() {
  return useQuery({
    queryKey: JOB_OFFERS_QUERY_KEY,
    queryFn: jobOfferService.getJobOffers,
  })
}

export function useExtractAndCreateJobOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rawText: string) => jobOfferService.extractJobOffer(rawText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_OFFERS_QUERY_KEY })
    },
  })
}

export function useUpdateJobOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<IJobOffer, 'id' | 'createdAt' | 'updatedAt'>>
    }) => jobOfferService.updateJobOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_OFFERS_QUERY_KEY })
    },
  })
}

export function useDeleteJobOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobOfferService.deleteJobOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_OFFERS_QUERY_KEY })
    },
  })
}
