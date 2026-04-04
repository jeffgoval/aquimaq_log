import { z } from 'zod'

const digitsOnly = (s: string) => s.replace(/\D/g, '')

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().optional(),
  phone: z.string().optional(),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || digitsOnly(v).length === 0 || digitsOnly(v).length === 14, {
      message: 'CNPJ deve ter 14 dígitos',
    }),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type SupplierInput = z.infer<typeof supplierSchema>
