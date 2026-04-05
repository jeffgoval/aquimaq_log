import { supabase } from '@/integrations/supabase/client'
import type { Tables, Inserts, Updates, ReceivableWithClient } from '@/integrations/supabase/db-types'

type PaymentInsert = Inserts<'receivable_payments'>
type ReceivableInsert = Inserts<'receivables'>
type ReceivableUpdate = Updates<'receivables'>

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

  async updateReceivable(id: string, payload: ReceivableUpdate): Promise<Tables<'receivables'>> {
    const { data, error } = await supabase.from('receivables').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  /** Uma parcela criada e quitada na hora (pagamento à vista). */
  async createReceivableWithFullPayment(params: {
    service_id: string
    client_id: string
    amount: number
    payment_date: string
  }): Promise<void> {
    const { data: rec, error: e1 } = await supabase
      .from('receivables')
      .insert({
        service_id: params.service_id,
        client_id: params.client_id,
        installment_number: 1,
        installment_count: 1,
        original_amount: params.amount,
        fee_percent: 0,
        final_amount: params.amount,
        due_date: params.payment_date,
        description: 'À vista',
      })
      .select('id')
      .single()
    if (e1) throw e1
    const { error: e2 } = await supabase.from('receivable_payments').insert({
      receivable_id: rec.id,
      amount: params.amount,
      payment_date: params.payment_date,
      payment_method: 'dinheiro',
    })
    if (e2) throw e2
  },
}
