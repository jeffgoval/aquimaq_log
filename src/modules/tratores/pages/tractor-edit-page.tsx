import { useParams } from 'react-router-dom'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { TractorForm } from '../components/tractor-form'
import { useTractorFormController } from '../hooks/use-tractor-form-controller'
import { useTractor } from '../hooks/use-tractor-queries'

export function TractorEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tractor, isLoading, isError, error } = useTractor(id!)
  const controller = useTractorFormController(tractor ?? undefined)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  return (
    <div className="max-w-2xl">
      <AppPageHeader title="Editar Trator" description={tractor?.name} />
      <TractorForm controller={controller} />
    </div>
  )
}
