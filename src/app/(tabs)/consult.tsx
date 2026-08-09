import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
    useConsultationDraft,
    useConsultationSubjects,
    type ConsultationSubjectRecord,
} from '@/features/consultation';

export default function ConsultScreen() {
  const router = useRouter();
  const { draft, updateSubject, updateBirthInfo } = useConsultationDraft();
  const { subjects, status, reload } = useConsultationSubjects();

  // Refresh the saved-subject list whenever this screen regains focus (e.g.
  // after adding/editing a subject). The hook's token discards stale responses.
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

  // "상담 열기" = open/resume this subject's latest conversation (subject-aware
  // hydration, no startNew). For a different subject we replace the draft
  // snapshot first; same subject keeps the current draft untouched.
  const openConsultation = (record: ConsultationSubjectRecord) => {
    if (draft.subject?.id !== record.id) {
      applySubjectToDraft(record);
    }
    router.push('/chat');
  };

  // "새 상담" = explicit new consultation (startNew, fresh empty conversation).
  // Existing conversations for this subject are preserved in the DB.
  const startNewConsultation = (record: ConsultationSubjectRecord) => {
    applySubjectToDraft(record);
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const addNewSubject = () => {
    router.push('/birth-info');
  };

  // "관리" = edit/delete the saved subject (never confused with opening a chat).
  const manageSubject = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/birth-info', params: { subjectId: record.id } });
  };

  // "상담 기록" = view this subject's past conversations (read + open).
  const openHistory = (record: ConsultationSubjectRecord) => {
    router.push({
      pathname: '/subject-history',
      params: { subjectId: record.id },
    });
  };

  const renderSubjectList = () => {
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
      // Error must never be shown as an empty list.
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
            저장된 대상이 없습니다.{'\n'}아래에서 새 대상을 추가해 주세요.
          </Text>
        </Card>
      );
    }

    return subjects.map((subject) => {
      // "진행 중" reflects only that this subject is the current in-memory draft.
      // It does NOT imply an existing conversation (no DB lookup here).
      const isCurrent = draft.subject?.id === subject.id;

      return (
        <Card key={subject.id}>
          <Stack gap="sm">
            <Stack gap="xs">
              <Stack direction="row" gap="xs" align="center">
                <Text variant="bodyLarge">
                  {subject.displayName}
                  {subject.isSelf ? ' (본인)' : ''}
                </Text>
                {isCurrent ? (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    · 진행 중
                  </Text>
                ) : null}
              </Stack>
              {subject.relationship ? (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {subject.relationship}
                </Text>
              ) : null}
            </Stack>

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
    <Screen>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Stack gap="xs">
          <Text variant="headingLarge">상담 시작</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            "상담 열기"로 최근 상담을 이어가고, "새 상담"으로 새로 시작할 수
            있습니다.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text variant="headingMedium">상담 대상</Text>
          {renderSubjectList()}
        </Stack>

        <Button label="새 대상 추가" onPress={addNewSubject} />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexWrap: 'wrap',
  },
});
