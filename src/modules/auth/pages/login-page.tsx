import { useLoginController } from '../hooks/use-login-controller'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function LoginPage() {
  const { form, onSubmit, isSubmitting } = useLoginController()
  const { register, formState: { errors } } = form

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Entrar</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Acesse sua conta para continuar
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            E-mail
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">
              Senha
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-amber text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

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
