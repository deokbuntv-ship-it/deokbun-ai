import type { AuthProviderId } from '@/features/auth/types/auth';

// Maps kakao/google/apple to their BUILT-IN Supabase providers for the shared
// signInWithOAuth flow. PURE + deterministic (unit-testable).
//
// Naver is intentionally NOT here: it is not a Supabase provider (Supabase's custom
// OAuth2 reads identity from the top level of the userinfo JSON, but Naver nests it
// under `response.id`, so it cannot be consumed directly — verified). Naver login is
// handled by the trusted edge bridge (naver/naverAuthService). See docs/NAVER_LOGIN_ARCHITECTURE.md.
//
// APPLE (2026-09-02) IS a Supabase provider and resolves here — this is the BROWSER leg, used on web,
// on Android, and on iOS whenever the native sheet is unavailable. iOS prefers the native sheet first
// (auth/apple/appleAuthService.ts) and falls back to THIS resolution; both land on the same Supabase
// identity, so an Apple account created on iOS logs in on the web too.
//
// The DeokbunAI user id is ALWAYS Supabase auth.users.id regardless of provider.
export type SupabaseProviderResolution =
  | { supported: true; supabaseProvider: 'kakao' | 'google' | 'apple' }
  | { supported: false };

export function resolveSupabaseProvider(
  providerId: AuthProviderId,
): SupabaseProviderResolution {
  switch (providerId) {
    case 'kakao':
      return { supported: true, supabaseProvider: 'kakao' };
    case 'google':
      return { supported: true, supabaseProvider: 'google' };
    case 'apple':
      return { supported: true, supabaseProvider: 'apple' };
    default:
      // naver → edge bridge (handled in authService). No other provider exists.
      return { supported: false };
  }
}
