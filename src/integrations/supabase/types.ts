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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          button_text: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_ticker: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          message: string
          order_index: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          message: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          message?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          added_date: string | null
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          name: string
          price: number
          sale_price: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          subcategory_id: string | null
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          added_date?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          name: string
          price: number
          sale_price?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          subcategory_id?: string | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          added_date?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          name?: string
          price?: number
          sale_price?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          subcategory_id?: string | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      products_collections: {
        Row: {
          collection_id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          product_id: string
        }
        Update: {
          collection_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          clearance_sale_active: boolean | null
          clearance_sale_end_date: string | null
          created_at: string
          facebook_url: string | null
          favicon_url: string | null
          foreground_color: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          website_name: string | null
          whatsapp_group_url: string | null
          whatsapp_number: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          clearance_sale_active?: boolean | null
          clearance_sale_end_date?: string | null
          created_at?: string
          facebook_url?: string | null
          favicon_url?: string | null
          foreground_color?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          website_name?: string | null
          whatsapp_group_url?: string | null
          whatsapp_number: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          clearance_sale_active?: boolean | null
          clearance_sale_end_date?: string | null
          created_at?: string
          facebook_url?: string | null
          favicon_url?: string | null
          foreground_color?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          website_name?: string | null
          whatsapp_group_url?: string | null
          whatsapp_number?: string;
        }
        Relationships: []
      }
      sliders: {
        Row: {
          active: boolean | null
          button_text: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          link_url: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          link_url?: string | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          link_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          created_at: string
          product_id: string
          product_name: string
          product_brand: string | null
          product_price: number
          customer_name: string
          customer_email: string
          customer_mobile: string
          customer_address: string
          payment_mode: string
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          product_name: string
          product_brand?: string | null
          product_price: number
          customer_name: string
          customer_email: string
          customer_mobile: string
          customer_address: string
          payment_mode: string
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          product_name?: string
          product_brand?: string | null
          product_price?: number
          customer_name?: string
          customer_email?: string
          customer_mobile?: string
          customer_address?: string
          payment_mode?: string
        }
        Relationships: []
      }
      system_limits: {
        Row: {
          id: number
          product_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_limit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_limit?: number
          created_at?: string
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
      product_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
