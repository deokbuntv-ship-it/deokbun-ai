import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

export default function ConsultScreen() {
  return (
    <Screen>
      <Stack style={{ flex: 1 }} align="center" justify="center">
        <Text variant="headingLarge">상담</Text>
      </Stack>
    </Screen>
  );
}
