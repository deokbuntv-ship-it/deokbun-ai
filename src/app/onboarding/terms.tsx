import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { OPTIONAL_CONSENTS, REQUIRED_CONSENTS, TERMS_VERSION, useOnboarding } from '@/features/onboarding';
import { trackOnboardingEvent } from '@/features/onboarding/onboardingAnalytics';
import { profileService } from '@/features/profile';
import { colors, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// STEP 1/2 — required consent (§17–§21). Bundled required rows + a genuinely-optional marketing row (never
// pre-checked, §19). Persists the accepted TERMS_VERSION; only then does onboarding advance to the birth
// profile. Reachable only for an authenticated user who has not accepted the current terms (gate-enforced).
export default function OnboardingTermsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { authState } = useAuth();
  const { reload, marketingOptIn: initialMarketing } = useOnboarding();

  const requiredIds = REQUIRED_CONSENTS.map((c) => c.id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [marketing, setMarketing] = useState<boolean>(initialMarketing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRequiredChecked = requiredIds.every((id) => checked[id]);
  const allChecked = allRequiredChecked && marketing;

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleAll = () => {
    const next = !allChecked;
    const map: Record<string, boolean> = {};
    for (const id of requiredIds) map[id] = next;
    setChecked(map);
    setMarketing(next);
  };

  const submit = async () => {
    if (!allRequiredChecked || saving) return;
    const userId = authState.user?.id;
    if (!userId) return; // gate guarantees auth; defensive
    setError(null);
    setSaving(true);
    try {
      await profileService.saveConsent(userId, { termsVersion: TERMS_VERSION, marketingOptIn: marketing });
      void trackOnboardingEvent('onboarding_terms_completed', { completion_step: 'terms' });
      reload(); // refresh shared facts → resolver advances to the birth step
      router.replace('/onboarding');
    } catch {
      // Keep selections; consent MUST be durably recorded before advancing (§59).
      setError('약관 동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ id, label, on, onToggle }: { id: string; label: string; on: boolean; onToggle: () => void }) => (
    <Pressable key={id} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.row}>
      <Text variant="bodyLarge" style={{ color: on ? theme.primary : theme.textSecondary }}>
        {on ? '☑' : '☐'}
      </Text>
      <Text variant="bodyMedium" style={styles.rowLabel}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen padded={false} frame>
      <AppHeader title="약관 동의" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="bodySmall" colorToken="textSecondary">
                1 / 2 · 약관 동의
              </Text>
              <Text variant="headingLarge">덕분AI 이용을 위해{'\n'}약관에 동의해 주세요.</Text>
            </Stack>

            {/* 전체 동의 */}
            <Pressable onPress={toggleAll} accessibilityRole="checkbox" accessibilityState={{ checked: allChecked }}>
              <Card radius="lg" style={{ borderColor: allChecked ? theme.primary : theme.border, borderWidth: allChecked ? 2 : 1 }}>
                <Stack direction="row" gap="sm" align="center">
                  <Text variant="bodyLarge" style={{ color: allChecked ? theme.primary : theme.textSecondary }}>
                    {allChecked ? '☑' : '☐'}
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
                    전체 동의
                  </Text>
                </Stack>
              </Card>
            </Pressable>

            <Card radius="lg">
              <Stack gap="xs">
                {REQUIRED_CONSENTS.map((c) => (
                  <Row key={c.id} id={c.id} label={c.label} on={!!checked[c.id]} onToggle={() => toggle(c.id)} />
                ))}
                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: spacing.xs }} />
                {OPTIONAL_CONSENTS.map((c) => (
                  <Row key={c.id} id={c.id} label={c.label} on={marketing} onToggle={() => setMarketing((m) => !m)} />
                ))}
              </Stack>
            </Card>

            <Stack gap="sm">
              <Button label={saving ? '저장 중...' : '동의하고 계속'} onPress={submit} disabled={!allRequiredChecked || saving} />
              {error ? (
                <Text variant="bodySmall" colorToken="danger">
                  {error}
                </Text>
              ) : null}
              <Text variant="caption" colorToken="textSecondary">
                필수 항목에 동의해야 서비스를 이용할 수 있어요. 선택 항목은 동의하지 않아도 괜찮아요.
              </Text>
            </Stack>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48, paddingVertical: spacing.xs },
  rowLabel: { flex: 1 },
});
