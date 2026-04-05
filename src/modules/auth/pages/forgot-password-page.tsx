import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema'
import { auth } from '@/integrations/supabase/auth'
import { ROUTES } from '@/shared/constants/routes'
import { AppButton } from '@/shared/components/app/app-button'

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  const { register, formState: { errors, isSubmitting, isSubmitSuccessful } } = form

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await auth.resetPassword(values.email)
    if (error) {
      toast.error('Não foi possível enviar o e-mail. Tente novamente.')
    } else {
      toast.success('E-mail de recuperação enviado!')
    }
  })

  return (
    <div>
      <h2 className="typo-auth-screen-title mb-1">Recuperar senha</h2>
      <p className="typo-body-muted mb-8">
        Enviaremos um link para redefinir sua senha
      </p>

      {isSubmitSuccessful ? (
        <p className="text-sm text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-500/15 rounded-lg p-4">
          Verifique sua caixa de e-mail para o link de recuperação.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="field-label">E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="field"
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            loadingText="Enviando..."
            className="w-full"
          >
            Enviar link
          </AppButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
