import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SocialButton } from '@/components/SocialButton';
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

// Signup-first ENTRY (§10/§11). Brand + a short value proposition + provider-distinct social CTAs anchored low
// (thumb reach). Social auth is BOTH login and signup — no "로그인 vs 회원가입" choice up front; new-vs-existing
// is resolved after auth by the onboarding resolver. On success we ALWAYS route to /onboarding (never straight
// to Home or a shared report): the resolver decides the next step and is the single consumer of any continuation.
export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider, isSigningIn } = useAuth();

  const [errorText, setErrorText] = useState<string | null>(null);
  const [pending, setPending] = useState<AuthProviderId | null>(null);

  useEffect(() => {
    void trackOnboardingEvent('login_entry_viewed');
  }, []);

  const handleLogin = async (providerId: AuthProviderId) => {
    setErrorText(null);
    setPending(providerId);
    void trackOnboardingEvent('oauth_started', { provider: providerId });

    const result = await signInWithProvider(providerId);

    if (result.success) {
      void trackOnboardingEvent('oauth_succeeded', { provider: providerId });
      // The resolver reads onboarding state and forwards: existing-complete → destination, new/incomplete →
      // the missing step. Any pending shared-report token / returnTo survives in its ephemeral store and is
      // consumed ONLY there, after onboarding completes — never here.
      router.replace('/onboarding');
      return;
    }

    setPending(null);
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
      <View style={{ flex: 1, paddingHorizontal: 28, width: '100%', maxWidth: 420, alignSelf: 'center' }}>
        {/* Brand + value prop in the upper region — understandable within ~3s (§11). Generous warm-white space. */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Stack gap="md" align="center">
            {/* Brand mark slot. assets/images holds only the Expo default icon, so the wordmark IS the
                mark for now; a real logo drops into this 64px slot with no layout change. */}
            <View style={styles.markSlot}>
              <Text style={styles.markGlyph}>🕯️</Text>
            </View>
            <Text variant="displayLarge">덕분이</Text>
            <Text variant="bodyLarge" colorToken="textSecondary" style={styles.valueProp}>
              태어난 순간의 기운으로{'\n'}오늘의 흐름과 관계를 읽어드려요.
            </Text>
          </Stack>
        </View>

        {/* Social CTAs anchored low (thumb reach, §38). Each provider keeps its own signature — never orange. */}
        <Stack gap="sm" style={{ paddingBottom: 12 }}>
          <SocialButton provider="kakao" onPress={() => handleLogin('kakao')} disabled={isSigningIn} loading={pending === 'kakao'} />
          <SocialButton provider="naver" onPress={() => handleLogin('naver')} disabled={isSigningIn} loading={pending === 'naver'} />
          <SocialButton provider="google" onPress={() => handleLogin('google')} disabled={isSigningIn} loading={pending === 'google'} />

          {errorText ? (
            <Text variant="bodySmall" colorToken="danger" style={{ textAlign: 'center', paddingTop: 4 }}>
              {errorText}
            </Text>
          ) : null}

          <Text variant="caption" colorToken="textMuted" style={{ textAlign: 'center', paddingTop: 8, lineHeight: 17 }}>
            계속하면 서비스 이용약관과 개인정보 처리방침에 동의하는 절차가 진행돼요.
          </Text>
          {/* C22 — the AI notice is one quiet line, never a warning box. */}
          <Text variant="caption" colorToken="textMuted" style={{ textAlign: 'center', lineHeight: 17 }}>
            덕분이의 해석은 AI가 생성하며 참고용이에요.
          </Text>
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  markSlot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF3D7', // surface.butter — the login screen renders before any theme branch matters
  },
  markGlyph: { fontSize: 30, lineHeight: 38 },
  valueProp: { textAlign: 'center' },
});
