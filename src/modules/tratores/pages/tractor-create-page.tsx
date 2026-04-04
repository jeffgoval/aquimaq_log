import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { useTractorFormController } from '../hooks/use-tractor-form-controller'
import { TractorForm } from '../components/tractor-form'

export function TractorCreatePage() {
  const controller = useTractorFormController()
  return (
    <div className="max-w-2xl">
      <AppPageHeader title="Novo Trator" description="Cadastre um novo ativo na frota" />
      <TractorForm controller={controller} />
    </div>
  )
}
