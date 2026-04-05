import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, WorklogWithOperator } from '@/integrations/supabase/db-types'

type WorklogInsert = Inserts<'service_worklogs'>
type WorklogUpdate = Updates<'service_worklogs'>

export const worklogRepository = {
  async listByService(serviceId: string): Promise<WorklogWithOperator[]> {
    const { data, error } = await supabase
      .from('service_worklogs')
      .select('*, operators(name, default_hour_rate)')
      .eq('service_id', serviceId)
      .order('work_date', { ascending: false })
    if (error) throw error
    return (data ?? []) as WorklogWithOperator[]
  },

  async create(payload: WorklogInsert): Promise<Tables<'service_worklogs'>> {
    const { data, error } = await supabase.from('service_worklogs').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: WorklogUpdate): Promise<Tables<'service_worklogs'>> {
    const { data, error } = await supabase.from('service_worklogs').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('service_worklogs').delete().eq('id', id)
    if (error) throw error
  },
}
