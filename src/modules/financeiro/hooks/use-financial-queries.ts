import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { financialRepository } from '../services/financial.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates } from '@/integrations/supabase/db-types'

type PaymentInsert = Inserts<'receivable_payments'>
type ReceivableInsert = Inserts<'receivables'>
type ReceivableUpdate = Updates<'receivables'>

export const useReceivables = (filters?: { status?: string }) => useQuery({
  queryKey: [...queryKeys.receivables, filters],
  queryFn: () => financialRepository.listReceivables(filters),
})

export const useReceivablesByService = (serviceId: string) => useQuery({
  queryKey: queryKeys.receivablesByService(serviceId),
  queryFn: () => financialRepository.listByService(serviceId),
  enabled: !!serviceId,
})

function invalidateAllReceivables(qc: ReturnType<typeof useQueryClient>, serviceId?: string) {
  qc.invalidateQueries({ queryKey: queryKeys.receivables })
  if (serviceId) qc.invalidateQueries({ queryKey: queryKeys.receivablesByService(serviceId) })
}

export function useRegisterPayment(serviceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: PaymentInsert) => financialRepository.registerPayment(p),
    onSuccess: () => {
      invalidateAllReceivables(qc, serviceId)
      toast.success('Pagamento registrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useCreateInstallments(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (receivables: ReceivableInsert[]) => financialRepository.createInstallments(receivables),
    onSuccess: () => {
      invalidateAllReceivables(qc, serviceId)
      toast.success('Parcelamento registrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateReceivable(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceivableUpdate }) =>
      financialRepository.updateReceivable(id, payload),
    onSuccess: () => {
      invalidateAllReceivables(qc, serviceId)
      toast.success('Parcela atualizada!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
