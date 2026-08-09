import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

// Offset-based pagination controls. `pageSize` is the number of rows returned for
// the current page; `hasNext` is true when a full page was returned (there may be
// more). Kept deliberately simple for MVP admin lists.
export function AdminPagination({
  offset,
  limit,
  pageSize,
  onPrev,
  onNext,
}: {
  offset: number;
  limit: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const canPrev = offset > 0;
  const canNext = pageSize >= limit;
  const from = pageSize === 0 ? 0 : offset + 1;
  const to = offset + pageSize;

  return (
    <Stack direction="row" gap="md" align="center">
      <Button
        label="이전"
        variant="secondary"
        disabled={!canPrev}
        onPress={onPrev}
      />
      <Text variant="bodySmall" colorToken="textSecondary">
        {`${from}–${to}`}
      </Text>
      <Button
        label="다음"
        variant="secondary"
        disabled={!canNext}
        onPress={onNext}
      />
    </Stack>
  );
}
