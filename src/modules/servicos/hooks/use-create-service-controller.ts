import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createServiceSchema, type CreateServiceInput } from '../schemas/service.schema'
import { useCreateService } from './use-service-queries'
import { useClientOptions } from '@/modules/clientes/hooks/use-client-queries'
import { useTractorOptions } from '@/modules/tratores/hooks/use-tractor-queries'
import { useTrucks } from '@/modules/caminhoes/hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from '@/shared/lib/dayjs'

export function useCreateServiceController() {
  const navigate = useNavigate()
  const createService = useCreateService()
  const clients = useClientOptions()
  const tractors = useTractorOptions()
  const trucks = useTrucks()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema) as Resolver<CreateServiceInput>,
    defaultValues: { 
      service_date: dayjs().format('YYYY-MM-DD'),
      vehicle_type: 'tractor',
      charge_type: 'por_hora',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const isTruck = values.vehicle_type === 'truck'
    
    const service = await createService.mutateAsync({
      client_id: values.client_id,
      tractor_id: !isTruck ? values.tractor_id || null : null,
      truck_id: isTruck ? values.truck_id || null : null,
      primary_operator_id: null,
      service_date: values.service_date,
      contracted_hour_rate: values.contracted_hour_rate,
      owner_discount_amount: 0,
      notes: values.notes || null,
      status: 'draft',
      // Towing fields
      charge_type: isTruck ? values.charge_type || undefined : undefined,
      towed_vehicle_plate: isTruck ? values.towed_vehicle_plate?.toUpperCase() || undefined : undefined,
      towed_vehicle_brand: isTruck ? values.towed_vehicle_brand || undefined : undefined,
      towed_vehicle_model: isTruck ? values.towed_vehicle_model || undefined : undefined,
      origin_location: isTruck ? values.origin_location || undefined : undefined,
      destination_location: isTruck ? values.destination_location || undefined : undefined,
    })
    navigate(ROUTES.SERVICE_DETAIL(service.id))
  })

  return {
    form,
    onSubmit,
    isSubmitting: createService.isPending,
    clients: clients.data ?? [],
    tractors: tractors.data ?? [],
    trucks: trucks.data ?? [],
  }
}
