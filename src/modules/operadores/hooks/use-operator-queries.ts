import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { operatorRepository } from '../services/operator.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { OperatorInput } from '../schemas/operator.schema'

export const useOperatorList = () => useQuery({ queryKey: queryKeys.operators, queryFn: operatorRepository.list })
export const useOperatorOptions = () => useQuery({ queryKey: queryKeys.operatorOptions, queryFn: operatorRepository.listActive })
export const useOperator = (id: string) => useQuery({ queryKey: ['operators', id], queryFn: () => operatorRepository.getById(id), enabled: !!id })
export const useOperatorLedger = (id: string) => useQuery({ queryKey: queryKeys.operatorLedger(id), queryFn: () => operatorRepository.getLedger(id), enabled: !!id })

export function useCreateOperator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: OperatorInput) => operatorRepository.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.operators }); toast.success('Operador cadastrado!') },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateOperator(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: OperatorInput) => operatorRepository.update(id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.operators }); toast.success('Operador atualizado!') },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
