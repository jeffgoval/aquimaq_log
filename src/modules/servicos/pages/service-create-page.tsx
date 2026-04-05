import { Link } from 'react-router-dom'
import { useCreateServiceController } from '../hooks/use-create-service-controller'
import { Controller } from 'react-hook-form'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { ROUTES } from '@/shared/constants/routes'

export function ServiceCreatePage() {
  const { form, onSubmit, isSubmitting, clients, tractors, trucks } = useCreateServiceController()
  const { register, control, watch, formState: { errors } } = form

  const vehicleType = watch('vehicle_type')

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
            <div className="sm:col-span-2">
              <label className="field-label flex gap-4">
                <span className="flex-1">Tipo de Máquina/Veículo *</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-normal">
                  <input type="radio" value="tractor" {...register('vehicle_type')} className="accent-primary" /> Trator
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-normal">
                  <input type="radio" value="truck" {...register('vehicle_type')} className="accent-primary" /> Guincho / Caminhão
                </label>
              </label>

              {vehicleType === 'tractor' ? (
                <>
                  <select {...register('tractor_id')} className="field mt-1.5">
                    <option value="">Selecione o trator...</option>
                    {tractors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
                </>
              ) : (
                <>
                  <select {...register('truck_id')} className="field mt-1.5">
                    <option value="">Selecione o guincho...</option>
                    {trucks.map(t => <option key={t.id} value={t.id}>{t.name} {t.plate ? `(${t.plate})` : ''}</option>)}
                  </select>
                  {errors.truck_id && <p className="field-error">{errors.truck_id.message}</p>}
                </>
              )}
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
            {vehicleType === 'truck' && (
              <>
                <div className="sm:col-span-3 pt-2 border-t border-border mt-2">
                  <h3 className="typo-section-title text-sm mb-3">Dados Logísticos (Guincho)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="field-label">Forma de Cobrança</label>
                      <select {...register('charge_type')} className="field">
                        <option value="por_hora">Por Hora</option>
                        <option value="por_km">Por KM Rodado</option>
                        <option value="valor_fixo">Valor Fixo</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Placa do Socorrido</label>
                      <input {...register('towed_vehicle_plate')} className="field uppercase" placeholder="ABC1D23" />
                    </div>
                    <div>
                      <label className="field-label">Marca/Modelo</label>
                      <input {...register('towed_vehicle_brand')} className="field" placeholder="Ex: VW Gol" />
                    </div>
                    <div className="sm:col-span-1.5">
                      <label className="field-label">Origem</label>
                      <input {...register('origin_location')} className="field" placeholder="Local de embarque" />
                    </div>
                    <div className="sm:col-span-1.5">
                      <label className="field-label">Destino</label>
                      <input {...register('destination_location')} className="field" placeholder="Local de desembarque" />
                    </div>
                  </div>
                </div>
              </>
            )}
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
