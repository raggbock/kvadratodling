// Generated from the live Supabase schema via `supabase gen types typescript`.
// Regenerate after schema changes — do not edit by hand.

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
      beds: {
        Row: {
          cols: number
          created_at: string
          garden_id: string
          id: string
          length_cm: number | null
          name: string
          notes: string | null
          rows: number
          updated_at: string
          width_cm: number | null
        }
        Insert: {
          cols: number
          created_at?: string
          garden_id: string
          id?: string
          length_cm?: number | null
          name: string
          notes?: string | null
          rows: number
          updated_at?: string
          width_cm?: number | null
        }
        Update: {
          cols?: number
          created_at?: string
          garden_id?: string
          id?: string
          length_cm?: number | null
          name?: string
          notes?: string | null
          rows?: number
          updated_at?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beds_garden_id_fkey"
            columns: ["garden_id"]
            isOneToOne: false
            referencedRelation: "gardens"
            referencedColumns: ["id"]
          },
        ]
      }
      gardens: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_frost_date: string | null
          length_cm: number | null
          location: string | null
          name: string
          updated_at: string
          user_id: string
          width_cm: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_frost_date?: string | null
          length_cm?: number | null
          location?: string | null
          name: string
          updated_at?: string
          user_id: string
          width_cm?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_frost_date?: string | null
          length_cm?: number | null
          location?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gardens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_compatibility: {
        Row: {
          id: string
          notes: string | null
          other_plant_id: string
          plant_id: string
          relationship: Database["public"]["Enums"]["compatibility_type"]
        }
        Insert: {
          id?: string
          notes?: string | null
          other_plant_id: string
          plant_id: string
          relationship: Database["public"]["Enums"]["compatibility_type"]
        }
        Update: {
          id?: string
          notes?: string | null
          other_plant_id?: string
          plant_id?: string
          relationship?: Database["public"]["Enums"]["compatibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "plant_compatibility_other_plant_id_fkey"
            columns: ["other_plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_compatibility_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      planting_slots: {
        Row: {
          bed_id: string
          col: number
          created_at: string
          id: string
          notes: string | null
          plant_id: string | null
          planted_at: string | null
          row: number
          updated_at: string
        }
        Insert: {
          bed_id: string
          col: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id?: string | null
          planted_at?: string | null
          row: number
          updated_at?: string
        }
        Update: {
          bed_id?: string
          col?: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id?: string | null
          planted_at?: string | null
          row?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planting_slots_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planting_slots_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          common_name: string
          created_at: string
          days_to_maturity_max: number | null
          days_to_maturity_min: number | null
          direct_sow_days_before_frost: number | null
          emoji: string
          family: string | null
          frost_tolerant: boolean
          id: string
          image_url: string | null
          is_active: boolean
          notes: string | null
          plants_per_sqft: number
          scientific_name: string | null
          slug: string
          sow_indoors_days_before_frost: number | null
          sun_requirement: Database["public"]["Enums"]["sun_requirement"]
          transplant_days_after_frost: number | null
          water_need: Database["public"]["Enums"]["water_need"]
        }
        Insert: {
          common_name: string
          created_at?: string
          days_to_maturity_max?: number | null
          days_to_maturity_min?: number | null
          direct_sow_days_before_frost?: number | null
          emoji?: string
          family?: string | null
          frost_tolerant?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
          plants_per_sqft: number
          scientific_name?: string | null
          slug: string
          sow_indoors_days_before_frost?: number | null
          sun_requirement: Database["public"]["Enums"]["sun_requirement"]
          transplant_days_after_frost?: number | null
          water_need: Database["public"]["Enums"]["water_need"]
        }
        Update: {
          common_name?: string
          created_at?: string
          days_to_maturity_max?: number | null
          days_to_maturity_min?: number | null
          direct_sow_days_before_frost?: number | null
          emoji?: string
          family?: string | null
          frost_tolerant?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
          plants_per_sqft?: number
          scientific_name?: string | null
          slug?: string
          sow_indoors_days_before_frost?: number | null
          sun_requirement?: Database["public"]["Enums"]["sun_requirement"]
          transplant_days_after_frost?: number | null
          water_need?: Database["public"]["Enums"]["water_need"]
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      compatibility_type: "companion" | "antagonist"
      sun_requirement: "full_sun" | "part_shade" | "full_shade"
      water_need: "low" | "medium" | "high"
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
    Enums: {
      compatibility_type: ["companion", "antagonist"],
      sun_requirement: ["full_sun", "part_shade", "full_shade"],
      water_need: ["low", "medium", "high"],
    },
  },
} as const
