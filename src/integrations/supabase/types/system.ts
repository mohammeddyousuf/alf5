export interface SystemLimits {
  Row: {
    id: number;
    product_limit: number;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: number;
    product_limit: number;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    product_limit?: number;
    created_at?: string;
    updated_at?: string;
  };
}