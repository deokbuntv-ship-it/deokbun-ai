import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import type { AuthActionResult } from '@/features/auth/services/authService';
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
// makeRedirectUri target (no attacker-controlled redirect). Google/Kakao are
// untouched (they keep the built-in signInWithOAuth flow in authService).
export async function signInWithNaverBridge(): Promise<AuthActionResult> {
  const clientId = getNaverClientId();
  if (!clientId) {
    // Not configured yet (no EXPO_PUBLIC_NAVER_CLIENT_ID) → AUTH_CONFIG_REQUIRED.
    return { success: false, reason: 'OAUTH_URL_MISSING' };
  }

  const supabase = getSupabaseClient();
  const redirectTo = makeRedirectUri({ path: 'login-callback' });
  const state = Crypto.randomUUID();

  const authorizeUrl = buildNaverAuthorizeUrl({ clientId, redirectUri: redirectTo, state });
  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { success: false, reason: 'CANCELLED' };
  }
  if (result.type !== 'success' || !result.url) {
    return { success: false, reason: 'REQUEST_FAILED' };
  }

  const callback = parseNaverCallback(result.url);
  if (!callback.ok) {
    // User denied → treat as cancelled; otherwise a malformed callback.
    return {
      success: false,
      reason: callback.reason === 'DENIED' ? 'CANCELLED' : 'REQUEST_FAILED',
    };
  }
  // CSRF: the returned state MUST equal the one we generated for this attempt.
  if (!statesMatch(callback.state, state)) {
    return { success: false, reason: 'REQUEST_FAILED' };
  }

  // Trusted exchange: the edge validates + exchanges the code, fetches the profile,
  // find-or-creates the Supabase user, and returns Supabase session tokens.
  let tokens: { access_token?: unknown; refresh_token?: unknown } | null = null;
  try {
    const { data, error } = await supabase.functions.invoke(NAVER_AUTH_FUNCTION, {
      body: { code: callback.code, state: callback.state, redirectUri: redirectTo },
    });
    if (error || !data) {
      return { success: false, reason: 'REQUEST_FAILED' };
    }
    tokens = data as { access_token?: unknown; refresh_token?: unknown };
  } catch {
    return { success: false, reason: 'REQUEST_FAILED' };
  }

  const accessToken =
    typeof tokens.access_token === 'string' ? tokens.access_token : '';
  const refreshToken =
    typeof tokens.refresh_token === 'string' ? tokens.refresh_token : '';
  if (!accessToken || !refreshToken) {
    return { success: false, reason: 'SESSION_MISSING' };
  }

  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (setSessionError) {
    return { success: false, reason: 'REQUEST_FAILED' };
  }

  return { success: true };
}
