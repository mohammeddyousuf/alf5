import type { Products } from './products';
import type { SystemLimits } from './system';
import type { Pages } from './pages';
import type { Settings } from './settings';
import type { Collections } from './collections';
import type { NewsTicker } from './newsTicker';
import type { Categories } from './categories';
import type { Subcategories } from './subcategories';
import type { Orders } from './orders';
import type { Sliders } from './sliders';
import type { Faqs } from './faqs';

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
      settings: Settings;
      collections: Collections;
      news_ticker: NewsTicker;
      categories: Categories;
      subcategories: Subcategories;
      orders: Orders;
      sliders: Sliders;
      faqs: Faqs;
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