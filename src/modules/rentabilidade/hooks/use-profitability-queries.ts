import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { profitabilityRepository, type ProfitabilityDateRange } from '../services/profitability.repository'

export { type ProfitabilityDateRange }

export const useTractorProfitability = (range: ProfitabilityDateRange) =>
  useQuery({
    queryKey: queryKeys.profitabilityTractors(range.from, range.to),
    queryFn: () => profitabilityRepository.getTractorProfitability(range),
  })

export const useTruckProfitability = (range: ProfitabilityDateRange) =>
  useQuery({
    queryKey: queryKeys.profitabilityTrucks(range.from, range.to),
    queryFn: () => profitabilityRepository.getTruckProfitability(range),
  })

export const useClientRevenue = (range: ProfitabilityDateRange) =>
  useQuery({
    queryKey: queryKeys.profitabilityClients(range.from, range.to),
    queryFn: () => profitabilityRepository.getClientRevenue(range),
  })

export const useFleetSpendByCategory = (range: ProfitabilityDateRange) =>
  useQuery({
    queryKey: queryKeys.profitabilityFleetSpend(range.from, range.to),
    queryFn: () => profitabilityRepository.getFleetSpendByCategory(range),
  })

export const useResourceProfitability = (range: ProfitabilityDateRange) =>
  useQuery({
    queryKey: queryKeys.profitabilityResources(range.from, range.to),
    queryFn: () => profitabilityRepository.getResourceProfitability(range),
  })
