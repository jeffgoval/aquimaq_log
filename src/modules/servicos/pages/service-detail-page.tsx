import { useParams, Link } from 'react-router-dom'
import React, { useMemo, useState } from 'react'
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
import { ServiceVoucherPdfButton } from '../components/service-voucher-pdf-button'
import { SimpleReceiptPdfButton } from '../components/simple-receipt-pdf-button'

type TabId = 'dados' | 'trabalho' | 'financeiro' | 'cobrancas'

const TABS: { id: TabId; label: string }[] = [
  { id: 'dados', label: 'Dados' },
  { id: 'trabalho', label: 'Dias trabalhados' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'cobrancas', label: 'Cobranças' },
]

const LaborOperatorsInService = ({ attribution }: { attribution: LaborOperatorAttribution }) => {
  if (attribution.kind === 'none') {
    return <span className="text-muted-foreground">— (defina nos dias trabalhados)</span>
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
  const [activeTab, setActiveTab] = useState<TabId>('dados')

  const summary = useMemo(() => {
    if (!service) {
      return {
        totalQuantity: 0,
        quantityUnit: 'h',
        billingGross: 0,
        ownerDiscountApplied: 0,
        billingNet: 0,
        operatorCostTotal: 0,
        marginTotal: 0,
        totalHours: 0,
      }
    }
    return computeServiceFinancialSummary(
      service.contracted_hour_rate,
      worklogs ?? [],
      service.owner_discount_amount ?? 0,
      (service.charge_type as import('../lib/service-financial-summary').ChargeType | null) ?? 'por_hora',
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

  const { totalQuantity, quantityUnit, billingGross, ownerDiscountApplied, billingNet, operatorCostTotal, marginTotal } = summary

  return (
    <div className="space-y-4">
      <AppPageHeader
        backTo={ROUTES.SERVICES}
        backLabel="Voltar aos serviços"
        title={service.clients?.name ?? 'Serviço'}
        description={`${service.tractors?.name || service.trucks?.name || ''} · ${dayjs(service.service_date).format('DD/MM/YYYY')}`}
        actions={
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
            <ServiceVoucherPdfButton service={service} worklogs={worklogs ?? []} summary={summary} />
            {service.truck_id ? (
              <SimpleReceiptPdfButton service={service} billingNet={billingNet} />
            ) : null}
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

      {/* Cards de resumo — sempre visíveis */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="typo-caption mb-1">{quantityUnit === 'km' ? 'KM totais' : 'Horas trabalhadas'}</p>
          <p className="typo-body font-semibold tabular-nums">
            {totalQuantity > 0 ? `${totalQuantity.toFixed(1)} ${quantityUnit}` : <span className="text-muted-foreground">—</span>}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="typo-caption mb-1">
            {service.charge_type === 'por_km' ? 'Taxa por KM' : service.charge_type === 'valor_fixo' ? 'Valor fixo' : 'Taxa/hora'}
          </p>
          <p className="typo-body font-semibold"><AppMoney value={service.contracted_hour_rate} /></p>
        </div>
        <div className={cn('rounded-xl border bg-card p-4', billingNet > 0 ? 'border-primary/25' : 'border-border')}>
          <p className="typo-caption mb-1">A cobrar do cliente</p>
          {billingNet > 0
            ? (
              <>
                <p className="typo-body font-bold tabular-nums"><AppMoney value={billingNet} /></p>
                {ownerDiscountApplied > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Bruto <AppMoney value={billingGross} size="sm" />
                    {' · '}− desconto <AppMoney value={ownerDiscountApplied} size="sm" />
                  </p>
                )}
              </>
            )
            : <p className="typo-body-muted text-sm">—</p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="typo-caption mb-1">Custo do operador</p>
          {totalQuantity > 0
            ? <p className="typo-body font-semibold tabular-nums"><AppMoney value={operatorCostTotal} /></p>
            : <p className="typo-body-muted text-sm">—</p>}
        </div>
        <div className={cn(
          'rounded-xl border bg-card p-4 col-span-2 sm:col-span-1',
          marginTotal !== 0 || totalQuantity > 0 ? 'border-green-200 dark:border-green-500/25' : 'border-border',
        )}>
          <p className="typo-caption mb-1">Margem estimada</p>
          {totalQuantity > 0
            ? <p className={cn('typo-section-title font-bold tabular-nums', marginTotal >= 0 ? 'text-foreground' : 'text-destructive')}><AppMoney value={marginTotal} colored /></p>
            : <p className="typo-body-muted text-sm">—</p>}
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-border">
        <nav className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das abas */}
      <div className="space-y-6">

        {/* ABA: DADOS */}
        {activeTab === 'dados' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="typo-section-title mb-3">Dados do serviço</h2>
              <dl className="grid grid-cols-1 gap-4 typo-body sm:grid-cols-2 lg:grid-cols-4">
                {[
                  service.tractor_id ? {
                    label: 'Operador(es)',
                    value: <LaborOperatorsInService attribution={laborOperatorAttribution} />,
                  } : null,
                  { label: 'Data', value: dayjs(service.service_date).format('DD/MM/YYYY') },
                  service.tractor_id
                    ? (service.tractors
                        ? { label: 'Custo/h base', value: service.tractors.standard_hour_cost != null ? <AppMoney value={Number(service.tractors.standard_hour_cost)} size="sm" /> : '—' }
                        : { label: 'Custo/h base', value: '—' })
                    : null,
                  ...(service.truck_id ? [
                    { label: 'Cobrança', value: service.charge_type === 'por_km' ? 'Por KM' : service.charge_type === 'valor_fixo' ? 'Valor Fixo' : 'Por Hora' },
                    { label: 'Placa socorrido', value: service.towed_vehicle_plate || '—' },
                    { label: 'Veículo socorrido', value: service.towed_vehicle_brand ? `${service.towed_vehicle_brand} ${service.towed_vehicle_model || ''}`.trim() : service.towed_vehicle_model || '—' },
                    { label: 'Origem', value: service.origin_location || '—' },
                    { label: 'Destino', value: service.destination_location || '—' },
                  ] : []),
                ].filter(Boolean).map((item) => {
                  const { label, value } = item as { label: string; value: React.ReactNode }
                  return (
                    <div key={label}>
                      <dt className="typo-caption truncate">{label}</dt>
                      <dd className="font-medium mt-1 uppercase text-sm">{value}</dd>
                    </div>
                  )
                })}
              </dl>
              {service.notes && <p className="mt-4 pt-4 border-t border-border typo-body-muted">{service.notes}</p>}
              {service.truck_id && (service.checkout_photo_path || service.checkout_notes) ? (
                <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-500/30 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Vistoria antes do reboque</p>
                  {service.checkout_notes && <p className="text-sm text-muted-foreground">{service.checkout_notes}</p>}
                  {service.checkout_photo_path && (
                    <ReceiptViewButton storagePath={service.checkout_photo_path} label="Ver foto da vistoria" variant="secondary" size="sm" />
                  )}
                </div>
              ) : null}
              {service.receipt_storage_path ? (
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                  <span className="typo-caption">Recibo anexado</span>
                  <ReceiptViewButton storagePath={service.receipt_storage_path} variant="secondary" size="sm" />
                </div>
              ) : null}
            </div>

            <ServiceOwnerDiscountCard
              serviceId={service.id}
              savedAmount={service.owner_discount_amount ?? 0}
              locked={service.status === 'completed' || service.status === 'cancelled'}
            />
          </div>
        )}

        {/* ABA: DIAS TRABALHADOS */}
        {activeTab === 'trabalho' && (
          <div className="animate-in fade-in duration-150">
            <WorklogSection
              serviceId={service.id}
              vehicleId={service.tractor_id ?? service.truck_id ?? ''}
              isTruck={!!service.truck_id}
              serviceStatus={service.status as any}
              defaultOperatorId={defaultOperatorFromWorklogs}
              serviceDate={service.service_date}
              contractedHourRate={service.contracted_hour_rate}
              chargeType={(service.charge_type as import('../lib/service-financial-summary').ChargeType | null) ?? 'por_hora'}
            />
          </div>
        )}

        {/* ABA: FINANCEIRO (operador) */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <ServiceOperatorPaymentPanel
              service={service}
              laborOperatorAttribution={laborOperatorAttribution}
              operatorCostTotal={operatorCostTotal}
            />

            {service.truck_id && billingNet > 0 && laborOperatorAttribution.kind !== 'none' && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-500/5 p-6 space-y-3">
                <h2 className="typo-section-title mb-1">Comissão sugerida</h2>
                <p className="typo-body-muted text-sm">
                  Sugestão de comissão sobre o frete líquido de{' '}
                  <span className="font-semibold text-foreground"><AppMoney value={billingNet} size="sm" /></span>.
                  Registre na ficha do operador.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {[5, 10, 15, 20].map((pct) => (
                    <div key={pct} className="rounded-lg border border-purple-200 dark:border-purple-500/30 bg-card px-3 py-2">
                      <p className="text-xs text-muted-foreground">{pct}%</p>
                      <p className="font-semibold tabular-nums">
                        <AppMoney value={billingNet * pct / 100} size="sm" />
                      </p>
                    </div>
                  ))}
                </div>
                {laborOperatorAttribution.kind === 'single' && (
                  <p className="text-xs text-muted-foreground">
                    Operador:{' '}
                    <Link to={ROUTES.OPERATOR_DETAIL(laborOperatorAttribution.operatorId)} className="text-primary hover:underline">
                      {laborOperatorAttribution.operatorName}
                    </Link>
                    {' '}— use o formulário de comissão na ficha do operador para registrar.
                  </p>
                )}
                {laborOperatorAttribution.kind === 'multiple' && (
                  <p className="text-xs text-muted-foreground">
                    Múltiplos operadores — acesse a ficha de cada um para registrar a comissão individualmente.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ABA: COBRANÇAS */}
        {activeTab === 'cobrancas' && (
          <div className="animate-in fade-in duration-150">
            <ReceivableSection
              serviceId={service.id}
              clientId={service.client_id}
              suggestedTotal={billingNet}
            />
          </div>
        )}
      </div>
    </div>
  )
}
