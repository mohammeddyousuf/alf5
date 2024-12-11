export interface Collections {
  button_text: string | null;
  created_at: string;
  description: string | null;
  id: string;
  image_url: string | null;
  link_url: string | null;
  name: string;
  updated_at: string;
}

export interface CollectionsInsert extends Partial<Omit<Collections, 'created_at' | 'updated_at' | 'name'>> {
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionsUpdate extends Partial<Collections> {}