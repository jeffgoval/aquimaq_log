import { supabase } from '@/integrations/supabase/client'
import type { Database } from './server-types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Typed join result types used by repositories
export type ServiceWithJoins = Tables<'services'> & {
  clients: { name: string } | null
  tractors: { name: string; standard_hour_cost: number | null } | null
}

export type WorklogWithOperator = Tables<'service_worklogs'> & {
  operators: { name: string; default_hour_rate: number } | null
}

export type ReceivableWithClient = Tables<'receivables'> & {
  clients: { name: string } | null
  services: { service_date: string } | null
}

export type MachineCostWithTractor = Tables<'machine_costs'> & {
  tractors: { name: string } | null
  services: { service_date: string } | null
  suppliers: { name: string; cnpj: string | null } | null
}
