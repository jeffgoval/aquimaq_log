import { Link } from 'react-router-dom'
import { useResetPasswordController } from '../hooks/use-reset-password-controller'
import { ROUTES } from '@/shared/constants/routes'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPasswordInput } from '@/shared/components/app/app-password-input'

export function ResetPasswordPage() {
  const { form, onSubmit, isSubmitting, sessionReady, sessionChecked } = useResetPasswordController()
  const { register, formState: { errors } } = form

  if (!sessionChecked) {
    return (
      <div>
        <h2 className="typo-auth-screen-title mb-1">Redefinir senha</h2>
        <p className="typo-body-muted">Validando o link…</p>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div>
        <h2 className="typo-auth-screen-title mb-1">Link inválido</h2>
        <p className="typo-body-muted mb-6">
          O link expirou ou já foi usado. Solicite um novo e-mail de recuperação.
        </p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="text-primary text-sm font-medium hover:underline">
          Pedir novo link
        </Link>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="typo-auth-screen-title mb-1">Nova senha</h2>
      <p className="typo-body-muted mb-8">
        Defina uma nova senha para sua conta.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="field-label">Nova senha</label>
          <AppPasswordInput
            {...register('newPassword')}
            autoComplete="new-password"
          />
          {errors.newPassword && <span className="field-error">{errors.newPassword.message}</span>}
        </div>
        <div>
          <label className="field-label">Confirmar senha</label>
          <AppPasswordInput
            {...register('confirmPassword')}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          loadingText="Salvando..."
          className="w-full"
        >
          Salvar nova senha
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
