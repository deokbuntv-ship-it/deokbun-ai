import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import { resolveOAuthReturn } from '@/features/auth/services/oauthReturn';
import { peekPendingConsultationIntent } from '@/features/consultation';

// Provider-neutral OAuth return route (google / kakao / naver all share it).
//
// WEB (static export): the OAuth popup returns to `/login-callback`;
// `maybeCompleteAuthSession()` completes the auth session and closes the popup,
// handing the result URL back to the opener window, which performs the token parse
// + `setSession` (features/auth/services/authService). This route therefore NEVER
// parses tokens, reads credentials, or logs anything — it only completes + waits.
//
// NATIVE: the deep-link return (`deokbunai://login-callback`) is intercepted by
// `WebBrowser.openAuthSessionAsync` and this screen is never mounted — native
// login is unaffected by this file.
//
// Direct / full-page landings fall through to a safe redirect once auth state
// resolves (authenticated → home, otherwise → login). No token is ever placed in
// or read from long-term storage here.
WebBrowser.maybeCompleteAuthSession();

export default function LoginCallbackScreen() {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    // Peek (do not consume) the resume route so the opener window (login.tsx) remains
    // the single consumer in the popup flow; this only matters on a direct/full-page
    // landing where this route IS the main window.
    const returnTo = peekPendingConsultationIntent()?.returnTo;
    const destination = resolveOAuthReturn(authState.status, returnTo);
    if (destination !== null) {
      router.replace(destination);
    }
    // null ('loading') → wait; in the web popup flow this window closes first.
  }, [authState.status, router]);

  return (
    <Screen frame>
      <Stack style={{ flex: 1 }} align="center" justify="center">
        <Text variant="bodyMedium" colorToken="textSecondary">
          로그인 처리 중입니다…
        </Text>
      </Stack>
    </Screen>
  );
}
