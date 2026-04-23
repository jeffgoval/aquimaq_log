import { z } from 'zod'
import dayjs from '@/shared/lib/dayjs'

export const createBookingSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  resource_id: z.string().min(1, 'Selecione um recurso'),
  pricing_mode: z.enum(['hourly', 'daily', 'fixed', 'km', 'equipment_15d', 'equipment_30d']).optional(),
  start_date: z.string().min(1, 'Data inicial é obrigatória'),
  end_date: z.string().min(1, 'Data final é obrigatória'),
  notes: z.string().optional(),
}).refine(data => {
  const start = dayjs(data.start_date)
  const end = dayjs(data.end_date)
  return end.isAfter(start) || end.isSame(start)
}, {
  message: 'A data final deve ser igual ou posterior à data inicial',
  path: ['end_date']
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
