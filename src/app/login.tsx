import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth, type AuthProviderId } from '@/features/auth';
import { consumePendingReturnTo } from '@/features/consultation';

const SIGN_IN_FAILED_MESSAGE = '로그인에 실패했습니다. 다시 시도해 주세요.';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider, isSigningIn } = useAuth();

  const [errorText, setErrorText] = useState<string | null>(null);

  const handleLogin = async (providerId: AuthProviderId) => {
    setErrorText(null);

    const success = await signInWithProvider(providerId);

    if (success) {
      // Authentication is an interruption, not a reset (§9): resume the consultation
      // the user was in, not always Home. returnTo is a pre-validated internal route
      // (open-redirect-safe, §12/§52); default Home when there is nothing to resume.
      const returnTo = consumePendingReturnTo();
      router.replace(returnTo ?? '/');
      return;
    }

    setErrorText(SIGN_IN_FAILED_MESSAGE);
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
