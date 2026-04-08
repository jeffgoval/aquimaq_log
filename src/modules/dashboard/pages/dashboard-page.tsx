import { useClientList } from '@/modules/clientes/hooks/use-client-queries'
import { useServiceList } from '@/modules/servicos/hooks/use-service-queries'
import { useReceivables } from '@/modules/financeiro/hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { useMachineCosts } from '@/modules/custos/hooks/use-cost-queries'
import { Building2, ClipboardList, DollarSign, AlertTriangle, Wallet, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { PreventiveOilAlertsCard } from '../components/preventive-oil-alerts-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import {
  getServicePaymentBadgeKind,
  getServicePaymentBadgeProps,
} from '@/modules/servicos/lib/service-payment-badge'

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
    <div className="min-w-0 max-w-full">
      <AppPageHeader title="Dashboard" />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">O que deseja fazer?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to={ROUTES.SERVICE_NEW}
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
          >
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Novo serviço</p>
              <p className="text-xs text-muted-foreground">Cadastrar um novo atendimento</p>
            </div>
          </Link>

          <Link
            to={ROUTES.RECEIVABLES}
            className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all group"
          >
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-sm group-hover:scale-105 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ver cobranças</p>
              <p className="text-xs text-muted-foreground">O que os clientes devem pagar</p>
            </div>
          </Link>

          <Link
            to={ROUTES.CLIENT_NEW}
            className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all group"
          >
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Novo cliente</p>
              <p className="text-xs text-muted-foreground">Cadastrar um novo cliente</p>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI cards section 1 (Operational) */}
      <div className="grid grid-cols-2 gap-3 mb-3 lg:gap-4 lg:mb-4">
        <AppStatCard
          title="Clientes"
          value={clients.data?.filter(c => c.is_active).length ?? '…'}
          icon={Building2}
          to={ROUTES.CLIENTS}
        />
        <AppStatCard
          title="Serviços"
          value={activeServices.length}
          icon={ClipboardList}
          description="Em aberto"
          to={ROUTES.SERVICES}
        />
      </div>

      <PreventiveOilAlertsCard />

      {/* Financial KPIs (Money) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <AppStatCard
          title="A receber"
          value={<AppMoney value={totalPending} />}
          icon={DollarSign}
          description={`${pendingReceivables.length} parcelas`}
          to={ROUTES.RECEIVABLES}
        />
        <AppStatCard
          title="Vencido"
          value={<AppMoney value={totalOverdue} />}
          icon={AlertTriangle}
          description={`${overdueReceivables.length} parcelas`}
          className={overdueReceivables.length > 0 ? 'border-destructive/20 bg-destructive/5' : ''}
          to={ROUTES.RECEIVABLES}
        />
        <AppStatCard
          title="Contas a pagar"
          value={<AppMoney value={totalPayables} />}
          icon={Wallet}
          description="Dívidas da frota"
          className="lg:border-primary/20"
          to={ROUTES.MACHINE_COSTS}
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
            {activeServices.slice(0, 5).map(s => {
              const pay = getServicePaymentBadgeProps(getServicePaymentBadgeKind(s))
              return (
              <Link key={s.id} to={ROUTES.SERVICE_DETAIL(s.id)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                <div className="min-w-0">
                  <p className="typo-body font-medium text-foreground">{s.clients?.name}</p>
                  <p className="typo-caption font-semibold uppercase tracking-wide mt-0.5">{s.tractors?.name}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="typo-caption font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-400">Em aberto</span>
                  <AppBadge variant={pay.variant}>{pay.label}</AppBadge>
                </div>
              </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
