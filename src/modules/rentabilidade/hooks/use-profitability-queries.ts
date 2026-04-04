import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { profitabilityRepository } from '../services/profitability.repository'

export const useTractorProfitability = () => useQuery({
  queryKey: queryKeys.profitability,
  queryFn: profitabilityRepository.getTractorProfitability,
})
