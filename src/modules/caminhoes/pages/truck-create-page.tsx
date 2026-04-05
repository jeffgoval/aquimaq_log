import { useNavigate } from 'react-router-dom'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { TruckForm } from '../components/truck-form'
import { useTruckFormController } from '../hooks/use-truck-form-controller'
import { useCreateTruck } from '../hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'

export function TruckCreatePage() {
  const navigate = useNavigate()
  const create = useCreateTruck()
  const form = useTruckFormController()

  const onSubmit = async (values: any) => {
    await create.mutateAsync(values)
    navigate(ROUTES.TRUCKS)
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        backTo={ROUTES.TRUCKS}
        backLabel="Voltar aos guinchos"
        title="Novo Guincho"
        description="Cadastro de veículo rodoviário"
      />
      <div className="card max-w-3xl">
        <TruckForm
          form={form}
          onSubmit={onSubmit}
          isLoading={create.isPending}
          submitLabel="Cadastrar Guincho"
        />
      </div>
    </div>
  )
}
