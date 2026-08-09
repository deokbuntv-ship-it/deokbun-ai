import type { ReactNode } from 'react';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

// Presentation-only placeholder for the derived myeongri facts (음양 · 오행 ·
// 십신 · 지장간 · 12운성 · 신살 · 합충형파해 등). APP-28B renders no values; when
// `available` is true (future sprints) it renders the provided children.

export function DerivedFactsSection({
  available,
  children,
}: {
  available: boolean;
  children?: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text variant="headingMedium">상세 명리 정보</Text>
      {available ? (
        <>{children}</>
      ) : (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            음양·오행·십신·지장간·12운성·신살 등 상세 명리 정보는 계산 엔진 연동
            후 제공됩니다.
          </Text>
        </Card>
      )}
    </Stack>
  );
}
