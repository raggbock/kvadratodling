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
      digest_runs: {
        Row: {
          error_message: string | null
          garden_count: number
          id: string
          resend_id: string | null
          sent_at: string
          status: string
          task_count: number
          user_id: string
          week_start: string
        }
        Insert: {
          error_message?: string | null
          garden_count?: number
          id?: string
          resend_id?: string | null
          sent_at?: string
          status: string
          task_count?: number
          user_id: string
          week_start: string
        }
        Update: {
          error_message?: string | null
          garden_count?: number
          id?: string
          resend_id?: string | null
          sent_at?: string
          status?: string
          task_count?: number
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          description: string | null
          direct_sow_days_before_frost: number | null
          diseases: string[] | null
          emoji: string
          english_name: string | null
          family: string | null
          frost_tolerant: boolean
          id: string
          image_url: string | null
          is_active: boolean
          notes: string | null
          pests: string[] | null
          plants_per_sqft: number
          scientific_name: string | null
          slug: string
          sow_indoors_days_before_frost: number | null
          sun_requirement: Database["public"]["Enums"]["sun_requirement"]
          tags: string[] | null
          tips: string | null
          transplant_days_after_frost: number | null
          water_need: Database["public"]["Enums"]["water_need"]
          zones_max: string | null
          zones_min: string | null
          zones_note: string | null
        }
        Insert: {
          common_name: string
          created_at?: string
          days_to_maturity_max?: number | null
          days_to_maturity_min?: number | null
          description?: string | null
          direct_sow_days_before_frost?: number | null
          diseases?: string[] | null
          emoji?: string
          english_name?: string | null
          family?: string | null
          frost_tolerant?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
          pests?: string[] | null
          plants_per_sqft: number
          scientific_name?: string | null
          slug: string
          sow_indoors_days_before_frost?: number | null
          sun_requirement: Database["public"]["Enums"]["sun_requirement"]
          tags?: string[] | null
          tips?: string | null
          transplant_days_after_frost?: number | null
          water_need: Database["public"]["Enums"]["water_need"]
          zones_max?: string | null
          zones_min?: string | null
          zones_note?: string | null
        }
        Update: {
          common_name?: string
          created_at?: string
          days_to_maturity_max?: number | null
          days_to_maturity_min?: number | null
          description?: string | null
          direct_sow_days_before_frost?: number | null
          diseases?: string[] | null
          emoji?: string
          english_name?: string | null
          family?: string | null
          frost_tolerant?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
          pests?: string[] | null
          plants_per_sqft?: number
          scientific_name?: string | null
          slug?: string
          sow_indoors_days_before_frost?: number | null
          sun_requirement?: Database["public"]["Enums"]["sun_requirement"]
          tags?: string[] | null
          tips?: string | null
          transplant_days_after_frost?: number | null
          water_need?: Database["public"]["Enums"]["water_need"]
          zones_max?: string | null
          zones_min?: string | null
          zones_note?: string | null
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
          weekly_digest_enabled: boolean
          weekly_digest_last_sent_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
          weekly_digest_enabled?: boolean
          weekly_digest_last_sent_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
          weekly_digest_enabled?: boolean
          weekly_digest_last_sent_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      trigger_weekly_digest: { Args: never; Returns: number }
    }
    Enums: {
      compatibility_type: "companion" | "antagonist"
      sun_requirement: "full_sun" | "part_shade" | "full_shade"
      water_need: "low" | "medium" | "high"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]
