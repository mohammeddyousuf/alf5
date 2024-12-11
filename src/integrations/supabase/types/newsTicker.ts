export interface NewsTicker {
  active: boolean | null;
  created_at: string;
  id: string;
  message: string;
  order_index: number;
  updated_at: string;
}

export interface NewsTickerInsert extends Partial<Omit<NewsTicker, 'created_at' | 'updated_at' | 'message'>> {
  message: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewsTickerUpdate extends Partial<NewsTicker> {}