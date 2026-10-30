import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Privileged service-role client (strictly for admin / background worker operations)
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Factory for user-scoped client honoring Row Level Security
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function isSupabaseConfigured(): boolean {
  return (
    env.SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
    env.SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
}

if (!isSupabaseConfigured()) {
  logger.warn('Supabase credentials not configured in backend .env. Operating in development mode.');
}

