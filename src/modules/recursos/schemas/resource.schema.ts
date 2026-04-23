import { z } from 'zod'

export const resourceSchema = z.object({
  name: z.string().min(2, 'Informe o nome do recurso'),
  type: z.enum(['tractor', 'truck', 'equipment']),
  billing_type: z.enum(['daily', 'hourly', 'fixed', 'km', 'equipment_15d', 'equipment_30d']),
  rate: z.coerce.number().min(0, 'A tarifa deve ser maior ou igual a zero'),
  truck_pricing: z
    .object({
      fixed: z.coerce.number().min(0, 'Valor fixo deve ser >= 0'),
      km: z.coerce.number().min(0, 'Valor por km deve ser >= 0'),
    })
    .optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  status: z.enum(['available', 'maintenance', 'inactive']),
  equipment_pricing: z
    .object({
      hourly: z.coerce.number().min(0, 'Hora deve ser >= 0'),
      daily: z.coerce.number().min(0, 'Diária deve ser >= 0'),
      equipment_15d: z.coerce.number().min(0, 'Pacote 15 dias deve ser >= 0'),
      equipment_30d: z.coerce.number().min(0, 'Pacote 30 dias deve ser >= 0'),
    })
    .optional(),
})

/** Valores após validação/transformação (uso em submit e payloads). */
export type ResourceInput = z.output<typeof resourceSchema>
/** Estado bruto do formulário (Zod 4: `coerce` difere input vs output). */
export type ResourceFormInput = z.input<typeof resourceSchema>
