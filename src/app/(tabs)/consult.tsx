import { useRouter } from 'expo-router';
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
  const { updateSubject, updateBirthInfo } = useConsultationDraft();
  const { subjects, status } = useConsultationSubjects();

  // Selecting a saved subject copies a SNAPSHOT into the current draft. Later
  // edits to the saved subject do not retroactively change this consultation.
  const selectSubject = (record: ConsultationSubjectRecord) => {
    updateSubject({
      id: record.id,
      displayName: record.displayName,
      relationship: record.relationship,
    });
    updateBirthInfo(record.birthInfo);
    router.push({ pathname: '/chat', params: { startNew: '1' } });
  };

  const addNewSubject = () => {
    router.push('/birth-info');
  };

  return (
    <Screen>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Stack gap="xs">
          <Text variant="headingLarge">상담 시작</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            상담할 대상을 선택하거나 새 대상을 추가하세요.
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
              <Pressable
                key={subject.id}
                onPress={() => selectSubject(subject)}
                accessibilityRole="button"
              >
                <Card>
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
                </Card>
              </Pressable>
            ))
          )}
        </Stack>

        <Button label="새 대상 추가" onPress={addNewSubject} />
      </Stack>
    </Screen>
  );
}
