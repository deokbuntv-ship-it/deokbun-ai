import type { ReactNode } from 'react';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

// Presentation-only seam for the remaining derived facts. 음양·오행·십신 (원국) and
// 지장간 are already shown elsewhere; the still-pending 오행 분포 lands here once the
// ENGINE provides it (ENGINE-11B). When `available` is true (future sprint) it
// renders the provided children; otherwise a plain, number-free placeholder — no
// fabricated distribution / counts / percentages.

export function DerivedFactsSection({
  available,
  children,
}: {
  available: boolean;
  children?: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text variant="headingMedium">오행 분포</Text>
      {available ? (
        <>{children}</>
      ) : (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            오행 분포는 계산 엔진 연동 후 제공됩니다.
          </Text>
        </Card>
      )}
    </Stack>
  );
}
