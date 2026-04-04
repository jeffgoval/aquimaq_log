import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '../schemas/auth.schema'
import { auth } from '@/integrations/supabase/auth'
import { ROUTES } from '@/shared/constants/routes'

export function useLoginController() {
  const navigate = useNavigate()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await auth.signIn(values.email, values.password)
    if (error) {
      toast.error('Credenciais inválidas. Verifique e-mail e senha.')
      return
    }
    navigate(ROUTES.DASHBOARD)
  })

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting }
}
