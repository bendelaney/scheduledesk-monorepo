import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

// Only create client if we have valid environment variables
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
} else {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables');
  } else {
    console.warn('Supabase environment variables not available during build');
  }
}

// Export a proxy that throws helpful errors when used without proper setup
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized - missing environment variables');
    }
    return (supabaseClient as any)[prop];
  }
});