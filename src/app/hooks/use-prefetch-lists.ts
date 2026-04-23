import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/integrations/supabase/query-keys'
import { operatorRepository } from '@/modules/operadores/services/operator.repository'
import { clientRepository } from '@/modules/clientes/services/client.repository'
import { supplierRepository } from '@/modules/fornecedores/services/supplier.repository'
import { tractorRepository } from '@/modules/tratores/services/tractor.repository'
import { serviceRepository } from '@/modules/servicos/services/service.repository'
import { fetchTrucks } from '@/modules/caminhoes/services/truck.repository'
import { TRUCK_KEYS } from '@/modules/caminhoes/hooks/use-truck-queries'

const STALE = 1000 * 60 * 5

/**
 * Dispara prefetch de todas as listas principais em background quando o layout
 * autenticado monta. Se o cache já estiver fresco (< 5 min) não faz request.
 */
export function usePrefetchLists() {
  const qc = useQueryClient()
  useEffect(() => {
    void qc.prefetchQuery({ queryKey: queryKeys.operators, queryFn: operatorRepository.list, staleTime: STALE })
    void qc.prefetchQuery({ queryKey: queryKeys.clients, queryFn: clientRepository.list, staleTime: STALE })
    void qc.prefetchQuery({ queryKey: queryKeys.suppliers, queryFn: supplierRepository.list, staleTime: STALE })
    void qc.prefetchQuery({ queryKey: queryKeys.tractors, queryFn: tractorRepository.list, staleTime: STALE })
    void qc.prefetchQuery({ queryKey: queryKeys.services, queryFn: serviceRepository.list, staleTime: STALE })
    void qc.prefetchQuery({ queryKey: TRUCK_KEYS.lists(), queryFn: fetchTrucks, staleTime: STALE })
  }, [qc])
}
