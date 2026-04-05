import { useNavigate, useParams } from 'react-router-dom'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { TruckForm } from '../components/truck-form'
import { useTruckFormController } from '../hooks/use-truck-form-controller'
import { useUpdateTruck, useTruck } from '../hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'

export function TruckEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: truck, isLoading, isError, error } = useTruck(id!)
  const update = useUpdateTruck(id!)
  const form = useTruckFormController(truck)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  const onSubmit = async (values: any) => {
    await update.mutateAsync(values)
    navigate(ROUTES.TRUCK_DETAIL(id!))
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        backTo={ROUTES.TRUCK_DETAIL(id!)}
        backLabel="Voltar"
        title="Editar Guincho"
        description="Atualize as informações do veículo"
      />
      
      <div className="card max-w-3xl">
        <TruckForm
          form={form}
          onSubmit={onSubmit}
          isLoading={update.isPending}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  )
}
