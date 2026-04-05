import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useService, useUpdateService } from '../hooks/use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: service, isLoading, isError, error } = useService(id ?? '')
  const update = useUpdateService(id ?? '')
  const clients = useClientOptions()
  const tractors = useTractorOptions()

  const locked = useMemo(
    () => service?.status === 'completed' || service?.status === 'cancelled',
    [service?.status],
  )

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
  })
  const { register, control, formState: { errors }, reset } = form

  useEffect(() => {
    if (!service) return
    reset({
      client_id: service.client_id,
      tractor_id: service.tractor_id,
      service_date: service.service_date.slice(0, 10),
      contracted_hour_rate: service.contracted_hour_rate,
      owner_discount_amount: service.owner_discount_amount ?? 0,
      notes: service.notes ?? '',
    })
  }, [service, reset])

  const onSubmit = form.handleSubmit(async (v) => {
    if (!id) return
    if (locked) {
      await update.mutateAsync({ notes: v.notes?.trim() || null })
    } else {
      await update.mutateAsync({
        client_id: v.client_id,
        tractor_id: v.tractor_id,
        primary_operator_id: null,
        service_date: v.service_date,
        contracted_hour_rate: v.contracted_hour_rate,
        owner_discount_amount: v.owner_discount_amount ?? 0,
        notes: v.notes?.trim() || null,
      })
    }
    navigate(ROUTES.SERVICE_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Serviço inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return <AppErrorState message="Serviço não encontrado" />

  const clientList = clients.data ?? []
  const tractorList = tractors.data ?? []

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        title="Editar Serviço"
        description={locked ? 'Apenas observações podem ser alteradas (serviço encerrado).' : undefined}
      />
      {locked && (
        <p className="mb-4 text-sm text-muted-foreground rounded-lg border border-border bg-card px-4 py-3">
          Este serviço está <strong className="text-foreground">{service.status === 'completed' ? 'concluído' : 'cancelado'}</strong>.
          Os demais campos ficam bloqueados para preservar o histórico financeiro.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Cliente *</label>
              <select {...register('client_id')} className="field" disabled={locked}>
                <option value="">Selecione...</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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
              <select {...register('tractor_id')} className="field" disabled={locked}>
                <option value="">Selecione...</option>
                {tractorList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input {...register('service_date')} type="date" className="field" disabled={locked} />
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
                    onValueChange={(vals) => onChange(vals.floatValue ?? undefined)}
                    placeholder="R$ 0,00"
                    disabled={locked}
                  />
                )}
              />
              {errors.contracted_hour_rate && <p className="field-error">{errors.contracted_hour_rate.message}</p>}
            </div>
            <div>
              <label className="field-label">Desconto (dono), R$</label>
              <Controller
                name="owner_discount_amount"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value ?? ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                    disabled={locked}
                  />
                )}
              />
              {errors.owner_discount_amount && (
                <p className="field-error">{errors.owner_discount_amount.message}</p>
              )}
              <p className="typo-caption text-muted-foreground mt-1">
                Abate da faturação bruta (horas × taxa). O custo do operador nos apontamentos não muda.
              </p>
            </div>
            <div className="sm:col-span-3">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={2} className="field resize-none" placeholder="Detalhes..." />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={update.isPending} loadingText="Salvando...">
            Salvar alterações
          </AppButton>
          <Link to={ROUTES.SERVICE_DETAIL(id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
