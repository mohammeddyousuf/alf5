export interface Products {
  Row: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[] | null;
    created_at: string;
    updated_at: string;
    category_id: string | null;
    subcategory_id: string | null;
    status: "draft" | "published" | "archived" | null;
    featured: boolean | null;
    brand: string | null;
    sale_price: number | null;
    added_date: string | null;
    video_urls: string[] | null;
  };
  Insert: {
    id?: string;
    name: string;
    description?: string | null;
    price: number;
    images?: string[] | null;
    created_at?: string;
    updated_at?: string;
    category_id?: string | null;
    subcategory_id?: string | null;
    status?: "draft" | "published" | "archived" | null;
    featured?: boolean | null;
    brand?: string | null;
    sale_price?: number | null;
    added_date?: string | null;
    video_urls?: string[] | null;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    images?: string[] | null;
    created_at?: string;
    updated_at?: string;
    category_id?: string | null;
    subcategory_id?: string | null;
    status?: "draft" | "published" | "archived" | null;
    featured?: boolean | null;
    brand?: string | null;
    sale_price?: number | null;
    added_date?: string | null;
    video_urls?: string[] | null;
  };
}