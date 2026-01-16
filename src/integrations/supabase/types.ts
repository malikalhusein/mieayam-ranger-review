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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      review_views: {
        Row: {
          id: string
          review_id: string | null
          viewed_at: string | null
          viewer_fingerprint: string | null
        }
        Insert: {
          id?: string
          review_id?: string | null
          viewed_at?: string | null
          viewer_fingerprint?: string | null
        }
        Update: {
          id?: string
          review_id?: string | null
          viewed_at?: string | null
          viewer_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_views_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          address: string
          ayam_bumbu: number | null
          ayam_potongan: number | null
          city: string
          compare_count: number | null
          complexity: number | null
          created_at: string
          editor_choice: boolean | null
          exclude_from_best: boolean | null
          fasilitas_alat_makan: number | null
          fasilitas_kebersihan: number | null
          fasilitas_tempat: number | null
          google_map_url: string | null
          goreng_aroma_tumisan: number | null
          goreng_bumbu_tumisan: number | null
          goreng_keseimbangan_minyak: number | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          kuah_aroma: number | null
          kuah_kaldu: number | null
          kuah_kejernihan: number | null
          kuah_kekentalan: number | null
          kuah_keseimbangan: number | null
          menu_image_url: string | null
          mie_tekstur: number | null
          mie_tipe: string | null
          notes: string | null
          outlet_name: string
          overall_score: number | null
          price: number
          product_type: string
          service_durasi: number | null
          slug: string | null
          sweetness: number | null
          take_it_or_leave_it: boolean | null
          topping_bakso: boolean | null
          topping_balungan: boolean | null
          topping_bawang_daun: boolean | null
          topping_ceker: boolean | null
          topping_dimsum: boolean | null
          topping_ekstra_ayam: boolean | null
          topping_ekstra_sawi: boolean | null
          topping_jenis_mie: boolean | null
          topping_mie_jumbo: boolean | null
          topping_pangsit_basah: boolean | null
          topping_pangsit_kering: boolean | null
          topping_tetelan: boolean | null
          topping_variasi_bumbu: boolean | null
          updated_at: string
          view_count: number | null
          visit_date: string
        }
        Insert: {
          address: string
          ayam_bumbu?: number | null
          ayam_potongan?: number | null
          city: string
          compare_count?: number | null
          complexity?: number | null
          created_at?: string
          editor_choice?: boolean | null
          exclude_from_best?: boolean | null
          fasilitas_alat_makan?: number | null
          fasilitas_kebersihan?: number | null
          fasilitas_tempat?: number | null
          google_map_url?: string | null
          goreng_aroma_tumisan?: number | null
          goreng_bumbu_tumisan?: number | null
          goreng_keseimbangan_minyak?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          kuah_aroma?: number | null
          kuah_kaldu?: number | null
          kuah_kejernihan?: number | null
          kuah_kekentalan?: number | null
          kuah_keseimbangan?: number | null
          menu_image_url?: string | null
          mie_tekstur?: number | null
          mie_tipe?: string | null
          notes?: string | null
          outlet_name: string
          overall_score?: number | null
          price: number
          product_type: string
          service_durasi?: number | null
          slug?: string | null
          sweetness?: number | null
          take_it_or_leave_it?: boolean | null
          topping_bakso?: boolean | null
          topping_balungan?: boolean | null
          topping_bawang_daun?: boolean | null
          topping_ceker?: boolean | null
          topping_dimsum?: boolean | null
          topping_ekstra_ayam?: boolean | null
          topping_ekstra_sawi?: boolean | null
          topping_jenis_mie?: boolean | null
          topping_mie_jumbo?: boolean | null
          topping_pangsit_basah?: boolean | null
          topping_pangsit_kering?: boolean | null
          topping_tetelan?: boolean | null
          topping_variasi_bumbu?: boolean | null
          updated_at?: string
          view_count?: number | null
          visit_date: string
        }
        Update: {
          address?: string
          ayam_bumbu?: number | null
          ayam_potongan?: number | null
          city?: string
          compare_count?: number | null
          complexity?: number | null
          created_at?: string
          editor_choice?: boolean | null
          exclude_from_best?: boolean | null
          fasilitas_alat_makan?: number | null
          fasilitas_kebersihan?: number | null
          fasilitas_tempat?: number | null
          google_map_url?: string | null
          goreng_aroma_tumisan?: number | null
          goreng_bumbu_tumisan?: number | null
          goreng_keseimbangan_minyak?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          kuah_aroma?: number | null
          kuah_kaldu?: number | null
          kuah_kejernihan?: number | null
          kuah_kekentalan?: number | null
          kuah_keseimbangan?: number | null
          menu_image_url?: string | null
          mie_tekstur?: number | null
          mie_tipe?: string | null
          notes?: string | null
          outlet_name?: string
          overall_score?: number | null
          price?: number
          product_type?: string
          service_durasi?: number | null
          slug?: string | null
          sweetness?: number | null
          take_it_or_leave_it?: boolean | null
          topping_bakso?: boolean | null
          topping_balungan?: boolean | null
          topping_bawang_daun?: boolean | null
          topping_ceker?: boolean | null
          topping_dimsum?: boolean | null
          topping_ekstra_ayam?: boolean | null
          topping_ekstra_sawi?: boolean | null
          topping_jenis_mie?: boolean | null
          topping_mie_jumbo?: boolean | null
          topping_pangsit_basah?: boolean | null
          topping_pangsit_kering?: boolean | null
          topping_tetelan?: boolean | null
          topping_variasi_bumbu?: boolean | null
          updated_at?: string
          view_count?: number | null
          visit_date?: string
        }
        Relationships: []
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
      wishlist_entries: {
        Row: {
          created_at: string
          id: string
          location: string
          notes: string | null
          place_name: string
          status: string
          updated_at: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          place_name: string
          status?: string
          updated_at?: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          place_name?: string
          status?: string
          updated_at?: string
          vote_count?: number | null
        }
        Relationships: []
      }
      wishlist_votes: {
        Row: {
          created_at: string | null
          id: string
          voter_identifier: string
          wishlist_entry_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          voter_identifier: string
          wishlist_entry_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          voter_identifier?: string
          wishlist_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_votes_wishlist_entry_id_fkey"
            columns: ["wishlist_entry_id"]
            isOneToOne: false
            referencedRelation: "wishlist_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: { Args: { name: string }; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
