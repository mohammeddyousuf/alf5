export interface Collections {
  Row: {
    button_text: string | null;
    created_at: string;
    description: string | null;
    id: string;
    image_url: string | null;
    link_url: string | null;
    name: string;
    updated_at: string;
  }
  Insert: {
    button_text?: string | null;
    created_at?: string;
    description?: string | null;
    id?: string;
    image_url?: string | null;
    link_url?: string | null;
    name: string;
    updated_at?: string;
  }
  Update: {
    button_text?: string | null;
    created_at?: string;
    description?: string | null;
    id?: string;
    image_url?: string | null;
    link_url?: string | null;
    name?: string;
    updated_at?: string;
  }
}

export type CollectionsInsert = Collections['Insert']
export type CollectionsUpdate = Collections['Update']
export type CollectionsRow = Collections['Row']