import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { BirthProfileForm } from '@/features/consultation/components/BirthProfileForm';
import { consultationSubjectService, useConsultationDraft, type BirthInfoDraft } from '@/features/consultation';
import { useOnboarding } from '@/features/onboarding';
import { trackOnboardingEvent } from '@/features/onboarding/onboardingAnalytics';

// STEP 2/2 — the canonical SELF birth profile (§22–§28). This is a CORE account asset, not a per-consultation
// input: it is created once here and thereafter reused by 상담 / 궁합 / 운세 (no repeated self entry, §D/§32).
// Idempotent: if a SELF subject already exists (e.g. an existing beta member missing only consent came back
// through here) it is UPDATED in place — never duplicated (§27). On success the draft is seeded to SELF so
// the very next consultation already knows the user, and the resolver advances to the continuation.
export default function OnboardingBirthScreen() {
  const router = useRouter();
  const { reload } = useOnboarding();
  const { updateSubject, updateBirthInfo } = useConsultationDraft();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void trackOnboardingEvent('onboarding_birth_viewed', { completion_step: 'birth' });
  }, []);

  const onSubmit = async (birthInfo: BirthInfoDraft) => {
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const name = birthInfo.displayName.trim() || '나';
      // Idempotent create-or-update of the ONE canonical SELF subject.
      const existing = await consultationSubjectService.getSelfSubject();
      let subjectId: string;
      if (existing) {
        await consultationSubjectService.updateSubject(existing.id, { displayName: name, birthInfo, isSelf: true });
        subjectId = existing.id;
      } else {
        const created = await consultationSubjectService.createSubject({
          displayName: name,
          relationship: '본인',
          isSelf: true,
          birthInfo,
        });
        subjectId = created.id;
      }

      // Seed the active consultation draft with SELF so 상담/궁합 know the user immediately (§32/§33).
      updateSubject({ id: subjectId, displayName: name, relationship: '본인' });
      updateBirthInfo(birthInfo);

      void trackOnboardingEvent('onboarding_birth_completed', { completion_step: 'birth' });
      void trackOnboardingEvent('onboarding_completed', { completion_step: 'complete' });

      reload(); // refresh shared facts → resolver sees COMPLETE → continuation destination
      router.replace('/onboarding');
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      setError(
        code === '23505'
          ? '이미 등록된 본인 정보가 있어요. 잠시 후 다시 시도해 주세요.'
          : '출생정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="출생정보" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="bodySmall" colorToken="textSecondary">
                2 / 2 · 출생정보
              </Text>
              <Text variant="headingLarge">마지막이에요.{'\n'}생년월일과 태어난 시간을 알려주세요.</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                입력하신 정보는 상담·운세·궁합의 기준이 되는 나의 사주 정보로 안전하게 저장돼요.
              </Text>
            </Stack>

            <BirthProfileForm submitting={saving} error={error} submitLabel="완료하고 시작하기" onSubmit={onSubmit} />
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
});
