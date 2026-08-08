import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

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

  // Select = RESUME that subject's latest conversation (subject-aware hydration,
  // no startNew). For a different subject we replace the draft snapshot first so
  // chat hydrates the selected subject's conversation. Same subject keeps the
  // current draft untouched.
  const selectSubject = (record: ConsultationSubjectRecord) => {
    if (draft.subject?.id !== record.id) {
      applySubjectToDraft(record);
    }
    router.push('/chat');
  };

  // Explicit NEW consultation for a subject → startNew (a fresh empty
  // conversation). Existing conversations for this subject stay in the DB.
  const startNewConsultation = (record: ConsultationSubjectRecord) => {
    applySubjectToDraft(record);
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const addNewSubject = () => {
    router.push('/birth-info');
  };

  // Distinct "manage" action → edit mode (never confused with selection).
  const manageSubject = (record: ConsultationSubjectRecord) => {
    router.push({ pathname: '/birth-info', params: { subjectId: record.id } });
  };

  return (
    <Screen>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Stack gap="xs">
          <Text variant="headingLarge">상담 시작</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            대상을 선택하면 진행 중 상담을 이어가고, "새 상담"으로 새로
            시작할 수 있습니다.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text variant="headingMedium">상담 대상</Text>

          {status === 'loading' ? (
            <Card>
              <Text variant="bodyMedium" colorToken="textSecondary">
                대상을 불러오는 중입니다...
              </Text>
            </Card>
          ) : subjects.length === 0 ? (
            <Card>
              <Text variant="bodyMedium" colorToken="textSecondary">
                저장된 대상이 없습니다.{'\n'}아래에서 새 대상을 추가해 주세요.
              </Text>
            </Card>
          ) : (
            subjects.map((subject) => (
              <Card key={subject.id}>
                <Stack gap="sm">
                  <Pressable
                    onPress={() => selectSubject(subject)}
                    accessibilityRole="button"
                    accessibilityLabel={`${subject.displayName} 상담 이어가기`}
                  >
                    <Stack gap="xs">
                      <Text variant="bodyLarge">
                        {subject.displayName}
                        {subject.isSelf ? ' (본인)' : ''}
                      </Text>
                      {subject.relationship ? (
                        <Text variant="bodySmall" colorToken="textSecondary">
                          {subject.relationship}
                        </Text>
                      ) : null}
                    </Stack>
                  </Pressable>

                  <Stack direction="row" gap="sm">
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
                  </Stack>
                </Stack>
              </Card>
            ))
          )}
        </Stack>

        <Button label="새 대상 추가" onPress={addNewSubject} />
      </Stack>
    </Screen>
  );
}
