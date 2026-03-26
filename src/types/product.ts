export interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  discount_price: number | null;
  images: string[];
  brand: string | null;
  custom_label: string | null;
  description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  featured: boolean | null;
  stock_status?: string | null;
  price_note?: string | null;
  top_notes?: string | null;
  heart_notes?: string | null;
  base_notes?: string | null;
  gender_profile?: string | null;
  occasion?: string | null;
  scent_family?: string | null;
  created_at: string;
}
