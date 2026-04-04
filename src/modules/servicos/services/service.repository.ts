import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, ServiceWithJoins } from '@/integrations/supabase/db-types'

type ServiceInsert = Inserts<'services'>
type ServiceUpdate = Updates<'services'>

export const serviceRepository = {
  async list(): Promise<ServiceWithJoins[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*, clients(name), tractors(name, standard_hour_cost), operators:primary_operator_id(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ServiceWithJoins[]
  },

  async getById(id: string): Promise<ServiceWithJoins> {
    const { data, error } = await supabase
      .from('services')
      .select('*, clients(name), tractors(name, standard_hour_cost), operators:primary_operator_id(name)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as ServiceWithJoins
  },

  async create(payload: ServiceInsert): Promise<Tables<'services'>> {
    const { data, error } = await supabase.from('services').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async complete(id: string): Promise<Tables<'services'>> {
    const { data, error } = await supabase
      .from('services')
      .update({ status: 'completed' } satisfies ServiceUpdate)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
