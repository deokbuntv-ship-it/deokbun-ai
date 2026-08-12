// Naver OAuth CLIENT config (PATH B — trusted edge bridge; see
// docs/NAVER_LOGIN_ARCHITECTURE.md). Naver is NOT a Supabase provider (its userinfo
// nests identity under `response.id`, which Supabase's custom OAuth2 cannot map), so
// login goes App → Naver authorize → naver-auth Edge Function → Supabase session.
//
// SECURITY: `client_id` is PUBLIC (it appears in every authorize URL the browser
// sees), so it is a client-safe EXPO_PUBLIC value. The Naver `client_secret` is
// NEVER here and NEVER in the client bundle — it lives ONLY as an Edge secret.
export const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize';

// Edge Function that performs the code exchange + Supabase session mint.
export const NAVER_AUTH_FUNCTION = 'naver-auth';

export function getNaverClientId(): string {
  return (process.env.EXPO_PUBLIC_NAVER_CLIENT_ID ?? '').trim();
}

// Whether the client has enough config to START Naver login (client_id present).
// When false, the app reports AUTH_CONFIG_REQUIRED rather than opening a broken flow.
export function isNaverLoginConfigured(): boolean {
  return getNaverClientId().length > 0;
}
