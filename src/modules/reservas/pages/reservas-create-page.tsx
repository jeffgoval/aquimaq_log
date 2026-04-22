import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppCard } from '@/shared/components/app/app-card'
import { AppButton } from '@/shared/components/app/app-button'
import { createBookingSchema, type CreateBookingInput } from '../schemas/booking.schema'
import { useCreateBooking, useResources } from '../hooks/use-booking-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { Check, X } from 'lucide-react'
import dayjs from '@/shared/lib/dayjs'
import { TZ_APP } from '@/app/config/constants'
import { toast } from 'sonner'

export function ReservasCreatePage() {
  const navigate = useNavigate()
  const createBooking = useCreateBooking()
  const clients = useClientOptions()
  const resources = useResources()

  const defaultStart = dayjs().tz(TZ_APP).startOf('day').add(8, 'hour').format('YYYY-MM-DDTHH:mm')
  const defaultEnd = dayjs().tz(TZ_APP).startOf('day').add(18, 'hour').format('YYYY-MM-DDTHH:mm')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      start_date: defaultStart,
      end_date: defaultEnd,
    },
  })
  const selectedResourceId = watch('resource_id')
  const selectedResource = resources.data?.find((r) => r.id === selectedResourceId)
  const equipmentPricingOptions = (selectedResource?.pricing ?? [])
    .filter((item) => item.deleted_at == null && item.is_active)
    .filter((item) => ['hourly', 'daily', 'equipment_15d', 'equipment_30d'].includes(item.pricing_mode))

  const onSubmit = async (data: CreateBookingInput) => {
    try {
      if (selectedResource?.type === 'equipment' && !data.pricing_mode) {
        toast.error('Selecione a modalidade de cobrança do equipamento.')
        return
      }

      // O Supabase precisa de TIMESTAMPTZ (ISO 8601).
      // Como o input date-time local pega no timezone do PC do usuário, 
      // convertemos garantindo que o banco entenda certo baseado no TZ_APP
      const startIso = dayjs.tz(data.start_date, TZ_APP).toISOString()
      const endIso = dayjs.tz(data.end_date, TZ_APP).toISOString()

      await createBooking.mutateAsync({
        client_id: data.client_id,
        resource_id: data.resource_id,
        pricing_mode: selectedResource?.type === 'equipment' ? data.pricing_mode ?? null : null,
        start_date: startIso,
        end_date: endIso,
        notes: data.notes || null,
        status: 'pending',
      })
      navigate(ROUTES.BOOKINGS_CALENDAR)
    } catch (error) {
      // O erro já é tratado pelo on-error do hook com Toast (incluindo o overbooking trigger)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <AppPageHeader
        backTo={ROUTES.BOOKINGS_CALENDAR}
        backLabel="Voltar ao Calendário"
        title="Nova Reserva"
        description="Agende a utilização de um trator, guincho ou equipamento."
      />

      <AppCard className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Cliente *</label>
              <select {...register('client_id')} className="field">
                <option value="">Selecione um cliente...</option>
                {clients.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.client_id && <p className="field-error">{errors.client_id.message}</p>}
            </div>

            <div>
              <label className="field-label">Recurso (Trator / Guincho / Equip.) *</label>
              <select
                {...register('resource_id')}
                className="field"
                onChange={(event) => {
                  setValue('resource_id', event.target.value)
                  setValue('pricing_mode', undefined)
                }}
              >
                <option value="">Selecione um recurso...</option>
                {resources.data?.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.status !== 'available' ? '(Manutenção)' : ''}
                  </option>
                ))}
              </select>
              {errors.resource_id && <p className="field-error">{errors.resource_id.message}</p>}
            </div>

            {selectedResource?.type === 'equipment' && (
              <div>
                <label className="field-label">Modalidade de cobrança do equipamento *</label>
                <select {...register('pricing_mode')} className="field">
                  <option value="">Selecione a modalidade...</option>
                  {equipmentPricingOptions.map((item) => (
                    <option key={item.pricing_mode} value={item.pricing_mode}>
                      {item.pricing_mode === 'hourly'
                        ? `Por hora (R$ ${Number(item.rate).toFixed(2)})`
                        : item.pricing_mode === 'daily'
                          ? `Diária (R$ ${Number(item.rate).toFixed(2)})`
                          : item.pricing_mode === 'equipment_15d'
                            ? `Pacote 15 dias (R$ ${Number(item.rate).toFixed(2)})`
                            : `Pacote 30 dias (R$ ${Number(item.rate).toFixed(2)})`}
                    </option>
                  ))}
                </select>
                {errors.pricing_mode && <p className="field-error">{errors.pricing_mode.message}</p>}
              </div>
            )}

            <div>
              <label className="field-label">Início *</label>
              <input type="datetime-local" {...register('start_date')} className="field" />
              {errors.start_date && <p className="field-error">{errors.start_date.message}</p>}
            </div>

            <div>
              <label className="field-label">Término *</label>
              <input type="datetime-local" {...register('end_date')} className="field" />
              {errors.end_date && <p className="field-error">{errors.end_date.message}</p>}
            </div>
          </div>

          <div>
            <label className="field-label">Observações</label>
            <textarea 
              {...register('notes')} 
              rows={3} 
              className="field resize-none" 
              placeholder="Ex: Trabalho na fazenda X..." 
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTES.BOOKINGS_CALENDAR)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              loading={createBooking.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar Reserva
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  )
}
