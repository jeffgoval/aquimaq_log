import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, ServiceWithJoins } from '@/integrations/supabase/db-types'

type ServiceInsert = Inserts<'services'>
type ServiceUpdate = Updates<'services'>

export const serviceRepository = {
  async list(): Promise<ServiceWithJoins[]> {
    const { data, error } = await supabase
      .from('services')
      .select(
        '*, clients(name), tractors(name, standard_hour_cost), trucks(name), receivables!receivables_service_id_fkey(id, status, final_amount, paid_amount)',
      )
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ServiceWithJoins[]
  },

  async getById(id: string): Promise<ServiceWithJoins> {
    const { data, error } = await supabase
      .from('services')
      .select(
        '*, clients(name), tractors(name, standard_hour_cost), trucks(name), receivables!receivables_service_id_fkey(id, status, final_amount, paid_amount)',
      )
      .eq('id', id)
      .single()
    if (error) throw error
    return data as ServiceWithJoins
  },

  /** Serviços em que o operador tem pelo menos um apontamento de horímetro (vale/pagamento no ledger). */
  async listByOperatorWorklogs(operatorId: string): Promise<{ id: string; service_date: string; clients: { name: string } | null }[]> {
    const { data, error } = await supabase
      .from('service_worklogs')
      .select('service_id, work_date, services!inner(id, service_date, clients(name))')
      .eq('operator_id', operatorId)
      .order('work_date', { ascending: false })
      .limit(300)
    if (error) throw error
    const seen = new Map<string, { id: string; service_date: string; clients: { name: string } | null }>()
    for (const row of data ?? []) {
      const s = row.services as { id: string; service_date: string; clients: { name: string } | null } | null
      if (s?.id && !seen.has(s.id)) seen.set(s.id, s)
      if (seen.size >= 80) break
    }
    return [...seen.values()]
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
