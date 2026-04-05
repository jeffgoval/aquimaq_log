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
import type { LaborOperatorAttribution } from '../lib/service-financial-summary'
import {
  computeServiceFinancialSummary,
  getLaborOperatorAttributionFromWorklogs,
} from '../lib/service-financial-summary'
import { ServiceOperatorPaymentPanel } from '../components/service-operator-payment-panel'
import { ServiceOwnerDiscountCard } from '../components/service-owner-discount-card'
import { ReceiptViewButton } from '@/shared/components/receipts'

const LaborOperatorsInService = ({ attribution }: { attribution: LaborOperatorAttribution }) => {
  if (attribution.kind === 'none') {
    return <span className="text-muted-foreground">— (defina no horímetro)</span>
  }
  if (attribution.kind === 'single') {
    return (
      <Link
        to={ROUTES.OPERATOR_DETAIL(attribution.operatorId)}
        className="text-primary font-medium hover:underline"
      >
        {attribution.operatorName}
      </Link>
    )
  }
  return (
    <span className="flex flex-wrap gap-x-1 gap-y-0.5">
      {attribution.operators.map((op, i) => (
        <span key={op.operatorId}>
          {i > 0 ? ', ' : ''}
          <Link to={ROUTES.OPERATOR_DETAIL(op.operatorId)} className="text-primary font-medium hover:underline">
            {op.operatorName}
          </Link>
        </span>
      ))}
    </span>
  )
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading, isError, error } = useService(id!)
  const { data: worklogs } = useWorklogsByService(id!)
  const complete = useCompleteService()

  const summary = useMemo(() => {
    if (!service) {
      return {
        totalHours: 0,
        billingGross: 0,
        ownerDiscountApplied: 0,
        billingNet: 0,
        operatorCostTotal: 0,
        marginTotal: 0,
      }
    }
    return computeServiceFinancialSummary(
      service.contracted_hour_rate,
      worklogs ?? [],
      service.owner_discount_amount ?? 0,
    )
  }, [service, worklogs])

  const laborOperatorAttribution = useMemo(
    () => getLaborOperatorAttributionFromWorklogs(worklogs ?? []),
    [worklogs],
  )

  const defaultOperatorFromWorklogs = useMemo(
    () => worklogs?.find((w) => w.operator_id)?.operator_id ?? undefined,
    [worklogs],
  )

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return null

  const { totalHours, billingGross, ownerDiscountApplied, billingNet, operatorCostTotal, marginTotal } = summary

  return (
    <div className="space-y-6">
      <AppPageHeader
        backTo={ROUTES.SERVICES}
        backLabel="Voltar aos serviços"
        title={service.clients?.name ?? 'Serviço'}
        description={`${service.tractors?.name} · ${dayjs(service.service_date).format('DD/MM/YYYY')}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={ROUTES.SERVICE_EDIT(service.id)}
              className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
            >
              {service.status === 'completed' || service.status === 'cancelled'
                ? 'Notas e recibo'
                : 'Editar'}
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
          Faturação: taxa contratada × horas; desconto do dono (se houver) só reduz o valor a cobrar ao cliente. Custo do operador vem da taxa de cada apontamento.
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
          <div className={cn('rounded-xl border bg-card p-4', billingNet > 0 ? 'border-primary/25' : 'border-border')}>
            <p className="typo-caption mb-1">Faturação líquida (cliente)</p>
            {billingNet > 0
              ? (
                <>
                  <p className="typo-body font-bold tabular-nums"><AppMoney value={billingNet} /></p>
                  {ownerDiscountApplied > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Bruto <AppMoney value={billingGross} size="sm" />
                      {' · '}
                      − desconto <AppMoney value={ownerDiscountApplied} size="sm" />
                    </p>
                  )}
                </>
              )
              : (
                <p className="typo-body-muted text-sm">
                  {billingGross > 0 && ownerDiscountApplied >= billingGross
                    ? 'Desconto cobre a faturação bruta'
                    : 'Sem horas registadas'}
                </p>
              )}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="typo-caption mb-1">Custo operador</p>
            {totalHours > 0
              ? <p className="typo-body font-semibold tabular-nums"><AppMoney value={operatorCostTotal} /></p>
              : <p className="typo-body-muted text-sm">—</p>}
          </div>
          <div className={cn(
            'rounded-xl border bg-card p-4 col-span-2 md:col-span-3 lg:col-span-1',
            marginTotal !== 0 || totalHours > 0 ? 'border-green-200 dark:border-green-500/25' : 'border-border',
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
              <p className="typo-caption text-muted-foreground mt-1">Lucro bruto (faturação líquida − mão de obra apontada)</p>
            )}
          </div>
        </div>

        <ServiceOwnerDiscountCard
          serviceId={service.id}
          savedAmount={service.owner_discount_amount ?? 0}
          locked={service.status === 'completed' || service.status === 'cancelled'}
        />
      </div>

      <WorklogSection
        serviceId={service.id}
        tractorId={service.tractor_id}
        serviceStatus={service.status}
        defaultOperatorId={defaultOperatorFromWorklogs}
        serviceDate={service.service_date}
        contractedHourRate={service.contracted_hour_rate}
      />

      <ServiceOperatorPaymentPanel
        service={service}
        laborOperatorAttribution={laborOperatorAttribution}
        operatorCostTotal={operatorCostTotal}
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="typo-section-title mb-3">Dados do serviço</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 typo-body">
          {[
            {
              label: 'Operadores (horímetro)',
              value: <LaborOperatorsInService attribution={laborOperatorAttribution} />,
            },
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
        {service.receipt_storage_path ? (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
            <span className="typo-caption">Recibo anexado</span>
            <ReceiptViewButton storagePath={service.receipt_storage_path} variant="secondary" size="sm" />
          </div>
        ) : null}
      </div>

      <ReceivableSection
        serviceId={service.id}
        clientId={service.client_id}
        suggestedTotal={billingNet}
      />
    </div>
  )
}
