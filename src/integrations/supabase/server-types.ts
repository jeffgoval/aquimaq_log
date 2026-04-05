export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          document: string | null
          phone: string | null
          email: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          document?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          document?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      machine_costs: {
        Row: {
          id: string
          tractor_id: string
          service_id: string | null
          supplier_id: string | null
          cost_date: string
          cost_type: 'fuel' | 'oil' | 'parts' | 'maintenance' | 'other'
          amount: number
          description: string | null
          supplier_name: string | null
          status: 'pending' | 'paid' | 'cancelled'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tractor_id: string
          service_id?: string | null
          supplier_id?: string | null
          cost_date: string
          cost_type: 'fuel' | 'oil' | 'parts' | 'maintenance' | 'other'
          amount: number
          description?: string | null
          supplier_name?: string | null
          status?: 'pending' | 'paid' | 'cancelled'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tractor_id?: string
          service_id?: string | null
          supplier_id?: string | null
          cost_date?: string
          cost_type?: 'fuel' | 'oil' | 'parts' | 'maintenance' | 'other'
          amount?: number
          description?: string | null
          supplier_name?: string | null
          status?: 'pending' | 'paid' | 'cancelled'
          due_date?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'machine_costs_tractor_id_fkey'; columns: ['tractor_id']; referencedRelation: 'tractors'; referencedColumns: ['id'] },
          { foreignKeyName: 'machine_costs_service_id_fkey'; columns: ['service_id']; referencedRelation: 'services'; referencedColumns: ['id'] },
          { foreignKeyName: 'machine_costs_supplier_id_fkey'; columns: ['supplier_id']; referencedRelation: 'suppliers'; referencedColumns: ['id'] },
        ]
      }
      operator_ledger: {
        Row: {
          id: string
          operator_id: string
          service_id: string | null
          entry_type: 'advance' | 'payment' | 'credit'
          amount: number
          entry_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          operator_id: string
          service_id?: string | null
          entry_type: 'advance' | 'payment' | 'credit'
          amount: number
          entry_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          operator_id?: string
          service_id?: string | null
          entry_type?: 'advance' | 'payment' | 'credit'
          amount?: number
          entry_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'operator_ledger_operator_id_fkey'; columns: ['operator_id']; referencedRelation: 'operators'; referencedColumns: ['id'] },
          { foreignKeyName: 'operator_ledger_service_id_fkey'; columns: ['service_id']; referencedRelation: 'services'; referencedColumns: ['id'] },
        ]
      }
      operators: {
        Row: {
          id: string
          name: string
          phone: string | null
          document: string | null
          default_hour_rate: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          document?: string | null
          default_hour_rate?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          document?: string | null
          default_hour_rate?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      receivable_payments: {
        Row: {
          id: string
          receivable_id: string
          amount: number
          payment_date: string
          payment_method: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receivable_id: string
          amount: number
          payment_date: string
          payment_method?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receivable_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'receivable_payments_receivable_id_fkey'; columns: ['receivable_id']; referencedRelation: 'receivables'; referencedColumns: ['id'] },
        ]
      }
      receivables: {
        Row: {
          id: string
          service_id: string | null
          client_id: string
          installment_number: number
          installment_count: number
          original_amount: number
          fee_percent: number
          final_amount: number
          paid_amount: number
          due_date: string
          status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id?: string | null
          client_id: string
          installment_number?: number
          installment_count?: number
          original_amount: number
          fee_percent?: number
          final_amount: number
          paid_amount?: number
          due_date: string
          status?: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string | null
          client_id?: string
          installment_number?: number
          installment_count?: number
          original_amount?: number
          fee_percent?: number
          final_amount?: number
          paid_amount?: number
          due_date?: string
          status?: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'receivables_service_id_fkey'; columns: ['service_id']; referencedRelation: 'services'; referencedColumns: ['id'] },
          { foreignKeyName: 'receivables_client_id_fkey'; columns: ['client_id']; referencedRelation: 'clients'; referencedColumns: ['id'] },
        ]
      }
      service_worklogs: {
        Row: {
          id: string
          service_id: string
          tractor_id: string
          operator_id: string | null
          work_date: string
          start_hourmeter: number
          end_hourmeter: number
          worked_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          tractor_id: string
          operator_id?: string | null
          work_date: string
          start_hourmeter: number
          end_hourmeter: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          tractor_id?: string
          operator_id?: string | null
          work_date?: string
          start_hourmeter?: number
          end_hourmeter?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'service_worklogs_service_id_fkey'; columns: ['service_id']; referencedRelation: 'services'; referencedColumns: ['id'] },
          { foreignKeyName: 'service_worklogs_tractor_id_fkey'; columns: ['tractor_id']; referencedRelation: 'tractors'; referencedColumns: ['id'] },
          { foreignKeyName: 'service_worklogs_operator_id_fkey'; columns: ['operator_id']; referencedRelation: 'operators'; referencedColumns: ['id'] },
        ]
      }
      services: {
        Row: {
          id: string
          client_id: string
          tractor_id: string
          primary_operator_id: string | null
          service_date: string
          contracted_hour_rate: number
          owner_discount_amount: number
          expected_hours: number | null
          status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
          operator_payment_status: 'pending' | 'paid'
          operator_payment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          tractor_id: string
          primary_operator_id?: string | null
          service_date: string
          contracted_hour_rate?: number
          owner_discount_amount?: number
          expected_hours?: number | null
          status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
          operator_payment_status?: 'pending' | 'paid'
          operator_payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          tractor_id?: string
          primary_operator_id?: string | null
          service_date?: string
          contracted_hour_rate?: number
          owner_discount_amount?: number
          expected_hours?: number | null
          status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
          operator_payment_status?: 'pending' | 'paid'
          operator_payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'services_client_id_fkey'; columns: ['client_id']; referencedRelation: 'clients'; referencedColumns: ['id'] },
          { foreignKeyName: 'services_tractor_id_fkey'; columns: ['tractor_id']; referencedRelation: 'tractors'; referencedColumns: ['id'] },
          { foreignKeyName: 'services_primary_operator_id_fkey'; columns: ['primary_operator_id']; referencedRelation: 'operators'; referencedColumns: ['id'] },
        ]
      }
      suppliers: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          cnpj: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          cnpj?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          cnpj?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tractors: {
        Row: {
          id: string
          name: string
          plate: string | null
          brand: string | null
          model: string | null
          purchase_value: number
          residual_value: number
          useful_life_hours: number
          standard_hour_cost: number | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plate?: string | null
          brand?: string | null
          model?: string | null
          purchase_value?: number
          residual_value?: number
          useful_life_hours?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plate?: string | null
          brand?: string | null
          model?: string | null
          purchase_value?: number
          residual_value?: number
          useful_life_hours?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_operator_financial_balance: {
        Row: {
          operator_id: string | null
          operator_name: string | null
          total_hours_worked: number | null
          total_earned: number | null
          total_advances: number | null
          total_payments: number | null
          current_balance: number | null
        }
        Relationships: []
      }
      v_tractor_profitability: {
        Row: {
          tractor_id: string | null
          tractor_name: string | null
          purchase_value: number | null
          residual_value: number | null
          useful_life_hours: number | null
          total_hours: number | null
          depreciation_cost: number | null
          operational_cost: number | null
          operator_cost: number | null
          gross_revenue: number | null
          revenue_per_hour: number | null
          cost_per_hour: number | null
          net_margin: number | null
        }
        Relationships: []
      }
      v_client_revenue: {
        Row: {
          client_id: string | null
          client_name: string | null
          service_count: number | null
          total_billed: number | null
          total_received: number | null
          total_pending: number | null
          total_overdue: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
