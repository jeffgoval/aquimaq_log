import { useClientList } from '@/modules/clientes/hooks/use-client-queries'
import { useServiceList } from '@/modules/servicos/hooks/use-service-queries'
import { useReceivables } from '@/modules/financeiro/hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { useMachineCosts } from '@/modules/custos/hooks/use-cost-queries'
import { Building2, ClipboardList, DollarSign, AlertTriangle, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'

export function DashboardPage() {
  const clients = useClientList()
  const services = useServiceList()
  const receivables = useReceivables()
  const machineCosts = useMachineCosts()

  const overdueReceivables = receivables.data?.filter(r => r.status === 'overdue') ?? []
  const pendingReceivables = receivables.data?.filter(r => r.status === 'pending' || r.status === 'partially_paid') ?? []
  const totalPending = pendingReceivables.reduce((a, r) => a + (r.final_amount - r.paid_amount), 0)
  const totalOverdue = overdueReceivables.reduce((a, r) => a + (r.final_amount - r.paid_amount), 0)
  const activeServices = services.data?.filter(s => s.status === 'draft' || s.status === 'in_progress') ?? []

  const totalPayables = machineCosts.data?.filter(c => c.status === 'pending').reduce((a, c) => a + c.amount, 0) ?? 0

  return (
    <div>
      <AppPageHeader title="Dashboard" />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="typo-section-label mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <Link to={ROUTES.SERVICE_NEW} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-foreground text-center leading-tight">Novo Serviço</span>
          </Link>

          <Link to={ROUTES.CLIENT_NEW} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-sm group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-foreground text-center leading-tight">Novo Cliente</span>
          </Link>
        </div>
      </div>

      {/* KPI cards section 1 (Operational) */}
      <div className="grid grid-cols-2 gap-3 mb-3 lg:gap-4 lg:mb-4">
        <AppStatCard title="Clientes" value={clients.data?.filter(c => c.is_active).length ?? '…'} icon={Building2} />
        <AppStatCard title="Serviços" value={activeServices.length} icon={ClipboardList} description="Em aberto" />
      </div>

      {/* Financial KPIs (Money) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <AppStatCard title="A receber" value={<AppMoney value={totalPending} />} icon={DollarSign} description={`${pendingReceivables.length} parcelas`} />
        <AppStatCard
          title="Vencido"
          value={<AppMoney value={totalOverdue} />}
          icon={AlertTriangle}
          description={`${overdueReceivables.length} parcelas`}
          className={overdueReceivables.length > 0 ? 'border-destructive/20 bg-destructive/5' : ''}
        />
        <AppStatCard
          title="Contas a pagar"
          value={<AppMoney value={totalPayables} />}
          icon={Wallet}
          description="Dívidas da frota"
          className="lg:border-primary/20"
        />
      </div>

      {/* Overdue alert */}
      {overdueReceivables.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="typo-section-title text-destructive">{overdueReceivables.length} parcela{overdueReceivables.length !== 1 ? 's' : ''} vencida{overdueReceivables.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2">
            {overdueReceivables.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between typo-body">
                <span className="text-muted-foreground">{r.clients?.name} · {r.description}</span>
                <AppMoney value={r.final_amount - r.paid_amount} size="sm" className="text-destructive" />
              </div>
            ))}
          </div>
          {overdueReceivables.length > 3 && (
            <Link to={ROUTES.RECEIVABLES} className="typo-caption text-primary hover:underline mt-2 block font-medium">Ver todas →</Link>
          )}
        </div>
      )}

      {/* Active services */}
      {activeServices.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="typo-section-title mb-4">Serviços em aberto</h2>
          <div className="space-y-2">
            {activeServices.slice(0, 5).map(s => (
              <Link key={s.id} to={ROUTES.SERVICE_DETAIL(s.id)}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                <div>
                  <p className="typo-body font-medium text-foreground">{s.clients?.name}</p>
                  <p className="typo-caption font-semibold uppercase tracking-wide mt-0.5">{s.tractors?.name}</p>
                </div>
                <span className={cn('typo-caption font-medium px-2 py-0.5 rounded-full bg-slate-400/10 text-slate-400')}>Em aberto</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
