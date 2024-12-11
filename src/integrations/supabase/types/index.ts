import type { Products } from './products';
import type { SystemLimits } from './system';
import type { Pages } from './pages';
import type { PublicSchema } from './schema';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: Products;
      system_limits: SystemLimits;
      pages: Pages;
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
