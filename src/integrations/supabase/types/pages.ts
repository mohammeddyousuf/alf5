export type PageLocation = "header" | "footer_company" | "footer_legal" | "none" | null;

export interface Pages {
  Row: {
    content: string;
    created_at: string;
    id: string;
    slug: string;
    title: string;
    updated_at: string;
    location: PageLocation;
  };
  Insert: {
    content: string;
    created_at?: string;
    id?: string;
    slug: string;
    title: string;
    updated_at?: string;
    location?: PageLocation;
  };
  Update: {
    content?: string;
    created_at?: string;
    id?: string;
    slug?: string;
    title?: string;
    updated_at?: string;
    location?: PageLocation;
  };
  Relationships: [];
}