import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';

// Provider-neutral OAuth return route (google / kakao / naver share it).
//
// WEB (static export): the OAuth popup returns here; `maybeCompleteAuthSession()` completes the session and
// closes the popup, handing the result URL to the opener window, which performs the token parse + setSession.
// This route NEVER parses tokens, reads credentials, or logs anything — it only completes + waits.
//
// NATIVE: the deep-link return (`deokbunai://login-callback`) is intercepted by openAuthSessionAsync and this
// screen is never mounted.
//
// On a direct / full-page landing we forward to the onboarding RESOLVER once authenticated (it owns member
// resolution + continuation), or back to /login otherwise. No token is placed in or read from storage here.
WebBrowser.maybeCompleteAuthSession();

export default function LoginCallbackScreen() {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.status === 'authenticated') {
      // Single hub: the resolver decides new-vs-existing and consumes any pending continuation (§13).
      router.replace('/onboarding');
      return;
    }
    if (authState.status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    // 'loading' → wait; in the web popup flow this window closes before this resolves.
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
