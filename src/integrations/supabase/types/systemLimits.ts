export interface SystemLimits {
  id: string;
  created_at: string;
  product_limit: number;
  max_image_size_mb: number | null;
  max_folder_size_mb: number | null;
}

export interface SystemLimitsInsert extends Partial<SystemLimits> {
  product_limit: number;
}

export interface SystemLimitsUpdate extends Partial<SystemLimits> {}