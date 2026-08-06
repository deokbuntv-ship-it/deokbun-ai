import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from '@/services/supabase/config';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient !== null) {
    return cachedClient;
  }

  const config = getSupabaseConfig();

  cachedClient = createClient(config.url, config.publishableKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
