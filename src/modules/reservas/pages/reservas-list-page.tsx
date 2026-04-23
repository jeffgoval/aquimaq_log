import { useEffect, useState } from 'react'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppTable, AppTableCell, AppTableRow } from '@/shared/components/app/app-table'
import {
  usePendingBookings,
  useNoShowBookings,
  useNoShowBookingsCount,
  useServices,
  useRecentFinishedServices,
  useConvertBooking,
  useStartOperation,
  useCloseService,
  useProfiles
} from '../hooks/use-booking-queries'
import { Play, CheckCircle, XCircle, ArrowRight, Clock, Eye, EyeOff, UserX } from 'lucide-react'
import dayjs from '@/shared/lib/dayjs'
import { TZ_APP } from '@/app/config/constants'
import { toast } from 'sonner'
import { getActionsByResourceType } from '../constants/resource-actions'
import { cn } from '@/shared/lib/cn'
import {
  BOOKING_PICKUP_GRACE_MINUTES_AFTER_START,
  isBookingPickupBeforeWindow,
  isBookingPickupMissedGraceWindow,
  isBookingPickupWindowExpired,
} from '../lib/booking-pickup-rules'

function billingLabel(type: string | null | undefined) {
  if (type === 'hourly') return 'Por hora'
  if (type === 'daily') return 'Diária'
  if (type === 'equipment_15d') return 'Pacote 15d'
  if (type === 'equipment_30d') return 'Pacote 30d'
  return 'Fixo'
}

