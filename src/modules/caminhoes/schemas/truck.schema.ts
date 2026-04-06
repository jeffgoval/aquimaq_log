import { z } from 'zod'

export const truckSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  plate: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  purchase_value: z.number().min(0, 'Valor de compra inválido'),
  residual_value: z.number().min(0, 'Valor residual inválido'),
  current_odometer: z.number().min(0, 'Odômetro inválido'),
  useful_life_km: z.number().min(1000, 'Vida útil mínima de 1.000 km'),
  fuel_cost_per_km: z.number().min(0, 'Custo de combustível inválido'),
  is_active: z.boolean(),
  notes: z.string().optional().nullable(),
})

export type TruckFormValues = z.infer<typeof truckSchema>
