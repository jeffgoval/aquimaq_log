import { z } from 'zod'

export const createServiceSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  tractor_id: z.string().uuid('Selecione um trator'),
  primary_operator_id: z.string().uuid().optional().or(z.literal('')),
  service_date: z.string().min(1, 'Data é obrigatória'),
  contracted_hour_rate: z.coerce.number().min(0, 'Taxa deve ser positiva'),
  notes: z.string().optional(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
