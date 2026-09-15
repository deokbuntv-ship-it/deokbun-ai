// APPLE SIGN-IN — the NATIVE path (iOS). The browser/OAuth path is the shared Supabase-provider flow in
// `authService.ts`; this module is only the iOS-native leg and it says NOT_AVAILABLE whenever it cannot run,
// so the caller can fall through without a user-visible failure.
//
// WHY TWO PATHS AT ALL (decision recorded 2026-09-02):
//   · On iOS, Sign in with Apple is expected to be the SYSTEM sheet, not a web view. `signInWithOAuth`
//     technically works there, but it opens a browser — a materially worse experience on the one platform
//     where Apple's own control exists.
//   · Everywhere else (web, Android, and iOS before a dev/EAS build), the Supabase provider flow is the ONLY
//     option and is also what makes the account PORTABLE: someone who signs up with Apple on iOS must be
//     able to log in to the same account on the web. Both legs land on the same Supabase identity
//     (provider `apple`, same `sub`), so they are one account, not two.
//
// The native module is loaded LAZILY and never statically imported — the same technique
// `duk/iap/reactNativeIapAdapter.ts` uses, and for the same reasons: the node test suite and `tsc` stay
// independent of a native module, and a missing module degrades instead of crashing.
import { Platform } from 'react-native';

import {
  formatAppleFullName, mapAppleErrorToReason, readIdentityToken, shouldPersistAppleName,
  type AppleCredentialLike,
} from '@/features/auth/apple/appleIdentity';
import type { AuthFailureReason } from '@/features/auth/errors/authErrors';
import { getSupabaseClient } from '@/services/supabase';

/** NOT_AVAILABLE is not a failure — it means "use the browser path instead" and is never shown to a user. */
export type AppleNativeResult =
  | { kind: 'success' }
  | { kind: 'failed'; reason: AuthFailureReason }
  | { kind: 'not_available' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppleModule = any;
let cached: AppleModule | null | undefined;

function loadApple(): AppleModule | null {
  if (cached !== undefined) return cached;
  try {
    // Lazy require — absent on web/Android bundles and before a dev build. Not a static import.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    cached = require('expo-apple-authentication');
  } catch {
    cached = null;
  }
  return cached;
}

/** iOS only, and only when the system actually offers Sign in with Apple (device/OS support). */
export async function isAppleNativeAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  const A = loadApple();
  if (!A?.isAvailableAsync) return false;
  try { return Boolean(await A.isAvailableAsync()); } catch { return false; }
}

/**
 * The native sheet → a Supabase session.
 *
 * `signInWithIdToken({ provider: 'apple' })` verifies Apple's ID token server-side and creates or matches the
 * user from its claims — including the email, whether real or a `@privaterelay.appleid.com` relay. Nothing
 * here fabricates an email and nothing rejects a relay one.
 */
export async function signInWithAppleNative(): Promise<AppleNativeResult> {
  if (!(await isAppleNativeAvailable())) return { kind: 'not_available' };
  const A = loadApple();
  if (!A) return { kind: 'not_available' };

  let credential: AppleCredentialLike;
  try {
    credential = await A.signInAsync({
      requestedScopes: [A.AppleAuthenticationScope.FULL_NAME, A.AppleAuthenticationScope.EMAIL],
    });
  } catch (e) {
    return { kind: 'failed', reason: mapAppleErrorToReason((e as { code?: unknown })?.code) };
  }

  const token = readIdentityToken(credential);
  if (!token) return { kind: 'failed', reason: 'SESSION_MISSING' };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token });
  if (error || !data?.session) return { kind: 'failed', reason: 'SESSION_MISSING' };

  // Apple returns the name ONLY on the first authorization. Capture it now or never — but never over an
  // existing one (see shouldPersistAppleName). Best-effort: a failure here must not fail the login.
  const appleName = formatAppleFullName(credential.fullName ?? null);
  const existing = (data.user?.user_metadata ?? {}) as { full_name?: unknown; name?: unknown };
  const existingName = typeof existing.full_name === 'string' ? existing.full_name
    : typeof existing.name === 'string' ? existing.name : null;
  if (shouldPersistAppleName(existingName, appleName)) {
    try { await supabase.auth.updateUser({ data: { full_name: appleName } }); } catch { /* non-fatal */ }
  }

  return { kind: 'success' };
}
