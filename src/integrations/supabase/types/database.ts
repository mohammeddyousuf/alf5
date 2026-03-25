import { Settings, SettingsInsert, SettingsUpdate } from './settings';
import { Products } from './products';
import { Categories, CategoriesInsert, CategoriesUpdate } from './categories';
import { Collections } from './collections';
import { NewsTicker, NewsTickerInsert, NewsTickerUpdate } from './newsTicker';
import { Pages } from './pages';
import { Sliders, SlidersInsert, SlidersUpdate } from './sliders';
import { Subcategories, SubcategoriesInsert, SubcategoriesUpdate } from './subcategories';
import { Orders, OrdersInsert, OrdersUpdate } from './orders';
import { SystemLimits, SystemLimitsInsert, SystemLimitsUpdate } from './systemLimits';
import { Enquiries, EnquiriesInsert, EnquiriesUpdate } from './enquiries';

export interface AppDatabase {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      settings: {
        Row: Settings;
        Insert: SettingsInsert;
        Update: SettingsUpdate;
        Relationships: [];
      };
      categories: {
        Row: Categories;
        Insert: CategoriesInsert;
        Update: CategoriesUpdate;
        Relationships: [];
      };
      collections: Collections;
      news_ticker: {
        Row: NewsTicker;
        Insert: NewsTickerInsert;
        Update: NewsTickerUpdate;
        Relationships: [];
      };
      pages: Pages;
      products: Products;
      sliders: {
        Row: Sliders;
        Insert: SlidersInsert;
        Update: SlidersUpdate;
        Relationships: [];
      };
      subcategories: {
        Row: Subcategories;
        Insert: SubcategoriesInsert;
        Update: SubcategoriesUpdate;
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: Orders;
        Insert: OrdersInsert;
        Update: OrdersUpdate;
        Relationships: [];
      };
      system_limits: {
        Row: SystemLimits;
        Insert: SystemLimitsInsert;
        Update: SystemLimitsUpdate;
        Relationships: [];
      };
      enquiries: {
        Row: Enquiries;
        Insert: EnquiriesInsert;
        Update: EnquiriesUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      product_status: "draft" | "published" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type { Json } from './json';
export * from './tables';
