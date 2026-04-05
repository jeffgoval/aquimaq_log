import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { costRepository } from '../services/cost.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates } from '@/integrations/supabase/db-types'

type CostInsert = Inserts<'machine_costs'>
type CostUpdate = Updates<'machine_costs'>

export const useMachineCosts = () => useQuery({ queryKey: queryKeys.machineCosts, queryFn: costRepository.list })

export function useCreateCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CostInsert) => costRepository.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.machineCosts })
      qc.invalidateQueries({ queryKey: queryKeys.profitability })
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateMachineCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CostUpdate }) => costRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.machineCosts })
      qc.invalidateQueries({ queryKey: queryKeys.profitability })
      toast.success('Custo atualizado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
