export interface Pages {
  Row: {
    id: string;
    title: string;
    content: string;
    slug: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    content: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    content?: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
  };
}