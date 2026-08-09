import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

export function AdminPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack gap="xs">
      <Text variant="headingLarge">{title}</Text>
      {subtitle ? (
        <Text variant="bodyMedium" colorToken="textSecondary">
          {subtitle}
        </Text>
      ) : null}
    </Stack>
  );
}
