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
  updated_at: string;
  website_name: string | null;
  whatsapp_group_url: string | null;
  whatsapp_number: string;
  social_media_links: SocialMediaLink[] | null;
}