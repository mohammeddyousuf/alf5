export interface Products {
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
    discount_price: number | null
    status: "draft" | "published" | "archived" | null
    subcategory_id: string | null
    updated_at: string
    video_urls: string[] | null
    custom_label: string | null
    whatsapp_number: string | null
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
    discount_price?: number | null
    status?: "draft" | "published" | "archived" | null
    subcategory_id?: string | null
    updated_at?: string
    video_urls?: string[] | null
    custom_label?: string | null
    whatsapp_number?: string | null
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
    discount_price?: number | null
    status?: "draft" | "published" | "archived" | null
    subcategory_id?: string | null
    updated_at?: string
    video_urls?: string[] | null
    custom_label?: string | null
    whatsapp_number?: string | null
  }
}

export type ProductsInsert = Products['Insert']
export type ProductsUpdate = Products['Update']
export type ProductsRow = Products['Row']