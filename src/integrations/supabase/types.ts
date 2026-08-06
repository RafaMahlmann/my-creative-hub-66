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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description_en: string | null
          description_pt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          position: number
          slug: string
          title_en: string | null
          title_pt: string
          trailer_video_id: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          position?: number
          slug: string
          title_en?: string | null
          title_pt: string
          trailer_video_id?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          position?: number
          slug?: string
          title_en?: string | null
          title_pt?: string
          trailer_video_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_trailer_video_id_fkey"
            columns: ["trailer_video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_active: boolean
          source: Database["public"]["Enums"]["enrollment_source"]
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          source?: Database["public"]["Enums"]["enrollment_source"]
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          source?: Database["public"]["Enums"]["enrollment_source"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          position: number
          title_en: string | null
          title_pt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          position?: number
          title_en?: string | null
          title_pt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          position?: number
          title_en?: string | null
          title_pt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          last_seen_at: string
          lesson_id: string
          seconds_watched: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          last_seen_at?: string
          lesson_id: string
          seconds_watched?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          last_seen_at?: string
          lesson_id?: string
          seconds_watched?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_en: string | null
          content_pt: string | null
          created_at: string
          description_en: string | null
          description_pt: string | null
          id: string
          is_free: boolean
          is_published: boolean
          module_id: string
          position: number
          slug: string
          title_en: string | null
          title_pt: string
          updated_at: string
          video_id: string | null
        }
        Insert: {
          content_en?: string | null
          content_pt?: string | null
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          module_id: string
          position?: number
          slug: string
          title_en?: string | null
          title_pt: string
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          content_en?: string | null
          content_pt?: string | null
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          module_id?: string
          position?: number
          slug?: string
          title_en?: string | null
          title_pt?: string
          updated_at?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description_en: string | null
          description_pt: string | null
          id: string
          is_published: boolean
          position: number
          slug: string
          title_en: string | null
          title_pt: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug: string
          title_en?: string | null
          title_pt: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug?: string
          title_en?: string | null
          title_pt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      subtitles: {
        Row: {
          content: string
          created_at: string
          id: string
          is_auto: boolean
          language: string
          updated_at: string
          video_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_auto?: boolean
          language: string
          updated_at?: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_auto?: boolean
          language?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtitles_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          is_free: boolean
          provider: Database["public"]["Enums"]["video_provider"]
          ref: string | null
          source_note: string | null
          source_path: string | null
          status: Database["public"]["Enums"]["video_status"]
          title_en: string | null
          title_pt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_free?: boolean
          provider?: Database["public"]["Enums"]["video_provider"]
          ref?: string | null
          source_note?: string | null
          source_path?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          title_en?: string | null
          title_pt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_free?: boolean
          provider?: Database["public"]["Enums"]["video_provider"]
          ref?: string | null
          source_note?: string | null
          source_path?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          title_en?: string | null
          title_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      enrollment_source: "free" | "admin_grant" | "courtesy"
      video_provider: "vimeo" | "youtube" | "hls" | "file"
      video_status: "ideia" | "gravado" | "editado" | "legendado" | "publicado"
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
      app_role: ["admin", "editor"],
      enrollment_source: ["free", "admin_grant", "courtesy"],
      video_provider: ["vimeo", "youtube", "hls", "file"],
      video_status: ["ideia", "gravado", "editado", "legendado", "publicado"],
    },
  },
} as const
