import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';

// Confirmation-based memory (§19). Important life info is NEVER auto-saved — the user
// explicitly confirms. This is presentation only: it surfaces the candidate the caller
// detected and delegates the actual persist/decline to the caller's handlers. The item
// text is caller-provided (from the conversation), never fabricated here.
export function MemoryConfirmation({
  itemLabel,
  onConfirm,
  onDismiss,
}: {
  itemLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card radius="xl">
      <Stack gap="sm">
        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
          이 내용을 기억해 둘까요?
        </Text>
        <Text variant="bodyMedium" colorToken="textSecondary">
          {itemLabel}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          <Button label="네, 기억할게요" variant="primary" onPress={onConfirm} />
          <Button label="아니요" variant="tertiary" onPress={onDismiss} />
        </View>
      </Stack>
    </Card>
  );
}
