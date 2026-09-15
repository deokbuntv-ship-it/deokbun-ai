import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { AdminPageHeader } from '@/features/admin';
import { FamousEditor, famousService, type FamousInput } from '@/features/famous';
import { requestSiteDeploy } from '@/features/publicSite';

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
      .then(async (created) => {
        // 새로 만들면서 바로 발행할 수도 있다 — 그 경우에도 정적 페이지가 있어야 한다.
        // ⚠ 여기서는 결과 문구를 띄울 화면이 곧 사라지므로(상세로 이동) 요청만 보낸다. 결과는
        // 이동한 상세 화면의 "마지막 사이트 재생성" 줄이 이어서 보여 준다.
        if (input.status === 'published') await requestSiteDeploy('famous:create');
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
