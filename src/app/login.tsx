import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth, type AuthProviderId } from '@/features/auth';
import { authDiag } from '@/features/auth/authDiag';
import {
  authOutcomeMessage,
  authReasonToOutcome,
  isSilentOutcome,
} from '@/features/auth/errors/authErrors';
import { trackOnboardingEvent } from '@/features/onboarding/onboardingAnalytics';

// Signup-first ENTRY (§9/§10/§12). Brand + a short value proposition + social CTAs. Social auth is BOTH
// login and signup — the user never has to pick "로그인 vs 회원가입" up front; new-vs-existing is resolved
// after auth by the onboarding resolver. On success we ALWAYS route to /onboarding (never straight to Home
// or a shared report): the resolver decides the next step and is the single consumer of any continuation.
export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider, isSigningIn } = useAuth();

  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    void trackOnboardingEvent('login_entry_viewed');
  }, []);

  const handleLogin = async (providerId: AuthProviderId) => {
    setErrorText(null);
    void trackOnboardingEvent('oauth_started', { provider: providerId });

    const result = await signInWithProvider(providerId);

    if (result.success) {
      void trackOnboardingEvent('oauth_succeeded', { provider: providerId });
      // The resolver reads onboarding state and forwards: existing-complete → destination, new/incomplete →
      // the missing step. Any pending shared-report token / returnTo survives in its ephemeral store and is
      // consumed ONLY there, after onboarding completes (§13/§47/§49) — never here.
      router.replace('/onboarding');
      return;
    }

    // Surface the SPECIFIC outcome (config required / account conflict / session failed / provider error)
    // instead of one generic line. A cancelled login (incl. double-tap) is silent.
    const outcome = authReasonToOutcome(result.reason);
    authDiag({ provider: providerId as 'naver' | 'kakao' | 'google' | 'apple', stage: 'outcome', code: outcome });
    if (isSilentOutcome(outcome)) {
      return;
    }
    void trackOnboardingEvent('oauth_failed', { provider: providerId });
    setErrorText(authOutcomeMessage(outcome));
  };

  return (
    <Screen frame>
      <Stack style={{ flex: 1, paddingTop: 24 }} align="center" justify="center" gap="xl">
        <Stack gap="sm" align="center">
          <Text variant="displayMedium">덕분이</Text>
          <Text variant="bodyLarge" colorToken="textSecondary" style={{ textAlign: 'center' }}>
            내 사주를 기반으로{'\n'}지금 필요한 답을 찾아주는{'\n'}AI 운세 상담
          </Text>
        </Stack>

        <Stack gap="sm" align="stretch" style={{ width: '100%', maxWidth: 360 }}>
          <Button label="카카오로 계속하기" onPress={() => handleLogin('kakao')} disabled={isSigningIn} />
          <Button label="네이버로 계속하기" onPress={() => handleLogin('naver')} disabled={isSigningIn} />
          <Button label="Google로 계속하기" onPress={() => handleLogin('google')} disabled={isSigningIn} />

          {errorText ? (
            <Text variant="bodySmall" colorToken="danger" style={{ textAlign: 'center' }}>
              {errorText}
            </Text>
          ) : null}
        </Stack>

        <Text variant="caption" colorToken="textSecondary" style={{ textAlign: 'center' }}>
          계속하면 서비스 이용약관과 개인정보 처리방침에 동의하는 절차가 진행돼요.
        </Text>
      </Stack>
    </Screen>
  );
}
