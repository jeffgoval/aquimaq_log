import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { worklogRepository } from '../services/worklog.repository'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { Inserts, Updates } from '@/integrations/supabase/db-types'

type WorklogInsert = Inserts<'service_worklogs'>
type WorklogUpdate = Updates<'service_worklogs'>

export const useWorklogsByService = (serviceId: string) => useQuery({
  queryKey: queryKeys.worklogsByService(serviceId),
  queryFn: () => worklogRepository.listByService(serviceId),
  enabled: !!serviceId,
})

export function useCreateWorklog(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<WorklogInsert, 'service_id'>) =>
      worklogRepository.create({ ...p, service_id: serviceId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.worklogsByService(serviceId) })
      qc.invalidateQueries({ queryKey: queryKeys.tractorLatestHourmeters })
      qc.invalidateQueries({ queryKey: ['tractors', 'latest-hourmeter'] })
      qc.invalidateQueries({ queryKey: ['profitability'] })
      toast.success('Apontamento registrado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useUpdateWorklog(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorklogUpdate }) => worklogRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.worklogsByService(serviceId) })
      qc.invalidateQueries({ queryKey: queryKeys.tractorLatestHourmeters })
      qc.invalidateQueries({ queryKey: ['tractors', 'latest-hourmeter'] })
      qc.invalidateQueries({ queryKey: ['profitability'] })
      toast.success('Registo de horímetro atualizado!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useDeleteWorklog(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => worklogRepository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.worklogsByService(serviceId) })
      qc.invalidateQueries({ queryKey: queryKeys.tractorLatestHourmeters })
      qc.invalidateQueries({ queryKey: ['tractors', 'latest-hourmeter'] })
      qc.invalidateQueries({ queryKey: ['profitability'] })
      toast.success('Registo removido.')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}
