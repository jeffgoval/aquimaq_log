import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { supplierRepository } from '../services/supplier.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates } from '@/integrations/supabase/db-types'

type SupplierInsert = Inserts<'suppliers'>
type SupplierUpdate = Updates<'suppliers'>

export const useSupplierList = () =>
  useQuery({ queryKey: queryKeys.suppliers, queryFn: supplierRepository.list })

export const useSupplierOptions = () =>
  useQuery({ queryKey: queryKeys.supplierOptions, queryFn: supplierRepository.listActive })

export const useSupplier = (id: string) =>
  useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierRepository.getById(id),
    enabled: !!id,
  })

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: SupplierInsert) => supplierRepository.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers })
      qc.invalidateQueries({ queryKey: queryKeys.supplierOptions })
      toast.success('Fornecedor cadastrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: SupplierUpdate) => supplierRepository.update(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers })
      qc.invalidateQueries({ queryKey: queryKeys.supplierOptions })
      qc.invalidateQueries({ queryKey: ['suppliers', id] })
      toast.success('Fornecedor atualizado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
