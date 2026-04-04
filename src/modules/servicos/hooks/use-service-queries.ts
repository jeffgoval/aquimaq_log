import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { serviceRepository } from '../services/service.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts } from '@/integrations/supabase/db-types'

type ServiceInsert = Inserts<'services'>

export const useServiceList = () => useQuery({ queryKey: queryKeys.services, queryFn: serviceRepository.list })
export const useService = (id: string) => useQuery({ queryKey: queryKeys.serviceDetails(id), queryFn: () => serviceRepository.getById(id), enabled: !!id })

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServiceInsert) => serviceRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services })
      toast.success('Serviço criado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useCompleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => serviceRepository.complete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.services })
      qc.invalidateQueries({ queryKey: queryKeys.serviceDetails(id) })
      toast.success('Serviço concluído!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
