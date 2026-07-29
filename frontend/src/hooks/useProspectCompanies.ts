import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as prospectCompanyService from '@/services/prospectCompanyService'

export const PROSPECT_COMPANIES_QUERY_KEY = ['prospect-companies'] as const

export function useProspectCompanies() {
  return useQuery({
    queryKey: PROSPECT_COMPANIES_QUERY_KEY,
    queryFn: prospectCompanyService.getProspectCompanies,
  })
}

export function useDeleteProspectCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => prospectCompanyService.deleteProspectCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_COMPANIES_QUERY_KEY })
    },
  })
}
