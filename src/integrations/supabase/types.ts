export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anomaly: {
        Row: {
          comment: string | null
          delta: number | null
          id: string
          reading_id: string | null
          type: string | null
        }
        Insert: {
          comment?: string | null
          delta?: number | null
          id?: string
          reading_id?: string | null
          type?: string | null
        }
        Update: {
          comment?: string | null
          delta?: number | null
          id?: string
          reading_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "reading"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          description: string | null
          id: string
          new_value: string | null
          old_value: string | null
          record_id: string | null
          table_name: string
          ts: string
          user_email: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id?: string | null
          table_name: string
          ts?: string
          user_email: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id?: string | null
          table_name?: string
          ts?: string
          user_email?: string
        }
        Relationships: []
      }
      import_log: {
        Row: {
          file_name: string
          id: string
          rows_err: number
          rows_ok: number
          ts: string | null
          user_email: string
        }
        Insert: {
          file_name: string
          id?: string
          rows_err: number
          rows_ok: number
          ts?: string | null
          user_email: string
        }
        Update: {
          file_name?: string
          id?: string
          rows_err?: number
          rows_ok?: number
          ts?: string | null
          user_email?: string
        }
        Relationships: []
      }
      kpi_daily: {
        Row: {
          co2: number
          cost_eur: number
          day: string
          id: string
          kwh: number
          site_id: string | null
        }
        Insert: {
          co2: number
          cost_eur: number
          day: string
          id?: string
          kwh: number
          site_id?: string | null
        }
        Update: {
          co2?: number
          cost_eur?: number
          day?: string
          id?: string
          kwh?: number
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_daily_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      meter: {
        Row: {
          id: string
          site_id: string | null
          type: string
        }
        Insert: {
          id?: string
          site_id?: string | null
          type: string
        }
        Update: {
          id?: string
          site_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      reading: {
        Row: {
          id: string
          meter_id: string | null
          ts: string
          value: number
        }
        Insert: {
          id?: string
          meter_id?: string | null
          ts: string
          value: number
        }
        Update: {
          id?: string
          meter_id?: string | null
          ts?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meter"
            referencedColumns: ["id"]
          },
        ]
      }
      site: {
        Row: {
          country: string
          id: string
          name: string
        }
        Insert: {
          country: string
          id?: string
          name: string
        }
        Update: {
          country?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "Operator" | "DataManager" | "Manager" | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Operator", "DataManager", "Manager", "Admin"],
    },
  },
} as const
