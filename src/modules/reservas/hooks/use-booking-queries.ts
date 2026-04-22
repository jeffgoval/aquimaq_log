import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { isLogResourcePricingUnavailable, parseSupabaseError } from '@/shared/lib/errors'
import type { TablesInsert } from '@/integrations/supabase/server-types'

export const queryKeys = {
  bookings: ['log_bookings'] as const,
  resources: ['log_resources'] as const,
  services: ['log_services'] as const,
  profiles: ['profiles'] as const,
}

export function useBookings(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.bookings, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('log_bookings')
        .select(`
          *,
          client:clients(name),
          resource:log_resources(name, type, status)
        `)
        .gte('end_date', startDate)
        .lte('start_date', endDate)
        .is('deleted_at', null)

      if (error) throw error
      return data
    },
  })
}

export function useResources() {
  return useQuery({
    queryKey: queryKeys.resources,
    queryFn: async () => {
      const { data: resources, error: resourcesError } = await supabase
        .from('log_resources')
        .select('*')
        .is('deleted_at', null)
        .order('name')

      if (resourcesError) throw resourcesError
      if (!resources?.length) return []

      const ids = resources.map((r) => r.id)
      const { data: pricingRows, error: pricingError } = await supabase
        .from('log_resource_pricing')
        .select('resource_id, pricing_mode, rate, is_active, deleted_at')
        .in('resource_id', ids)

      if (pricingError) {
        if (isLogResourcePricingUnavailable(pricingError)) {
          if (import.meta.env.DEV) {
            console.warn('[log_resource_pricing]', pricingError.message)
          }
          return resources.map((r) => ({ ...r, pricing: [] as NonNullable<typeof pricingRows> }))
        }
        throw pricingError
      }

      const byResource = new Map<string, NonNullable<typeof pricingRows>>()
      for (const row of pricingRows ?? []) {
        const list = byResource.get(row.resource_id) ?? []
        list.push(row)
        byResource.set(row.resource_id, list)
      }

      return resources.map((r) => ({
        ...r,
        pricing: byResource.get(r.id) ?? [],
      }))
    },
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TablesInsert<'log_bookings'>) => {
      const { data, error } = await supabase
        .from('log_bookings')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings })
      toast.success('Reserva criada com sucesso!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useConvertBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, operatorId }: { bookingId: string, operatorId?: string | null }) => {
      const { data, error } = await supabase.rpc('log_convert_booking_to_service', {
        p_booking_id: bookingId,
        p_operator_id: operatorId ?? null
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings })
      qc.invalidateQueries({ queryKey: queryKeys.services })
      toast.success('Retirada iniciada com sucesso!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useStartOperation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { data, error } = await supabase
        .from('log_services')
        .update({ status: 'in_progress', in_progress_at: new Date().toISOString() })
        .eq('id', serviceId)
        .eq('status', 'open')
        .is('deleted_at', null)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.services })
      toast.success('Operação iniciada!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function useCloseService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ serviceId, isCancel }: { serviceId: string, isCancel: boolean }) => {
      const { error } = await supabase.rpc('log_close_service', {
        p_service_id: serviceId,
        p_is_cancel: isCancel
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.services })
      qc.invalidateQueries({ queryKey: queryKeys.bookings })
      toast.success(variables.isCancel ? 'Serviço cancelado com pro rata.' : 'Serviço encerrado com sucesso!')
    },
    onError: (e: Error) => toast.error(parseSupabaseError(e)),
  })
}

export function usePendingBookings() {
  return useQuery({
    queryKey: [...queryKeys.bookings, 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('log_bookings')
        .select(`
          *,
          client:clients(name),
          resource:log_resources(name, type)
        `)
        .eq('status', 'pending')
        .is('deleted_at', null)
        .order('start_date', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('log_services')
        .select(`
          *,
          booking:log_bookings(client:clients(name)),
          resource:log_resources(name, type),
          operator:profiles!log_services_operator_id_fkey(name)
        `)
        .in('status', ['open', 'in_progress'])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useRecentFinishedServices() {
  return useQuery({
    queryKey: [...queryKeys.services, 'recent-finished'],
    queryFn: async () => {
      const startOfDayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

      const { data, error } = await supabase
        .from('log_services')
        .select(`
          *,
          booking:log_bookings(client:clients(name)),
          resource:log_resources(name, type),
          operator:profiles!log_services_operator_id_fkey(name)
        `)
        .in('status', ['closed', 'cancelled'])
        .is('deleted_at', null)
        .gte('ended_at', startOfDayIso)
        .order('ended_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
  })
}

export function useProfiles() {
  return useQuery({
    queryKey: queryKeys.profiles,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('name')
      if (error) throw error
      return data
    },
  })
}
