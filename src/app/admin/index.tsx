import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader } from '@/features/admin';

// ADMIN-01 dashboard placeholder. NO fake metrics / users / content — real
// operations data arrives in later sprints (ADMIN-02+). Only renders when the
// admin route layout has already confirmed authorization.
export default function AdminDashboardScreen() {
  return (
    <Stack gap="xl">
      <AdminPageHeader title="대시보드" subtitle="덕분AI 운영 관리자" />
      <Card>
        <Text variant="bodyMedium" colorToken="textSecondary">
          관리자 접근 및 권한 확인 기반이 구성되었습니다. 사용자·상담·AI 사용량·
          유명인·콘텐츠 등 운영 기능은 다음 스프린트에서 순차적으로 제공됩니다.
        </Text>
      </Card>
    </Stack>
  );
}
