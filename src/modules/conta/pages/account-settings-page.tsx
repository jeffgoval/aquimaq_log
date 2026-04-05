import { useAuth } from '@/app/providers/auth-provider'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPasswordInput } from '@/shared/components/app/app-password-input'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import {
  useAccountProfileController,
  useAccountPasswordController,
} from '../hooks/use-account-settings-controller'

export function AccountSettingsPage() {
  const { user, isLoading } = useAuth()
  const profile = useAccountProfileController()
  const password = useAccountPasswordController()

  if (isLoading) {
    return <AppLoadingState />
  }

  if (!user) {
    return null
  }

  const { register: regProfile, formState: { errors: profileErrors } } = profile.form
  const { register: regPwd, formState: { errors: pwdErrors } } = password.form

  return (
    <div className="max-w-2xl space-y-8">
      <AppPageHeader
        title="Minha conta"
        description="Dados do perfil e segurança da sua conta."
      />

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Perfil</h2>
        <div>
          <label className="field-label">E-mail</label>
          <input
            type="email"
            value={user.email ?? ''}
            readOnly
            disabled
            className="field opacity-70 cursor-not-allowed"
            autoComplete="email"
          />
          <p className="typo-caption text-muted-foreground mt-1.5">
            O e-mail não pode ser alterado aqui.
          </p>
        </div>
        <form onSubmit={profile.onSubmit} className="space-y-4">
          <div>
            <label className="field-label">Nome para exibição</label>
            <input
              {...regProfile('full_name')}
              type="text"
              className="field"
              placeholder="Seu nome"
              autoComplete="name"
            />
            {profileErrors.full_name?.message && (
              <span className="field-error">{profileErrors.full_name.message}</span>
            )}
          </div>
          <AppButton type="submit" disabled={profile.isSubmitting}>
            {profile.isSubmitting ? 'Salvando…' : 'Salvar nome'}
          </AppButton>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Alterar senha</h2>
        <p className="typo-caption text-muted-foreground">
          Confirme a senha atual por segurança antes de definir uma nova.
        </p>
        <form onSubmit={password.onSubmit} className="space-y-4">
          <div>
            <label className="field-label">Senha atual</label>
            <AppPasswordInput
              {...regPwd('currentPassword')}
              autoComplete="current-password"
            />
            {pwdErrors.currentPassword && (
              <span className="field-error">{pwdErrors.currentPassword.message}</span>
            )}
          </div>
          <div>
            <label className="field-label">Nova senha</label>
            <AppPasswordInput
              {...regPwd('newPassword')}
              autoComplete="new-password"
            />
            {pwdErrors.newPassword && (
              <span className="field-error">{pwdErrors.newPassword.message}</span>
            )}
          </div>
          <div>
            <label className="field-label">Confirmar nova senha</label>
            <AppPasswordInput
              {...regPwd('confirmPassword')}
              autoComplete="new-password"
            />
            {pwdErrors.confirmPassword && (
              <span className="field-error">{pwdErrors.confirmPassword.message}</span>
            )}
          </div>
          <AppButton type="submit" disabled={password.isSubmitting}>
            {password.isSubmitting ? 'Alterando…' : 'Alterar senha'}
          </AppButton>
        </form>
      </section>
    </div>
  )
}
