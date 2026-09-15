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
  if (!r.supabaseUrl || !r.declared || !r.projectRef) return r;
  const refEnv = KNOWN_PROJECT_REFS[r.projectRef];
  if (!refEnv) return r; // unknown ref → nothing to assert
  // Protect the PRODUCTION boundary: a production build must hit production and a non-production build must NOT.
  // 'development' and 'staging' both legitimately use the staging backend, so only prod↔non-prod is a mismatch.
  if ((r.declared === 'production') !== (refEnv === 'production')) {
    throw new Error(
      `Environment mismatch: EXPO_PUBLIC_APP_ENV='${r.declared}' but the Supabase URL targets '${refEnv}' ` +
        `(ref ${r.projectRef}). Refusing to start a build across the production boundary.`,
    );
  }
  return r;
}

/**
 * Refuse to let a LOCAL DEV RUN silently attach to production (KNOWN_RISKS H5, 2026-09-05).
 *
 * THE HOLE THIS CLOSES: `assertEnvironmentConsistency` only fires when APP_ENV is DECLARED. With it
 * unset — which is exactly what a bare `.env` gives you — the resolver happily INFERS 'production'
 * from the URL and everything works. `npm start` then writes real rows into the real database and
 * nothing says so. The CLI has three layers of production defence (`link`, `config.toml`, the
 * PreToolUse hook) but all three inspect COMMANDS; none of them can see the app's own runtime.
 *
 * WHY IT IS SCOPED TO `__DEV__` AND NOT TO EVERY BUILD: every eas.json profile already declares
 * APP_ENV, so native builds pass regardless. The web production build is made by Vercel, and if its
 * dashboard does not set APP_ENV a blanket throw would break the owner's deploys to fix a problem
 * they do not have. The actual reported failure is a person running the app locally, so that is
 * exactly what this blocks — a smaller, sharper rule that cannot take production down.
 *
 * Escape hatch: declare `EXPO_PUBLIC_APP_ENV=production` (i.e. say it out loud). `.env.prod` in the
 * repo root holds the production values ready for `cp .env.prod .env`.
 */
export function assertNotSilentProduction(
  r: ResolvedEnvironment = resolveEnvironment(),
  isDev: boolean = typeof __DEV__ !== 'undefined' && __DEV__,
): ResolvedEnvironment {
  if (!isDev) return r;
  if (r.projectRef && KNOWN_PROJECT_REFS[r.projectRef] === 'production' && r.declared !== 'production') {
    throw new Error(
      '로컬 개발 실행이 PRODUCTION 을 가리키고 있습니다. 기본값은 staging 이어야 합니다.\n' +
        `  현재 프로젝트 ref: ${r.projectRef} (production)\n` +
        '  고치기: .env 를 staging 으로 되돌리세요 (기본값이 그것입니다).\n' +
        '  정말 프로덕션에 붙어야 한다면 EXPO_PUBLIC_APP_ENV=production 을 명시하세요 ' +
        '(cp .env.prod .env). 조용히 붙는 것만 막습니다.',
    );
  }
  return r;
}

/**
 * One line at boot saying which backend this process is talking to.
 *
 * The point of H5 was not only that a dev run could reach production but that it did so WITHOUT
 * SAYING SO. Even when the target is correct, printing it turns "I assumed staging" into something
 * a person can check in one glance. Never prints keys — ref and label only.
 */
export function describeEnvironment(r: ResolvedEnvironment = resolveEnvironment()): string {
  const how = r.declared ? 'declared' : 'inferred';
  return `[env] ${environmentLabel(r.env)} (${r.env}, ${how}) · ref=${r.projectRef ?? 'unknown'}`;
}

/** Operator/debug label for the current environment (e.g. admin top bar). Never shown in the consumer prod UI. */
export function environmentLabel(env: AppEnvironment = resolveEnvironment().env): string {
  return env === 'production' ? '운영' : env === 'staging' ? '스테이징' : '개발';
}
