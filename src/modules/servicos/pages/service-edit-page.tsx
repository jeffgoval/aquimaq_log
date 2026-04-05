import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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
import { AppMoney } from '@/shared/components/app/app-money'
import { cn } from '@/shared/lib/cn'
import { ReceiptPhotoPicker, ReceiptViewButton } from '@/shared/components/receipts'
import { compressImageToJpeg } from '@/shared/lib/image-compress'
import { parseSupabaseError } from '@/shared/lib/errors'
import { removeReceiptAtPathIfExists, uploadServiceReceipt } from '@/integrations/supabase/receipts-storage'
import type { Updates } from '@/integrations/supabase/db-types'

type ServiceUpdate = Updates<'services'>

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

  const [receiptFile, setReceiptFile] = useState<File | null>(null)

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
      notes: service.notes ?? '',
    })
  }, [service, reset])

  const onSubmit = form.handleSubmit(async (v) => {
    if (!id || !service) return
    const receiptExtra: ServiceUpdate = {}
    if (receiptFile) {
      try {
        const blob = await compressImageToJpeg(receiptFile)
        if (service.receipt_storage_path) await removeReceiptAtPathIfExists(service.receipt_storage_path)
        receiptExtra.receipt_storage_path = await uploadServiceReceipt(id, blob)
      } catch (e) {
        toast.error(parseSupabaseError(e as Error))
        return
      }
    }
    if (locked) {
      await update.mutateAsync({ notes: v.notes?.trim() || null, ...receiptExtra })
    } else {
      await update.mutateAsync({
        client_id: v.client_id,
        tractor_id: v.tractor_id,
        primary_operator_id: null,
        service_date: v.service_date,
        contracted_hour_rate: v.contracted_hour_rate,
        notes: v.notes?.trim() || null,
        ...receiptExtra,
      })
    }
    setReceiptFile(null)
    navigate(ROUTES.SERVICE_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Serviço inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return <AppErrorState message="Serviço não encontrado" />

  const clientList = clients.data ?? []
  const tractorList = tractors.data ?? []
  const lockedClientName = clientList.find((c) => c.id === service.client_id)?.name ?? '—'
  const lockedTractorName = tractorList.find((t) => t.id === service.tractor_id)?.name ?? '—'

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={ROUTES.SERVICE_DETAIL(id)}
        backLabel="Voltar ao serviço"
        title="Editar Serviço"
        description={
          locked
            ? 'Encerrado: observações gerais e recibo aqui; notas por linha de horímetro no detalhe do serviço.'
            : undefined
        }
      />
      {locked && (
        <p className="mb-4 text-sm text-muted-foreground rounded-lg border border-border bg-card px-4 py-3">
          Este serviço está <strong className="text-foreground">{service.status === 'completed' ? 'concluído' : 'cancelado'}</strong>.
          Cliente, trator, data e taxa ficam bloqueados; use a secção de horímetro no detalhe do serviço para notas por lançamento.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {locked ? (
              <>
                <input type="hidden" {...register('client_id')} />
                <input type="hidden" {...register('tractor_id')} />
                <input type="hidden" {...register('service_date')} />
                <input type="hidden" {...register('contracted_hour_rate', { valueAsNumber: true })} />
                <div>
                  <p className="field-label">Cliente</p>
                  <p className={cn('typo-body rounded-lg border border-border bg-muted/30 px-3 py-2')}>{lockedClientName}</p>
                </div>
                <div>
                  <p className="field-label">Trator</p>
                  <p className={cn('typo-body rounded-lg border border-border bg-muted/30 px-3 py-2')}>{lockedTractorName}</p>
                </div>
                <div>
                  <p className="field-label">Data</p>
                  <p className={cn('typo-body rounded-lg border border-border bg-muted/30 px-3 py-2 tabular-nums')}>
                    {service.service_date.slice(0, 10).split('-').reverse().join('/')}
                  </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <p className="field-label">Taxa/hora (contratada)</p>
                  <p className={cn('typo-body rounded-lg border border-border bg-muted/30 px-3 py-2')}>
                    <AppMoney value={service.contracted_hour_rate} />
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="field-label">Cliente *</label>
                  <select {...register('client_id')} className="field">
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
                  <select {...register('tractor_id')} className="field">
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
                        onValueChange={(vals) => onChange(vals.floatValue ?? undefined)}
                        placeholder="R$ 0,00"
                      />
                    )}
                  />
                  {errors.contracted_hour_rate && <p className="field-error">{errors.contracted_hour_rate.message}</p>}
                </div>
              </>
            )}
            <div className="sm:col-span-3">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={2} className="field resize-none" placeholder="Detalhes..." />
            </div>
            <div className="sm:col-span-3 rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Recibo / nota do serviço</p>
              <p className="text-xs text-muted-foreground">
                Guarde a foto do recibo assinado ou da NF para consulta futura (bucket seguro no Supabase).
              </p>
              {service.receipt_storage_path ? (
                <div className="flex flex-wrap items-center gap-2">
                  <ReceiptViewButton storagePath={service.receipt_storage_path} variant="secondary" size="sm" />
                  <span className="text-xs text-muted-foreground">Anexe outra imagem abaixo para substituir.</span>
                </div>
              ) : null}
              <ReceiptPhotoPicker file={receiptFile} onChange={setReceiptFile} disabled={update.isPending} />
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
