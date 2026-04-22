import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Views, ClientRevenueRow, TruckProfitabilityRow } from '@/integrations/supabase/db-types'

/** Intervalo inclusive; null em from/to = sem limite nesse lado (visão acumulada). */
export type ProfitabilityDateRange = { from: string | null; to: string | null }

export type TractorProfitabilityRow = Views<'v_tractor_profitability'>

function throwProfitabilityRpcError(error: PostgrestError): never {
  const msg = error.message ?? ''
  const details = error.details ?? ''
  if (
    error.code === 'PGRST202'
    || /Could not find the function/i.test(msg)
    || /schema cache/i.test(msg)
    || /404/.test(details)
    || /404/.test(msg)
  ) {
    throw new Error(
      'Não foi possível carregar os dados de rentabilidade no momento. Tente novamente em instantes.',
    )
  }
  throw error
}

export const profitabilityRepository = {
  async getTractorProfitability(range?: ProfitabilityDateRange): Promise<TractorProfitabilityRow[]> {
    const { data, error } = await supabase.rpc('fn_tractor_profitability_range', {
      p_start: range?.from ?? undefined,
      p_end: range?.to ?? undefined,
    })
    if (error) throwProfitabilityRpcError(error)
    return (data ?? []) as TractorProfitabilityRow[]
  },

  async getTruckProfitability(range?: ProfitabilityDateRange): Promise<TruckProfitabilityRow[]> {
    const { data, error } = await supabase.rpc('fn_truck_profitability_range', {
      p_start: range?.from ?? undefined,
      p_end: range?.to ?? undefined,
    })
    if (error) throwProfitabilityRpcError(error)
    return (data ?? []) as TruckProfitabilityRow[]
  },

  async getClientRevenue(range?: ProfitabilityDateRange): Promise<ClientRevenueRow[]> {
    const { data, error } = await supabase.rpc('fn_client_revenue_range', {
      p_start: range?.from ?? undefined,
      p_end: range?.to ?? undefined,
    })
    if (error) throwProfitabilityRpcError(error)
    const rows = (data ?? []) as ClientRevenueRow[]
    return [...rows].sort((a, b) => Number(b.total_billed ?? 0) - Number(a.total_billed ?? 0))
  },

  async getFleetSpendByCategory(range?: ProfitabilityDateRange): Promise<Views<'v_fleet_spend_by_category'>> {
    const { data, error } = await supabase.rpc('fn_fleet_spend_by_category_range', {
      p_start: range?.from ?? undefined,
      p_end: range?.to ?? undefined,
    })
    if (error) throwProfitabilityRpcError(error)
    const row = data?.[0]
    return {
      spend_diesel: Number(row?.spend_diesel ?? 0),
      spend_maintenance: Number(row?.spend_maintenance ?? 0),
      spend_operator: Number(row?.spend_operator ?? 0),
    }
  },
}
