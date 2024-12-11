export interface Products {
  Row: {
    added_date: string | null;
    brand: string | null;
    category_id: string | null;
    created_at: string;
    description: string | null;
    featured: boolean | null;
    id: string;
    images: string[] | null;
    name: string;
    price: number;
    sale_price: number | null;
    status: "draft" | "published" | "archived" | null;
    subcategory_id: string | null;
    updated_at: string;
    video_urls: string[] | null;
  };
  Insert: {
    added_date?: string | null;
    brand?: string | null;
    category_id?: string | null;
    created_at?: string;
    description?: string | null;
    featured?: boolean | null;
    id?: string;
    images?: string[] | null;
    name: string;
    price: number;
    sale_price?: number | null;
    status?: "draft" | "published" | "archived" | null;
    subcategory_id?: string | null;
    updated_at?: string;
    video_urls?: string[] | null;
  };
  Update: {
    added_date?: string | null;
    brand?: string | null;
    category_id?: string | null;
    created_at?: string;
    description?: string | null;
    featured?: boolean | null;
    id?: string;
    images?: string[] | null;
    name?: string;
    price?: number;
    sale_price?: number | null;
    status?: "draft" | "published" | "archived" | null;
    subcategory_id?: string | null;
    updated_at?: string;
    video_urls?: string[] | null;
  };
  Relationships: [
    {
      foreignKeyName: "products_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "products_subcategory_id_fkey";
      columns: ["subcategory_id"];
      isOneToOne: false;
      referencedRelation: "subcategories";
      referencedColumns: ["id"];
    }
  ];
}