import { z } from 'zod'

export const createServiceSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  tractor_id: z.string().uuid('Selecione um trator'),
  service_date: z.string().min(1, 'Data é obrigatória'),
  contracted_hour_rate: z.coerce.number().min(0, 'Taxa deve ser positiva'),
  /** Desconto fixo em R$ sobre a faturação por horas (dono da operação). */
  owner_discount_amount: z.number().min(0, 'Desconto não pode ser negativo').default(0),
  notes: z.string().optional(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
