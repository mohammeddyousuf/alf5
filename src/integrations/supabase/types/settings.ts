import { SocialMediaLink } from './social';

export interface Settings {
  Row: {
    id: string;
    website_name: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    background_color: string | null;
    foreground_color: string | null;
    whatsapp_number: string;
    whatsapp_group_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    clearance_sale_active: boolean | null;
    clearance_sale_end_date: string | null;
    created_at: string;
    updated_at: string;
    social_media_links: SocialMediaLink[] | null;
  };
  Insert: {
    id?: string;
    website_name?: string | null;
    logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    background_color?: string | null;
    foreground_color?: string | null;
    whatsapp_number: string;
    whatsapp_group_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    clearance_sale_active?: boolean | null;
    clearance_sale_end_date?: string | null;
    created_at?: string;
    updated_at?: string;
    social_media_links?: SocialMediaLink[] | null;
  };
  Update: {
    id?: string;
    website_name?: string | null;
    logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    background_color?: string | null;
    foreground_color?: string | null;
    whatsapp_number?: string;
    whatsapp_group_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    clearance_sale_active?: boolean | null;
    clearance_sale_end_date?: string | null;
    created_at?: string;
    updated_at?: string;
    social_media_links?: SocialMediaLink[] | null;
  };
  Relationships: [];
}