import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { clientRepository } from '../services/client.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates, Tables } from '@/integrations/supabase/db-types'

type ClientInsert = Inserts<'clients'>
type ClientUpdate = Updates<'clients'>

export const useClientList = () => useQuery({ queryKey: queryKeys.clients, queryFn: clientRepository.list })
export const useClientOptions = () => useQuery({ queryKey: queryKeys.clientOptions, queryFn: clientRepository.listActive })
export const useClient = (id: string) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientRepository.getById(id),
    enabled: !!id,
    initialData: () => qc.getQueryData<Tables<'clients'>[]>(queryKeys.clients)?.find((c) => c.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(queryKeys.clients)?.dataUpdatedAt,
  })
}

const normalizeClientInsert = (p: ClientInsert): ClientInsert => ({
  name: String(p.name ?? '').trim(),
  is_active: p.is_active ?? true,
  document: p.document == null || String(p.document).trim() === '' ? null : String(p.document).trim(),
  phone: p.phone == null || String(p.phone).trim() === '' ? null : String(p.phone).trim(),
  email: p.email == null || String(p.email).trim() === '' ? null : String(p.email).trim(),
  notes: p.notes == null || String(p.notes).trim() === '' ? null : String(p.notes).trim(),
})

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ClientInsert) => clientRepository.create(normalizeClientInsert(p)),
    onSuccess: async (created, variables) => {
      const id = String(created.id)
      const nameFromRow = String(created.name ?? '').trim()
      const nameFromInput = String((variables as ClientInsert | undefined)?.name ?? '').trim()
      const name = nameFromRow || nameFromInput
      const isActive = Boolean((created as Tables<'clients'>).is_active ?? true)

      if (id && name && isActive) {
        qc.setQueryData(queryKeys.clientOptions, (prev: Array<{ id: string; name: string }> | undefined) => {
          const next = [...(prev ?? [])]
          if (!next.some((c) => c.id === id)) next.push({ id, name })
          return next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        })
      }

      qc.invalidateQueries({ queryKey: queryKeys.clients })
      await qc.refetchQueries({ queryKey: queryKeys.clientOptions })
      toast.success('Cliente cadastrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ClientUpdate) => clientRepository.update(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clients })
      qc.invalidateQueries({ queryKey: queryKeys.clientOptions })
      qc.invalidateQueries({ queryKey: ['clients', id] })
      toast.success('Cliente atualizado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
