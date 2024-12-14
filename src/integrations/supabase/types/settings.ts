import { SocialMediaLink } from './social';

export interface Settings {
  accent_color: string | null;
  background_color: string | null;
  clearance_sale_active: boolean | null;
  clearance_sale_end_date: string | null;
  created_at: string;
  facebook_url: string | null;
  favicon_url: string | null;
  foreground_color: string | null;
  id: string;
  instagram_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tracking_codes: string | null;
  updated_at: string;
  website_name: string | null;
  whatsapp_group_url: string | null;
  whatsapp_number: string;
  social_media_links: SocialMediaLink[] | null;
  lock_enabled: boolean | null;
  lock_datetime: string | null;
  lock_message: string | null;
}

export interface SettingsInsert extends Partial<Omit<Settings, 'whatsapp_number' | 'created_at' | 'updated_at'>> {
  whatsapp_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsUpdate extends Partial<Settings> {}