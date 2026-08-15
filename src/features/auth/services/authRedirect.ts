// OAuth redirect resolution (production hardening). PURE + unit-testable — no react-native /
// expo imports here so the node test suite can lock the production behavior.
//
// WHY: google/kakao go through Supabase's /auth/v1/callback, which redirects the browser to
// the client-provided `redirect_to` ONLY if it is in the Supabase "Redirect URLs" allowlist;
// otherwise it falls back to the dashboard "Site URL" (whose dev default is http://localhost).
// Relying on `makeRedirectUri()` (= window.location.origin on web) means the redirect_to is
// whatever origin the page happens to be served from (apex vs www vs a preview URL) — if that
// doesn't exactly match an allowlisted URL, Supabase silently uses the Site URL (localhost).
//
// FIX: on web, when the canonical production origin is configured (EXPO_PUBLIC_PUBLIC_BASE_URL
// via getPublicBaseUrl), PIN the redirect to `${base}/login-callback` so it is deterministic
// and always matches the one allowlisted canonical URL. Native + local dev (no configured
// base) fall through to expo `makeRedirectUri` (the app scheme / the actual dev origin) — so
// localhost only ever appears in genuine local development, never from a hardcoded fallback.

export const LOGIN_CALLBACK_PATH = 'login-callback';

/**
 * The pinned web redirect URI, or null when it should be resolved by expo `makeRedirectUri`
 * (native, or web with no configured production origin). `base` is getPublicBaseUrl()'s
 * output (an https origin with no trailing slash, or null).
 */
export function resolveConfiguredWebRedirect(base: string | null, isWeb: boolean): string | null {
  if (!isWeb) return null; // native → app scheme via makeRedirectUri (deokbunai://login-callback)
  if (!base) return null; // web dev / origin unconfigured → makeRedirectUri (actual origin)
  return `${base}/${LOGIN_CALLBACK_PATH}`;
}
