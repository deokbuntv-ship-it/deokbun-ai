import type { ReactNode } from 'react';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

export type AdminDetailRow = { label: string; value: string };

// A titled card of label/value rows (+ optional extra children). Read-only.
export function AdminDetailSection({
  title,
  rows,
  children,
}: {
  title: string;
  rows?: AdminDetailRow[];
  children?: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text variant="headingMedium">{title}</Text>
      <Card>
        <Stack gap="sm">
          {(rows ?? []).map((row) => (
            <Stack key={row.label} direction="row" gap="sm" align="flex-start">
              <Text
                variant="bodySmall"
                colorToken="textSecondary"
                style={{ width: 120 }}
              >
                {row.label}
              </Text>
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {row.value}
              </Text>
            </Stack>
          ))}
          {children}
        </Stack>
      </Card>
    </Stack>
  );
}
