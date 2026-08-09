import type { ReactNode } from 'react';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

// Presentation-only placeholder for the fortune cycles (대운 · 세운 · 월운).
// APP-28B renders no values; when `available` is true (future sprints) it renders
// the provided children.

export function FortuneCycleSection({
  available,
  children,
}: {
  available: boolean;
  children?: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text variant="headingMedium">대운 · 세운</Text>
      {available ? (
        <>{children}</>
      ) : (
        <Card>
          <Text variant="bodyMedium" colorToken="textSecondary">
            대운·세운·월운 정보는 계산 엔진 연동 후 제공됩니다.
          </Text>
        </Card>
      )}
    </Stack>
  );
}
