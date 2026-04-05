import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { auth } from '@/integrations/supabase/auth'
import { useAuth } from '@/app/providers/auth-provider'
import {
  profileSchema,
  changePasswordSchema,
  type ProfileInput,
  type ChangePasswordInput,
} from '../schemas/account.schema'

function getFullNameFromUser(user: { user_metadata?: Record<string, unknown> } | null): string {
  const v = user?.user_metadata?.full_name
  return typeof v === 'string' ? v : ''
}

export function useAccountProfileController() {
  const { user } = useAuth()

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '' },
  })
  const { reset } = form

  useEffect(() => {
    reset({ full_name: getFullNameFromUser(user) })
  }, [user, reset])

  const onSubmit = form.handleSubmit(async values => {
    const { error } = await auth.updateUserMetadata({ full_name: values.full_name || '' })
    if (error) {
      toast.error(error.message || 'Não foi possível salvar o nome.')
      return
    }
    toast.success('Nome atualizado.')
  })

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting }
}

export function useAccountPasswordController() {
  const { user } = useAuth()
  const email = user?.email ?? ''

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit(async values => {
    if (!email) {
      toast.error('Sessão inválida. Entre novamente.')
      return
    }

    const { error: signInError } = await auth.signIn(email, values.currentPassword)
    if (signInError) {
      toast.error('Senha atual incorreta.')
      return
    }

    const { error: updateError } = await auth.updatePassword(values.newPassword)
    if (updateError) {
      toast.error(updateError.message || 'Não foi possível alterar a senha.')
      return
    }

    toast.success('Senha alterada com sucesso.')
    form.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  })

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting }
}
