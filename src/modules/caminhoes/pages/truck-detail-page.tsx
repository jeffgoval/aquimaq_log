import { useParams, Link } from 'react-router-dom'
import { useTruck } from '../hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppMoney } from '@/shared/components/app/app-money'
import dayjs from '@/shared/lib/dayjs'

export function TruckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: truck, isLoading, isError, error } = useTruck(id!)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!truck) return null

  return (
    <div className="space-y-6">
      <AppPageHeader
        backTo={ROUTES.TRUCKS}
        backLabel="Voltar aos guinchos"
        title={truck.name}
        description={truck.is_active ? 'Veículo Ativo' : 'Veículo Inativo'}
        actions={
          <Link
            to={ROUTES.TRUCK_EDIT(truck.id)}
            className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
          >
            Editar cadastro
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="typo-section-title">Dados do Guincho</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Placa</dt>
              <dd className="font-semibold mt-1 uppercase">{truck.plate || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Marca / Modelo</dt>
              <dd className="font-semibold mt-1">{truck.brand} {truck.model}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Odômetro Atual</dt>
              <dd className="font-medium mt-1">{truck.current_odometer.toLocaleString('pt-BR')} KM</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cadastro em</dt>
              <dd className="font-medium mt-1">{dayjs(truck.created_at).format('DD/MM/YYYY')}</dd>
            </div>
          </dl>
          {truck.notes && (
            <div className="pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground block mb-1">Notas</span>
              <p className="text-sm whitespace-pre-wrap">{truck.notes}</p>
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="typo-section-title">Financeiro do Caminhão</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground mb-1">Valor de Compra</dt>
              <dd className="font-medium"><AppMoney value={truck.purchase_value} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1">Valor Residual Projetado</dt>
              <dd className="font-medium"><AppMoney value={truck.residual_value} /></dd>
            </div>
          </dl>
          {/* Espaço para rentabilidade do guincho no futuro */}
        </div>
      </div>
    </div>
  )
}
