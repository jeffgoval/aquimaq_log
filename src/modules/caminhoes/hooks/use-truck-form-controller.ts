import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { truckSchema, type TruckFormValues } from '../schemas/truck.schema'
import type { TruckRow } from '../types/truck.types'

export const useTruckFormController = (truck?: TruckRow) => {
  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      name: '',
      plate: '',
      brand: '',
      model: '',
      purchase_value: 0,
      residual_value: 0,
      current_odometer: 0,
      useful_life_km: 500000,
      fuel_cost_per_km: 0,
      is_active: true,
      notes: '',
    }
  })

  useEffect(() => {
    if (truck) {
      form.reset({
        name: truck.name,
        plate: truck.plate || '',
        brand: truck.brand || '',
        model: truck.model || '',
        purchase_value: truck.purchase_value,
        residual_value: truck.residual_value,
        current_odometer: truck.current_odometer,
        useful_life_km: truck.useful_life_km ?? 500000,
        fuel_cost_per_km: truck.fuel_cost_per_km ?? 0,
        is_active: truck.is_active,
        notes: truck.notes || '',
      })
    }
  }, [truck, form.reset])

  return form
}
