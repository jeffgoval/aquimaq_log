import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/server-types'
import { toast } from 'sonner'
import { isLogResourcePricingUnavailable, parseSupabaseError } from '@/shared/lib/errors'

export type ResourceRow = Tables<'log_resources'>
export type ResourcePricingRow = Tables<'log_resource_pricing'>
type ResourceInsert = TablesInsert<'log_resources'>
type ResourceUpdate = TablesUpdate<'log_resources'>
type ResourcePricingInsert = TablesInsert<'log_resource_pricing'>

export interface EquipmentPricingInput {
  hourly: number
  daily: number
  equipment_15d: number
  equipment_30d: number
}

const resourceKeys = {
  all: ['log_resources'] as const,
  detail: (id: string) => ['log_resources', id] as const,
  pricing: (id: string) => ['log_resource_pricing', id] as const,
}

const upsertResourcePricing = async ({
  resourceId,
  pricing,
}: {
  resourceId: string
  pricing: Array<Pick<ResourcePricingInsert, 'pricing_mode' | 'rate'>>
}) => {
  const { error: deleteError } = await supabase
    .from('log_resource_pricing')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('resource_id', resourceId)
    .is('deleted_at', null)

  if (deleteError) {
    if (isLogResourcePricingUnavailable(deleteError)) {
      throw new Error(
        'log_resource_pricing não existe neste projeto. Aplique as migrations: npm run db:push',
      )
    }
    throw deleteError
  }

  const payload: ResourcePricingInsert[] = pricing.map((item) => ({
    resource_id: resourceId,
    pricing_mode: item.pricing_mode,
    rate: item.rate,
    is_active: true,
  }))

  const { error: insertError } = await supabase
    .from('log_resource_pricing')
    .insert(payload)

  if (insertError) {
    if (isLogResourcePricingUnavailable(insertError)) {
      throw new Error(
        'log_resource_pricing não existe neste projeto. Aplique as migrations: npm run db:push',
      )
    }
    throw insertError
  }
}

export function useResourceList() {
  return useQuery({
    queryKey: resourceKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('log_resources')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export function useResourceById(id?: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const rid = id as string
      const { data: resource, error: resourceError } = await supabase
        .from('log_resources')
        .select('*')
        .eq('id', rid)
        .is('deleted_at', null)
        .single()

      if (resourceError) throw resourceError

      const { data: pricing, error: pricingError } = await supabase
        .from('log_resource_pricing')
        .select('*')
        .eq('resource_id', rid)
        .order('pricing_mode', { ascending: true })

      if (pricingError) {
        if (isLogResourcePricingUnavailable(pricingError)) {
          if (import.meta.env.DEV) {
            console.warn('[log_resource_pricing]', pricingError.message)
          }
          return { ...resource, pricing: [] }
        }
        throw pricingError
      }

      return { ...resource, pricing: pricing ?? [] }
    },
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      payload,
      equipmentPricing,
    }: {
      payload: ResourceInsert
      equipmentPricing?: EquipmentPricingInput
    }) => {
      const { data, error } = await supabase
        .from('log_resources')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      if (payload.type === 'equipment' && equipmentPricing) {
        await upsertResourcePricing({
          resourceId: data.id,
          pricing: [
            { pricing_mode: 'hourly', rate: equipmentPricing.hourly },
            { pricing_mode: 'daily', rate: equipmentPricing.daily },
            { pricing_mode: 'equipment_15d', rate: equipmentPricing.equipment_15d },
            { pricing_mode: 'equipment_30d', rate: equipmentPricing.equipment_30d },
          ],
        })
      } else {
        await upsertResourcePricing({
          resourceId: data.id,
          pricing: [{ pricing_mode: payload.billing_type, rate: payload.rate }],
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      toast.success('Recurso criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(parseSupabaseError(error))
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
      equipmentPricing,
    }: {
      id: string
      payload: ResourceUpdate
      equipmentPricing?: EquipmentPricingInput
    }) => {
      const { data, error } = await supabase
        .from('log_resources')
        .update(payload)
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) throw error

      if (payload.type === 'equipment' && equipmentPricing) {
        await upsertResourcePricing({
          resourceId: id,
          pricing: [
            { pricing_mode: 'hourly', rate: equipmentPricing.hourly },
            { pricing_mode: 'daily', rate: equipmentPricing.daily },
            { pricing_mode: 'equipment_15d', rate: equipmentPricing.equipment_15d },
            { pricing_mode: 'equipment_30d', rate: equipmentPricing.equipment_30d },
          ],
        })
      } else if (payload.billing_type && typeof payload.rate === 'number') {
        await upsertResourcePricing({
          resourceId: id,
          pricing: [{ pricing_mode: payload.billing_type, rate: payload.rate }],
        })
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: resourceKeys.pricing(variables.id) })
      toast.success('Recurso atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(parseSupabaseError(error))
    },
  })
}

export function useDeactivateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('log_resources')
        .update({
          status: 'inactive',
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('deleted_at', null)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      toast.success('Recurso desativado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(parseSupabaseError(error))
    },
  })
}
