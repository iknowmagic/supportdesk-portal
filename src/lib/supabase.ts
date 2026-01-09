import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { noctare } from './noctare';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    noctare.log('Supabase environment variables are missing. API calls will fail until they are configured.');
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
          );
        },
      }
    ) as SupabaseClient;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'starter-template',
      },
    },
  });
};

export const supabase = createSupabaseClient();
