import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { ROUTES } from '@/shared/constants/routes'
import { useTractorFormController } from '../hooks/use-tractor-form-controller'
import { TractorForm } from '../components/tractor-form'

export function TractorCreatePage() {
  const controller = useTractorFormController()
  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={ROUTES.TRACTORS}
        backLabel="Voltar aos tratores"
        title="Novo Trator"
        description="Cadastre um novo ativo na frota"
      />
      <TractorForm controller={controller} />
    </div>
  )
}
