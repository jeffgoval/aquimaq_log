import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useService, useCompleteService } from '../hooks/use-service-queries'
import { useWorklogsByService } from '@/modules/apontamentos/hooks/use-worklog-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppButton } from '@/shared/components/app/app-button'
import { WorklogSection } from '@/modules/apontamentos/components/worklog-section'
import { ReceivableSection } from '@/modules/financeiro/components/receivable-section'
import { cn } from '@/shared/lib/cn'
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS } from '@/shared/constants/status'
import dayjs from '@/shared/lib/dayjs'
import { ROUTES } from '@/shared/constants/routes'
import { computeServiceFinancialSummary } from '../lib/service-financial-summary'
import { ServiceOperatorPaymentPanel } from '../components/service-operator-payment-panel'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading, isError, error } = useService(id!)
  const { data: worklogs } = useWorklogsByService(id!)
  const complete = useCompleteService()

  const summary = useMemo(() => {
    if (!service) {
      return { totalHours: 0, billingTotal: 0, operatorCostTotal: 0, marginTotal: 0 }
    }
    return computeServiceFinancialSummary(service.contracted_hour_rate, worklogs ?? [])
  }, [service, worklogs])

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return null

  const { totalHours, billingTotal, operatorCostTotal, marginTotal } = summary

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={service.clients?.name ?? 'Serviço'}
        description={`${service.tractors?.name} · ${dayjs(service.service_date).format('DD/MM/YYYY')}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={ROUTES.SERVICE_EDIT(service.id)}
              className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
            >
              Editar
            </Link>
            <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full border', SERVICE_STATUS_COLORS[service.status])}>
              {SERVICE_STATUS_LABELS[service.status]}
            </span>
            {service.status !== 'completed' && service.status !== 'cancelled' && (
              <AppButton
                variant="success"
                size="sm"
                loading={complete.isPending}
                loadingText="..."
                onClick={() => complete.mutate(service.id)}
              >
                Concluir serviço
              </AppButton>
            )}
          </div>
        }
      />

      <div className="space-y-2">
        <p className="typo-caption text-muted-foreground">
          Valores baseados nos registos de horímetro abaixo (taxa contratada × horas; custo do operador pela taxa de cada apontamento).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="typo-caption mb-1">Horas totais</p>
            <p className="typo-body font-semibold tabular-nums">
              {totalHours > 0 ? `${totalHours.toFixed(1)} h` : <span className="text-muted-foreground">—</span>}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="typo-caption mb-1">Taxa contratada (cliente)</p>
            <p className="typo-body font-semibold"><AppMoney value={service.contracted_hour_rate} /></p>
          </div>
          <div className={cn('rounded-xl border bg-card p-4', billingTotal > 0 ? 'border-primary/25' : 'border-border')}>
            <p className="typo-caption mb-1">Faturação (cliente)</p>
            {billingTotal > 0
              ? <p className="typo-body font-bold tabular-nums"><AppMoney value={billingTotal} /></p>
              : <p className="typo-body-muted text-sm">Sem horas registadas</p>}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="typo-caption mb-1">Custo operador</p>
            {totalHours > 0
              ? <p className="typo-body font-semibold tabular-nums"><AppMoney value={operatorCostTotal} /></p>
              : <p className="typo-body-muted text-sm">—</p>}
          </div>
          <div className={cn(
            'rounded-xl border bg-card p-4 col-span-2 md:col-span-3 lg:col-span-1',
            marginTotal !== 0 || totalHours > 0 ? 'border-green-500/20' : 'border-border',
          )}
          >
            <p className="typo-caption mb-1">Margem estimada</p>
            {totalHours > 0
              ? (
                <p className={cn('typo-section-title font-bold tabular-nums', marginTotal >= 0 ? 'text-foreground' : 'text-destructive')}>
                  <AppMoney value={marginTotal} colored />
                </p>
              )
              : <p className="typo-body-muted text-sm">—</p>}
            {totalHours > 0 && (
              <p className="typo-caption text-muted-foreground mt-1">Lucro bruto (faturação − mão de obra apontada)</p>
            )}
          </div>
        </div>
      </div>

      <WorklogSection
        serviceId={service.id}
        tractorId={service.tractor_id}
        defaultOperatorId={service.primary_operator_id ?? undefined}
        serviceDate={service.service_date}
        contractedHourRate={service.contracted_hour_rate}
      />

      <ServiceOperatorPaymentPanel
        service={service}
        operatorName={service.operators?.name}
        operatorCostTotal={operatorCostTotal}
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="typo-section-title mb-3">Dados do serviço</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 typo-body">
          {[
            { label: 'Operador principal', value: service.operators?.name || '—' },
            { label: 'Data', value: dayjs(service.service_date).format('DD/MM/YYYY') },
            { label: 'Custo/h do trator (referência)', value: service.tractors?.standard_hour_cost != null ? <AppMoney value={Number(service.tractors.standard_hour_cost)} size="sm" /> : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="typo-caption">{label}</dt>
              <dd className="font-medium mt-1">{value}</dd>
            </div>
          ))}
        </dl>
        {service.notes && <p className="mt-4 pt-4 border-t border-border typo-body-muted">{service.notes}</p>}
      </div>

      <ReceivableSection
        serviceId={service.id}
        clientId={service.client_id}
        suggestedTotal={billingTotal}
      />
    </div>
  )
}
