import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type ClientInput = z.infer<typeof clientSchema>
