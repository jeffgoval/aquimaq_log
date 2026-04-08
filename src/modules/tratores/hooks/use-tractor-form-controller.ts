import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { tractorSchema, type TractorInput } from '../schemas/tractor.schema'
import { useCreateTractor, useUpdateTractor } from './use-tractor-queries'
import { ROUTES } from '@/shared/constants/routes'
import type { Tables } from '@/integrations/supabase/db-types'

type Tractor = Tables<'tractors'>

export function useTractorFormController(existing?: Tractor) {
  const navigate = useNavigate()
  const createTractor = useCreateTractor()
  const updateTractor = useUpdateTractor(existing?.id ?? '')

  const form = useForm<TractorInput>({
    resolver: zodResolver(tractorSchema) as Resolver<TractorInput>,
    values: existing
      ? {
          name: existing.name,
          plate: existing.plate ?? '',
          brand: existing.brand ?? '',
          model: existing.model ?? '',
          default_hour_rate: Number((existing as { default_hour_rate?: number | null }).default_hour_rate ?? 0),
          purchase_value: existing.purchase_value,
          residual_value: existing.residual_value,
          useful_life_hours: existing.useful_life_hours,
          is_active: existing.is_active,
          notes: existing.notes ?? '',
          oil_change_interval_hours: existing.oil_change_interval_hours ?? null,
          oil_change_last_done_hourmeter: existing.oil_change_last_done_hourmeter ?? null,
        }
      : undefined,
    defaultValues: {
      name: '',
      plate: '',
      brand: '',
      model: '',
      default_hour_rate: 0,
      purchase_value: 0,
      residual_value: 0,
      useful_life_hours: 5000,
      is_active: true,
      notes: '',
      oil_change_interval_hours: null,
      oil_change_last_done_hourmeter: null,
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (existing) {
      await updateTractor.mutateAsync(values)
    } else {
      await createTractor.mutateAsync(values)
    }
    navigate(ROUTES.TRACTORS)
  })

  const isSubmitting = createTractor.isPending || updateTractor.isPending

  return { form, onSubmit, isSubmitting, isEditing: !!existing }
}
