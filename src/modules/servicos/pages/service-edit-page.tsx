import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editServiceSchema, type EditServiceInput } from '../schemas/service.schema'
import { useService, useUpdateService } from '../hooks/use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { useTrucks } from '@/modules/caminhoes/hooks/use-truck-queries'
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
import { removeReceiptAtPathIfExists, uploadServiceReceipt, uploadServiceCheckoutPhoto } from '@/integrations/supabase/receipts-storage'
import type { Updates } from '@/integrations/supabase/db-types'

type ServiceUpdate = Updates<'services'>

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: service, isLoading, isError, error } = useService(id ?? '')
  const update = useUpdateService(id ?? '')
  const clients = useClientOptions()
  const tractors = useTractorOptions()
  const trucksList = useTrucks()

  const locked = useMemo(
    () => service?.status === 'completed' || service?.status === 'cancelled',
    [service?.status],
  )

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [checkoutFile, setCheckoutFile] = useState<File | null>(null)

  const form = useForm<EditServiceInput>({
    resolver: zodResolver(editServiceSchema) as Resolver<EditServiceInput>,
  })
  const { register, control, watch, formState: { errors }, reset } = form
  
  const vehicleType = watch('vehicle_type')

  useEffect(() => {
    if (!service) return
    reset({
      client_id: service.client_id,
      tractor_id: service.tractor_id ?? undefined,
      truck_id: service.truck_id ?? undefined,
      vehicle_type: service.tractor_id ? 'tractor' : 'truck',
      service_date: service.service_date.slice(0, 10),
      contracted_hour_rate: service.contracted_hour_rate,
      notes: service.notes ?? '',
      charge_type: (service.charge_type as 'valor_fixo' | 'por_km' | 'por_hora') ?? undefined,
      towed_vehicle_plate: service.towed_vehicle_plate ?? undefined,
      towed_vehicle_brand: service.towed_vehicle_brand ?? undefined,
      towed_vehicle_model: service.towed_vehicle_model ?? undefined,
      origin_location: service.origin_location ?? undefined,
      destination_location: service.destination_location ?? undefined,
      checkout_notes: service.checkout_notes ?? undefined,
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
    if (checkoutFile) {
      try {
        const blob = await compressImageToJpeg(checkoutFile)
        if (service.checkout_photo_path) await removeReceiptAtPathIfExists(service.checkout_photo_path)
        receiptExtra.checkout_photo_path = await uploadServiceCheckoutPhoto(id, blob)
      } catch (e) {
        toast.error(parseSupabaseError(e as Error))
        return
      }
    }
    const newReceiptPath =
      typeof receiptExtra.receipt_storage_path === 'string'
        ? receiptExtra.receipt_storage_path
        : undefined
    try {
      if (locked) {
        await update.mutateAsync({ notes: v.notes?.trim() || null, checkout_notes: v.checkout_notes?.trim() || null, ...receiptExtra })
      } else {
        const isTruck = v.vehicle_type === 'truck'
        await update.mutateAsync({
          client_id: v.client_id,
          tractor_id: !isTruck ? v.tractor_id || null : null,
          truck_id: isTruck ? v.truck_id || null : null,
          primary_operator_id: null,
          service_date: v.service_date,
          contracted_hour_rate: v.contracted_hour_rate,
          notes: v.notes?.trim() || null,
          charge_type: isTruck ? v.charge_type || undefined : undefined,
          towed_vehicle_plate: isTruck ? v.towed_vehicle_plate?.toUpperCase() || undefined : undefined,
          towed_vehicle_brand: isTruck ? v.towed_vehicle_brand || undefined : undefined,
          towed_vehicle_model: isTruck ? v.towed_vehicle_model || undefined : undefined,
          origin_location: isTruck ? v.origin_location || undefined : undefined,
          destination_location: isTruck ? v.destination_location || undefined : undefined,
          checkout_notes: isTruck ? v.checkout_notes?.trim() || null : null,
          ...receiptExtra,
        })
      }
    } catch (e) {
      if (newReceiptPath) void removeReceiptAtPathIfExists(newReceiptPath)
      toast.error(parseSupabaseError(e as Error))
      return
    }
    setReceiptFile(null)
    setCheckoutFile(null)
    navigate(ROUTES.SERVICE_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Serviço inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return <AppErrorState message="Serviço não encontrado" />

  const clientList = clients.data ?? []
  const tractorList = tractors.data ?? []
  const trucks = trucksList.data ?? []
  const lockedClientName = clientList.find((c) => c.id === service.client_id)?.name ?? '—'
  const lockedTractorName = tractorList.find((t) => t.id === service.tractor_id)?.name ?? ''
  const lockedTruckName = trucks.find((t) => t.id === service.truck_id)?.name ?? ''
  const lockedVehicle = lockedTractorName || lockedTruckName || '—'

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
                  <p className="field-label">Veículo</p>
                  <p className={cn('typo-body rounded-lg border border-border bg-muted/30 px-3 py-2')}>{lockedVehicle}</p>
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
                        {tractorList.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
                    </>
                  ) : (
                    <>
                      <select {...register('truck_id')} className="field mt-1.5">
                        <option value="">Selecione o guincho...</option>
                        {trucks.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} {t.plate ? `(${t.plate})` : ''}</option>
                        ))}
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
                        onValueChange={(vals) => onChange(vals.floatValue ?? undefined)}
                        placeholder="R$ 0,00"
                      />
                    )}
                  />
                  {errors.contracted_hour_rate && <p className="field-error">{errors.contracted_hour_rate.message}</p>}
                </div>
                {vehicleType === 'truck' && (
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
                )}
              </>
            )}
            <div className="sm:col-span-3">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={2} className="field resize-none" placeholder="Detalhes..." />
            </div>
            {(vehicleType === 'truck' || service.truck_id) && (
              <div className="sm:col-span-3 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Vistoria antes do reboque</p>
                <p className="text-xs text-muted-foreground">
                  Registre o estado do veículo socorrido antes do embarque — foto e observações ficam vinculadas ao serviço.
                </p>
                {service.checkout_photo_path ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <ReceiptViewButton storagePath={service.checkout_photo_path} variant="secondary" size="sm" label="Ver foto da vistoria" />
                    <span className="text-xs text-muted-foreground">Anexe outra imagem para substituir.</span>
                  </div>
                ) : null}
                <ReceiptPhotoPicker file={checkoutFile} onChange={setCheckoutFile} disabled={update.isPending} label="Foto da vistoria" />
                <div>
                  <label className="field-label">Observações da vistoria</label>
                  <textarea
                    {...register('checkout_notes')}
                    rows={2}
                    className="field resize-none"
                    placeholder="Ex.: arranhado no para-choque dianteiro, pneu furado, sem documentos..."
                  />
                </div>
              </div>
            )}
            <div className="sm:col-span-3 rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Recibo / nota do serviço</p>
              <p className="text-xs text-muted-foreground">
                Anexe a foto do recibo assinado ou da NF. O arquivo fica armazenado com segurança no Supabase.
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
