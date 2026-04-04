import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, WorklogWithOperator } from '@/integrations/supabase/db-types'

type WorklogInsert = Inserts<'service_worklogs'>

export const worklogRepository = {
  async listByService(serviceId: string): Promise<WorklogWithOperator[]> {
    const { data, error } = await supabase
      .from('service_worklogs')
      .select('*, operators(name)')
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
}
