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
      agent_config: {
        Row: {
          active_flows: Json | null
          ai_phone_number: string | null
          client_id: string | null
          custom_script: string | null
          deployed_at: string | null
          id: string
          is_active: boolean | null
          language: string | null
          last_updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          active_flows?: Json | null
          ai_phone_number?: string | null
          client_id?: string | null
          custom_script?: string | null
          deployed_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          active_flows?: Json | null
          ai_phone_number?: string | null
          client_id?: string | null
          custom_script?: string | null
          deployed_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_config_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_config_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          amount_egp: number
          client_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount_egp: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_type?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount_egp?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          business_name: string
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          language: string | null
          notes: string | null
          owner_name: string
          phone: string | null
          tier: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          business_name: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          notes?: string | null
          owner_name: string
          phone?: string | null
          tier?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          business_name?: string
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          notes?: string | null
          owner_name?: string
          phone?: string | null
          tier?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      pipeline: {
        Row: {
          churn_reason: string | null
          churned_at: string | null
          client_id: string | null
          contract_signed_at: string | null
          created_at: string | null
          demo_booked_at: string | null
          id: string
          onboarding_started_at: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          went_live_at: string | null
        }
        Insert: {
          churn_reason?: string | null
          churned_at?: string | null
          client_id?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          demo_booked_at?: string | null
          id?: string
          onboarding_started_at?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          went_live_at?: string | null
        }
        Update: {
          churn_reason?: string | null
          churned_at?: string | null
          client_id?: string | null
          contract_signed_at?: string | null
          created_at?: string | null
          demo_booked_at?: string | null
          id?: string
          onboarding_started_at?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          went_live_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_access: {
        Row: {
          can_view_billing: boolean | null
          created_at: string | null
          email: string
          id: string
          last_active: string | null
          name: string
          role: string | null
        }
        Insert: {
          can_view_billing?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          last_active?: string | null
          name: string
          role?: string | null
        }
        Update: {
          can_view_billing?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          last_active?: string | null
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          business_name: string | null
          city: string | null
          client_id: string | null
          created_at: string
          full_name: string | null
          id: string
          industry: string | null
          onboarded: boolean
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          industry?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_profile_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_profile_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_overview: {
        Row: {
          business_name: string | null
          city: string | null
          id: string | null
          industry: string | null
          owner_name: string | null
          phone: string | null
          pipeline_status: string | null
          tier: string | null
          total_invoices: number | null
          total_overdue_egp: number | null
          total_paid_egp: number | null
          total_pending_egp: number | null
          went_live_at: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
      overdue_alerts: {
        Row: {
          amount_egp: number | null
          business_name: string | null
          days_overdue: number | null
          due_date: string | null
          invoice_number: string | null
          owner_name: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
      revenue_by_tier: {
        Row: {
          client_count: number | null
          collected_egp: number | null
          tier: string | null
          total_billed_egp: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_billing: { Args: never; Returns: boolean }
      current_client_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_team_member: { Args: never; Returns: boolean }
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
