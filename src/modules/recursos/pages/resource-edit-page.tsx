import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppCard } from '@/shared/components/app/app-card'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { ROUTES } from '@/shared/constants/routes'
import { ResourceForm } from '../components/resource-form'
import { useResourceById, useUpdateResource } from '../hooks/use-resource-queries'
import { resourceSchema, type ResourceFormInput, type ResourceInput } from '../schemas/resource.schema'

export function ResourceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateResource = useUpdateResource()
  const { data, isLoading, isError, error, refetch } = useResourceById(id)

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
    },
  })

  useEffect(() => {
    if (!data) return
    const pricingRows = ((data as unknown as { pricing?: Array<{ pricing_mode: string; rate: number; deleted_at: string | null; is_active: boolean }> }).pricing ?? [])
      .filter((item) => item.deleted_at == null && item.is_active)

    const getRate = (mode: string) => pricingRows.find((item) => item.pricing_mode === mode)?.rate ?? 0

    form.reset({
      name: data.name,
      type: data.type as ResourceInput['type'],
      billing_type: data.billing_type as ResourceInput['billing_type'],
      rate: data.rate,
      brand: data.brand ?? '',
      model: data.model ?? '',
      status: data.status as ResourceInput['status'],
      equipment_pricing: {
        hourly: getRate('hourly'),
        daily: getRate('daily'),
        equipment_15d: getRate('equipment_15d'),
        equipment_30d: getRate('equipment_30d'),
      },
    })
  }, [data, form])

  const onSubmit = async (values: ResourceInput) => {
    if (!id) return
    await updateResource.mutateAsync({
      id,
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

    navigate(ROUTES.RESOURCE_DETAIL(id))
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AppPageHeader
        backTo={id ? ROUTES.RESOURCE_DETAIL(id) : ROUTES.RESOURCES}
        backLabel="Voltar"
        title="Editar recurso"
        description="Atualize os dados operacionais e de cobrança do recurso."
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <AppCard className="mt-6">
          <ResourceForm
            form={form}
            submitting={updateResource.isPending}
            onSubmit={onSubmit}
            onCancel={() => navigate(id ? ROUTES.RESOURCE_DETAIL(id) : ROUTES.RESOURCES)}
            submitLabel="Salvar alterações"
          />
        </AppCard>
      )}
    </div>
  )
}
