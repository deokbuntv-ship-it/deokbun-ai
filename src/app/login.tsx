import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SocialButton } from '@/components/SocialButton';
import { colors } from '@/theme';
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
/**
 * Apple button placement (2026-09-02, when Apple became a V1 requirement).
 *
 * SHOWN ON EVERY PLATFORM, not iOS-only. The reason is account portability, not parity for its own sake:
 * someone who signs up with Apple on an iPhone must be able to log in to the SAME account from the web.
 * Hiding the button off iOS would strand those accounts. iOS uses the system sheet; web and Android use
 * the Supabase provider flow — both land on the same Supabase identity, so it is one account.
 *
 * FIRST ON iOS, LAST ELSEWHERE. Apple's platform guidance is that Sign in with Apple appears at least as
 * prominently as the other options, and "first" is the unambiguous reading of that. Off iOS that guidance
 * does not apply and the Korean-market order (Kakao first) is the better one.
 * ⚠ The exact placement requirement is a store-policy question this repository cannot verify — flagged for
 * owner confirmation. Changing it is a one-line edit here.
 */
const APPLE_FIRST_ON_IOS = Platform.OS === 'ios';

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
          {/* Apple first on iOS (see APPLE_FIRST_ON_IOS). Written out per provider rather than mapped over
              an array so the existing source-level regression locks keep working and each provider's
              wiring stays greppable. */}
          {APPLE_FIRST_ON_IOS ? (
            <SocialButton provider="apple" onPress={() => handleLogin('apple')} disabled={isSigningIn} loading={pending === 'apple'} />
          ) : null}
          <SocialButton provider="kakao" onPress={() => handleLogin('kakao')} disabled={isSigningIn} loading={pending === 'kakao'} />
          <SocialButton provider="naver" onPress={() => handleLogin('naver')} disabled={isSigningIn} loading={pending === 'naver'} />
          <SocialButton provider="google" onPress={() => handleLogin('google')} disabled={isSigningIn} loading={pending === 'google'} />
          {APPLE_FIRST_ON_IOS ? null : (
            <SocialButton provider="apple" onPress={() => handleLogin('apple')} disabled={isSigningIn} loading={pending === 'apple'} />
          )}

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
    // surface.butter. 로그인 화면은 테마 분기 전에 그려지므로 **의도적으로 라이트 값 고정**이다
    // (2026-09-06: 같은 값을 하드코딩하던 것을 토큰 참조로 바꿨다 — 시각 변화 0).
    backgroundColor: colors.light.surfaceButter,
  },
  markGlyph: { fontSize: 30, lineHeight: 38 },
  valueProp: { textAlign: 'center' },
});
