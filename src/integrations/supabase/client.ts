import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hoytbffldsdeywkyuuza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveXRiZmZsZHNkZXl3a3l1dXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTAyNDksImV4cCI6MjA0OTI4NjI0OX0.gJwvzpKqdhIWhsIGF1a4BPUXysKXNtB-lg_aNG_VFz4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
  },
});

// Add detailed debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  console.log('Session details:', session);
  
  if (event === 'SIGNED_IN') {
    console.log('Sign in successful');
  } else if (event === 'SIGNED_OUT') {
    console.log('Sign out successful');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  } else if (event === 'USER_DELETED') {
    console.log('User deleted');
  } else if (event === 'PASSWORD_RECOVERY') {
    console.log('Password recovery initiated');
  }
});

// Add error logging for auth operations
supabase.auth.onError((error) => {
  console.error('Auth error:', error);
});