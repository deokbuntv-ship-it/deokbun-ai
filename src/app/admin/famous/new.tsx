import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { AdminPageHeader } from '@/features/admin';
import { FamousEditor, famousService, type FamousInput } from '@/features/famous';

export default function AdminFamousNewScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (input: FamousInput) => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    famousService
      .createFamous(input)
      .then((created) => {
        router.replace({
          pathname: '/admin/famous/[id]',
          params: { id: created.id },
        });
      })
      .catch((error) => {
        const code = (error as { code?: string } | null)?.code;
        setErrorMessage(
          code === '23505'
            ? '이미 사용 중인 slug입니다. 다른 slug을 입력해 주세요.'
            : '유명인 생성에 실패했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요.',
        );
        setSubmitting(false);
      });
  };

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" align="center">
        <Button
          label="← 목록"
          variant="secondary"
          onPress={() => router.push('/admin/famous')}
        />
      </Stack>
      <AdminPageHeader title="새 유명인" subtitle="유명인 프로필을 생성합니다." />
      <FamousEditor
        initial={null}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
