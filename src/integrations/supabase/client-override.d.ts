import { SupabaseClient } from '@supabase/supabase-js';

// Override the auto-generated empty Database type so that
// supabase.from("table") calls don't error with 'never'.
// The actual tables live on the external Supabase instance.
declare module '@/integrations/supabase/client' {
  export const supabase: SupabaseClient<any>;
}
