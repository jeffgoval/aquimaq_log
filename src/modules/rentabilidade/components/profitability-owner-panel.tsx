import { FleetSpendCategoryChart } from './fleet-spend-category-chart'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AlertTriangle, Building2, DollarSign, TrendingDown, TrendingUp, Tractor, Truck } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { ClientRevenueRow, TruckProfitabilityRow, Views } from '@/integrations/supabase/db-types'

interface Props {
  tractors: TractorProfitabilityRow[]
  trucks: TruckProfitabilityRow[]
  clients: ClientRevenueRow[]
  fleetSpend: Views<'v_fleet_spend_by_category'> | undefined
  fleetSpendLoading: boolean
  fleetSpendError: boolean
}

export const ProfitabilityOwnerPanel = ({
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
    }),
    { revenue: 0, margin: 0, hours: 0 },
  )

  const truckTotals = trucks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      km: acc.km + Number(t.total_km),
    }),
    { revenue: 0, margin: 0, km: 0 },
  )

  const billedClients = clients.filter((c) => Number(c.total_billed) > 0)
  const totalBilled = billedClients.reduce((s, c) => s + Number(c.total_billed), 0)
  const totalPending = billedClients.reduce((s, c) => s + Number(c.total_pending), 0)
  const totalOverdue = billedClients.reduce((s, c) => s + Number(c.total_overdue), 0)

  const top3 = [...billedClients]
    .sort((a, b) => Number(b.total_billed) - Number(a.total_billed))
    .slice(0, 3)
  const top3Share = totalBilled > 0
    ? top3.reduce((s, c) => s + Number(c.total_billed), 0) / totalBilled * 100
    : 0

  const worstTractors = [...tractors]
    .filter((t) => Number(t.total_hours) > 0)
    .sort((a, b) => Number(a.net_margin) - Number(b.net_margin))
    .slice(0, 2)

  const bestTractors = [...tractors]
    .filter((t) => Number(t.total_hours) > 0)
    .sort((a, b) => Number(b.net_margin) - Number(a.net_margin))
    .slice(0, 2)

  const worstTrucks = [...trucks]
    .filter((t) => Number(t.total_km) > 0 || Number(t.gross_revenue) > 0)
    .sort((a, b) => Number(a.net_margin) - Number(b.net_margin))
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200/80 bg-amber-500/5 dark:border-amber-500/25 p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Leitura simples — o que isto é (e o que não é)</p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>
            Números para
            {' '}
            <strong className="text-foreground font-medium">decidir preço, máquina e cliente</strong>
            , não para declarar imposto.
          </li>
          <li>
            “Lucro” aqui usa o
            {' '}
            <strong className="text-foreground font-medium">faturamento registado</strong>
            {' '}
            e custos que lançou no sistema — pode ser diferente do dinheiro já no banco.
          </li>
          <li>
            “Custo da máquina nas horas” é uma
            {' '}
            <strong className="text-foreground font-medium">repartição do custo de compra</strong>
            {' '}
            pelas horas trabalhadas, não a folha oficial do contador.
          </li>
        </ul>
      </div>

      <div>
        <h2 className="typo-section-label mb-3">Situação geral — tratores</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AppStatCard
            title="Faturamento (tratores)"
            value={<AppMoney value={totals.revenue} />}
            icon={DollarSign}
          />
          <AppStatCard
            title="Sobra após custos"
            value={<AppMoney value={totals.margin} colored />}
            icon={TrendingUp}
            description="Lucro gerencial no período"
          />
          <AppStatCard title="Horas trabalhadas" value={`${totals.hours.toFixed(1)} h`} icon={Tractor} />
          <AppStatCard
            title="A receber (clientes)"
            value={<AppMoney value={totalPending} />}
            icon={TrendingDown}
            description={totalOverdue > 0 ? 'Inclui valores em atraso' : 'Parcelas em aberto'}
          />
        </div>
      </div>

      {trucks.length > 0 && (
        <div>
          <h2 className="typo-section-label mb-3">Guinchos — resumo</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <AppStatCard title="Faturamento (guinchos)" value={<AppMoney value={truckTotals.revenue} />} icon={Truck} />
            <AppStatCard title="Sobra após custos" value={<AppMoney value={truckTotals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="KM no período" value={`${truckTotals.km.toFixed(1)} km`} icon={Truck} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="typo-section-title text-base">Alertas rápidos</h2>
        {totalOverdue > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p>
              Há
              {' '}
              <strong><AppMoney value={totalOverdue} size="sm" /></strong>
              {' '}
              em títulos
              {' '}
              <strong>vencidos</strong>
              . Cobre ou combine com o contador.
            </p>
          </div>
        )}
        {top3Share >= 50 && totalBilled > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <Building2 className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              Os 3 maiores clientes concentram
              {' '}
              <strong>{top3Share.toFixed(0)}%</strong>
              {' '}
              do faturamento no período — se um sair, a conta aperta.
            </p>
          </div>
        )}
        {worstTractors.some((t) => {
          const rev = Number(t.revenue_per_hour)
          const c = Number(t.cost_per_hour)
          return Number(t.total_hours) > 0 && rev < c
        }) && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
            <Tractor className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p>
              Pelo menos um
              {' '}
              <strong>trator</strong>
              {' '}
              está com
              {' '}
              <strong>ganho por hora abaixo do custo por hora</strong>
              . Veja qual na aba Profissional e ajuste preço ou uso.
            </p>
          </div>
        )}
        {!totalOverdue && top3Share < 50
          && !worstTractors.some((t) => Number(t.total_hours) > 0 && Number(t.revenue_per_hour) < Number(t.cost_per_hour)) && (
          <p className="text-sm text-muted-foreground">Nenhum alerta crítico nos indicadores acima.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="typo-section-label mb-2">Tratores — precisa de atenção</h3>
          {worstTractors.length === 0
            ? <p className="text-sm text-muted-foreground">Sem horas no período para comparar.</p>
            : (
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
            )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="typo-section-label mb-2">Tratores — melhor resultado</h3>
          {bestTractors.length === 0
            ? <p className="text-sm text-muted-foreground">Sem dados no período.</p>
            : (
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
            )}
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

      {fleetSpendError ? (
        <p className="typo-body text-destructive rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
          Não foi possível carregar o gráfico de gastos. Confirme que as funções de rentabilidade estão no Supabase (npm run db:push).
        </p>
      ) : (
        <FleetSpendCategoryChart row={fleetSpend} isLoading={fleetSpendLoading} />
      )}

      {!billedClients.length ? (
        <AppEmptyState title="Clientes no período" description="Sem faturamento de serviços neste intervalo de datas." />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="typo-section-label mb-2">Clientes — totais no período</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Em aberto:
            {' '}
            <AppMoney value={totalPending} size="sm" />
            {totalOverdue > 0 && (
              <>
                {' '}
                · Vencido:
                {' '}
                <span className="text-destructive font-medium"><AppMoney value={totalOverdue} size="sm" /></span>
              </>
            )}
          </p>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {billedClients.slice(0, 8).map((c) => (
              <li key={c.client_id ?? ''} className="flex justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                <span className="font-medium truncate">{c.client_name}</span>
                <span className="tabular-nums shrink-0"><AppMoney value={Number(c.total_billed)} size="sm" /></span>
              </li>
            ))}
          </ul>
          {billedClients.length > 8 && (
            <p className="text-xs text-muted-foreground mt-2">Lista completa na aba Profissional.</p>
          )}
        </div>
      )}
    </div>
  )
}
