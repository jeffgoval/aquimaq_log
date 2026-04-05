import { supabase } from '@/integrations/supabase/client'
import type { Views, ClientRevenueRow } from '@/integrations/supabase/db-types'

export const profitabilityRepository = {
  async getTractorProfitability(): Promise<Views<'v_tractor_profitability'>[]> {
    const { data, error } = await supabase.from('v_tractor_profitability').select('*')
    if (error) throw error
    return data
  },

  async getClientRevenue(): Promise<ClientRevenueRow[]> {
    const { data, error } = await supabase
      .from('v_client_revenue')
      .select('*')
      .order('total_billed', { ascending: false })
    if (error) throw error
    return data
  },

  /** Uma linha: diesel, manutenção/peças/óleo, operador (toda a frota). */
  async getFleetSpendByCategory(): Promise<Views<'v_fleet_spend_by_category'>> {
    const { data, error } = await supabase.from('v_fleet_spend_by_category').select('*').single()
    if (error) throw error
    return data
  },
}
