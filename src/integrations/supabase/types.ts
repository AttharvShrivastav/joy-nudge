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
      focus_sessions: {
        Row: {
          break_duration_minutes: number
          completed_at: string | null
          created_at: string | null
          duration_minutes: number
          id: string
          session_type: string | null
          user_id: string
        }
        Insert: {
          break_duration_minutes: number
          completed_at?: string | null
          created_at?: string | null
          duration_minutes: number
          id?: string
          session_type?: string | null
          user_id: string
        }
        Update: {
          break_duration_minutes?: number
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          session_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nudge_completions: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          id: string
          mood_at_completion: string | null
          user_id: string
          user_nudge_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          mood_at_completion?: string | null
          user_id: string
          user_nudge_id: string
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          mood_at_completion?: string | null
          user_id?: string
          user_nudge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nudge_completions_user_nudge_id_fkey"
            columns: ["user_nudge_id"]
            isOneToOne: false
            referencedRelation: "user_nudges"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          interactive_type:
            | Database["public"]["Enums"]["interactive_type"]
            | null
          is_ai_generated: boolean | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          interactive_type?:
            | Database["public"]["Enums"]["interactive_type"]
            | null
          is_ai_generated?: boolean | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          interactive_type?:
            | Database["public"]["Enums"]["interactive_type"]
            | null
          is_ai_generated?: boolean | null
          title?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          completion_id: string | null
          content: string
          created_at: string | null
          emotion_tags: string[] | null
          id: string
          user_id: string
        }
        Insert: {
          completion_id?: string | null
          content: string
          created_at?: string | null
          emotion_tags?: string[] | null
          id?: string
          user_id: string
        }
        Update: {
          completion_id?: string | null
          content?: string
          created_at?: string | null
          emotion_tags?: string[] | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "nudge_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status_type"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date?: string | null
          status: Database["public"]["Enums"]["subscription_status_type"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status_type"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_device_tokens: {
        Row: {
          created_at: string | null
          device_token: string
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_token: string
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_token?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nudges: {
        Row: {
          created_at: string | null
          custom_description: string | null
          custom_title: string | null
          id: string
          is_active: boolean | null
          last_completed_at: string | null
          nudge_id: string | null
          schedule_frequency: Database["public"]["Enums"]["schedule_frequency"]
          scheduled_times: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          nudge_id?: string | null
          schedule_frequency: Database["public"]["Enums"]["schedule_frequency"]
          scheduled_times: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          nudge_id?: string | null
          schedule_frequency?: Database["public"]["Enums"]["schedule_frequency"]
          scheduled_times?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nudges_nudge_id_fkey"
            columns: ["nudge_id"]
            isOneToOne: false
            referencedRelation: "nudges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_nudges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_streak_days: number | null
          email: string
          id: string
          last_active_at: string | null
          last_streak_update_date: string | null
          longest_streak_days: number | null
          selected_avatar_url: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tutorial_seen: boolean | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak_days?: number | null
          email: string
          id: string
          last_active_at?: string | null
          last_streak_update_date?: string | null
          longest_streak_days?: number | null
          selected_avatar_url?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tutorial_seen?: boolean | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak_days?: number | null
          email?: string
          id?: string
          last_active_at?: string | null
          last_streak_update_date?: string | null
          longest_streak_days?: number | null
          selected_avatar_url?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tutorial_seen?: boolean | null
          username?: string | null
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
      interactive_type:
        | "BREATHING"
        | "TIMED"
        | "OBSERVATIONAL"
        | "REFLECTIVE"
        | "NONE"
      plan_type: "PREMIUM_MONTHLY" | "PREMIUM_ANNUAL"
      platform_type: "IOS" | "ANDROID"
      schedule_frequency: "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM"
      subscription_status: "FREE" | "PREMIUM"
      subscription_status_type: "ACTIVE" | "CANCELLED" | "PAST_DUE"
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
      interactive_type: [
        "BREATHING",
        "TIMED",
        "OBSERVATIONAL",
        "REFLECTIVE",
        "NONE",
      ],
      plan_type: ["PREMIUM_MONTHLY", "PREMIUM_ANNUAL"],
      platform_type: ["IOS", "ANDROID"],
      schedule_frequency: ["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"],
      subscription_status: ["FREE", "PREMIUM"],
      subscription_status_type: ["ACTIVE", "CANCELLED", "PAST_DUE"],
    },
  },
} as const
