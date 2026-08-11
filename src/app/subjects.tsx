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
        <Card key={subject.id}>
          <Stack gap="sm">
            <Pressable
              onPress={() => openManse(subject)}
              accessibilityRole="button"
              accessibilityLabel={`${subject.displayName} 만세력 보기`}
            >
              <Stack gap="xs">
                <Stack direction="row" gap="xs" align="center">
                  <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                    {subject.displayName}
                    {subject.isSelf ? ' (본인)' : ''}
                  </Text>
                  {isCurrent ? (
                    <Text variant="bodySmall" colorToken="textSecondary">
                      · 선택됨
                    </Text>
                  ) : null}
                </Stack>
                {subject.relationship ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {subject.relationship}
                  </Text>
                ) : null}
              </Stack>
            </Pressable>

            <Stack direction="row" gap="sm" style={styles.actionRow}>
              <Button label="상담 열기" onPress={() => openConsultation(subject)} />
              <Button
                label="새 상담"
                variant="secondary"
                onPress={() => startNewConsultation(subject)}
              />
              <Button
                label="관리"
                variant="secondary"
                onPress={() => manageSubject(subject)}
              />
              <Button
                label="상담 기록"
                variant="secondary"
                onPress={() => openHistory(subject)}
              />
            </Stack>
          </Stack>
        </Card>
      );
    });
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="분석 대상자 관리" showBack onBack={handleBack} />
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
  actionRow: {
    flexWrap: 'wrap',
  },
});
