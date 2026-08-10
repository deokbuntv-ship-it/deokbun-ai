import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';

// Consultation history is kept per subject and opened from the 상담 tab
// (each subject card has a "상담 기록" action). This screen guides there rather
// than showing a bare title. No fabricated records.
export default function RecordsScreen() {
  const router = useRouter();

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="displayMedium">상담 기록</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                지난 상담을 다시 볼 수 있어요.
              </Text>
            </Stack>

            <Card>
              <Stack gap="md">
                <Text variant="bodyMedium">
                  상담 기록은 상담 대상별로 저장됩니다. 상담 탭에서 대상을 선택해
                  &quot;상담 기록&quot;을 열어 보세요.
                </Text>
                <Button
                  label="상담 대상으로 이동"
                  onPress={() => router.push('/consult')}
                />
              </Stack>
            </Card>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
