import { z } from 'zod'

export const operatorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
  document: z.string().optional(),
  default_hour_rate: z.coerce.number().min(0, 'Taxa deve ser positiva').default(0),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
})

export type OperatorInput = z.infer<typeof operatorSchema>
