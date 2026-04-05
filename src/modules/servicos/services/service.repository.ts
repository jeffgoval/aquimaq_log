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

  /** Serviços onde o operador é o principal (para ligar vale/pagamento ao serviço). */
  async listByPrimaryOperator(operatorId: string): Promise<{ id: string; service_date: string; clients: { name: string } | null }[]> {
    const { data, error } = await supabase
      .from('services')
      .select('id, service_date, clients(name)')
      .eq('primary_operator_id', operatorId)
      .order('service_date', { ascending: false })
      .limit(80)
    if (error) throw error
    return (data ?? []) as { id: string; service_date: string; clients: { name: string } | null }[]
  },

  async create(payload: ServiceInsert): Promise<Tables<'services'>> {
    const { data, error } = await supabase.from('services').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: ServiceUpdate): Promise<Tables<'services'>> {
    const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single()
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
