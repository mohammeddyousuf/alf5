export interface SystemLimits {
  id: number;
  product_limit: number;
  created_at: string;
  updated_at: string;
}

export interface SystemLimitsInsert extends Partial<Omit<SystemLimits, 'created_at' | 'updated_at'>> {
  product_limit: number;
  created_at?: string;
  updated_at?: string;
}

export interface SystemLimitsUpdate extends Partial<SystemLimits> {}