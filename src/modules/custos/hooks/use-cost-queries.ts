import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { costRepository } from '../services/cost.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts } from '@/integrations/supabase/db-types'

type CostInsert = Inserts<'machine_costs'>

export const useMachineCosts = () => useQuery({ queryKey: queryKeys.machineCosts, queryFn: costRepository.list })

export function useCreateCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CostInsert) => costRepository.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.machineCosts })
      qc.invalidateQueries({ queryKey: queryKeys.profitability })
      toast.success('Custo registrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
