import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, Views } from '@/integrations/supabase/db-types'

export type OperatorLedgerRowWithService = Tables<'operator_ledger'> & {
  services: { service_date: string; clients: { name: string } | null } | null
}

type OperatorInsert = Inserts<'operators'>
type OperatorUpdate = Updates<'operators'>
type OperatorLedgerInsert = Inserts<'operator_ledger'>

export const operatorRepository = {
  async list(): Promise<Tables<'operators'>[]> {
    const { data, error } = await supabase.from('operators').select('*').order('name')
    if (error) throw error
    return data
  },

  async listActive(): Promise<Pick<Tables<'operators'>, 'id' | 'name' | 'default_hour_rate'>[]> {
    const { data, error } = await supabase
      .from('operators')
      .select('id, name, default_hour_rate')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Tables<'operators'>> {
    const { data, error } = await supabase.from('operators').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async getLedger(operatorId: string): Promise<Views<'v_operator_financial_balance'>> {
    const { data, error } = await supabase
      .from('v_operator_financial_balance')
      .select('*')
      .eq('operator_id', operatorId)
      .single()
    if (error) throw error
    return data
  },

  async listLedgerRows(operatorId: string): Promise<OperatorLedgerRowWithService[]> {
    const { data, error } = await supabase
      .from('operator_ledger')
      .select('*, services(service_date, clients(name))')
      .eq('operator_id', operatorId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as OperatorLedgerRowWithService[]
  },

  async insertLedgerRow(payload: OperatorLedgerInsert): Promise<Tables<'operator_ledger'>> {
    const { data, error } = await supabase.from('operator_ledger').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async create(payload: OperatorInsert): Promise<Tables<'operators'>> {
    const { data, error } = await supabase.from('operators').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: OperatorUpdate): Promise<Tables<'operators'>> {
    const { data, error } = await supabase.from('operators').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
}
