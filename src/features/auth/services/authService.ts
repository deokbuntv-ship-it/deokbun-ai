import type { Provider } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { signInWithAppleNative } from '@/features/auth/apple/appleAuthService';
import { signInWithNaverBridge } from '@/features/auth/naver/naverAuthService';
import {
	LOGIN_CALLBACK_PATH,
	resolveConfiguredWebRedirect,
} from '@/features/auth/services/authRedirect';
import { resolveSupabaseProvider } from '@/features/auth/services/authProviders';
import type { AuthFailureReason } from '@/features/auth/errors/authErrors';
import type { AuthProviderId } from '@/features/auth/types/auth';
import { getPublicBaseUrl } from '@/features/publicSite/publicUrl';
import { getSupabaseClient } from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

export type AuthActionResult =
	| {
			success: true;
		}
	| {
			success: false;
			reason: AuthFailureReason;
		};

async function signInWithSupabaseOAuth(
	provider: Provider,
): Promise<AuthActionResult> {
	const supabase = getSupabaseClient();
	// Production hardening: on web with a configured canonical origin
	// (EXPO_PUBLIC_PUBLIC_BASE_URL), PIN redirect_to to `${base}/login-callback` so Supabase's
	// callback never falls back to the dashboard Site URL (localhost). Native + local dev use
	// expo makeRedirectUri (app scheme / actual dev origin). See authRedirect.ts.
	const redirectTo =
		resolveConfiguredWebRedirect(getPublicBaseUrl(), Platform.OS === 'web') ??
		makeRedirectUri({ path: LOGIN_CALLBACK_PATH });

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo,
			skipBrowserRedirect: true,
		},
	});

	if (error || !data?.url) {
		return { success: false, reason: 'OAUTH_URL_MISSING' };
	}

	const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

	if (result.type === 'cancel' || result.type === 'dismiss') {
		return { success: false, reason: 'CANCELLED' };
	}

	if (result.type !== 'success' || !result.url) {
		return { success: false, reason: 'REQUEST_FAILED' };
	}

	const { params, errorCode } = QueryParams.getQueryParams(result.url);

	if (errorCode) {
		return { success: false, reason: 'REQUEST_FAILED' };
	}

	const { access_token: accessToken, refresh_token: refreshToken } = params;

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

async function signInWithProvider(
	providerId: AuthProviderId,
): Promise<AuthActionResult> {
	// naver → trusted edge bridge (Naver is not a Supabase provider; see
	// naver/naverAuthService). kakao/google/apple → built-in Supabase providers via
	// the shared signInWithOAuth flow below.
	if (providerId === 'naver') {
		return signInWithNaverBridge();
	}

	// apple (2026-09-02): try the iOS SYSTEM sheet first, then fall through to the shared
	// browser flow. `not_available` is NOT a failure — it is web, Android, or an iOS build
	// without the native module, all of which the Supabase provider path below handles.
	// A real native outcome (including a user cancel) is returned as-is and never silently
	// retried in a browser: re-opening a web sheet right after someone dismissed the system
	// one would be the wrong answer to "cancel".
	if (providerId === 'apple') {
		const native = await signInWithAppleNative();
		if (native.kind === 'success') {
			return { success: true };
		}
		if (native.kind === 'failed') {
			return { success: false, reason: native.reason };
		}
	}

	const resolution = resolveSupabaseProvider(providerId);

	if (!resolution.supported) {
		return { success: false, reason: 'NOT_SUPPORTED' };
	}

	return signInWithSupabaseOAuth(resolution.supabaseProvider);
}

async function signOut(): Promise<void> {
	const supabase = getSupabaseClient();
	await supabase.auth.signOut();
}

export const authService = {
	signInWithProvider,
	signOut,
};

