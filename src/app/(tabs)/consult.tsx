import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useConsultationDraft } from '@/features/consultation';

export default function ConsultScreen() {
  const router = useRouter();
  const { updateSubject } = useConsultationDraft();

  const handleStart = () => {
    updateSubject({ id: 'self', displayName: '본인', relationship: 'self' });
    router.push('/birth-info');
  };

  return (
    <Screen>
      <Stack gap="xxl" style={{ flex: 1, paddingTop: 24 }}>
        <Stack gap="xs">
          <Text variant="headingLarge">상담 시작</Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            출생정보를 입력하면 덕분AI와 바로 대화를 시작할 수 있습니다.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text variant="headingMedium">상담 대상</Text>
          <Card>
            <Text variant="bodyLarge">본인</Text>
          </Card>
          <Text variant="bodySmall" colorToken="textSecondary">
            다른 대상자 등록 기능은 추후 제공됩니다.
          </Text>
        </Stack>

        <Button label="출생정보 입력하기" onPress={handleStart} />
      </Stack>
    </Screen>
  );
}
