import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useCreateService } from './use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useOperatorOptions } from '@/modules/operadores/hooks/use-operator-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from '@/shared/lib/dayjs'

export function useCreateServiceController() {
  const navigate = useNavigate()
  const createService = useCreateService()
  const clients = useClientOptions()
  const operators = useOperatorOptions()
  const tractors = useTractorOptions()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
    defaultValues: { service_date: dayjs().format('YYYY-MM-DD') },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await createService.mutateAsync({
      client_id: values.client_id,
      tractor_id: values.tractor_id,
      primary_operator_id: values.primary_operator_id || null,
      service_date: values.service_date,
      contracted_hour_rate: values.contracted_hour_rate,
      notes: values.notes || null,
      status: 'draft',
    })
    navigate(ROUTES.SERVICES)
  })

  return {
    form,
    onSubmit,
    isSubmitting: createService.isPending,
    clients: clients.data ?? [],
    operators: operators.data ?? [],
    tractors: tractors.data ?? [],
  }
}
