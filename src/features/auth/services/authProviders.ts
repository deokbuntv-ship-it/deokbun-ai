import type { Provider } from '@supabase/supabase-js';

import type { AuthProviderId } from '@/features/auth/types/auth';

// Maps the app's AuthProviderId to the Supabase provider it signs in through.
// PURE + deterministic (no I/O) so it is unit-testable.
//
// - kakao / google → Supabase BUILT-IN social providers (unchanged behaviour).
// - naver          → Supabase's official **Custom OAuth provider** feature. Naver
//                    is NOT a built-in provider and is not OIDC-standard, so it is
//                    configured in the Supabase Dashboard as a custom OAuth2
//                    provider and invoked as `custom:<slug>`. This keeps Naver on
//                    the SAME client flow as kakao/google (signInWithOAuth →
//                    WebBrowser → setSession) with NO client-side secret handling —
//                    Naver's client_id/secret live in the Supabase Dashboard.
//                    See docs/NAVER_LOGIN_ARCHITECTURE.md.
// - apple          → declared in AuthProviderId but not enabled here yet.
//
// The DeokbunAI user id is ALWAYS Supabase auth.users.id regardless of provider;
// the Naver provider id is only identity/app_metadata, never the app's user id.

// Default custom-provider slug configured in the Supabase Dashboard. Overridable
// (non-secret, client-safe) for projects that named the custom provider
// differently. Must keep the `custom:` prefix — enforced below.
export const NAVER_CUSTOM_PROVIDER_DEFAULT: `custom:${string}` = 'custom:naver';

export function naverCustomProvider(): Provider {
  const override = (process.env.EXPO_PUBLIC_NAVER_SUPABASE_PROVIDER ?? '').trim();
  if (override.length === 0) {
    return NAVER_CUSTOM_PROVIDER_DEFAULT;
  }
  // Enforce the `custom:` prefix so a misconfigured env can never accidentally
  // point Naver at a built-in provider.
  const slug = override.startsWith('custom:') ? override : `custom:${override}`;
  return slug as Provider;
}

export type SupabaseProviderResolution =
  | { supported: true; supabaseProvider: Provider }
  | { supported: false };

export function resolveSupabaseProvider(
  providerId: AuthProviderId,
): SupabaseProviderResolution {
  switch (providerId) {
    case 'kakao':
      return { supported: true, supabaseProvider: 'kakao' };
    case 'google':
      return { supported: true, supabaseProvider: 'google' };
    case 'naver':
      return { supported: true, supabaseProvider: naverCustomProvider() };
    default:
      // apple (declared but not enabled) and any future/unknown id.
      return { supported: false };
  }
}
