import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates } from '@/integrations/supabase/db-types'

type SupplierInsert = Inserts<'suppliers'>
type SupplierUpdate = Updates<'suppliers'>

export const supplierRepository = {
  async list(): Promise<Tables<'suppliers'>[]> {
    const { data, error } = await supabase.from('suppliers').select('*').order('name')
    if (error) throw error
    return data
  },

  async listActive(): Promise<Pick<Tables<'suppliers'>, 'id' | 'name'>[]> {
    const { data, error } = await supabase.from('suppliers').select('id, name').eq('is_active', true).order('name')
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Tables<'suppliers'>> {
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(payload: SupplierInsert): Promise<Tables<'suppliers'>> {
    const { data, error } = await supabase.from('suppliers').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: SupplierUpdate): Promise<Tables<'suppliers'>> {
    const { data, error } = await supabase.from('suppliers').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
}
