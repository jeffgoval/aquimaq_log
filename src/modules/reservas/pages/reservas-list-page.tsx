import { useState } from 'react'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppTable, AppTableCell, AppTableRow } from '@/shared/components/app/app-table'
import {
  usePendingBookings,
  useServices,
  useRecentFinishedServices,
  useConvertBooking,
  useStartOperation,
  useCloseService,
  useProfiles
} from '../hooks/use-booking-queries'
import { Play, CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react'
import dayjs from '@/shared/lib/dayjs'
import { TZ_APP } from '@/app/config/constants'
import { toast } from 'sonner'
import { getActionsByResourceType } from '../constants/resource-actions'

export function ReservasListPage() {
  const pendingBookings = usePendingBookings()
  const activeServices = useServices()
  const recentFinishedServices = useRecentFinishedServices()
  const profiles = useProfiles()

  const convertBooking = useConvertBooking()
  const startOperation = useStartOperation()
  const closeService = useCloseService()

  // State local para segurar o operador selecionado de cada reserva pendente
  const [selectedOperators, setSelectedOperators] = useState<Record<string, string>>({})

  const handleConvert = async (bookingId: string, resourceType?: string) => {
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
    <div className="max-w-6xl mx-auto w-full space-y-8">
      <AppPageHeader
        title="Painel de Serviços"
        description="Controle de retiradas, operações e devoluções de recursos."
      />

      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Reservas Pendentes
          </h2>

          {pendingBookings.isLoading && <p className="text-muted-foreground">Carregando...</p>}
          {!pendingBookings.isLoading && pendingBookings.data?.length === 0 && (
            <p className="text-muted-foreground">Nenhuma reserva pendente no momento.</p>
          )}

          {!!pendingBookings.data?.length && (
            <AppTable
              columns={[
                { header: 'Cliente' },
                { header: 'Recurso' },
                { header: 'Período' },
                { header: 'Operador' },
                { header: 'Ação', align: 'right' },
              ]}
            >
              {pendingBookings.data?.map(booking => (
                <AppTableRow key={booking.id}>
                  {/** Regras de ação por tipo de recurso padronizadas em helper único */}
                  {(() => {
                    const bookingActions = getActionsByResourceType(booking.resource?.type)
                    return (
                      <>
                  <AppTableCell className="font-medium">{booking.client?.name}</AppTableCell>
                  <AppTableCell>
                    {booking.resource?.name} ({booking.resource?.type})
                  </AppTableCell>
                  <AppTableCell className="text-muted-foreground">
                    {dayjs(booking.start_date).tz(TZ_APP).format('DD/MM HH:mm')} - {dayjs(booking.end_date).tz(TZ_APP).format('DD/MM HH:mm')}
                  </AppTableCell>
                  <AppTableCell>
                    {bookingActions.requiresOperatorOnPickup ? (
                      <select
                        className="field py-1.5 text-sm min-w-[190px]"
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
                      variant="primary"
                      size="sm"
                      onClick={() => handleConvert(booking.id, booking.resource?.type)}
                      loading={convertBooking.isPending && convertBooking.variables?.bookingId === booking.id}
                      disabled={
                        convertBooking.isPending ||
                        (bookingActions.requiresOperatorOnPickup && !selectedOperators[booking.id])
                      }
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Iniciar Retirada
                    </AppButton>
                  </AppTableCell>
                      </>
                    )
                  })()}
                </AppTableRow>
              ))}
            </AppTable>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            Serviços em Andamento
          </h2>

          {activeServices.isLoading && <p className="text-muted-foreground">Carregando...</p>}
          {!activeServices.isLoading && activeServices.data?.length === 0 && (
            <p className="text-muted-foreground">Nenhum serviço ativo no momento.</p>
          )}

          {!!activeServices.data?.length && (
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
              {activeServices.data?.map(service => (
                <AppTableRow key={service.id}>
                  {(() => {
                    const serviceActions = getActionsByResourceType(service.resource?.type)
                    return (
                      <>
                  <AppTableCell className="font-medium">{service.booking?.client?.name}</AppTableCell>
                  <AppTableCell>{service.resource?.name}</AppTableCell>
                  <AppTableCell className="text-muted-foreground">
                    {service.billing_type_snapshot === 'hourly'
                      ? 'Hora'
                      : service.billing_type_snapshot === 'daily'
                        ? 'Diária'
                        : service.billing_type_snapshot === 'equipment_15d'
                          ? 'Pacote 15 dias'
                          : service.billing_type_snapshot === 'equipment_30d'
                            ? 'Pacote 30 dias'
                            : 'Fixo'}
                  </AppTableCell>
                  <AppTableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      service.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {service.status === 'open' ? 'Aguardando operação' : 'Em operação'}
                    </span>
                  </AppTableCell>
                  <AppTableCell className="text-muted-foreground">{service.operator?.name ?? 'N/A'}</AppTableCell>
                  <AppTableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      {service.status === 'open' && serviceActions.canStartOperation && (
                        <AppButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            void startOperation.mutateAsync(service.id).catch(() => {
                              /* toast em onError */
                            })
                          }}
                          loading={startOperation.isPending && startOperation.variables === service.id}
                          disabled={startOperation.isPending || closeService.isPending}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar Operação
                        </AppButton>
                      )}
                      {serviceActions.canReturn && (
                        <AppButton
                          variant="success"
                          size="sm"
                          onClick={() => {
                            void closeService
                              .mutateAsync({ serviceId: service.id, isCancel: false })
                              .catch(() => {
                                /* toast em onError */
                              })
                          }}
                          loading={closeService.isPending && closeService.variables?.serviceId === service.id && closeService.variables?.isCancel === false}
                          disabled={closeService.isPending || startOperation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Devolução
                        </AppButton>
                      )}
                      <AppButton
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={closeService.isPending || startOperation.isPending}
                        onClick={() => {
                          if (!confirm('Deseja realmente cancelar este serviço? O valor será calculado como Pro Rata.')) {
                            return
                          }
                          void closeService
                            .mutateAsync({ serviceId: service.id, isCancel: true })
                            .catch(() => {
                              /* toast em onError */
                            })
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancelar
                      </AppButton>
                    </div>
                  </AppTableCell>
                      </>
                    )
                  })()}
                </AppTableRow>
              ))}
            </AppTable>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Finalizados hoje</h2>
          {recentFinishedServices.isLoading && <p className="text-muted-foreground">Carregando...</p>}
          {!recentFinishedServices.isLoading && recentFinishedServices.data?.length === 0 && (
            <p className="text-muted-foreground">Nenhum serviço finalizado hoje.</p>
          )}
          {!!recentFinishedServices.data?.length && (
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
                  <AppTableCell className="text-muted-foreground">
                    {service.billing_type_snapshot === 'hourly'
                      ? 'Hora'
                      : service.billing_type_snapshot === 'daily'
                        ? 'Diária'
                        : service.billing_type_snapshot === 'equipment_15d'
                          ? 'Pacote 15 dias'
                          : service.billing_type_snapshot === 'equipment_30d'
                            ? 'Pacote 30 dias'
                            : 'Fixo'}
                  </AppTableCell>
                  <AppTableCell className="text-muted-foreground">
                    {service.ended_at ? dayjs(service.ended_at).tz(TZ_APP).format('DD/MM/YYYY HH:mm') : '-'}
                  </AppTableCell>
                  <AppTableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      service.status === 'cancelled'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {service.status === 'cancelled' ? 'Cancelado' : 'Devolução'}
                    </span>
                  </AppTableCell>
                  <AppTableCell align="right" className="font-medium">
                    {service.total_amount != null
                      ? service.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '-'}
                  </AppTableCell>
                </AppTableRow>
              ))}
            </AppTable>
          )}
        </section>
      </div>
    </div>
  )
}
