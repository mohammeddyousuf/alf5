export interface Orders {
  id: string;
  created_at: string;
  product_id: string;
  product_name: string;
  product_brand: string | null;
  product_price: number;
  category_name: string | null;
  subcategory_name: string | null;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  payment_mode: string;
  message: string | null;
  location: string | null;
  ip_address: string | null;
  source: string | null;
  whatsapp_number: string | null;
  sent_to_whatsapp: string | null;
}

export interface OrdersInsert extends Partial<Omit<Orders, 'created_at'>> {
  created_at?: string;
}

export interface OrdersUpdate extends Partial<Orders> {}