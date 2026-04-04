import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema'
import { auth } from '@/integrations/supabase/auth'
import { ROUTES } from '@/shared/constants/routes'

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
      <h2 className="text-2xl font-bold text-foreground mb-1">Recuperar senha</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Enviaremos um link para redefinir sua senha
      </p>

      {isSubmitSuccessful ? (
        <p className="text-sm text-green-400 bg-green-400/10 rounded-lg p-4">
          Verifique sua caixa de e-mail para o link de recuperação.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-amber text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </button>
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
