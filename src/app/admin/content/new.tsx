import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { AdminPageHeader } from '@/features/admin';
import {
  ContentEditor,
  contentService,
  type ContentInput,
} from '@/features/content';

export default function AdminContentNewScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (input: ContentInput) => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    contentService
      .createContent(input)
      .then((created) => {
        router.replace({
          pathname: '/admin/content/[id]',
          params: { id: created.id },
        });
      })
      .catch(() => {
        setErrorMessage(
          '콘텐츠 생성에 실패했습니다. 관리자 권한 또는 DB 설정을 확인해 주세요.',
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
          onPress={() => router.push('/admin/content')}
        />
      </Stack>
      <AdminPageHeader title="새 콘텐츠" subtitle="콘텐츠 초안을 생성합니다." />
      <ContentEditor
        initial={null}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
