import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { tractorRepository } from '../services/tractor.repository'
import { computeOilChangeAlerts } from '../lib/oil-change-alerts'
import { useTractorList } from './use-tractor-queries'

export function useTractorLatestHourmetersQuery() {
  return useQuery({
    queryKey: queryKeys.tractorLatestHourmeters,
    queryFn: () => tractorRepository.listLatestHourmeters(),
  })
}

export function useTractorLatestHourmeterQuery(tractorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tractorLatestHourmeter(tractorId ?? ''),
    queryFn: () => tractorRepository.getLatestHourmeter(tractorId!),
    enabled: !!tractorId,
  })
}

export function usePreventiveOilAlerts() {
  const tractors = useTractorList()
  const hourmeters = useTractorLatestHourmetersQuery()

  const alerts = useMemo(() => {
    if (!tractors.data || !hourmeters.data) return []
    const map = new Map<string, number>()
    for (const row of hourmeters.data) {
      const id = row.tractor_id
      const h = row.latest_hourmeter
      if (id != null && h != null) map.set(id, Number(h))
    }
    return computeOilChangeAlerts(tractors.data, map)
  }, [tractors.data, hourmeters.data])

  return {
    alerts,
    isLoading: tractors.isLoading || hourmeters.isLoading,
    isError: tractors.isError || hourmeters.isError,
  }
}
