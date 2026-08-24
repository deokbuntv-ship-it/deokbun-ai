import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { LineIcon } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import { OPTIONAL_CONSENTS, REQUIRED_CONSENTS, TERMS_VERSION, useOnboarding } from '@/features/onboarding';
import { trackOnboardingEvent } from '@/features/onboarding/onboardingAnalytics';
import { profileService } from '@/features/profile';
import { colors, radius, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';

// D02 약관 동의 — STEP 1/2. DESIGN_FREEZE_FINAL presentation over the UNCHANGED consent contract:
// the required/optional split, the persisted TERMS_VERSION, and the gate that only lets onboarding
// advance after a durable save are all exactly as before. The optional marketing row is never
// pre-checked.
//
// What the freeze adds: 전체 동의 as one colour plane, a real 44dp checkbox target on every row, and a
// per-row 보기 link — you cannot meaningfully agree to a document you have no way to open.
//
// No bottom tab bar and no header bell here: onboarding is one of the two exceptions.

// Each consent row points at the document it is actually about. Marketing has no separate document,
// so it gets no link rather than a misleading one.
const CONSENT_DOC: Record<string, Href> = {
  service: '/terms-of-service',
  privacy: '/privacy-policy',
  age14: '/minor-policy',
};

export default function OnboardingTermsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
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
      reload(); // refresh shared facts (→ NEEDS_BIRTH_PROFILE)
      // Show the OPTIONAL Kakao-channel step next (§2); it is skippable and continues to the birth step.
      router.replace('/onboarding/channel');
    } catch {
      // Keep selections; consent MUST be durably recorded before advancing (§59).
      setError('약관 동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const Box = ({ on, tone = 'ink' }: { on: boolean; tone?: 'ink' | 'quiet' }) => (
    <View
      style={[
        styles.box,
        {
          borderColor: on ? theme.brandPrimary : theme.actionSecondaryBorder,
          backgroundColor: on ? theme.brandPrimary : 'transparent',
        },
        tone === 'quiet' && !on ? { borderColor: theme.border } : null,
      ]}
    >
      {on ? <LineIcon name="check" size={14} color={theme.brandPrimaryText} strokeWidth={2.4} /> : null}
    </View>
  );

  const Row = ({ id, label, on, onToggle }: { id: string; label: string; on: boolean; onToggle: () => void }) => {
    const doc = CONSENT_DOC[id];
    return (
      <View style={styles.rowWrap}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: on }}
          accessibilityLabel={label}
          style={styles.row}
        >
          <Box on={on} tone="quiet" />
          <Text variant="bodyMedium" style={styles.rowLabel}>
            {label}
          </Text>
        </Pressable>
        {doc ? (
          <Pressable
            onPress={() => router.push(doc)}
            accessibilityRole="button"
            accessibilityLabel={`${label} 보기`}
            hitSlop={8}
            style={styles.viewLink}
          >
            <Text variant="bodySmall" colorToken="textSecondary" style={styles.viewLinkText}>
              보기
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <AppHeader title="약관 동의" centerTitle />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="bodySmall" colorToken="textSecondary">
                1 / 2 · 약관 동의
              </Text>
              <Text variant="headingLarge">약관에 동의해 주세요</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                필수 항목에 동의하면 덕분이를 시작할 수 있어요.
              </Text>
            </Stack>

            {/* 전체 동의 — one colour plane, the single biggest target on the screen. */}
            <Pressable
              onPress={toggleAll}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allChecked }}
              accessibilityLabel="전체 동의"
              style={({ pressed }) => [
                styles.allRow,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceSage },
              ]}
            >
              <Box on={allChecked} />
              <Text variant="bodyLarge" style={{ color: theme.onSage, fontWeight: '700' }}>
                전체 동의
              </Text>
            </Pressable>

            <View>
              {REQUIRED_CONSENTS.map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} /> : null}
                  <Row id={c.id} label={c.label} on={!!checked[c.id]} onToggle={() => toggle(c.id)} />
                </View>
              ))}
              <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} />
              {OPTIONAL_CONSENTS.map((c) => (
                <Row key={c.id} id={c.id} label={c.label} on={marketing} onToggle={() => setMarketing((m) => !m)} />
              ))}
            </View>

            <Stack gap="sm">
              <Button label={saving ? '저장 중...' : '동의하고 계속하기'} radius="lg" loading={saving} onPress={submit} disabled={!allRequiredChecked || saving} />
              {error ? (
                <Text variant="bodySmall" colorToken="danger">
                  {error}
                </Text>
              ) : null}
              <Text variant="caption" colorToken="textMuted">
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
  scroll: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    minHeight: 60,
  },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // 44dp minimum on the checkbox target itself (the visible box is 22).
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48, paddingVertical: spacing.xs },
  rowLabel: { flex: 1 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  viewLink: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs },
  viewLinkText: { textDecorationLine: 'underline', fontWeight: '600' },
  divider: { height: 1 },
});
