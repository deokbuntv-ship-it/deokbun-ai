import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import type { AdInput } from '@/features/ads';
import { AdEditor } from '@/features/ads/components';
import { adAdvertisementService } from '@/features/ads/services/adAdvertisementService';

// ADMIN 광고 신규등록 (§1/§5). Create → on success navigate to the detail screen, where the
// operator publishes to mint the tracking URL. False-success is impossible: createAd THROWS
// on failure → we surface the error and stay on the form (§57).
export default function AdminAdNewScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (input: AdInput) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await adAdvertisementService.createAd(input);
      router.replace(`/admin/ads/${created.id}`);
    } catch {
      setErrorMessage('광고 저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="xl">
      <AdminPageHeader title="광고 신규등록" subtitle="광고 정보를 입력하고 저장한 뒤, 상세 화면에서 발행하면 추적 URL이 발급됩니다." />
      <View style={{ maxWidth: 640, gap: 16 }}>
        <AdEditor
          initial={null}
          submitting={submitting}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        />
        <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
          저장 후 상세 화면에서 [발행]을 누르면 고유 추적 URL이 자동 발급됩니다.
        </Text>
      </View>
    </Stack>
  );
}
