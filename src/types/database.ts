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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          channel: string | null
          client_id: string
          firm_id: string
          id: string
          message_id: string | null
          metadata: Json | null
          performed_by: string | null
          task_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          channel?: string | null
          client_id: string
          firm_id: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          channel?: string | null
          client_id?: string
          firm_id?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "compliance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      client_magic_links: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          firm_id: string
          id: string
          task_id: string | null
          token: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at: string
          firm_id: string
          id?: string
          task_id?: string | null
          token: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          firm_id?: string
          id?: string
          task_id?: string | null
          token?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_magic_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_magic_links_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          cin: string | null
          compliance_types: string[]
          contact_name: string | null
          created_at: string
          email: string | null
          firm_id: string
          gstin: string | null
          id: string
          name: string
          pan: string | null
          phone: string | null
          preferred_language: string
          status: string
        }
        Insert: {
          cin?: string | null
          compliance_types?: string[]
          contact_name?: string | null
          created_at?: string
          email?: string | null
          firm_id: string
          gstin?: string | null
          id?: string
          name: string
          pan?: string | null
          phone?: string | null
          preferred_language?: string
          status?: string
        }
        Update: {
          cin?: string | null
          compliance_types?: string[]
          contact_name?: string | null
          created_at?: string
          email?: string | null
          firm_id?: string
          gstin?: string | null
          id?: string
          name?: string
          pan?: string | null
          phone?: string | null
          preferred_language?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_calendar: {
        Row: {
          compliance_type: string
          frequency: string
          id: string
          is_extended: boolean
          source_notification: string | null
          standard_due_date: string
          updated_at: string
          updated_due_date: string | null
        }
        Insert: {
          compliance_type: string
          frequency: string
          id?: string
          is_extended?: boolean
          source_notification?: string | null
          standard_due_date: string
          updated_at?: string
          updated_due_date?: string | null
        }
        Update: {
          compliance_type?: string
          frequency?: string
          id?: string
          is_extended?: boolean
          source_notification?: string | null
          standard_due_date?: string
          updated_at?: string
          updated_due_date?: string | null
        }
        Relationships: []
      }
      compliance_tasks: {
        Row: {
          assigned_to: string | null
          client_id: string
          compliance_type: string
          created_at: string
          due_date: string
          firm_id: string
          id: string
          notes: string | null
          period: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          compliance_type: string
          created_at?: string
          due_date: string
          firm_id: string
          id?: string
          notes?: string | null
          period: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          compliance_type?: string
          created_at?: string
          due_date?: string
          firm_id?: string
          id?: string
          notes?: string | null
          period?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_executions: {
        Row: {
          completed_at: string | null
          execution_date: string
          id: string
          started_at: string
          status: string
          summary: Json | null
        }
        Insert: {
          completed_at?: string | null
          execution_date: string
          id?: string
          started_at?: string
          status?: string
          summary?: Json | null
        }
        Update: {
          completed_at?: string | null
          execution_date?: string
          id?: string
          started_at?: string
          status?: string
          summary?: Json | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string
          file_name: string
          file_path: string
          file_size: number | null
          firm_id: string
          id: string
          task_id: string
          uploaded_at: string
          uploaded_by_client: boolean
        }
        Insert: {
          client_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          firm_id: string
          id?: string
          task_id: string
          uploaded_at?: string
          uploaded_by_client?: boolean
        }
        Update: {
          client_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          firm_id?: string
          id?: string
          task_id?: string
          uploaded_at?: string
          uploaded_by_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "compliance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          client_limit: number
          created_at: string
          email: string
          id: string
          name: string
          partner_name: string | null
          phone: string | null
          plan: string
        }
        Insert: {
          client_limit?: number
          created_at?: string
          email: string
          id?: string
          name: string
          partner_name?: string | null
          phone?: string | null
          plan?: string
        }
        Update: {
          client_limit?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          partner_name?: string | null
          phone?: string | null
          plan?: string
        }
        Relationships: []
      }
      reminder_rules: {
        Row: {
          cadence: string
          channels: string[]
          created_at: string
          enabled: boolean
          firm_id: string
          id: string
          offset_days: number
          updated_at: string
        }
        Insert: {
          cadence: string
          channels?: string[]
          created_at?: string
          enabled?: boolean
          firm_id: string
          id?: string
          offset_days: number
          updated_at?: string
        }
        Update: {
          cadence?: string
          channels?: string[]
          created_at?: string
          enabled?: boolean
          firm_id?: string
          id?: string
          offset_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_rules_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_jobs: {
        Row: {
          id: string
          firm_id: string
          client_id: string
          task_id: string
          cadence: string
          channel: string
          status: string
          scheduled_for: string
          attempts: number
          last_error: string | null
          provider_message_id: string | null
          created_at: string
          updated_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          firm_id: string
          client_id: string
          task_id: string
          cadence: string
          channel?: string
          status?: string
          scheduled_for: string
          attempts?: number
          last_error?: string | null
          provider_message_id?: string | null
          created_at?: string
          updated_at?: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          firm_id?: string
          client_id?: string
          task_id?: string
          cadence?: string
          channel?: string
          status?: string
          scheduled_for?: string
          attempts?: number
          last_error?: string | null
          provider_message_id?: string | null
          created_at?: string
          updated_at?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_jobs_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "compliance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_templates: {
        Row: {
          body: string
          cadence: string
          channel: string
          created_at: string
          firm_id: string | null
          id: string
          language: string
          subject: string | null
        }
        Insert: {
          body: string
          cadence: string
          channel: string
          created_at?: string
          firm_id?: string | null
          id?: string
          language?: string
          subject?: string | null
        }
        Update: {
          body?: string
          cadence?: string
          channel?: string
          created_at?: string
          firm_id?: string | null
          id?: string
          language?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_templates_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          firm_id: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          firm_id?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          firm_id?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_firm_id: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
