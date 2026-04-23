import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { tractorRepository } from '../services/tractor.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { TractorInput } from '../schemas/tractor.schema'
import type { Tables } from '@/integrations/supabase/db-types'

export function useTractorList() {
  return useQuery({ queryKey: queryKeys.tractors, queryFn: tractorRepository.list })
}

export function useTractorOptions() {
  return useQuery({ queryKey: queryKeys.tractorOptions, queryFn: tractorRepository.listActive })
}

export function useTractor(id: string) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: queryKeys.tractorById(id),
    queryFn: () => tractorRepository.getById(id),
    enabled: !!id,
    initialData: () => qc.getQueryData<Tables<'tractors'>[]>(queryKeys.tractors)?.find((t) => t.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(queryKeys.tractors)?.dataUpdatedAt,
  })
}

export function useCreateTractor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TractorInput) => tractorRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tractors })
      qc.invalidateQueries({ queryKey: queryKeys.tractorOptions })
      toast.success('Trator cadastrado com sucesso!')
    },
    onError: (error: Error) => toast.error(parseSupabaseError(error)),
  })
}

export function useUpdateTractor(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TractorInput) => tractorRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tractors })
      qc.invalidateQueries({ queryKey: queryKeys.tractorOptions })
      toast.success('Trator atualizado!')
    },
    onError: (error: Error) => toast.error(parseSupabaseError(error)),
  })
}

export function useDeactivateTractor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tractorRepository.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tractors })
      qc.invalidateQueries({ queryKey: queryKeys.tractorOptions })
      toast.success('Trator desativado.')
    },
    onError: (error: Error) => toast.error(parseSupabaseError(error)),
  })
}
