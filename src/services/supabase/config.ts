export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

function readEnvValue(value: string | undefined): string {
  return (value ?? '').trim();
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = readEnvValue(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const publishableKey = readEnvValue(
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  if (url.length === 0 || publishableKey.length === 0) {
    throw new Error('Supabase environment variables are not configured.');
  }

  return { url, publishableKey };
}
