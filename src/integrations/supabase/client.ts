import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Force-type the client with the correct Database schema from types/database.ts
// The auto-generated types.ts has empty tables and is read-only
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Re-export with correct typing
export const supabase = _supabase as unknown as ReturnType<typeof createClient<Database>>;
