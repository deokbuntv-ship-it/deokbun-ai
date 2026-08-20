import { Redirect, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { consumePendingShareToken } from '@/features/chat/report/pendingSharedReport';
import { consumePendingReturnTo } from '@/features/consultation';
import {
  ONBOARDING_BIRTH_PATH,
  ONBOARDING_TERMS_PATH,
  pickPostOnboardingDestination,
  useOnboarding,
} from '@/features/onboarding';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Post-auth RESOLVER — the single hub every authenticated entry passes through (login, callback, and each
// completed step route here). It reads the shared onboarding state and forwards to the correct step, or —
// once COMPLETE — resolves the continuation destination EXACTLY ONCE (§49): a pending shared report wins,
// then a validated internal returnTo, then Home. It is the ONLY place the continuation is consumed.
export default function OnboardingResolverScreen() {
  const { state, reload } = useOnboarding();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [dest, setDest] = useState<Href | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (state !== 'COMPLETE' || resolvedRef.current) return;
    resolvedRef.current = true;
    // One-shot read+clear of the ephemeral continuation stores; the pure picker decides priority.
    const picked = pickPostOnboardingDestination({
      shareToken: consumePendingShareToken(),
      returnTo: consumePendingReturnTo(),
    });
    setDest(picked.kind === 'shared-report' ? { pathname: '/shared-report/[token]', params: { token: picked.token } } : (picked.to as Href));
  }, [state]);

  if (state === 'ANONYMOUS') return <Redirect href="/login" />;
  if (state === 'NEEDS_TERMS') return <Redirect href={ONBOARDING_TERMS_PATH as Href} />;
  if (state === 'NEEDS_BIRTH_PROFILE') return <Redirect href={ONBOARDING_BIRTH_PATH as Href} />;
  if (state === 'COMPLETE' && dest) return <Redirect href={dest} />;

  // AUTHENTICATED_LOADING / COMPLETE-before-dest / ERROR → branded hold (retry on error).
  return (
    <Screen frame>
      <View style={styles.center}>
        <Stack gap="md" align="center">
          <Text variant="headingLarge">덕분이</Text>
          {state === 'ERROR' ? (
            <Stack gap="sm" align="center">
              <Text variant="bodyMedium" colorToken="textSecondary">
                정보를 불러오지 못했어요. 다시 시도해 주세요.
              </Text>
              <Button label="다시 시도" variant="secondary" onPress={reload} />
            </Stack>
          ) : (
            <ActivityIndicator color={theme.primary} />
          )}
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
