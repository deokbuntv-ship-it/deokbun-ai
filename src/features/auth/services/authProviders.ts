import type { AuthProviderId } from '@/features/auth/types/auth';

// Maps kakao/google to their BUILT-IN Supabase providers for the shared
// signInWithOAuth flow. PURE + deterministic (unit-testable).
//
// Naver is intentionally NOT here: it is not a Supabase provider (Supabase's custom
// OAuth2 reads identity from the top level of the userinfo JSON, but Naver nests it
// under `response.id`, so it cannot be consumed directly — verified). Naver login is
// handled by the trusted edge bridge (naver/naverAuthService). apple is declared in
// AuthProviderId but not enabled yet. See docs/NAVER_LOGIN_ARCHITECTURE.md.
//
// The DeokbunAI user id is ALWAYS Supabase auth.users.id regardless of provider.
export type SupabaseProviderResolution =
  | { supported: true; supabaseProvider: 'kakao' | 'google' }
  | { supported: false };

export function resolveSupabaseProvider(
  providerId: AuthProviderId,
): SupabaseProviderResolution {
  switch (providerId) {
    case 'kakao':
      return { supported: true, supabaseProvider: 'kakao' };
    case 'google':
      return { supported: true, supabaseProvider: 'google' };
    default:
      // naver → edge bridge (handled in authService); apple → not enabled.
      return { supported: false };
  }
}
