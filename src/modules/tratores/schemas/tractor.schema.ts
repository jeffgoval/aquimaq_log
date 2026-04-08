import { z } from 'zod'

const optionalIntHours = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.null(), z.coerce.number().int('Use horas inteiras').min(1, 'Mínimo 1 hora')]),
)

const optionalHourmeter = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.null(), z.coerce.number().min(0, 'Horímetro não pode ser negativo')]),
)

export const tractorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  plate: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  default_hour_rate: z.coerce.number().min(0, 'Valor deve ser positivo').default(0),
  purchase_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  residual_value: z.coerce.number().min(0, 'Valor deve ser positivo').default(0),
  useful_life_hours: z.coerce.number().int().min(1, 'Vida útil deve ser maior que 0'),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
  oil_change_interval_hours: optionalIntHours,
  oil_change_last_done_hourmeter: optionalHourmeter,
})

export type TractorInput = z.infer<typeof tractorSchema>
