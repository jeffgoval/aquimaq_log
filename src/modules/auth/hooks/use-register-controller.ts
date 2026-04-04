import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { auth } from '@/integrations/supabase/auth'
import { ROUTES } from '@/shared/constants/routes'

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof registerSchema>

export function useRegisterController() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      await auth.signUp(values.email, values.password)
      toast.success('Cadastro realizado com sucesso!')
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao realizar cadastro')
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, onSubmit, isSubmitting }
}
