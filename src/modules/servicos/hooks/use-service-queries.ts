import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { serviceRepository } from '../services/service.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates } from '@/integrations/supabase/db-types'

type ServiceInsert = Inserts<'services'>
type ServiceUpdate = Updates<'services'>

export const useServiceList = () => useQuery({ queryKey: queryKeys.services, queryFn: serviceRepository.list })
export const useService = (id: string) => useQuery({ queryKey: queryKeys.serviceDetails(id), queryFn: () => serviceRepository.getById(id), enabled: !!id })

export const useServicesByOperatorWorklogs = (operatorId: string) =>
  useQuery({
    queryKey: ['services', 'operator-worklogs', operatorId] as const,
    queryFn: () => serviceRepository.listByOperatorWorklogs(operatorId),
    enabled: !!operatorId,
  })

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

export function useUpdateService(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ServiceUpdate) => serviceRepository.update(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services })
      qc.invalidateQueries({ queryKey: queryKeys.serviceDetails(id) })
      toast.success('Serviço atualizado!')
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
