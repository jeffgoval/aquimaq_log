import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
