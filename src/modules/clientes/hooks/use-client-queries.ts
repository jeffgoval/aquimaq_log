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
export const useClient = (id: string) => useQuery({ queryKey: ['clients', id], queryFn: () => clientRepository.getById(id), enabled: !!id })

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ClientInsert) => clientRepository.create(p),
    onSuccess: (created) => {
      const id = String(created.id)
      const name = String(created.name ?? '').trim()
      const isActive = Boolean((created as Tables<'clients'>).is_active ?? true)

      if (id && name && isActive) {
        qc.setQueryData(queryKeys.clientOptions, (prev: Array<{ id: string; name: string }> | undefined) => {
          const next = [...(prev ?? [])]
          if (!next.some((c) => c.id === id)) next.push({ id, name })
          return next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        })
      }

      qc.invalidateQueries({ queryKey: queryKeys.clients })
      qc.invalidateQueries({ queryKey: queryKeys.clientOptions })
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
