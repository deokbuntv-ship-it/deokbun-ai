import {
  assertEnvironmentConsistency,
  assertNotSilentProduction,
  describeEnvironment,
  resolveEnvironment,
} from '@/config/environment';

// Announce the target ONCE per process, not per client construction.
let announced = false;

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

  // Fail fast on a cross-targeted build (§7.2): if EXPO_PUBLIC_APP_ENV is declared but the URL points at a
  // different known environment, refuse to start. No-op when APP_ENV is unset (env is inferred from the ref).
  const resolved = assertEnvironmentConsistency(resolveEnvironment({ url }));

  // And refuse a LOCAL DEV RUN that resolved to production without saying so (KNOWN_RISKS H5).
  // The check above cannot catch it: with APP_ENV unset there is nothing to contradict.
  assertNotSilentProduction(resolved);

  if (!announced) {
    announced = true;
    // eslint-disable-next-line no-console -- one boot line naming the backend; the silence WAS the bug.
    console.info(describeEnvironment(resolved));
  }

  return { url, publishableKey };
}
