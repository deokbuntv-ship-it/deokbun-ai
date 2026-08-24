import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useConsultationDraft,
  useConsultationSubjects,
  type ConsultationSubjectRecord,
} from '@/features/consultation';

// 분석 대상자 관리 (reached from MY). Preserves the existing subject management
// flow — open/new consultation, edit, history, 만세력 — under the FINAL IA.
// (This is the former 상담 tab content, relocated so 상담 can be history-centric.)
export default function SubjectsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const { subjects, status, reload } = useConsultationSubjects();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const applySubjectToDraft = (record: ConsultationSubjectRecord) => {
    updateSubject({
      id: record.id,
      displayName: record.displayName,
      relationship: record.relationship,
    });
    updateBirthInfo(record.birthInfo);
  };

  const openConsultation = (record: ConsultationSubjectRecord) => {
    if (draft.subject?.id !== record.id) {
      applySubjectToDraft(record);
    }
    router.push('/chat');
  };

  const startNewConsultation = (record: ConsultationSubjectRecord) => {
    applySubjectToDraft(record);
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const manageSubject = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/birth-info', params: { subjectId: record.id } });
  };

  const openHistory = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/subject-history', params: { subjectId: record.id } });
  };

  const openManse = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/subject-manse', params: { subjectId: record.id } });
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/my');
  };

  const renderList = () => {
    if (status === 'loading') {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            대상을 불러오는 중입니다...
          </Text>
        </Card>
      );
    }
    if (status === 'error') {
      return (
        <Card>
          <Stack gap="sm">
            <Text variant="bodyMedium" colorToken="textSecondary">
              대상을 불러오지 못했습니다.
            </Text>
            <Button label="다시 시도" variant="secondary" onPress={reload} />
          </Stack>
        </Card>
      );
    }
    if (subjects.length === 0) {
      return (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            저장된 대상이 없습니다. 아래에서 새 대상을 추가해 주세요.
          </Text>
        </Card>
      );
    }
    return subjects.map((subject) => {
      const isCurrent = draft.subject?.id === subject.id;
      return (
        // The selected person is clearly marked (orange border + 선택됨 chip = signature-orange selected state).
        // Hierarchy (§ real-device QA #5): name → ONE primary action (상담 열기) + secondary (새 상담) → demoted
        // management (관리 / 상담 기록). No dense equal-weight grid; S8-width safe. All actions preserved.
        <Card key={subject.id} style={isCurrent ? { borderColor: theme.brandPrimary, borderWidth: 1.5 } : undefined}>
          <Stack gap="md">
            <Pressable
              onPress={() => openManse(subject)}
              accessibilityRole="button"
              accessibilityLabel={`${subject.displayName} 만세력 보기`}
            >
              <Stack gap="xs">
                <Stack direction="row" gap="sm" align="center" style={{ justifyContent: 'space-between' }}>
                  <Text variant="bodyLarge" style={{ fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
                    {subject.displayName}
                    {subject.isSelf ? ' (본인)' : ''}
                  </Text>
                  {isCurrent ? (
                    <View style={[styles.selectedChip, { backgroundColor: theme.brandPrimarySoft }]}>
                      <Text variant="caption" style={{ color: theme.brandPrimaryText, fontWeight: '700' }}>
                        선택됨
                      </Text>
                    </View>
                  ) : null}
                </Stack>
                {subject.relationship ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {subject.relationship}
                  </Text>
                ) : null}
              </Stack>
            </Pressable>

            {/* Primary + secondary — the two consultation actions, equal width, clear emphasis order. */}
            <Stack direction="row" gap="sm">
              <View style={styles.flex1}>
                <Button label="상담 열기" variant="primary" radius="lg" onPress={() => openConsultation(subject)} />
              </View>
              <View style={styles.flex1}>
                <Button label="새 상담" variant="secondary" radius="lg" onPress={() => startNewConsultation(subject)} />
              </View>
            </Stack>

            {/* Demoted management actions — text-only, visually quieter. */}
            <Stack direction="row" gap="xs" align="center">
              <Button label="관리" variant="tertiary" onPress={() => manageSubject(subject)} />
              <Text variant="bodySmall" colorToken="textMuted">·</Text>
              <Button label="상담 기록" variant="tertiary" onPress={() => openHistory(subject)} />
            </Stack>
          </Stack>
        </Card>
      );
    });
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="분석 대상자 관리" showBack onBack={handleBack} showBell />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="lg">
            <Text variant="bodyMedium" colorToken="textSecondary">
              분석·상담 대상을 관리합니다. 이름을 누르면 만세력을 볼 수 있어요.
            </Text>
            <Stack gap="sm">{renderList()}</Stack>
            <Button label="새 대상 추가" onPress={() => router.push('/birth-info')} />
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  flex1: {
    flex: 1,
  },
  selectedChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
