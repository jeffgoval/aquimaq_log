import { useLoginController } from '../hooks/use-login-controller'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPasswordInput } from '@/shared/components/app/app-password-input'

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
          <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5 items-end">
            <label htmlFor="login-password" className="field-label mb-0 col-start-1 row-start-1 self-end">
              Senha
            </label>
            <div className="col-span-2 row-start-2">
              <AppPasswordInput
                id="login-password"
                {...register('password')}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="col-start-2 row-start-1 justify-self-end text-xs text-primary hover:underline pb-0.5"
            >
              Esqueceu a senha?
            </Link>
          </div>
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
      </form>
    </div>
  )
}
