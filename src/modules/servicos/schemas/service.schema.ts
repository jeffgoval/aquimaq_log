import { z } from 'zod'

export const createServiceSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  vehicle_type: z.enum(['tractor', 'truck']),
  tractor_id: z.string().uuid('Selecione um trator').optional().nullable(),
  truck_id: z.string().uuid('Selecione um guincho').optional().nullable(),
  service_date: z.string().min(1, 'Data é obrigatória'),
  contracted_hour_rate: z.coerce.number().min(0, 'Taxa/valor deve ser positivo'),
  notes: z.string().optional(),
  // Truck fields
  charge_type: z.enum(['valor_fixo', 'por_km', 'por_hora']).optional().nullable(),
  towed_vehicle_plate: z.string().optional().nullable(),
  towed_vehicle_brand: z.string().optional().nullable(),
  towed_vehicle_model: z.string().optional().nullable(),
  origin_location: z.string().optional().nullable(),
  destination_location: z.string().optional().nullable()
}).refine(data => {
  if (data.vehicle_type === 'tractor') return !!data.tractor_id
  if (data.vehicle_type === 'truck') return !!data.truck_id
  return false
}, {
  message: 'Veículo obrigatório',
  path: ['tractor_id'] // shows error on tractor dropdown typically
})

// Used for partial edits:
export const editServiceSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  vehicle_type: z.enum(['tractor', 'truck']),
  tractor_id: z.string().uuid('Selecione um trator').optional().nullable(),
  truck_id: z.string().uuid('Selecione um guincho').optional().nullable(),
  service_date: z.string().min(1, 'Data é obrigatória'),
  contracted_hour_rate: z.coerce.number().min(0, 'Taxa/valor deve ser positivo'),
  notes: z.string().optional().nullable(),
  // Truck fields
  charge_type: z.enum(['valor_fixo', 'por_km', 'por_hora']).optional().nullable(),
  towed_vehicle_plate: z.string().optional().nullable(),
  towed_vehicle_brand: z.string().optional().nullable(),
  towed_vehicle_model: z.string().optional().nullable(),
  origin_location: z.string().optional().nullable(),
  destination_location: z.string().optional().nullable()
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type EditServiceInput = z.infer<typeof editServiceSchema>
