import { useRouter } from 'expo-router';
import { useState } from 'react';

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
import { consumePendingShareToken } from '@/features/chat/report/pendingSharedReport';
import { consumePendingReturnTo } from '@/features/consultation';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider, isSigningIn } = useAuth();

  const [errorText, setErrorText] = useState<string | null>(null);

  const handleLogin = async (providerId: AuthProviderId) => {
    setErrorText(null);

    const result = await signInWithProvider(providerId);

    if (result.success) {
      // A recipient interrupted while opening a shared report resumes there (§24). The token rides an
      // ephemeral client store (never `returnTo`), is shape-validated, and only fills the dynamic route
      // param — so there is no open-redirect surface.
      const shareToken = consumePendingShareToken();
      if (shareToken) {
        router.replace({ pathname: '/shared-report/[token]', params: { token: shareToken } });
        return;
      }
      // Authentication is an interruption, not a reset (§9): resume the consultation
      // the user was in, not always Home. returnTo is a pre-validated internal route
      // (open-redirect-safe, §12/§52); default Home when there is nothing to resume.
      const returnTo = consumePendingReturnTo();
      router.replace(returnTo ?? '/');
      return;
    }

    // Surface the SPECIFIC outcome (config required / account conflict / session
    // failed / provider error) instead of one generic line — so a real failure is
    // actionable, not a dead end. A cancelled login (incl. double-tap) is silent.
    const outcome = authReasonToOutcome(result.reason);
    authDiag({ provider: providerId as 'naver' | 'kakao' | 'google' | 'apple', stage: 'outcome', code: outcome });
    if (isSilentOutcome(outcome)) {
      return;
    }
    setErrorText(authOutcomeMessage(outcome));
  };

  return (
    <Screen frame>
      <Stack style={{ flex: 1, paddingTop: 24 }} align="center" justify="center" gap="lg">
        <Stack gap="xs" align="center">
          <Text variant="headingLarge">덕분AI</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            로그인하고 AI 상담을 시작해 보세요.
          </Text>
        </Stack>

        <Button
          label="카카오로 시작하기"
          onPress={() => handleLogin('kakao')}
          disabled={isSigningIn}
        />

        <Button
          label="Google로 시작하기"
          onPress={() => handleLogin('google')}
          disabled={isSigningIn}
        />

        {/* Naver login — reuses the existing Button + generic handler (no custom
            styling yet). Official green Naver branding is a follow-up in
            docs/NAVER_LOGIN_UI_HANDOFF.md. */}
        <Button
          label="네이버로 시작하기"
          onPress={() => handleLogin('naver')}
          disabled={isSigningIn}
        />

        {errorText ? (
          <Text variant="bodySmall" colorToken="danger">
            {errorText}
          </Text>
        ) : null}
      </Stack>
    </Screen>
  );
}
