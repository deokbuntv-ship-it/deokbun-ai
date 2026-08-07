import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import type { AuthProviderId } from '@/features/auth/types/auth';
import { getSupabaseClient } from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

export type AuthActionResult =
	| {
			success: true;
		}
	| {
			success: false;
			reason:
				| 'CANCELLED'
				| 'NOT_SUPPORTED'
				| 'OAUTH_URL_MISSING'
				| 'SESSION_MISSING'
				| 'REQUEST_FAILED';
		};

type SupabaseOAuthProvider = 'kakao' | 'google';

async function signInWithSupabaseOAuth(
	provider: SupabaseOAuthProvider,
): Promise<AuthActionResult> {
	const supabase = getSupabaseClient();
	const redirectTo = makeRedirectUri({ path: 'login-callback' });

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
	if (providerId === 'kakao' || providerId === 'google') {
		return signInWithSupabaseOAuth(providerId);
	}

	return { success: false, reason: 'NOT_SUPPORTED' };
}

async function signOut(): Promise<void> {
	const supabase = getSupabaseClient();
	await supabase.auth.signOut();
}

export const authService = {
	signInWithProvider,
	signOut,
};

