import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, MachineCostWithTractor } from '@/integrations/supabase/db-types'

type CostInsert = Inserts<'machine_costs'>

export const costRepository = {
  async list(): Promise<MachineCostWithTractor[]> {
    const { data, error } = await supabase
      .from('machine_costs')
      .select('*, tractors(name), services(service_date), suppliers(name, cnpj)')
      .order('cost_date', { ascending: false })
    if (error) throw error
    return (data ?? []) as MachineCostWithTractor[]
  },

  async create(payload: CostInsert): Promise<Tables<'machine_costs'>> {
    const { data, error } = await supabase.from('machine_costs').insert(payload).select().single()
    if (error) throw error
    return data
  },
}
