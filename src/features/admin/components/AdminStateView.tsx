import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

// Unified loading / empty / error state for admin screens. Never shows a stack
// trace or DB enum — product-facing copy only.
export function AdminStateView({
  state,
  message,
  onRetry,
}: {
  state: 'loading' | 'empty' | 'error';
  message?: string;
  onRetry?: () => void;
}) {
  const defaultMessage =
    state === 'loading'
      ? '불러오는 중입니다...'
      : state === 'empty'
        ? '표시할 데이터가 없습니다.'
        : '데이터를 불러오지 못했습니다.';

  return (
    <Card>
      <Stack gap="sm" align="flex-start">
        <Text variant="bodyMedium" colorToken="textSecondary">
          {message ?? defaultMessage}
        </Text>
        {state === 'error' && onRetry ? (
          <Button label="다시 시도" variant="secondary" onPress={onRetry} />
        ) : null}
      </Stack>
    </Card>
  );
}
