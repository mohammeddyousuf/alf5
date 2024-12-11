import { Settings, SettingsInsert, SettingsUpdate } from './settings';
import { Products, ProductsInsert, ProductsUpdate } from './products';
import { Categories, CategoriesInsert, CategoriesUpdate } from './categories';
import { Collections, CollectionsInsert, CollectionsUpdate } from './collections';
import { NewsTicker, NewsTickerInsert, NewsTickerUpdate } from './newsTicker';
import { Pages, PagesInsert, PagesUpdate } from './pages';
import { Sliders, SlidersInsert, SlidersUpdate } from './sliders';
import { Subcategories, SubcategoriesInsert, SubcategoriesUpdate } from './subcategories';
import { Orders, OrdersInsert, OrdersUpdate } from './orders';
import { SystemLimits, SystemLimitsInsert, SystemLimitsUpdate } from './systemLimits';

export interface Database {
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
      collections: {
        Row: Collections;
        Insert: CollectionsInsert;
        Update: CollectionsUpdate;
        Relationships: [];
      };
      news_ticker: {
        Row: NewsTicker;
        Insert: NewsTickerInsert;
        Update: NewsTickerUpdate;
        Relationships: [];
      };
      pages: {
        Row: Pages;
        Insert: PagesInsert;
        Update: PagesUpdate;
        Relationships: [];
      };
      products: {
        Row: Products;
        Insert: ProductsInsert;
        Update: ProductsUpdate;
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
      };
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