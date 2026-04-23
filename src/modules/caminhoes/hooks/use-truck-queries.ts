import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as repo from '../services/truck.repository'
import { toast } from 'sonner'
import { parseSupabaseError } from '@/shared/lib/errors'
import type { TruckRow } from '../types/truck.types'

export const TRUCK_KEYS = {
  all: ['trucks'] as const,
  lists: () => [...TRUCK_KEYS.all, 'list'] as const,
  detail: (id: string) => [...TRUCK_KEYS.all, 'detail', id] as const,
}

export const useTrucks = () => useQuery({ queryKey: TRUCK_KEYS.lists(), queryFn: repo.fetchTrucks })
export const useTruck = (id: string) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: TRUCK_KEYS.detail(id),
    queryFn: () => repo.fetchTruckById(id),
    enabled: !!id,
    initialData: () => qc.getQueryData<TruckRow[]>(TRUCK_KEYS.lists())?.find((t) => t.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(TRUCK_KEYS.lists())?.dataUpdatedAt,
  })
}

export const useCreateTruck = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: repo.createTruck,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRUCK_KEYS.lists() })
      toast.success('Guincho cadastrado com sucesso!')
    },
    onError: (err) => toast.error(parseSupabaseError(err))
  })
}

export const useUpdateTruck = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => repo.updateTruck(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRUCK_KEYS.lists() })
      qc.invalidateQueries({ queryKey: TRUCK_KEYS.detail(id) })
      toast.success('Guincho salvo com sucesso!')
    },
    onError: (err) => toast.error(parseSupabaseError(err))
  })
}

export const useDeleteTruck = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: repo.deleteTruck,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRUCK_KEYS.lists() })
      toast.success('Guincho excluído!')
    },
    onError: (err) => toast.error(parseSupabaseError(err))
  })
}
