import { Link, useNavigate, useParams } from 'react-router-dom'
import { Edit, PowerOff } from 'lucide-react'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCard } from '@/shared/components/app/app-card'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { ROUTES } from '@/shared/constants/routes'
import { useDeactivateResource, useResourceById } from '../hooks/use-resource-queries'

const typeLabelMap = {
  tractor: 'Trator',
  truck: 'Guincho/Caminhão',
  equipment: 'Equipamento',
} as const

const statusLabelMap = {
  available: { label: 'Disponível', variant: 'success' as const },
  maintenance: { label: 'Manutenção', variant: 'warning' as const },
  inactive: { label: 'Inativo', variant: 'default' as const },
} as const

type ResourceTypeKey = keyof typeof typeLabelMap
type ResourceStatusKey = keyof typeof statusLabelMap

const resourceTypeKey = (value: string): ResourceTypeKey =>
  value in typeLabelMap ? (value as ResourceTypeKey) : 'tractor'

const resourceStatusKey = (value: string): ResourceStatusKey =>
  value in statusLabelMap ? (value as ResourceStatusKey) : 'available'

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useResourceById(id)
  const deactivate = useDeactivateResource()
  const pricingRows = ((data as unknown as { pricing?: Array<{ pricing_mode: string; rate: number; deleted_at: string | null; is_active: boolean }> } | undefined)?.pricing ?? [])
    .filter((item) => item.deleted_at == null && item.is_active)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AppPageHeader
        backTo={ROUTES.RESOURCES}
        backLabel="Voltar para recursos"
        title={data?.name ?? 'Detalhes do recurso'}
        description="Visualize e gerencie os dados do recurso."
        actions={
          id ? (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.RESOURCE_EDIT(id)}>
                <AppButton variant="secondary" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </AppButton>
              </Link>
              <AppButton
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={deactivate.isPending}
                onClick={async () => {
                  if (!id) return
                  if (!confirm('Desativar este recurso?')) return
                  await deactivate.mutateAsync(id)
                  navigate(ROUTES.RESOURCES)
                }}
              >
                <PowerOff className="mr-2 h-4 w-4" />
                Desativar
              </AppButton>
            </div>
          ) : null
        }
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && data && (
        <AppCard className="mt-6">
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</dt>
              <dd className="mt-1 text-sm font-medium">{typeLabelMap[resourceTypeKey(data.type)]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <AppBadge variant={statusLabelMap[resourceStatusKey(data.status)].variant}>
                  {statusLabelMap[resourceStatusKey(data.status)].label}
                </AppBadge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marca</dt>
              <dd className="mt-1 text-sm font-medium">{data.brand || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modelo</dt>
              <dd className="mt-1 text-sm font-medium">{data.model || '—'}</dd>
            </div>
          </dl>

          {data.type === 'equipment' && (
            <div className="mt-6 rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-semibold">Tabela de preços do equipamento</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { mode: 'hourly', label: 'Hora' },
                  { mode: 'daily', label: 'Diária' },
                  { mode: 'equipment_15d', label: 'Pacote 15 dias' },
                  { mode: 'equipment_30d', label: 'Pacote 30 dias' },
                ].map((item) => {
                  const rate = pricingRows.find((row) => row.pricing_mode === item.mode)?.rate ?? 0
                  return (
                    <div key={item.mode}>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium">
                        <AppMoney value={rate} />
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(data.type === 'tractor' || data.type === 'truck') && (() => {
            const billingLabelMap: Record<string, string> = {
              hourly: 'Por hora',
              daily: 'Por dia',
              km: 'Por km',
              fixed: 'Valor fixo',
            }
            const fixedRate = pricingRows.find((row) => row.pricing_mode === 'fixed')?.rate ?? 0
            const kmRate = pricingRows.find((row) => row.pricing_mode === 'km')?.rate ?? 0
            const pricing = pricingRows[0]
            const billingType = pricing?.pricing_mode ?? (data as { billing_type?: string }).billing_type ?? ''
            const rate = pricing?.rate ?? (data as { rate?: number }).rate ?? 0
            const label = billingLabelMap[billingType] ?? billingType
            return (
              <div className="mt-6 rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-semibold">Tabela de preços</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.type === 'truck' ? (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor fixo (na cidade)</p>
                        <p className="font-medium">
                          <AppMoney value={fixedRate} />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor por km (fora da cidade)</p>
                        <p className="font-medium">
                          <AppMoney value={kmRate} />
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo de cobrança</p>
                        <p className="font-medium">{label || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tarifa</p>
                        <p className="font-medium">
                          <AppMoney value={rate} />
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })()}
        </AppCard>
      )}
    </div>
  )
}
