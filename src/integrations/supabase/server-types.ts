export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_row: Json | null
          old_row: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_error_logs: {
        Row: {
          app_version: string | null
          component_stack: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          page_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          component_stack?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          component_stack?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      log_bookings: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_date: string
          id: string
          notes: string | null
          pricing_mode: string | null
          reopened_from_no_show_at: string | null
          resource_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          pricing_mode?: string | null
          reopened_from_no_show_at?: string | null
          resource_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          pricing_mode?: string | null
          reopened_from_no_show_at?: string | null
          resource_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_revenue"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "log_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_bookings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "log_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      log_resource_pricing: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          pricing_mode: string
          rate: number
          resource_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          pricing_mode: string
          rate: number
          resource_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          pricing_mode?: string
          rate?: number
          resource_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_resource_pricing_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_resource_pricing_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "log_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      log_resources: {
        Row: {
          billing_type: string
          brand: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          model: string | null
          name: string
          rate: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          billing_type: string
          brand?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          model?: string | null
          name: string
          rate: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          billing_type?: string
          brand?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          model?: string | null
          name?: string
          rate?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      log_services: {
        Row: {
          billing_type_snapshot: string
          booking_id: string
          client_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          ended_at: string | null
          id: string
          in_progress_at: string | null
          is_pro_rata: boolean
          notes: string | null
          operator_id: string | null
          rate_snapshot: number
          resource_id: string
          started_at: string
          status: string
          total_amount: number | null
          updated_at: string
          usage_quantity: number | null
        }
        Insert: {
          billing_type_snapshot: string
          booking_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_at?: string | null
          id?: string
          in_progress_at?: string | null
          is_pro_rata?: boolean
          notes?: string | null
          operator_id?: string | null
          rate_snapshot: number
          resource_id: string
          started_at: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          usage_quantity?: number | null
        }
        Update: {
          billing_type_snapshot?: string
          booking_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_at?: string | null
          id?: string
          in_progress_at?: string | null
          is_pro_rata?: boolean
          notes?: string | null
          operator_id?: string | null
          rate_snapshot?: number
          resource_id?: string
          started_at?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          usage_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "log_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "log_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_revenue"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "log_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_services_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_services_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "log_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_costs: {
        Row: {
          amount: number
          cost_date: string
          cost_type: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          receipt_storage_path: string | null
          resource_id: string | null
          service_id: string | null
          status: string | null
          supplier_id: string | null
          supplier_name: string | null
          tractor_id: string | null
          truck_id: string | null
        }
        Insert: {
          amount: number
          cost_date: string
          cost_type: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          receipt_storage_path?: string | null
          resource_id?: string | null
          service_id?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          tractor_id?: string | null
          truck_id?: string | null
        }
        Update: {
          amount?: number
          cost_date?: string
          cost_type?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          receipt_storage_path?: string | null
          resource_id?: string | null
          service_id?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          tractor_id?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_costs_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "log_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_costs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_costs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_costs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_costs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "v_tractor_profitability"
            referencedColumns: ["tractor_id"]
          },
          {
            foreignKeyName: "machine_costs_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_ledger: {
        Row: {
          amount: number
          commission_percent: number | null
          created_at: string
          entry_date: string
          entry_type: string
          id: string
          notes: string | null
          operator_id: string
          service_id: string | null
        }
        Insert: {
          amount: number
          commission_percent?: number | null
          created_at?: string
          entry_date: string
          entry_type: string
          id?: string
          notes?: string | null
          operator_id: string
          service_id?: string | null
        }
        Update: {
          amount?: number
          commission_percent?: number | null
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          notes?: string | null
          operator_id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_ledger_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_ledger_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "v_operator_financial_balance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "operator_ledger_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          cnh: string | null
          cnh_expiration: string | null
          created_at: string
          default_hour_rate: number
          document: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          cnh?: string | null
          cnh_expiration?: string | null
          created_at?: string
          default_hour_rate?: number
          document?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cnh?: string | null
          cnh_expiration?: string | null
          created_at?: string
          default_hour_rate?: number
          document?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          module: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      receivable_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          receivable_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          receivable_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receivable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_payments_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          due_date: string
          fee_percent: number
          final_amount: number
          id: string
          installment_count: number
          installment_number: number
          original_amount: number
          paid_amount: number
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          due_date: string
          fee_percent?: number
          final_amount: number
          id?: string
          installment_count?: number
          installment_number?: number
          original_amount: number
          paid_amount?: number
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          fee_percent?: number
          final_amount?: number
          id?: string
          installment_count?: number
          installment_number?: number
          original_amount?: number
          paid_amount?: number
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_revenue"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "receivables_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_worklogs: {
        Row: {
          created_at: string
          end_hourmeter: number | null
          end_odometer: number | null
          id: string
          notes: string | null
          operator_id: string | null
          service_id: string
          start_hourmeter: number | null
          start_odometer: number | null
          tractor_id: string | null
          truck_id: string | null
          work_date: string
          worked_hours: number | null
          worked_km: number | null
        }
        Insert: {
          created_at?: string
          end_hourmeter?: number | null
          end_odometer?: number | null
          id?: string
          notes?: string | null
          operator_id?: string | null
          service_id: string
          start_hourmeter?: number | null
          start_odometer?: number | null
          tractor_id?: string | null
          truck_id?: string | null
          work_date: string
          worked_hours?: number | null
          worked_km?: number | null
        }
        Update: {
          created_at?: string
          end_hourmeter?: number | null
          end_odometer?: number | null
          id?: string
          notes?: string | null
          operator_id?: string | null
          service_id?: string
          start_hourmeter?: number | null
          start_odometer?: number | null
          tractor_id?: string | null
          truck_id?: string | null
          work_date?: string
          worked_hours?: number | null
          worked_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_worklogs_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_worklogs_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "v_operator_financial_balance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "service_worklogs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_worklogs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_worklogs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "v_tractor_profitability"
            referencedColumns: ["tractor_id"]
          },
          {
            foreignKeyName: "service_worklogs_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          charge_type: string
          checkout_notes: string | null
          checkout_photo_path: string | null
          client_id: string
          contracted_hour_rate: number
          created_at: string
          destination_location: string | null
          expected_hours: number | null
          id: string
          notes: string | null
          operator_payment_date: string | null
          operator_payment_status: string
          origin_location: string | null
          owner_discount_amount: number
          primary_operator_id: string | null
          receipt_storage_path: string | null
          service_date: string
          status: string
          towed_vehicle_brand: string | null
          towed_vehicle_model: string | null
          towed_vehicle_plate: string | null
          tractor_id: string | null
          truck_id: string | null
          updated_at: string
        }
        Insert: {
          charge_type?: string
          checkout_notes?: string | null
          checkout_photo_path?: string | null
          client_id: string
          contracted_hour_rate?: number
          created_at?: string
          destination_location?: string | null
          expected_hours?: number | null
          id?: string
          notes?: string | null
          operator_payment_date?: string | null
          operator_payment_status?: string
          origin_location?: string | null
          owner_discount_amount?: number
          primary_operator_id?: string | null
          receipt_storage_path?: string | null
          service_date: string
          status?: string
          towed_vehicle_brand?: string | null
          towed_vehicle_model?: string | null
          towed_vehicle_plate?: string | null
          tractor_id?: string | null
          truck_id?: string | null
          updated_at?: string
        }
        Update: {
          charge_type?: string
          checkout_notes?: string | null
          checkout_photo_path?: string | null
          client_id?: string
          contracted_hour_rate?: number
          created_at?: string
          destination_location?: string | null
          expected_hours?: number | null
          id?: string
          notes?: string | null
          operator_payment_date?: string | null
          operator_payment_status?: string
          origin_location?: string | null
          owner_discount_amount?: number
          primary_operator_id?: string | null
          receipt_storage_path?: string | null
          service_date?: string
          status?: string
          towed_vehicle_brand?: string | null
          towed_vehicle_model?: string | null
          towed_vehicle_plate?: string | null
          tractor_id?: string | null
          truck_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_revenue"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "services_primary_operator_id_fkey"
            columns: ["primary_operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_primary_operator_id_fkey"
            columns: ["primary_operator_id"]
            isOneToOne: false
            referencedRelation: "v_operator_financial_balance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "services_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "v_tractor_profitability"
            referencedColumns: ["tractor_id"]
          },
          {
            foreignKeyName: "services_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tractors: {
        Row: {
          brand: string | null
          created_at: string
          default_hour_rate: number
          id: string
          is_active: boolean
          model: string | null
          name: string
          notes: string | null
          oil_change_interval_hours: number | null
          oil_change_last_done_hourmeter: number | null
          plate: string | null
          purchase_value: number
          residual_value: number
          standard_hour_cost: number | null
          updated_at: string
          useful_life_hours: number
        }
        Insert: {
          brand?: string | null
          created_at?: string
          default_hour_rate?: number
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          notes?: string | null
          oil_change_interval_hours?: number | null
          oil_change_last_done_hourmeter?: number | null
          plate?: string | null
          purchase_value?: number
          residual_value?: number
          standard_hour_cost?: number | null
          updated_at?: string
          useful_life_hours?: number
        }
        Update: {
          brand?: string | null
          created_at?: string
          default_hour_rate?: number
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          notes?: string | null
          oil_change_interval_hours?: number | null
          oil_change_last_done_hourmeter?: number | null
          plate?: string | null
          purchase_value?: number
          residual_value?: number
          standard_hour_cost?: number | null
          updated_at?: string
          useful_life_hours?: number
        }
        Relationships: []
      }
      trucks: {
        Row: {
          brand: string | null
          created_at: string
          current_odometer: number
          fuel_cost_per_km: number
          id: string
          is_active: boolean
          model: string | null
          name: string
          notes: string | null
          plate: string | null
          purchase_value: number
          residual_value: number
          updated_at: string
          useful_life_km: number
        }
        Insert: {
          brand?: string | null
          created_at?: string
          current_odometer?: number
          fuel_cost_per_km?: number
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          notes?: string | null
          plate?: string | null
          purchase_value?: number
          residual_value?: number
          updated_at?: string
          useful_life_km?: number
        }
        Update: {
          brand?: string | null
          created_at?: string
          current_odometer?: number
          fuel_cost_per_km?: number
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          notes?: string | null
          plate?: string | null
          purchase_value?: number
          residual_value?: number
          updated_at?: string
          useful_life_km?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_client_revenue: {
        Row: {
          client_id: string | null
          client_name: string | null
          service_count: number | null
          total_billed: number | null
          total_overdue: number | null
          total_pending: number | null
          total_received: number | null
        }
        Relationships: []
      }
      v_fleet_spend_by_category: {
        Row: {
          spend_diesel: number | null
          spend_maintenance: number | null
          spend_operator: number | null
        }
        Relationships: []
      }
      v_operator_financial_balance: {
        Row: {
          current_balance: number | null
          operator_id: string | null
          operator_name: string | null
          total_advances: number | null
          total_earned: number | null
          total_hours_worked: number | null
          total_payments: number | null
        }
        Relationships: []
      }
      v_tractor_latest_hourmeter: {
        Row: {
          latest_hourmeter: number | null
          tractor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_worklogs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_worklogs_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "v_tractor_profitability"
            referencedColumns: ["tractor_id"]
          },
        ]
      }
      v_tractor_profitability: {
        Row: {
          cost_per_hour: number | null
          depreciation_cost: number | null
          gross_revenue: number | null
          net_margin: number | null
          operational_cost: number | null
          operator_cost: number | null
          purchase_value: number | null
          residual_value: number | null
          revenue_per_hour: number | null
          total_hours: number | null
          tractor_id: string | null
          tractor_name: string | null
          useful_life_hours: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_client_revenue_range: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          client_id: string
          client_name: string
          service_count: number
          total_billed: number
          total_overdue: number
          total_pending: number
          total_received: number
        }[]
      }
      fn_fleet_spend_by_category_range: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          spend_diesel: number
          spend_maintenance: number
          spend_operator: number
        }[]
      }
      fn_resource_profitability_range: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          billing_type: string
          machine_cost: number
          net_margin: number
          resource_id: string
          resource_name: string
          resource_status: string
          resource_type: string
          services_count: number
          total_revenue: number
          total_usage: number
        }[]
      }
      fn_tractor_profitability_range: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          cost_per_hour: number
          depreciation_cost: number
          gross_revenue: number
          net_margin: number
          operational_cost: number
          operator_cost: number
          purchase_value: number
          residual_value: number
          revenue_per_hour: number
          total_hours: number
          tractor_id: string
          tractor_name: string
          useful_life_hours: number
        }[]
      }
      fn_truck_profitability_range: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          cost_per_km: number
          depreciation_cost: number
          fuel_cost_per_km: number
          gross_revenue: number
          net_margin: number
          operational_cost: number
          operator_cost: number
          purchase_value: number
          residual_value: number
          revenue_per_km: number
          total_km: number
          truck_id: string
          truck_name: string
          useful_life_km: number
        }[]
      }
      get_my_permissions: { Args: never; Returns: string[] }
      log_check_availability: {
        Args: {
          p_end_date: string
          p_exclude_booking_id?: string
          p_resource_id: string
          p_start_date: string
        }
        Returns: boolean
      }
      log_close_service: {
        Args: { p_is_cancel?: boolean; p_service_id: string }
        Returns: undefined
      }
      log_convert_booking_to_service: {
        Args: { p_booking_id: string; p_operator_id: string | null }
        Returns: string
      }
      log_archive_expired_pending_bookings: { Args: never; Returns: number }
      mark_overdue_receivables: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
