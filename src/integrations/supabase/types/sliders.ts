export interface Sliders {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  active: boolean;
  order_index: number;
}

export interface SlidersInsert extends Partial<Omit<Sliders, 'id' | 'created_at' | 'updated_at'>> {
  title: string;
}

export interface SlidersUpdate extends Partial<Sliders> {}