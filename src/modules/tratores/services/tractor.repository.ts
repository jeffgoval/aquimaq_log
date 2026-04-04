import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates } from '@/integrations/supabase/db-types'

type TractorInsert = Inserts<'tractors'>
type TractorUpdate = Updates<'tractors'>

export const tractorRepository = {
  async list(): Promise<Tables<'tractors'>[]> {
    const { data, error } = await supabase.from('tractors').select('*').order('name')
    if (error) throw error
    return data
  },

  async listActive(): Promise<Pick<Tables<'tractors'>, 'id' | 'name' | 'brand' | 'model'>[]> {
    const { data, error } = await supabase
      .from('tractors')
      .select('id, name, brand, model')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Tables<'tractors'>> {
    const { data, error } = await supabase.from('tractors').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(payload: TractorInsert): Promise<Tables<'tractors'>> {
    const { data, error } = await supabase.from('tractors').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: TractorUpdate): Promise<Tables<'tractors'>> {
    const { data, error } = await supabase.from('tractors').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deactivate(id: string): Promise<Tables<'tractors'>> {
    return tractorRepository.update(id, { is_active: false })
  },
}
