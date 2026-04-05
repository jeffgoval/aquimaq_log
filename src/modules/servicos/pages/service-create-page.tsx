import { Link } from 'react-router-dom'
import { useCreateServiceController } from '../hooks/use-create-service-controller'
import { Controller } from 'react-hook-form'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { ROUTES } from '@/shared/constants/routes'

export function ServiceCreatePage() {
  const { form, onSubmit, isSubmitting, clients, tractors } = useCreateServiceController()
  const { register, control, formState: { errors } } = form

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={ROUTES.SERVICES}
        backLabel="Voltar aos serviços"
        title="Novo Serviço"
        description="Cadastre o trabalho. Desconto do dono (R$) e contas a receber ficam na ficha do serviço depois de criar."
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Cliente *</label>
              <select {...register('client_id')} className="field">
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.client_id && <p className="field-error">{errors.client_id.message}</p>}
              <p className="mt-1.5 typo-caption">
                <Link to={ROUTES.CLIENT_NEW} className="text-primary font-medium hover:underline">
                  Cadastrar cliente
                </Link>
              </p>
            </div>
            <div>
              <label className="field-label">Trator *</label>
              <select {...register('tractor_id')} className="field">
                <option value="">Selecione...</option>
                {tractors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input {...register('service_date')} type="date" className="field" />
              {errors.service_date && <p className="field-error">{errors.service_date.message}</p>}
            </div>
            <div>
              <label className="field-label">Taxa/hora *</label>
              <Controller
                name="contracted_hour_rate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value ?? ''}
                    onValueChange={(v) => onChange(v.floatValue ?? undefined)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {errors.contracted_hour_rate && <p className="field-error">{errors.contracted_hour_rate.message}</p>}
            </div>
            <div className="sm:col-span-3">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={2} className="field resize-none" placeholder="Detalhes, condições, localidade..." />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={isSubmitting} loadingText="Criando...">
            Criar serviço
          </AppButton>
          <Link to={ROUTES.SERVICES} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
