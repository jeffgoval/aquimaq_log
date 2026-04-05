import { useRegisterController } from '../hooks/use-register-controller'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPasswordInput } from '@/shared/components/app/app-password-input'

export function RegisterPage() {
  const { form, onSubmit, isSubmitting } = useRegisterController()
  const { register, formState: { errors } } = form

  return (
    <div>
      <h2 className="typo-auth-screen-title mb-1">Criar Conta</h2>
      <p className="typo-body-muted mb-8">
        Preencha os dados abaixo para cadastrar-se no sistema
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
          <label className="field-label">Senha</label>
          <AppPasswordInput
            {...register('password')}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>

        <div>
          <label className="field-label">Confirmar Senha</label>
          <AppPasswordInput
            {...register('confirmPassword')}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          loadingText="Cadastrando..."
          className="w-full mt-6"
        >
          Criar Conta
        </AppButton>

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
