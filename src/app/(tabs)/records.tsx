import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';

// 운세 우편함 — recurring-history destination (route stays /records for minimal
// churn). Reuses the existing per-subject consultation records as the first real
// section; nothing here deletes or fabricates records. Future recurring sections
// (오늘의 운세 기록 등) show a truthful "준비 중" until their engines are connected.
export default function FortuneMailboxScreen() {
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
              <Text variant="displayMedium">운세 우편함</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                지난 상담과 운세 기록을 한곳에서 모아 봅니다.
              </Text>
            </Stack>

            {/* Real section: consultation records (saved per subject). */}
            <Stack gap="sm">
              <Text variant="headingMedium">상담 기록</Text>
              <Card>
                <Stack gap="md">
                  <Text variant="bodyMedium">
                    상담 기록은 상담 대상별로 저장됩니다. 상담 탭에서 대상을
                    선택해 &quot;상담 기록&quot;을 열어 보세요.
                  </Text>
                  <Button
                    label="상담 대상으로 이동"
                    onPress={() => router.push('/consult')}
                  />
                </Stack>
              </Card>
            </Stack>

            {/* Future recurring sections — truthful 준비 중, no fabricated data. */}
            <Stack gap="sm">
              <Text variant="headingMedium">준비 중인 기록</Text>
              <Card>
                <Stack
                  direction="row"
                  gap="sm"
                  align="center"
                  style={styles.row}
                >
                  <Text variant="bodyMedium">오늘의 운세 기록</Text>
                  <StatusBadge label="준비 중" tone="neutral" />
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
});
