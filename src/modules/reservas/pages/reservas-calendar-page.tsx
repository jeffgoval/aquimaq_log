import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from '@/shared/lib/dayjs'
import { TZ_APP } from '@/app/config/constants'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { ROUTES } from '@/shared/constants/routes'
import { BookingCalendar } from '../components/booking-calendar'
import { useBookings, useCreateBooking, useResources } from '../hooks/use-booking-queries'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { createBookingSchema, type CreateBookingInput } from '../schemas/booking.schema'
import { AppButton } from '@/shared/components/app/app-button'
import { toast } from 'sonner'

interface BookingQuickModalProps {
  defaultDate: dayjs.Dayjs
  onClose: () => void
  onSuccess: () => void
}

function BookingQuickModal({ defaultDate, onClose, onSuccess }: BookingQuickModalProps) {
  const createBooking = useCreateBooking()
  const clients = useClientOptions()
  const resources = useResources()

  const defaultStart = defaultDate.tz(TZ_APP).startOf('day').add(8, 'hour').format('YYYY-MM-DDTHH:mm')
  const defaultEnd = defaultDate.tz(TZ_APP).startOf('day').add(18, 'hour').format('YYYY-MM-DDTHH:mm')

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
    if (selectedResource?.type === 'equipment' && !data.pricing_mode) {
      toast.error('Selecione a modalidade de cobrança do equipamento.')
      return
    }

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

    onSuccess()
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-4 pt-3 pb-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Nova reserva</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {defaultDate.tz(TZ_APP).format('DD/MM/YYYY')}
              </p>
            </div>
            <AppButton type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={onClose} aria-label="Fechar">
              <X className="h-4 w-4" />
            </AppButton>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <label className="field-label">Recurso *</label>
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
                      {r.name} ({r.type}){r.status !== 'available' ? ' — Manutenção' : ''}
                    </option>
                  ))}
                </select>
                {errors.resource_id && <p className="field-error">{errors.resource_id.message}</p>}
              </div>

              {selectedResource?.type === 'equipment' && (
                <div className="sm:col-span-2">
                  <label className="field-label">Modalidade de cobrança *</label>
                  <select {...register('pricing_mode')} className="field">
                    <option value="">Selecione...</option>
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
                rows={2}
                className="field resize-none"
                placeholder="Ex: Trabalho na fazenda X..."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 border-t border-border pt-3">
              <AppButton type="button" variant="ghost" onClick={onClose} className="justify-center">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </AppButton>
              <AppButton type="submit" variant="primary" loading={createBooking.isPending} className="flex-1 sm:flex-none justify-center">
                <Check className="mr-2 h-4 w-4" />
                Salvar Reserva
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null
}

export function ReservasCalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(dayjs().tz(TZ_APP))
  const [quickModalDate, setQuickModalDate] = useState<dayjs.Dayjs | null>(null)

  // Fetch bookings for the current month view (padded by a few days to fill the grid)
  const startOfMonth = currentDate.startOf('month').startOf('week')
  const endOfMonth = currentDate.endOf('month').endOf('week')

  const { data: bookings, isLoading, isError, error, refetch } = useBookings(
    startOfMonth.toISOString(),
    endOfMonth.toISOString()
  )

  const handleNewBooking = (date: dayjs.Dayjs) => {
    setQuickModalDate(date)
  }

  const handleBookingClick = (bookingId: string) => {
    navigate(`${ROUTES.BOOKINGS_LIST}?bookingId=${bookingId}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {quickModalDate && (
        <BookingQuickModal
          defaultDate={quickModalDate}
          onClose={() => setQuickModalDate(null)}
          onSuccess={() => {
            setQuickModalDate(null)
            refetch()
          }}
        />
      )}

      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Calendário de Reservas"
        description="Agendamento e controle de recursos (Frota/Equipamentos)"
        actions={
          <Link to={ROUTES.BOOKING_NEW} className="flex items-center gap-2 gradient-cat text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm">
            <Plus className="h-4 w-4" />Nova Reserva
          </Link>
        }
      />

      <div className="flex-1 mt-4">
        {isLoading && <AppLoadingState />}
        {isError && <AppErrorState message={error.message} onRetry={refetch} />}
        {!isLoading && !isError && (
          <BookingCalendar 
            bookings={bookings ?? []}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onNewBooking={handleNewBooking}
            onBookingClick={handleBookingClick}
          />
        )}
      </div>
    </div>
  )
}
