import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, Views } from '@/integrations/supabase/db-types'

type TractorInsert = Inserts<'tractors'>
type TractorUpdate = Updates<'tractors'>
type LatestHourmeterRow = Pick<Views<'v_tractor_latest_hourmeter'>, 'tractor_id' | 'latest_hourmeter'>

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

  /** Maior horímetro final registado por trator (apontamentos). */
  async listLatestHourmeters(): Promise<LatestHourmeterRow[]> {
    const { data, error } = await supabase.from('v_tractor_latest_hourmeter').select('tractor_id, latest_hourmeter')
    if (error) throw error
    return (data ?? []) as LatestHourmeterRow[]
  },

  async getLatestHourmeter(tractorId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('v_tractor_latest_hourmeter')
      .select('latest_hourmeter')
      .eq('tractor_id', tractorId)
      .maybeSingle()
    if (error) throw error
    const v = data?.latest_hourmeter
    return v != null ? Number(v) : null
  },
}
