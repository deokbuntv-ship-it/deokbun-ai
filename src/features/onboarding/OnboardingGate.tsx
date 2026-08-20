import { Redirect, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Stack as VStack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { isSafeReturnTo, setPendingConsultationIntent } from '@/features/consultation';
import { classifyConsumerPath, resolveGateNavigation } from '@/features/onboarding/entryRouting';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import type { OnboardingState } from '@/features/onboarding/onboardingState';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Full-screen branded hold OVERLAY (§8/§56/§57). It covers the navigator while auth/onboarding state
// resolves or a redirect is in flight — so no protected screen is ever visible — WITHOUT unmounting the
// navigator underneath. On a recoverable facts ERROR it offers retry instead of spinning forever (§6/§61).
function GateHoldOverlay({ state, onRetry }: { state: OnboardingState; onRetry: () => void }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: theme.background }]}>
      <VStack gap="md" align="center">
        <Text variant="headingLarge">덕분이</Text>
        {state === 'ERROR' ? (
          <VStack gap="sm" align="center">
            <Text variant="bodyMedium" colorToken="textSecondary">
              정보를 불러오지 못했어요. 다시 시도해 주세요.
            </Text>
            <Button label="다시 시도" variant="secondary" onPress={onRetry} />
          </VStack>
        ) : (
          <ActivityIndicator color={theme.primary} />
        )}
      </VStack>
    </View>
  );
}

// The ONE centralized gate (§7). CRITICAL (loop fix): the root navigator (`children` = <Stack>) is ALWAYS
// rendered — never swapped for a redirect/loading element. Conditionally unmounting the root navigator is an
// expo-router anti-pattern that, during the auth→facts transition, remounts the Stack (+ the nested Tabs)
// mid-navigation and drives ContextNavigator into "Maximum update depth". Instead we keep the navigator
// mounted and, when the user must go elsewhere, render a declarative <Redirect> (idempotent — only when not
// already at the target) plus a full-screen hold overlay so no protected screen is ever seen. State
// derivation stays pure (resolveGateDecision); the gate itself never calls setState or navigates imperatively.
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

  // Pure, idempotent nav contract (never re-issues a redirect to the current route).
  const { redirectTo, showOverlay } = resolveGateNavigation(state, pathname);

  return (
    <>
      {children}
      {redirectTo !== null ? <Redirect href={redirectTo as never} /> : null}
      {showOverlay ? <GateHoldOverlay state={state} onRetry={reload} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
});
