import { FleetSpendCategoryChart } from './fleet-spend-category-chart'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { DollarSign, TrendingDown, TrendingUp, Tractor, Truck, Users, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { ClientRevenueRow, TruckProfitabilityRow, Views } from '@/integrations/supabase/db-types'
import type { ProfitabilityFleetTab } from './profitability-toolbar'

interface Props {
  fleetTab: ProfitabilityFleetTab
  tractors: TractorProfitabilityRow[]
  trucks: TruckProfitabilityRow[]
  clients: ClientRevenueRow[]
  fleetSpend: Views<'v_fleet_spend_by_category'> | undefined
  fleetSpendLoading: boolean
  fleetSpendError: boolean
}

export const ProfitabilityOwnerPanel = ({
  fleetTab,
  tractors,
  trucks,
  clients,
  fleetSpend,
  fleetSpendLoading,
  fleetSpendError,
}: Props) => {
  const totals = tractors.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      hours: acc.hours + Number(t.total_hours),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational: acc.operational + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, hours: 0, depreciation: 0, operational: 0, operatorCost: 0 },
  )

  const truckTotals = trucks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      km: acc.km + Number(t.total_km),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational: acc.operational + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, km: 0, depreciation: 0, operational: 0, operatorCost: 0 },
  )

  const tractorCostsTotal = totals.depreciation + totals.operational + totals.operatorCost
  const truckCostsTotal = truckTotals.depreciation + truckTotals.operational + truckTotals.operatorCost

  const tractorRevenuePerHour = totals.hours > 0 ? totals.revenue / totals.hours : 0
  const tractorCostPerHour = totals.hours > 0 ? tractorCostsTotal / totals.hours : 0
  const tractorProfitPerHour = totals.hours > 0 ? totals.margin / totals.hours : 0

  const truckRevenuePerKm = truckTotals.km > 0 ? truckTotals.revenue / truckTotals.km : 0
  const truckCostPerKm = truckTotals.km > 0 ? truckCostsTotal / truckTotals.km : 0
  const truckProfitPerKm = truckTotals.km > 0 ? truckTotals.margin / truckTotals.km : 0

  const billedClients = clients.filter((c) => Number(c.total_billed) > 0)
  const totalPending = billedClients.reduce((s, c) => s + Number(c.total_pending), 0)
  const totalOverdue = billedClients.reduce((s, c) => s + Number(c.total_overdue), 0)

  const tractorsWithHours = tractors.filter((t) => Number(t.total_hours) > 0)
  const sortedTractorsAsc = [...tractorsWithHours].sort(
    (a, b) => Number(a.net_margin) - Number(b.net_margin),
  )
  const sortedTractorsDesc = [...tractorsWithHours].sort(
    (a, b) => Number(b.net_margin) - Number(a.net_margin),
  )

  /** Só faz sentido comparar “pior” vs “melhor” com 2+ máquinas; senão é o mesmo trator nas duas colunas. */
  const showTractorRanking = tractorsWithHours.length >= 2

  let worstTractors: typeof tractorsWithHours = []
  let bestTractors: typeof tractorsWithHours = []
  if (showTractorRanking) {
    if (tractorsWithHours.length === 2) {
      worstTractors = [sortedTractorsAsc[0]]
      bestTractors = [sortedTractorsDesc[0]]
    } else {
      worstTractors = sortedTractorsAsc.slice(0, 2)
      const worstIds = new Set(worstTractors.map((t) => t.tractor_id))
      bestTractors = sortedTractorsDesc.filter((t) => !worstIds.has(t.tractor_id)).slice(0, 2)
    }
  }

  const worstTrucks = [...trucks]
    .filter((t) => Number(t.total_km) > 0 || Number(t.gross_revenue) > 0)
    .sort((a, b) => Number(a.net_margin) - Number(b.net_margin))
    .slice(0, 2)

  if (fleetTab === 'truck') {
    return (
      <div className="space-y-6">
        {!trucks.length ? (
          <AppEmptyState title="Guinchos" description="Não há caminhões cadastrados." />
        ) : (
          <>
            <div>
              <h2 className="typo-section-label mb-3">Situação geral — guinchos</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AppStatCard title="Receita (período)" value={<AppMoney value={truckTotals.revenue} />} icon={DollarSign} />
                <AppStatCard title="Custos (período)" value={<AppMoney value={truckCostsTotal} />} icon={TrendingDown} description="Máquina + operacional + mão de obra" />
                <AppStatCard title="Lucro (período)" value={<AppMoney value={truckTotals.margin} colored />} icon={TrendingUp} description="Sobra após custos (gestão)" />
                <AppStatCard title="KM no período" value={`${truckTotals.km.toFixed(1)} km`} icon={Truck} />
                <AppStatCard title="Receita por km" value={<AppMoney value={truckRevenuePerKm} />} icon={Truck} description="Média no período" />
                <AppStatCard title="Lucro por km" value={<AppMoney value={truckProfitPerKm} colored />} icon={TrendingUp} description="Média no período" />
              </div>
            </div>
            {worstTrucks.length > 0 && Number(worstTrucks[0]?.net_margin) < 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="typo-section-label mb-2">Guincho com margem mais baixa</h3>
                <ul className="space-y-2 text-sm">
                  {worstTrucks.map((t) => (
                    <li key={t.truck_id} className="flex justify-between gap-2">
                      <span className="font-medium">{t.truck_name}</span>
                      <AppMoney value={Number(t.net_margin)} colored size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="typo-section-label mb-3">Situação geral — tratores</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AppStatCard
            title="Receita (período)"
            value={<AppMoney value={totals.revenue} />}
            icon={DollarSign}
          />
          <AppStatCard
            title="Custos (período)"
            value={<AppMoney value={tractorCostsTotal} />}
            icon={TrendingDown}
            description="Máquina + operacional + mão de obra"
          />
          <AppStatCard
            title="Lucro (período)"
            value={<AppMoney value={totals.margin} colored />}
            icon={TrendingUp}
            description="Sobra após custos (gestão)"
          />
          <AppStatCard
            title="Horas trabalhadas"
            value={`${totals.hours.toFixed(1)} h`}
            icon={Clock}
          />
          <AppStatCard
            title="Receita por hora"
            value={<AppMoney value={tractorRevenuePerHour} />}
            icon={Tractor}
            description="Média no período"
          />
          <AppStatCard
            title="Lucro por hora"
            value={<AppMoney value={tractorProfitPerHour} colored />}
            icon={TrendingUp}
            description="Média no período"
          />
          <AppStatCard
            title="A receber (clientes)"
            value={<AppMoney value={totalPending} />}
            icon={Users}
            description={totalOverdue > 0 ? 'Inclui valores em atraso' : 'Parcelas em aberto'}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Dica: se a <strong className="text-foreground">receita por hora</strong> estiver perto do <strong className="text-foreground">custo por hora</strong> ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tractorCostPerHour)}), a margem fica apertada.
        </p>
      </div>

      {showTractorRanking && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="typo-section-label mb-2">Tratores — precisa de atenção</h3>
            <ul className="space-y-2 text-sm">
              {worstTractors.map((t) => (
                <li key={t.tractor_id ?? ''} className="flex justify-between gap-2">
                  <span className="font-medium">{t.tractor_name}</span>
                  <span className={cn(Number(t.net_margin) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                    <AppMoney value={Number(t.net_margin)} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="typo-section-label mb-2">Tratores — melhor resultado</h3>
            <ul className="space-y-2 text-sm">
              {bestTractors.map((t) => (
                <li key={t.tractor_id ?? ''} className="flex justify-between gap-2">
                  <span className="font-medium">{t.tractor_name}</span>
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    <AppMoney value={Number(t.net_margin)} size="sm" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {fleetSpendError ? (
        <p className="typo-body text-destructive rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
          Não foi possível carregar o gráfico de gastos. Tente novamente em instantes.
        </p>
      ) : (
        <FleetSpendCategoryChart row={fleetSpend} isLoading={fleetSpendLoading} />
      )}
    </div>
  )
}
