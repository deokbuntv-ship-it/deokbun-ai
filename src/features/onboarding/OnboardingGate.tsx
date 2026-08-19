import { Redirect, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { isSafeReturnTo, setPendingConsultationIntent } from '@/features/consultation';
import { classifyConsumerPath, resolveGateDecision } from '@/features/onboarding/entryRouting';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import type { OnboardingState } from '@/features/onboarding/onboardingState';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Small branded hold shown while auth/onboarding state resolves — never a blank white page, never a flash of
// Home/Chat (§8/§56/§57). On a recoverable facts ERROR it offers a retry instead of spinning forever (§6/§61).
// Deterministic first paint (no time-of-day text) so the web static export hydrates.
function OnboardingHold({ state, onRetry }: { state: OnboardingState; onRetry: () => void }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <Screen frame>
      <View style={styles.center}>
        <Stack gap="md" align="center">
          <Text variant="headingLarge">덕분AI</Text>
          {state === 'ERROR' ? (
            <Stack gap="sm" align="center">
              <Text variant="bodyMedium" colorToken="textSecondary">
                정보를 불러오지 못했어요. 다시 시도해 주세요.
              </Text>
              <Button label="다시 시도" variant="secondary" onPress={onRetry} />
            </Stack>
          ) : (
            <ActivityIndicator color={theme.primary} />
          )}
        </Stack>
      </View>
    </Screen>
  );
}

// The ONE centralized gate (§7). Wraps the whole navigator: it reads the shared onboarding state + the
// current path and either renders the app, holds on a branded loader, or declaratively redirects to the
// right step. Declarative <Redirect> (not an effect) so it fires on a fresh/incognito web load too.
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { state, reload } = useOnboarding();
  const pathname = usePathname();

  // Preserve deep-link intent: when an anonymous user is bounced off a gated route, remember where they were
  // headed — SAFE allowlist only, ephemeral, never a URL param — so onboarding returns them there (§53).
  useEffect(() => {
    if (state === 'ANONYMOUS' && classifyConsumerPath(pathname) === 'gated' && isSafeReturnTo(pathname)) {
      setPendingConsultationIntent({ returnTo: pathname });
    }
  }, [state, pathname]);

  const decision = resolveGateDecision(state, pathname);
  if (decision.kind === 'redirect') return <Redirect href={decision.to as never} />;
  if (decision.kind === 'loading') return <OnboardingHold state={state} onRetry={reload} />;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
