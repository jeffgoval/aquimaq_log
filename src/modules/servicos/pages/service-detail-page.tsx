import { useParams } from 'react-router-dom'
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
import dayjs from 'dayjs'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading, isError, error } = useService(id!)
  const { data: worklogs } = useWorklogsByService(id!)
  const complete = useCompleteService()

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!service) return null

  const totalHours = worklogs?.reduce((acc, w) => acc + (w.worked_hours ?? 0), 0) ?? 0
  const totalValue = totalHours * service.contracted_hour_rate

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={service.clients?.name ?? 'Serviço'}
        description={`${service.tractors?.name} · ${dayjs(service.service_date).format('DD/MM/YYYY')}`}
        actions={
          <div className="flex items-center gap-2">
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

      {/* Resumo financeiro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Taxa/hora</p>
          <p className="font-semibold"><AppMoney value={service.contracted_hour_rate} /></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Horas trabalhadas</p>
          <p className="font-semibold">{totalHours > 0 ? `${totalHours.toFixed(1)}h` : <span className="text-muted-foreground">—</span>}</p>
        </div>
        <div className={cn('rounded-xl border bg-card p-4 col-span-2', totalValue > 0 ? 'border-primary/30' : 'border-border')}>
          <p className="text-xs text-muted-foreground mb-1">Total apurado</p>
          {totalValue > 0
            ? (
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-lg"><AppMoney value={totalValue} /></p>
                <p className="text-xs text-muted-foreground">({totalHours.toFixed(1)}h × <AppMoney value={service.contracted_hour_rate} size="sm" />)</p>
              </div>
            )
            : <p className="text-muted-foreground text-sm">Sem apontamentos ainda</p>}
        </div>
      </div>

      {/* Dados */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-3">Dados do serviço</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Operador', value: service.operators?.name || '—' },
            { label: 'Data', value: dayjs(service.service_date).format('DD/MM/YYYY') },
            { label: 'Custo/h do trator', value: service.tractors?.standard_hour_cost != null ? <AppMoney value={Number(service.tractors.standard_hour_cost)} size="sm" /> : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
        {service.notes && <p className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">{service.notes}</p>}
      </div>

      <WorklogSection serviceId={service.id} tractorId={service.tractor_id} />

      <ReceivableSection
        serviceId={service.id}
        clientId={service.client_id}
        suggestedTotal={totalValue}
      />
    </div>
  )
}
