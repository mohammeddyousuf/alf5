export interface Categories {
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  updated_at: string;
}

export interface CategoriesInsert extends Partial<Omit<Categories, 'created_at' | 'updated_at'>> {
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesUpdate extends Partial<Categories> {}