export function ReservasListPage() {
  const [, setNowTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => { setNowTick(n => n + 1) }, 10_000)
    return () => clearInterval(id)
  }, [])

  const pendingBookings = usePendingBookings()
  const noShowCount = useNoShowBookingsCount()
  const [showNoShows, setShowNoShows] = useState(false)
  const noShowBookings = useNoShowBookings(showNoShows)
  const activeServices = useServices()
  const recentFinishedServices = useRecentFinishedServices()
  const profiles = useProfiles()

  const convertBooking = useConvertBooking()
  const startOperation = useStartOperation()
  const closeService = useCloseService()

  const [selectedOperators, setSelectedOperators] = useState<Record<string, string>>({})

  const handleConvert = async (
    bookingId: string,
    resourceType: string | undefined,
    startDateIso: string,
    endDateIso: string,
  ) => {
    if (isBookingPickupBeforeWindow(startDateIso)) {
      toast.error(`A retirada só pode iniciar a partir de ${dayjs(startDateIso).tz(TZ_APP).format('DD/MM/YYYY HH:mm')}.`)
      return
    }
    if (isBookingPickupMissedGraceWindow(startDateIso)) {
      toast.error(
        `Prazo de retirada expirado: é necessário iniciar no horário de início ou até ${BOOKING_PICKUP_GRACE_MINUTES_AFTER_START} min depois (${dayjs(startDateIso).tz(TZ_APP).format('DD/MM HH:mm')}). A reserva caduca e o equipamento pode ser alugado a outro cliente.`,
      )
      return
    }
    if (isBookingPickupWindowExpired(endDateIso)) {
      toast.error('O período desta reserva já terminou. Atualize a página: o registo passará para no-show e o equipamento fica livre para nova reserva.')
      return
    }

    const actions = getActionsByResourceType(resourceType)
    const needsOperator = actions.requiresOperatorOnPickup
    const operatorId = selectedOperators[bookingId]

    if (needsOperator && !operatorId) {
      toast.error('Selecione um operador antes de iniciar a retirada do trator.')
      return
    }

    try {
      await convertBooking.mutateAsync({ bookingId, operatorId: operatorId ?? null })
    } catch {
      // Toast em useConvertBooking.onError
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-8">
      <AppPageHeader
        title="Painel de Serviços"
        description="Controle de retiradas, operações e devoluções de recursos."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* ── Reservas Pendentes ─────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Reservas Pendentes
          </h2>

          {pendingBookings.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
          {!pendingBookings.isLoading && pendingBookings.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhuma reserva pendente no momento.</p>
          )}

          {!!pendingBookings.data?.length && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <AppTable
                  columns={[
                    { header: 'Cliente' },
                    { header: 'Recurso' },
                    { header: 'Período' },
                    { header: 'Operador' },
                    { header: 'Ação', align: 'right' },
                  ]}
                >
                  {pendingBookings.data?.map(booking => {
                    const bookingActions = getActionsByResourceType(booking.resource?.type)
                    const pickupTooEarly = isBookingPickupBeforeWindow(booking.start_date)
                    const pickupMissedGrace = isBookingPickupMissedGraceWindow(booking.start_date)
                    const pickupExpired = isBookingPickupWindowExpired(booking.end_date)
                    const pickupBlocked = pickupTooEarly || pickupMissedGrace || pickupExpired
                    const pickupTitle = pickupTooEarly
                      ? 'Ainda não é o horário de início desta reserva.'
                      : pickupMissedGrace
                        ? `Não foi iniciada a retirada até ${BOOKING_PICKUP_GRACE_MINUTES_AFTER_START} min após o início; a reserva caduca.`
                        : pickupExpired
                          ? 'O fim do período da reserva já passou; não é possível iniciar retirada aqui.'
                          : undefined
                    const pickupLabel = pickupTooEarly
                      ? 'Aguardar início'
                      : pickupMissedGrace
                        ? 'Retirada expirada'
                        : pickupExpired
                          ? 'Período encerrado'
                          : 'Iniciar Retirada'
                    return (
                      <AppTableRow key={booking.id}>
                        <AppTableCell className="font-medium">{booking.client?.name}</AppTableCell>
                        <AppTableCell>{booking.resource?.name} ({booking.resource?.type})</AppTableCell>
                        <AppTableCell className="text-muted-foreground">
                          {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')} – {dayjs(booking.end_date).tz(TZ_APP).format('DD/MM HH:mm')}
                        </AppTableCell>
                        <AppTableCell>
                          {bookingActions.requiresOperatorOnPickup ? (
                            <select
                              className="field py-1.5 text-sm min-w-[160px]"
                              value={selectedOperators[booking.id] || ''}
                              onChange={e => setSelectedOperators(prev => ({ ...prev, [booking.id]: e.target.value }))}
                            >
                              <option value="">Selecionar...</option>
                              {profiles.data?.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </AppTableCell>
                        <AppTableCell align="right">
                          <AppButton
                            variant={pickupBlocked ? 'secondary' : 'primary'}
                            size="sm"
                            title={pickupTitle}
                            onClick={() => { void handleConvert(booking.id, booking.resource?.type, booking.start_date, booking.end_date) }}
                            loading={convertBooking.isPending && convertBooking.variables?.bookingId === booking.id}
                            disabled={
                              convertBooking.isPending
                              || pickupBlocked
                              || (bookingActions.requiresOperatorOnPickup && !selectedOperators[booking.id])
                            }
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            {pickupLabel}
                          </AppButton>
                        </AppTableCell>
                      </AppTableRow>
                    )
                  })}
                </AppTable>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {pendingBookings.data?.map(booking => {
                  const bookingActions = getActionsByResourceType(booking.resource?.type)
                  const pickupTooEarly = isBookingPickupBeforeWindow(booking.start_date)
                  const pickupMissedGrace = isBookingPickupMissedGraceWindow(booking.start_date)
                  const pickupExpired = isBookingPickupWindowExpired(booking.end_date)
                  const pickupBlocked = pickupTooEarly || pickupMissedGrace || pickupExpired
                  const pickupTitle = pickupTooEarly
                    ? 'Ainda não é o horário de início desta reserva.'
                    : pickupMissedGrace
                      ? `Não foi iniciada a retirada até ${BOOKING_PICKUP_GRACE_MINUTES_AFTER_START} min após o início; a reserva caduca.`
                      : pickupExpired
                        ? 'O fim do período da reserva já passou; não é possível iniciar retirada aqui.'
                        : undefined
                  const pickupLabel = pickupTooEarly
                    ? 'Aguardar início'
                    : pickupMissedGrace
                      ? 'Retirada expirada'
                      : pickupExpired
                        ? 'Período encerrado'
                        : 'Iniciar Retirada'
                  return (
                    <div key={booking.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{booking.client?.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.resource?.name} · {booking.resource?.type}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
                          Pendente
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')} – {dayjs(booking.end_date).tz(TZ_APP).format('DD/MM HH:mm')}
                      </p>
                      {bookingActions.requiresOperatorOnPickup && (
                        <div>
                          <label className="field-label text-xs">Operador *</label>
                          <select
                            className="field py-2 text-sm"
                            value={selectedOperators[booking.id] || ''}
                            onChange={e => setSelectedOperators(prev => ({ ...prev, [booking.id]: e.target.value }))}
                          >
                            <option value="">Selecionar operador...</option>
                            {profiles.data?.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {pickupTooEarly && (
                        <p className="text-xs text-muted-foreground">
                          Início da reserva: {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')}. A retirada só pode ser registada a partir desse horário, até {BOOKING_PICKUP_GRACE_MINUTES_AFTER_START} min depois; caso contrário a reserva caduca.
                        </p>
                      )}
                      {pickupMissedGrace && (
                        <p className="text-xs text-amber-800 dark:text-amber-200/90">
                          Passou o prazo para iniciar retirada após o horário de início. Atualize a lista: no-show e o equipamento pode ser reservado por outro cliente.
                        </p>
                      )}
                      {pickupExpired && !pickupMissedGrace && (
                        <p className="text-xs text-amber-800 dark:text-amber-200/90">
                          O fim deste período já passou. Atualize a lista: a reserva será tratada como no-show e o recurso liberta agenda para novas reservas.
                        </p>
                      )}
                      <AppButton
                        variant={pickupBlocked ? 'secondary' : 'primary'}
                        size="sm"
                        className="w-full justify-center"
                        title={pickupTitle}
                        onClick={() => { void handleConvert(booking.id, booking.resource?.type, booking.start_date, booking.end_date) }}
                        loading={convertBooking.isPending && convertBooking.variables?.bookingId === booking.id}
                        disabled={
                          convertBooking.isPending
                          || pickupBlocked
                          || (bookingActions.requiresOperatorOnPickup && !selectedOperators[booking.id])
                        }
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {pickupLabel}
                      </AppButton>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {(noShowCount.data ?? 0) > 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 min-w-0">
                <UserX className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-snug">
                  <span className="font-semibold text-foreground tabular-nums">{noShowCount.data}</span>
                  {' '}reserva(s) em no-show (fim do período sem devolução operacional, ou não iniciada a retirada a tempo após o horário de início). Registo mantido para auditoria; o recurso não fica bloqueado — novas reservas só consideram estados pendente ou em retirada (convertido).
                </p>
              </div>
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 self-start sm:self-center"
                onClick={() => setShowNoShows(v => !v)}
              >
                {showNoShows ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar no-shows
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver no-shows
                  </>
                )}
              </AppButton>
            </div>
          )}

          {showNoShows && (
            <div className="space-y-2 pl-1 border-l-2 border-slate-300 dark:border-slate-600 ml-1">
              {noShowBookings.isLoading && <p className="text-muted-foreground text-sm">Carregando no-shows...</p>}
              {noShowBookings.isError && (
                <p className="text-sm text-red-600">Não foi possível carregar os no-shows.</p>
              )}
              {!noShowBookings.isLoading && !noShowBookings.isError && (noShowBookings.data?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-sm">Nenhum registo no-show.</p>
              )}
              {!!noShowBookings.data?.length && (
                <>
                  <div className="hidden sm:block">
                    <AppTable
                      columns={[
                        { header: 'Cliente' },
                        { header: 'Recurso' },
                        { header: 'Período' },
                        { header: 'Estado' },
                      ]}
                    >
                      {noShowBookings.data.map(booking => (
                        <AppTableRow key={booking.id}>
                          <AppTableCell className="font-medium">{booking.client?.name}</AppTableCell>
                          <AppTableCell>{booking.resource?.name} ({booking.resource?.type})</AppTableCell>
                          <AppTableCell className="text-muted-foreground">
                            {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')} – {dayjs(booking.end_date).tz(TZ_APP).format('DD/MM HH:mm')}
                          </AppTableCell>
                          <AppTableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              No-show
                            </span>
                          </AppTableCell>
                        </AppTableRow>
                      ))}
                    </AppTable>
                  </div>
                  <div className="flex flex-col gap-3 sm:hidden">
                    {noShowBookings.data.map(booking => (
                      <div key={booking.id} className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{booking.client?.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.resource?.name} · {booking.resource?.type}</p>
                          </div>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
                            No-show
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')} – {dayjs(booking.end_date).tz(TZ_APP).format('DD/MM HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* ── Serviços em Andamento ──────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            Serviços em Andamento
          </h2>

          {activeServices.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
          {!activeServices.isLoading && activeServices.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum serviço ativo no momento.</p>
          )}

          {!!activeServices.data?.length && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <AppTable
                  columns={[
                    { header: 'Cliente' },
                    { header: 'Recurso' },
                    { header: 'Cobrança' },
                    { header: 'Status' },
                    { header: 'Operador' },
                    { header: 'Ações', align: 'right' },
                  ]}
                >
                  {activeServices.data?.map(service => {
                    const serviceActions = getActionsByResourceType(service.resource?.type)
                    return (
                      <AppTableRow key={service.id}>
                        <AppTableCell className="font-medium">{service.booking?.client?.name}</AppTableCell>
                        <AppTableCell>{service.resource?.name}</AppTableCell>
                        <AppTableCell className="text-muted-foreground">{billingLabel(service.billing_type_snapshot)}</AppTableCell>
                        <AppTableCell>
                          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', service.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400')}>
                            {service.status === 'open' ? 'Aguardando operação' : 'Em operação'}
                          </span>
                        </AppTableCell>
                        <AppTableCell className="text-muted-foreground">{service.operator?.name ?? 'N/A'}</AppTableCell>
                        <AppTableCell align="right">
                          <div className="flex items-center justify-end gap-2">
                            {service.status === 'open' && serviceActions.canStartOperation && (
                              <AppButton variant="secondary" size="sm" onClick={() => { void startOperation.mutateAsync(service.id).catch(() => {}) }} loading={startOperation.isPending && startOperation.variables === service.id} disabled={startOperation.isPending || closeService.isPending}>
                                <Play className="w-4 h-4 mr-2" />Iniciar Operação
                              </AppButton>
                            )}
                            {serviceActions.canReturn && (
                              <AppButton variant="success" size="sm" onClick={() => { void closeService.mutateAsync({ serviceId: service.id, isCancel: false }).catch(() => {}) }} loading={closeService.isPending && closeService.variables?.serviceId === service.id && closeService.variables?.isCancel === false} disabled={closeService.isPending || startOperation.isPending}>
                                <CheckCircle className="w-4 h-4 mr-2" />Devolução
                              </AppButton>
                            )}
                            <AppButton variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={closeService.isPending || startOperation.isPending} onClick={() => { if (!confirm('Deseja realmente cancelar este serviço? O valor será calculado como Pro Rata.')) return; void closeService.mutateAsync({ serviceId: service.id, isCancel: true }).catch(() => {}) }}>
                              <XCircle className="w-4 h-4 mr-1" />Cancelar
                            </AppButton>
                          </div>
                        </AppTableCell>
                      </AppTableRow>
                    )
                  })}
                </AppTable>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {activeServices.data?.map(service => {
                  const serviceActions = getActionsByResourceType(service.resource?.type)
                  return (
                    <div key={service.id} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{service.booking?.client?.name}</p>
                          <p className="text-xs text-muted-foreground">{service.resource?.name} · {billingLabel(service.billing_type_snapshot)}</p>
                          {service.operator?.name && <p className="text-xs text-muted-foreground">Op: {service.operator.name}</p>}
                        </div>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap', service.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400')}>
                          {service.status === 'open' ? 'Aguardando' : 'Em operação'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.status === 'open' && serviceActions.canStartOperation && (
                          <AppButton variant="secondary" size="sm" className="flex-1 justify-center" onClick={() => { void startOperation.mutateAsync(service.id).catch(() => {}) }} loading={startOperation.isPending && startOperation.variables === service.id} disabled={startOperation.isPending || closeService.isPending}>
                            <Play className="w-4 h-4 mr-1.5" />Iniciar Op.
                          </AppButton>
                        )}
                        {serviceActions.canReturn && (
                          <AppButton variant="success" size="sm" className="flex-1 justify-center" onClick={() => { void closeService.mutateAsync({ serviceId: service.id, isCancel: false }).catch(() => {}) }} loading={closeService.isPending && closeService.variables?.serviceId === service.id && closeService.variables?.isCancel === false} disabled={closeService.isPending || startOperation.isPending}>
                            <CheckCircle className="w-4 h-4 mr-1.5" />Devolução
                          </AppButton>
                        )}
                        <AppButton variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={closeService.isPending || startOperation.isPending} onClick={() => { if (!confirm('Deseja realmente cancelar este serviço? O valor será calculado como Pro Rata.')) return; void closeService.mutateAsync({ serviceId: service.id, isCancel: true }).catch(() => {}) }}>
                          <XCircle className="w-4 h-4 mr-1" />Cancelar
                        </AppButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        {/* ── Finalizados hoje ───────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-semibold">Finalizados hoje</h2>
          {recentFinishedServices.isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
          {!recentFinishedServices.isLoading && recentFinishedServices.data?.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum serviço finalizado hoje.</p>
          )}
          {!!recentFinishedServices.data?.length && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <AppTable
                  columns={[
                    { header: 'Cliente' },
                    { header: 'Recurso' },
                    { header: 'Cobrança' },
                    { header: 'Encerrado em' },
                    { header: 'Tipo' },
                    { header: 'Valor', align: 'right' },
                  ]}
                >
                  {recentFinishedServices.data?.map(service => (
                    <AppTableRow key={service.id}>
                      <AppTableCell className="font-medium">{service.booking?.client?.name}</AppTableCell>
                      <AppTableCell>{service.resource?.name}</AppTableCell>
                      <AppTableCell className="text-muted-foreground">{billingLabel(service.billing_type_snapshot)}</AppTableCell>
                      <AppTableCell className="text-muted-foreground">
                        {service.ended_at ? dayjs(service.ended_at).tz(TZ_APP).format('DD/MM/YYYY HH:mm') : '-'}
                      </AppTableCell>
                      <AppTableCell>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', service.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                          {service.status === 'cancelled' ? 'Cancelado' : 'Devolução'}
                        </span>
                      </AppTableCell>
                      <AppTableCell align="right" className="font-medium">
                        {service.total_amount != null ? service.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                      </AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTable>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 sm:hidden">
                {recentFinishedServices.data?.map(service => (
                  <div key={service.id} className={cn('rounded-xl border p-4', service.status === 'cancelled' ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{service.booking?.client?.name}</p>
                        <p className="text-xs text-muted-foreground">{service.resource?.name} · {billingLabel(service.billing_type_snapshot)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {service.ended_at ? dayjs(service.ended_at).tz(TZ_APP).format('DD/MM/YYYY HH:mm') : '-'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', service.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                          {service.status === 'cancelled' ? 'Cancelado' : 'Devolução'}
                        </span>
                        <span className="text-sm font-bold">
                          {service.total_amount != null ? service.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
