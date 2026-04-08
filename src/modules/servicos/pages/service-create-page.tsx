import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft, Check, UserPlus } from 'lucide-react'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { ROUTES } from '@/shared/constants/routes'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useCreateService } from '../hooks/use-service-queries'
import { useClientOptions, useCreateClient } from '@/modules/clientes/hooks/use-client-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { useTrucks } from '@/modules/caminhoes/hooks/use-truck-queries'
import { clientSchema, type ClientInput } from '@/modules/clientes/schemas/client.schema'
import { AppPhoneInput } from '@/shared/components/app/app-numeric-input'
import { cn } from '@/shared/lib/cn'
import dayjs from '@/shared/lib/dayjs'

const STEPS = [
  { id: 1, label: 'Cliente' },
  { id: 2, label: 'Veículo' },
  { id: 3, label: 'Valores' },
  { id: 4, label: 'Confirmar' },
]

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.id
        const active = current === step.id
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  done
                    ? 'bg-primary text-white'
                    : active
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap hidden sm:block',
                  active ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 mb-4', current > step.id ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Modal rápido para cadastrar cliente sem sair do wizard
function NewClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string, name: string) => void }) {
  const create = useCreateClient()
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema) as Resolver<ClientInput>,
    defaultValues: { name: '', is_active: true },
  })
  const { register, control, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (v) => {
    const created = await create.mutateAsync(v)
    onCreated(created.id, created.name)
  })

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground">Cadastrar novo cliente</p>
            <p className="text-xs text-muted-foreground mt-0.5">Preencha o nome para continuar. Os demais dados pode completar depois.</p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </AppButton>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="field-label">Nome *</label>
            <input {...register('name')} className="field" placeholder="Nome completo ou razão social" autoFocus />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>
          <div>
            <label className="field-label">Telefone</label>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <AppPhoneInput
                  ref={ref}
                  value={value ?? ''}
                  onBlur={onBlur}
                  onValueChange={(vals) => onChange(vals.formattedValue)}
                />
              )}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <AppButton type="submit" loading={create.isPending} loadingText="Salvando..." className="flex-1">
              Cadastrar e continuar
            </AppButton>
            <AppButton type="button" variant="ghost" onClick={onClose}>Cancelar</AppButton>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null
}

