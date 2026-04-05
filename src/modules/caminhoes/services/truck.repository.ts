import { supabase } from '@/integrations/supabase/client'
import type { TruckRow } from '../types/truck.types'

export const fetchTrucks = async (): Promise<TruckRow[]> => {
  const { data, error } = await supabase.from('trucks').select('*').order('name')
  if (error) throw error
  return data
}

export const fetchTruckById = async (id: string): Promise<TruckRow> => {
  const { data, error } = await supabase.from('trucks').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createTruck = async (payload: Omit<TruckRow, 'id' | 'created_at' | 'updated_at'>): Promise<TruckRow> => {
  const { data, error } = await supabase.from('trucks').insert(payload).select().single()
  if (error) throw error
  return data
}

export const updateTruck = async (id: string, payload: Partial<TruckRow>): Promise<TruckRow> => {
  const { data, error } = await supabase.from('trucks').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteTruck = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trucks').delete().eq('id', id)
  if (error) throw error
}
