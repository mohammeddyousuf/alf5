import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hoytbffldsdeywkyuuza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveXRiZmZsZHNkZXl3a3l1dXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTAyNDksImV4cCI6MjA0OTI4NjI0OX0.gJwvzpKqdhIWhsIGF1a4BPUXysKXNtB-lg_aNG_VFz4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
  },
  global: {
    headers: {
      'apikey': SUPABASE_PUBLISHABLE_KEY,
    },
  },
});

// Add debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});