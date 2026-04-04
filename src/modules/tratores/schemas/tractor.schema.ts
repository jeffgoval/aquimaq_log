import { z } from 'zod'

export const tractorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  plate: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchase_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  residual_value: z.coerce.number().min(0, 'Valor deve ser positivo').default(0),
  useful_life_hours: z.coerce.number().int().min(1, 'Vida útil deve ser maior que 0'),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
})

export type TractorInput = z.infer<typeof tractorSchema>
