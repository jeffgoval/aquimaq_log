import { useParams } from 'react-router-dom'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { useTractor } from '../hooks/use-tractor-queries'
import { Link } from 'react-router-dom'
import { Edit, Clock, DollarSign, Droplets, TrendingDown } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/cn'
import { useTractorLatestHourmeterQuery } from '../hooks/use-preventive-oil-alerts'
import {
  getOilChangeStatus,
  OIL_CHANGE_CRITICAL_HOURS,
  OIL_CHANGE_WARNING_HOURS,
} from '../lib/oil-change-alerts'

export function TractorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tractor, isLoading, isError, error } = useTractor(id!)
  const { data: latestHourmeter } = useTractorLatestHourmeterQuery(id)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!tractor) return null

  const oil = getOilChangeStatus(tractor, latestHourmeter ?? null)
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 })

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.TRACTORS}
        backLabel="Voltar aos tratores"
        title={tractor.name}
        description={[tractor.brand, tractor.model, tractor.plate].filter(Boolean).join(' · ')}
        actions={
          <Link
            to={ROUTES.TRACTOR_EDIT(tractor.id)}
            className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        }
      />

      {/* Status badge */}
      <span className={cn(
        'inline-flex text-xs font-medium px-3 py-1 rounded-full mb-6',
        tractor.is_active
          ? 'bg-green-100 text-green-900 dark:bg-green-500/15 dark:text-green-400'
          : 'bg-muted text-muted-foreground'
      )}>
        {tractor.is_active ? 'Ativo' : 'Inativo'}
      </span>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AppStatCard
          title="Valor de Compra"
          value={<AppMoney value={tractor.purchase_value} />}
          icon={DollarSign}
        />
        <AppStatCard
          title="Custo/hora (depreciação)"
          value={<AppMoney value={tractor.standard_hour_cost ?? 0} />}
          icon={TrendingDown}
        />
        <AppStatCard
          title="Vida Útil"
          value={`${tractor.useful_life_hours.toLocaleString('pt-BR')}h`}
          icon={Clock}
        />
      </div>

      {oil.configured && (
        <div
          className={cn(
            'rounded-xl border p-4 mb-6',
            !oil.hasReading && 'border-border bg-muted/30',
            oil.hasReading &&
              oil.hoursRemaining != null &&
              oil.hoursRemaining <= 0 &&
              'border-destructive/40 bg-destructive/10',
            oil.hasReading &&
              oil.hoursRemaining != null &&
              oil.hoursRemaining > 0 &&
              oil.hoursRemaining <= OIL_CHANGE_CRITICAL_HOURS &&
              'border-destructive/35 bg-destructive/5',
            oil.hasReading &&
              oil.hoursRemaining != null &&
              oil.hoursRemaining > OIL_CHANGE_CRITICAL_HOURS &&
              oil.hoursRemaining <= OIL_CHANGE_WARNING_HOURS &&
              'border-amber-500/35 bg-amber-500/5',
            oil.hasReading &&
              oil.hoursRemaining != null &&
              oil.hoursRemaining > OIL_CHANGE_WARNING_HOURS &&
              'border-border bg-card',
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <h2 className="typo-section-title">Troca de óleo (preventiva)</h2>
          </div>
          {!oil.hasReading ? (
            <p className="typo-body text-muted-foreground">
              Intervalo {tractor.oil_change_interval_hours} h desde o horímetro {fmt(tractor.oil_change_last_done_hourmeter!)} h.
              Registe apontamentos com horímetro nos serviços para o sistema calcular horas restantes e alertas no dashboard.
            </p>
          ) : oil.hoursRemaining != null && oil.nextDueHourmeter != null ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 typo-body">
              <div>
                <dt className="typo-caption text-muted-foreground">Horímetro atual (última leitura)</dt>
                <dd className="font-medium mt-0.5">{fmt(latestHourmeter!)} h</dd>
              </div>
              <div>
                <dt className="typo-caption text-muted-foreground">Meta de horímetro (próxima troca)</dt>
                <dd className="font-medium mt-0.5">{fmt(oil.nextDueHourmeter)} h</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="typo-caption text-muted-foreground">Situação</dt>
                <dd className="font-medium mt-0.5">
                  {oil.hoursRemaining <= 0
                    ? `Em atraso: ${fmt(Math.abs(oil.hoursRemaining))} h além do intervalo.`
                    : oil.hoursRemaining <= OIL_CHANGE_CRITICAL_HOURS
                      ? `Faltam ${fmt(oil.hoursRemaining)} h para a troca de óleo.`
                      : oil.hoursRemaining <= OIL_CHANGE_WARNING_HOURS
                        ? `Faltam ${fmt(oil.hoursRemaining)} h — agendar troca em breve.`
                        : `Faltam ${fmt(oil.hoursRemaining)} h até à próxima troca prevista.`}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="typo-section-title mb-4">Detalhes</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Valor Residual', value: <AppMoney value={tractor.residual_value} /> },
            { label: 'Placa', value: tractor.plate || '—' },
            { label: 'Marca', value: tractor.brand || '—' },
            { label: 'Modelo', value: tractor.model || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
        {tractor.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <dt className="text-xs text-muted-foreground mb-1">Observações</dt>
            <dd className="text-sm text-foreground">{tractor.notes}</dd>
          </div>
        )}
      </div>
    </div>
  )
}
