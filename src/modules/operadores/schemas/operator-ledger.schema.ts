import { z } from 'zod'

export const operatorLedgerMovementSchema = z.object({
  entry_type: z.enum(['advance', 'payment', 'commission']),
  amount: z.number().positive('Informe um valor maior que zero'),
  entry_date: z.string().min(1, 'Data obrigatória'),
  notes: z.string().max(500).optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  commission_percent: z.number().min(0).max(100).optional().nullable(),
})

export type OperatorLedgerMovementInput = z.infer<typeof operatorLedgerMovementSchema>
