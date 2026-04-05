import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, MachineCostWithTractor } from '@/integrations/supabase/db-types'

type CostInsert = Inserts<'machine_costs'>
type CostUpdate = Updates<'machine_costs'>

export const costRepository = {
  async list(): Promise<MachineCostWithTractor[]> {
    const { data, error } = await supabase
      .from('machine_costs')
      .select('*, tractors(name), trucks(name), services(service_date), suppliers(name, cnpj)')
      .order('cost_date', { ascending: false })
    if (error) throw error
    return (data ?? []) as MachineCostWithTractor[]
  },

  async create(payload: CostInsert): Promise<Tables<'machine_costs'>> {
    const { data, error } = await supabase.from('machine_costs').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: CostUpdate): Promise<Tables<'machine_costs'>> {
    const { data, error } = await supabase.from('machine_costs').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
}
