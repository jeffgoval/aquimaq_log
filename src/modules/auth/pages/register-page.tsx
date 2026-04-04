import { useRegisterController } from '../hooks/use-register-controller'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function RegisterPage() {
  const { form, onSubmit, isSubmitting } = useRegisterController()
  const { register, formState: { errors } } = form

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Criar Conta</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Preencha os dados abaixo para cadastrar-se no sistema
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
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Senha
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Confirmar Senha
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full gradient-amber text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity mt-6"
        >
          {isSubmitting ? 'Cadastrando...' : 'Criar Conta'}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já possui conta?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-medium">
              Voltar para o Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
