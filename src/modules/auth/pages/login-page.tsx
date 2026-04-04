import { useLoginController } from '../hooks/use-login-controller'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { AppButton } from '@/shared/components/app/app-button'

export function LoginPage() {
  const { form, onSubmit, isSubmitting } = useLoginController()
  const { register, formState: { errors } } = form

  return (
    <div>
      <h2 className="typo-auth-screen-title mb-1">Entrar</h2>
      <p className="typo-body-muted mb-8">
        Acesse sua conta para continuar
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="field-label">E-mail</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className="field"
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label mb-0">Senha</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="field"
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          loadingText="Entrando..."
          className="w-full mt-2"
        >
          Entrar
        </AppButton>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary hover:underline font-medium">
              Criar agora
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
