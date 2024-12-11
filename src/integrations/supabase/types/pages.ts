export interface Pages {
  Row: {
    content: string;
    created_at: string;
    id: string;
    slug: string;
    title: string;
    updated_at: string;
    location: "header" | "footer_company" | "footer_legal" | "none" | null;
  };
  Insert: {
    content: string;
    created_at?: string;
    id?: string;
    slug: string;
    title: string;
    updated_at?: string;
    location?: "header" | "footer_company" | "footer_legal" | "none" | null;
  };
  Update: {
    content?: string;
    created_at?: string;
    id?: string;
    slug?: string;
    title?: string;
    updated_at?: string;
    location?: "header" | "footer_company" | "footer_legal" | "none" | null;
  };
  Relationships: [];
}