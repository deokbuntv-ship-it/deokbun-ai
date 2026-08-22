// App environment contract (Sprint J7 §7.2). Single source of truth for WHICH backend a build targets, so a
// staging build can never silently ship production (or vice-versa). Pure + testable. It does NOT introduce a new
// required env var — if EXPO_PUBLIC_APP_ENV is unset it INFERS the environment from the Supabase project ref, so
// existing builds keep working. When APP_ENV IS declared (e.g. per eas.json profile), a mismatch with the URL's
// ref FAILS FAST (assertEnvironmentConsistency) — the core release-safety guarantee.
export type AppEnvironment = 'development' | 'staging' | 'production';

// Known project refs → environment. Adding a ref here makes the fail-fast assertion protect that pairing.
export const KNOWN_PROJECT_REFS: Readonly<Record<string, AppEnvironment>> = {
  olvkpaldrwvtexxpoaag: 'production',
  aephpsiurgkvqcswyeie: 'staging',
};

/** Extract the Supabase project ref from a `https://<ref>.supabase.co` URL. */
export function projectRefFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

function normalizeDeclared(v: string | null | undefined): AppEnvironment | null {
  const s = (v ?? '').trim().toLowerCase();
  return s === 'production' || s === 'staging' || s === 'development' ? s : null;
}

export type ResolvedEnvironment = {
  env: AppEnvironment;
  supabaseUrl: string;
  projectRef: string | null;
  declared: AppEnvironment | null; // explicit EXPO_PUBLIC_APP_ENV, if any
  isProduction: boolean;
};

/** Resolve the effective environment from the URL + optional declared APP_ENV. Declared wins; else inferred. */
export function resolveEnvironment(input?: { url?: string | null; declared?: string | null }): ResolvedEnvironment {
  const supabaseUrl = (input?.url ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
  const declared = normalizeDeclared(input?.declared ?? process.env.EXPO_PUBLIC_APP_ENV);
  const ref = projectRefFromUrl(supabaseUrl);
  const inferred: AppEnvironment = ref ? (KNOWN_PROJECT_REFS[ref] ?? 'development') : 'development';
  const env = declared ?? inferred;
  return { env, supabaseUrl, projectRef: ref, declared, isProduction: env === 'production' };
}

/**
 * Fail fast if a build is cross-targeted: EXPO_PUBLIC_APP_ENV is declared but the Supabase URL points at a
 * DIFFERENT known environment (a staging build hitting production, or the reverse). Empty URL is left to the
 * Supabase config's own required-vars throw. Throws on mismatch; returns the resolved environment otherwise.
 */
export function assertEnvironmentConsistency(r: ResolvedEnvironment = resolveEnvironment()): ResolvedEnvironment {
  if (!r.supabaseUrl) return r;
  if (r.declared && r.projectRef && KNOWN_PROJECT_REFS[r.projectRef] && KNOWN_PROJECT_REFS[r.projectRef] !== r.declared) {
    throw new Error(
      `Environment mismatch: EXPO_PUBLIC_APP_ENV='${r.declared}' but the Supabase URL targets ` +
        `'${KNOWN_PROJECT_REFS[r.projectRef]}' (ref ${r.projectRef}). Refusing to start a cross-targeted build.`,
    );
  }
  return r;
}

/** Operator/debug label for the current environment (e.g. admin top bar). Never shown in the consumer prod UI. */
export function environmentLabel(env: AppEnvironment = resolveEnvironment().env): string {
  return env === 'production' ? '운영' : env === 'staging' ? '스테이징' : '개발';
}
