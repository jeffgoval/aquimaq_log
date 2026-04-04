import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates } from '@/integrations/supabase/db-types'

type ClientInsert = Inserts<'clients'>
type ClientUpdate = Updates<'clients'>

export const clientRepository = {
  async list(): Promise<Tables<'clients'>[]> {
    const { data, error } = await supabase.from('clients').select('*').order('name')
    if (error) throw error
    return data
  },

  async listActive(): Promise<Pick<Tables<'clients'>, 'id' | 'name'>[]> {
    const { data, error } = await supabase.from('clients').select('id, name').eq('is_active', true).order('name')
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Tables<'clients'>> {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(payload: ClientInsert): Promise<Tables<'clients'>> {
    const { data, error } = await supabase.from('clients').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: ClientUpdate): Promise<Tables<'clients'>> {
    const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
}
