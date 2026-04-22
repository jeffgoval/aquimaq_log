import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppCard } from '@/shared/components/app/app-card'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { ROUTES } from '@/shared/constants/routes'
import { ResourceForm } from '../components/resource-form'
import { useCreateResource } from '../hooks/use-resource-queries'
import { resourceSchema, type ResourceFormInput, type ResourceInput } from '../schemas/resource.schema'

export function ResourceCreatePage() {
  const navigate = useNavigate()
  const createResource = useCreateResource()

  const form = useForm<ResourceFormInput, unknown, ResourceInput>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      type: 'tractor',
      billing_type: 'hourly',
      rate: 0,
      brand: '',
      model: '',
      status: 'available',
      equipment_pricing: {
        hourly: 0,
        daily: 0,
        equipment_15d: 0,
        equipment_30d: 0,
      },
    },
  })

  const onSubmit = async (values: ResourceInput) => {
    const created = await createResource.mutateAsync({
      payload: {
        name: values.name,
        type: values.type,
        billing_type: values.type === 'equipment' ? 'daily' : values.billing_type,
        rate: values.type === 'equipment' ? values.equipment_pricing?.daily ?? 0 : values.rate,
        brand: values.brand || null,
        model: values.model || null,
        status: values.status,
      },
      equipmentPricing: values.type === 'equipment' ? values.equipment_pricing : undefined,
    })

    navigate(ROUTES.RESOURCE_DETAIL(created.id))
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AppPageHeader
        backTo={ROUTES.RESOURCES}
        backLabel="Voltar para recursos"
        title="Novo recurso"
        description="Cadastre tratores, guinchos ou equipamentos na tabela unificada."
      />

      <AppCard className="mt-6">
        <ResourceForm
          form={form}
          submitting={createResource.isPending}
          onSubmit={onSubmit}
          onCancel={() => navigate(ROUTES.RESOURCES)}
          submitLabel="Salvar recurso"
        />
      </AppCard>
    </div>
  )
}
