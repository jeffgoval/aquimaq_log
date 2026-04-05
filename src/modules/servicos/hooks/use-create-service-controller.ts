import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useCreateService } from './use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from '@/shared/lib/dayjs'

export function useCreateServiceController() {
  const navigate = useNavigate()
  const createService = useCreateService()
  const clients = useClientOptions()
  const tractors = useTractorOptions()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
    defaultValues: { service_date: dayjs().format('YYYY-MM-DD'), owner_discount_amount: 0 },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const service = await createService.mutateAsync({
      client_id: values.client_id,
      tractor_id: values.tractor_id,
      primary_operator_id: null,
      service_date: values.service_date,
      contracted_hour_rate: values.contracted_hour_rate,
      owner_discount_amount: values.owner_discount_amount ?? 0,
      notes: values.notes || null,
      status: 'draft',
    })
    navigate(ROUTES.SERVICE_DETAIL(service.id))
  })

  return {
    form,
    onSubmit,
    isSubmitting: createService.isPending,
    clients: clients.data ?? [],
    tractors: tractors.data ?? [],
  }
}
