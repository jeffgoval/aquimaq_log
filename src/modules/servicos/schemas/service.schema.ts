import { z } from 'zod'

export const clientBillingModeSchema = z.enum(['later', 'paid_full', 'pending', 'installments'])

export const createServiceSchema = z
  .object({
    client_id: z.string().uuid('Selecione um cliente'),
    tractor_id: z.string().uuid('Selecione um trator'),
    primary_operator_id: z.string().uuid().optional().or(z.literal('')),
    service_date: z.string().min(1, 'Data é obrigatória'),
    contracted_hour_rate: z.coerce.number().min(0, 'Taxa deve ser positiva'),
    notes: z.string().optional(),
    client_billing_mode: clientBillingModeSchema,
    client_billing_amount: z.coerce.number().min(0).optional(),
    client_payment_date: z.string().optional(),
    client_due_date: z.string().optional(),
    client_installment_count: z.coerce.number().int().min(1).optional(),
    client_fee_percent: z.coerce.number().min(0).optional(),
    client_first_due_date: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.client_billing_mode === 'paid_full') {
      if (!d.client_billing_amount || d.client_billing_amount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o valor recebido', path: ['client_billing_amount'] })
      }
      if (!d.client_payment_date?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data do pagamento é obrigatória', path: ['client_payment_date'] })
      }
    }
    if (d.client_billing_mode === 'pending') {
      if (!d.client_billing_amount || d.client_billing_amount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o valor a receber', path: ['client_billing_amount'] })
      }
      if (!d.client_due_date?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vencimento é obrigatório', path: ['client_due_date'] })
      }
    }
    if (d.client_billing_mode === 'installments') {
      if (!d.client_billing_amount || d.client_billing_amount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o valor total', path: ['client_billing_amount'] })
      }
      const n = d.client_installment_count ?? 0
      if (n < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mínimo 2 parcelas', path: ['client_installment_count'] })
      }
      if (!d.client_first_due_date?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '1º vencimento obrigatório', path: ['client_first_due_date'] })
      }
    }
  })

export type CreateServiceInput = z.infer<typeof createServiceSchema>

/** Valores por omissão para campos de conta a receber (criação e edição de serviço). */
export function getDefaultServiceBillingFields() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    client_billing_mode: 'later' as const,
    client_billing_amount: 0,
    client_payment_date: today,
    client_due_date: today,
    client_installment_count: 2,
    client_fee_percent: 0,
    client_first_due_date: today,
  }
}
