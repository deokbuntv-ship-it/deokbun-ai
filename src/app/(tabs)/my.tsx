import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

export default function MyScreen() {
  return (
    <Screen>
      <Stack style={{ flex: 1 }} align="center" justify="center">
        <Text variant="headingLarge">마이</Text>
      </Stack>
    </Screen>
  );
}
