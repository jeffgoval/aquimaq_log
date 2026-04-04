import { useTractorList } from '@/modules/tratores/hooks/use-tractor-queries'
import { useOperatorList } from '@/modules/operadores/hooks/use-operator-queries'
import { useClientList } from '@/modules/clientes/hooks/use-client-queries'
import { useServiceList } from '@/modules/servicos/hooks/use-service-queries'
import { useReceivables } from '@/modules/financeiro/hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { Tractor, Users, Building2, ClipboardList, DollarSign, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'
import dayjs from 'dayjs'

export function DashboardPage() {
  const tractors = useTractorList()
  const operators = useOperatorList()
  const clients = useClientList()
  const services = useServiceList()
  const receivables = useReceivables()

  const overdueReceivables = receivables.data?.filter(r => r.status === 'overdue') ?? []
  const pendingReceivables = receivables.data?.filter(r => r.status === 'pending' || r.status === 'partially_paid') ?? []
  const totalPending = pendingReceivables.reduce((a, r) => a + (r.final_amount - r.paid_amount), 0)
  const totalOverdue = overdueReceivables.reduce((a, r) => a + (r.final_amount - r.paid_amount), 0)
  const activeServices = services.data?.filter(s => s.status === 'draft' || s.status === 'in_progress') ?? []

  return (
    <div>
      <AppPageHeader
        title="Dashboard"
        description={`Visão geral — ${dayjs().format('dddd, D [de] MMMM [de] YYYY')}`}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AppStatCard title="Tratores ativos" value={tractors.data?.filter(t => t.is_active).length ?? '…'} icon={Tractor} />
        <AppStatCard title="Operadores" value={operators.data?.filter(o => o.is_active).length ?? '…'} icon={Users} />
        <AppStatCard title="Clientes" value={clients.data?.filter(c => c.is_active).length ?? '…'} icon={Building2} />
        <AppStatCard title="Serviços em aberto" value={activeServices.length} icon={ClipboardList} description="Aguardando conclusão" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AppStatCard title="A receber (pendente)" value={<AppMoney value={totalPending} />} icon={DollarSign} description={`${pendingReceivables.length} parcelas`} />
        <AppStatCard
          title="Vencido"
          value={<AppMoney value={totalOverdue} />}
          icon={AlertTriangle}
          description={`${overdueReceivables.length} parcelas`}
          className={overdueReceivables.length > 0 ? 'border-red-400/30' : ''}
        />
      </div>

      {/* Overdue alert */}
      {overdueReceivables.length > 0 && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-sm font-semibold text-red-400">{overdueReceivables.length} parcela{overdueReceivables.length !== 1 ? 's' : ''} vencida{overdueReceivables.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2">
            {overdueReceivables.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.clients?.name} · {r.description}</span>
                <AppMoney value={r.final_amount - r.paid_amount} size="sm" className="text-red-400" />
              </div>
            ))}
          </div>
          {overdueReceivables.length > 3 && (
            <Link to={ROUTES.RECEIVABLES} className="text-xs text-primary hover:underline mt-2 block">Ver todas →</Link>
          )}
        </div>
      )}

      {/* Active services */}
      {activeServices.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Serviços em aberto</h2>
          <div className="space-y-2">
            {activeServices.slice(0, 5).map(s => (
              <Link key={s.id} to={ROUTES.SERVICE_DETAIL(s.id)}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{s.clients?.name}</p>
                  <p className="text-xs text-muted-foreground">{s.tractors?.name} · {dayjs(s.service_date).format('DD/MM/YY')}</p>
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full bg-slate-400/10 text-slate-400')}>Em aberto</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
