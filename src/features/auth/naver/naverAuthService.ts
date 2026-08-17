import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { newRequestId } from '@/features/analysis';
import { authDiag, type AuthDiagStage } from '@/features/auth/authDiag';
import type { AuthFailureReason } from '@/features/auth/errors/authErrors';
import {
  LOGIN_CALLBACK_PATH,
  resolveConfiguredWebRedirect,
} from '@/features/auth/services/authRedirect';
import type { AuthActionResult } from '@/features/auth/services/authService';
import { getPublicBaseUrl } from '@/features/publicSite/publicUrl';
import { getSupabaseClient } from '@/services/supabase';

import {
  NAVER_AUTH_FUNCTION,
  getNaverClientId,
} from './naverConfig';
import { buildNaverAuthorizeUrl, parseNaverCallback, statesMatch } from './naverOAuth';

// Naver login CLIENT flow (PATH B — trusted edge bridge). Naver is not a Supabase
// provider, so the client: opens Naver authorize (public client_id + CSRF state),
// parses code+state on return, validates the state, then hands code+state to the
// `naver-auth` Edge Function which holds the client_secret + service_role and mints
// a real Supabase session. The client only ever sees Supabase tokens.
//
// SECURITY: never logs the Naver code, the Naver token, or the Supabase tokens;
// never handles the Naver client_secret; only redirects to the app's own
// redirect target (no attacker-controlled redirect). Google/Kakao are untouched.
//
// WEB REDIRECT PINNING (Overnight Sprint §1): the web redirect_uri is now resolved
// with the SAME canonical-origin pinning as google/kakao (authService →
// resolveConfiguredWebRedirect) instead of a bare makeRedirectUri. On web this pins
// to `${EXPO_PUBLIC_PUBLIC_BASE_URL}/login-callback` so the value is deterministic
// and matches the one URL registered in the Naver console — apex/www/preview-origin
// drift was a probable production failure cause. Native falls through to the app
// scheme (deokbunai://login-callback) exactly as before.
export async function signInWithNaverBridge(): Promise<AuthActionResult> {
  const requestId = newRequestId();
  // One correlation id per attempt; every failure emits a SAFE stage breadcrumb
  // (no token/code/URL/PII — see authDiag) so a production failure is attributable.
  const fail = (stage: AuthDiagStage, reason: AuthFailureReason): AuthActionResult => {
    authDiag({ provider: 'naver', stage, code: reason, requestId });
    return { success: false, reason };
  };

  const clientId = getNaverClientId();
  if (!clientId) {
    // Not configured yet (no EXPO_PUBLIC_NAVER_CLIENT_ID) → AUTH_CONFIG_REQUIRED.
    return fail('authorize', 'OAUTH_URL_MISSING');
  }

  const supabase = getSupabaseClient();
  const redirectTo =
    resolveConfiguredWebRedirect(getPublicBaseUrl(), Platform.OS === 'web') ??
    makeRedirectUri({ path: LOGIN_CALLBACK_PATH });
  const state = Crypto.randomUUID();

  const authorizeUrl = buildNaverAuthorizeUrl({ clientId, redirectUri: redirectTo, state });
  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return fail('authorize', 'CANCELLED');
  }
  if (result.type !== 'success' || !result.url) {
    return fail('authorize', 'REQUEST_FAILED');
  }

  const callback = parseNaverCallback(result.url);
  if (!callback.ok) {
    // User denied → treat as cancelled; otherwise a malformed callback.
    return fail(
      'callback_parse',
      callback.reason === 'DENIED' ? 'CANCELLED' : 'REQUEST_FAILED',
    );
  }
  // CSRF: the returned state MUST equal the one we generated for this attempt.
  if (!statesMatch(callback.state, state)) {
    return fail('state_validate', 'REQUEST_FAILED');
  }

  // Trusted exchange: the edge validates + exchanges the code, fetches the profile,
  // find-or-creates the Supabase user, and returns Supabase session tokens.
  let tokens: { access_token?: unknown; refresh_token?: unknown } | null = null;
  try {
    const { data, error } = await supabase.functions.invoke(NAVER_AUTH_FUNCTION, {
      body: { code: callback.code, state: callback.state, redirectUri: redirectTo },
    });
    if (error || !data) {
      return fail('edge_invoke', 'REQUEST_FAILED');
    }
    tokens = data as { access_token?: unknown; refresh_token?: unknown };
  } catch {
    return fail('edge_invoke', 'REQUEST_FAILED');
  }

  const accessToken =
    typeof tokens.access_token === 'string' ? tokens.access_token : '';
  const refreshToken =
    typeof tokens.refresh_token === 'string' ? tokens.refresh_token : '';
  if (!accessToken || !refreshToken) {
    return fail('session_set', 'SESSION_MISSING');
  }

  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (setSessionError) {
    return fail('session_set', 'REQUEST_FAILED');
  }

  return { success: true };
}
