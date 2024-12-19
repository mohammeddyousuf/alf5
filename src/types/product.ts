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
  created_at: string;
}