export function ServiceCreatePage() {
  const navigate = useNavigate()
  const createService = useCreateService()
  const clients = useClientOptions()
  const tractors = useTractorOptions()
  const trucks = useTrucks()

  const [step, setStep] = useState(1)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  // Guarda o nome do cliente recém-criado no modal (antes do re-fetch da query)
  const [newClientName, setNewClientName] = useState<string | null>(null)

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
    defaultValues: {
      service_date: dayjs().format('YYYY-MM-DD'),
      vehicle_type: 'tractor',
      charge_type: 'por_hora',
      contracted_hour_rate: 0,
    },
  })
  const { register, control, watch, setValue, formState: { errors } } = form

  const vehicleType = watch('vehicle_type')
  const clientId = watch('client_id')
  const tractorId = watch('tractor_id')
  const truckId = watch('truck_id')

  const clientList = clients.data ?? []
  const tractorList = tractors.data ?? []
  const truckList = trucks.data ?? []

  // Usa o nome local se o cliente foi recém-criado e ainda não está na lista re-fetchada
  const selectedClient = clientList.find((c) => c.id === clientId) ?? (clientId && newClientName ? { id: clientId, name: newClientName } : undefined)
  const selectedTractor = tractorList.find((t) => t.id === tractorId)
  const selectedTruck = truckList.find((t) => t.id === truckId)
  const selectedVehicle = vehicleType === 'tractor' ? selectedTractor?.name : selectedTruck?.name

  const contractedRate = watch('contracted_hour_rate')
  const serviceDate = watch('service_date')
  const notes = watch('notes')
  const chargeType = watch('charge_type')

  const CHARGE_TYPE_LABELS: Record<string, string> = {
    por_hora: 'Por hora',
    por_km: 'Por KM rodado',
    valor_fixo: 'Valor fixo',
  }

  // Step validation guards
  const step1Valid = !!clientId
  const step2Valid = vehicleType === 'tractor' ? !!tractorId : !!truckId
  const step3Valid = contractedRate > 0 && !!serviceDate

  const goNext = () => {
    if (step === 1 && !step1Valid) return
    if (step === 2 && !step2Valid) return
    if (step === 3 && !step3Valid) return
    setStep((s) => s + 1)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const isTruck = values.vehicle_type === 'truck'
    const service = await createService.mutateAsync({
      client_id: values.client_id,
      tractor_id: !isTruck ? values.tractor_id || null : null,
      truck_id: isTruck ? values.truck_id || null : null,
      primary_operator_id: null,
      service_date: values.service_date,
      contracted_hour_rate: values.contracted_hour_rate,
      owner_discount_amount: 0,
      notes: values.notes || null,
      status: 'draft',
      charge_type: isTruck ? values.charge_type || undefined : undefined,
      towed_vehicle_plate: isTruck ? values.towed_vehicle_plate?.toUpperCase() || undefined : undefined,
      towed_vehicle_brand: isTruck ? values.towed_vehicle_brand || undefined : undefined,
      towed_vehicle_model: isTruck ? values.towed_vehicle_model || undefined : undefined,
      origin_location: isTruck ? values.origin_location || undefined : undefined,
      destination_location: isTruck ? values.destination_location || undefined : undefined,
    })
    navigate(ROUTES.SERVICE_DETAIL(service.id))
  })

  return (
    <div className="max-w-2xl mx-auto w-full">
      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
          onCreated={(id, name) => {
            setValue('client_id', id, { shouldValidate: true })
            setNewClientName(name)
            setShowNewClientModal(false)
          }}
        />
      )}

      <AppPageHeader
        backTo={ROUTES.SERVICES}
        backLabel="Voltar aos serviços"
        title="Novo Serviço"
      />

      <StepBar current={step} />

      <div className="rounded-xl border border-border bg-card p-6">

        {/* PASSO 1 — Cliente */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <h2 className="text-base font-semibold text-foreground">Para qual cliente é este serviço?</h2>
              <p className="text-sm text-muted-foreground mt-1">Selecione um cliente já cadastrado ou cadastre um novo.</p>
            </div>

            {/* Cliente selecionado — exibe nome em destaque quando já escolhido */}
            {selectedClient ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-primary bg-primary/8 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Cliente selecionado</p>
                  <p className="font-semibold text-foreground">{selectedClient.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue('client_id', undefined as any)
                    setNewClientName(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline shrink-0"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <div>
                <label className="field-label">Cliente *</label>
                <select {...register('client_id')} className="field">
                  <option value="">Selecione um cliente...</option>
                  {clientList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.client_id && <p className="field-error">{errors.client_id.message}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowNewClientModal(true)}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar novo cliente
            </button>
          </div>
        )}

        {/* PASSO 2 — Veículo */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <h2 className="text-base font-semibold text-foreground">Qual máquina ou veículo será usado?</h2>
              <p className="text-sm text-muted-foreground mt-1">Escolha entre trator ou guincho/caminhão.</p>
            </div>

            <div>
              <label className="field-label">Tipo de veículo *</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {[
                  { value: 'tractor', label: 'Trator' },
                  { value: 'truck', label: 'Guincho / Caminhão' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setValue('vehicle_type', opt.value as 'tractor' | 'truck')
                      setValue('tractor_id', undefined)
                      setValue('truck_id', undefined)
                    }}
                    className={cn(
                      'rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all text-left',
                      vehicleType === opt.value
                        ? 'border-primary bg-primary/8 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {vehicleType === 'tractor' ? (
              <div>
                <label className="field-label">Trator *</label>
                <select {...register('tractor_id')} className="field">
                  <option value="">Selecione o trator...</option>
                  {tractorList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
              </div>
            ) : (
              <div>
                <label className="field-label">Guincho / Caminhão *</label>
                <select {...register('truck_id')} className="field">
                  <option value="">Selecione o veículo...</option>
                  {truckList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}{t.plate ? ` (${t.plate})` : ''}</option>
                  ))}
                </select>
                {errors.truck_id && <p className="field-error">{errors.truck_id.message}</p>}
              </div>
            )}

            {/* Dados logísticos do guincho — já no passo 2 para não fragmentar */}
            {vehicleType === 'truck' && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                <p className="text-sm font-medium text-foreground">Dados do serviço de guincho</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Forma de cobrança</label>
                    <select {...register('charge_type')} className="field">
                      <option value="por_hora">Por hora</option>
                      <option value="por_km">Por KM rodado</option>
                      <option value="valor_fixo">Valor fixo</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Placa do veículo socorrido</label>
                    <input {...register('towed_vehicle_plate')} className="field uppercase" placeholder="ABC1D23" />
                  </div>
                  <div>
                    <label className="field-label">Marca / Modelo</label>
                    <input {...register('towed_vehicle_brand')} className="field" placeholder="Ex.: VW Gol" />
                  </div>
                  <div>
                    <label className="field-label">Origem</label>
                    <input {...register('origin_location')} className="field" placeholder="Local de embarque" />
                  </div>
                  <div>
                    <label className="field-label">Destino</label>
                    <input {...register('destination_location')} className="field" placeholder="Local de desembarque" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASSO 3 — Data e valor */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <h2 className="text-base font-semibold text-foreground">Quando e quanto será cobrado?</h2>
              <p className="text-sm text-muted-foreground mt-1">Defina a data do serviço e o valor da taxa contratada.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Data do serviço *</label>
                <input {...register('service_date')} type="date" className="field" />
                {errors.service_date && <p className="field-error">{errors.service_date.message}</p>}
              </div>
              <div>
                <label className="field-label">
                  {vehicleType === 'truck' && chargeType === 'por_km'
                    ? 'Taxa por KM *'
                    : vehicleType === 'truck' && chargeType === 'valor_fixo'
                      ? 'Valor fixo *'
                      : 'Taxa por hora *'}
                </label>
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
            </div>
            <div>
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={3} className="field resize-none" placeholder="Detalhes, condições, local do serviço…" />
            </div>
          </div>
        )}

        {/* PASSO 4 — Resumo / Confirmar */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <h2 className="text-base font-semibold text-foreground">Tudo certo? Confira o resumo:</h2>
              <p className="text-sm text-muted-foreground mt-1">Revise as informações antes de criar o serviço.</p>
            </div>
            <dl className="divide-y divide-border rounded-lg border border-border overflow-hidden text-sm">
              {[
                { label: 'Cliente', value: selectedClient?.name ?? '—' },
                { label: 'Veículo', value: selectedVehicle ?? '—' },
                { label: vehicleType === 'truck' ? 'Tipo de cobrança' : 'Cobrança', value: vehicleType === 'truck' ? (CHARGE_TYPE_LABELS[chargeType ?? 'por_hora'] ?? '—') : 'Por hora' },
                { label: vehicleType === 'truck' && chargeType === 'valor_fixo' ? 'Valor fixo' : 'Taxa contratada', value: `R$ ${(contractedRate ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                { label: 'Data', value: serviceDate ? dayjs(serviceDate).format('DD/MM/YYYY') : '—' },
                ...(notes ? [{ label: 'Observações', value: notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 px-4 py-3">
                  <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              Após criar o serviço você poderá registrar os dias trabalhados e as cobranças ao cliente.
            </p>
          </div>
        )}
      </div>

      {/* Navegação do wizard */}
      <div className="flex items-center justify-between gap-4 mt-6">
        {step > 1 ? (
          <AppButton type="button" variant="secondary" size="md" className="flex items-center" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </AppButton>
        ) : (
          <Link to={ROUTES.SERVICES} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        )}

        {step < 4 ? (
          <AppButton
            type="button"
            variant="primary"
            size="md"
            className="flex items-center"
            onClick={goNext}
            disabled={
              (step === 1 && !step1Valid) ||
              (step === 2 && !step2Valid) ||
              (step === 3 && !step3Valid)
            }
          >
            Continuar
            <ChevronRight className="h-4 w-4 ml-1" />
          </AppButton>
        ) : (
          <AppButton
            type="button"
            variant="primary"
            size="md"
            className="flex items-center"
            loading={createService.isPending}
            loadingText="Criando serviço..."
            onClick={() => void onSubmit()}
          >
            <Check className="h-4 w-4 mr-1" />
            Criar serviço
          </AppButton>
        )}
      </div>
    </div>
  )
}
