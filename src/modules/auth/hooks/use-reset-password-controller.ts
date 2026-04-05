import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { auth } from '@/integrations/supabase/auth'
import { ROUTES } from '@/shared/constants/routes'
import { resetNewPasswordSchema, type ResetNewPasswordInput } from '../schemas/auth.schema'

export function useResetPasswordController() {
  const navigate = useNavigate()
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const resolvedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const resolve = (ok: boolean) => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true
      setSessionReady(ok)
      setSessionChecked(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' && session) {
        resolve(true)
      }
    })

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || resolvedRef.current) return
      if (session) {
        resolve(true)
      }
    })

    const timeout = window.setTimeout(() => {
      if (cancelled || resolvedRef.current) return
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || resolvedRef.current) return
        resolve(!!session)
      })
    }, 1200)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const form = useForm<ResetNewPasswordInput>({
    resolver: zodResolver(resetNewPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async values => {
    const { error: updateError } = await auth.updatePassword(values.newPassword)
    if (updateError) {
      toast.error(updateError.message || 'Não foi possível definir a nova senha.')
      return
    }
    await auth.signOut()
    toast.success('Senha redefinida. Entre com a nova senha.')
    navigate(ROUTES.LOGIN, { replace: true })
  })

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    sessionReady,
    sessionChecked,
  }
}
