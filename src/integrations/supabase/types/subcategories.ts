export interface Subcategories {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  category_id: string;
}

export interface SubcategoriesInsert extends Partial<Omit<Subcategories, 'id' | 'created_at' | 'updated_at'>> {
  name: string;
  category_id: string;
}

export interface SubcategoriesUpdate extends Partial<Subcategories> {}