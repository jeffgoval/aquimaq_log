import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, ReceivableWithClient } from '@/integrations/supabase/db-types'

type PaymentInsert = Inserts<'receivable_payments'>
type ReceivableInsert = Inserts<'receivables'>

export const financialRepository = {
  async listReceivables(filters?: { status?: string }): Promise<ReceivableWithClient[]> {
    let query = supabase
      .from('receivables')
      .select('*, clients(name), services(service_date)')
      .order('due_date')
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as Tables<'receivables'>['status'])
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as ReceivableWithClient[]
  },

  async listByService(serviceId: string): Promise<Tables<'receivables'>[]> {
    const { data, error } = await supabase
      .from('receivables')
      .select('*')
      .eq('service_id', serviceId)
      .order('installment_number')
    if (error) throw error
    return data
  },

  async registerPayment(payload: PaymentInsert): Promise<Tables<'receivable_payments'>> {
    const { data, error } = await supabase
      .from('receivable_payments')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async createInstallments(receivables: ReceivableInsert[]): Promise<void> {
    const { error } = await supabase.from('receivables').insert(receivables)
    if (error) throw error
  },
}
