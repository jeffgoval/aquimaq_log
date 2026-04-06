import type { Database } from './server-types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Typed join result types used by repositories
export type ServiceReceivableSummary = Pick<
  Tables<'receivables'>,
  'id' | 'status' | 'final_amount' | 'paid_amount'
>

export type ServiceWithJoins = Tables<'services'> & {
  clients: { name: string } | null
  tractors: { name: string; standard_hour_cost: number | null } | null
  trucks: { name: string } | null
  /** Parcelas a receber (PostgREST embutido na listagem). */
  receivables?: ServiceReceivableSummary[] | null
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
  trucks: { name: string } | null
  services: { service_date: string } | null
  suppliers: { name: string; cnpj: string | null } | null
}

export type ClientRevenueRow = Views<'v_client_revenue'>

/** Linha de `fn_truck_profitability_range` (alinhada ao retorno da RPC). */
export type TruckProfitabilityRow = {
  truck_id: string
  truck_name: string
  purchase_value: number
  residual_value: number
  useful_life_km: number
  fuel_cost_per_km: number
  total_km: number
  depreciation_cost: number
  operational_cost: number
  operator_cost: number
  gross_revenue: number
  revenue_per_km: number
  cost_per_km: number
  net_margin: number
}
