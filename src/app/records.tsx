import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';

// 운세 우편함 — recurring-history hub (route /records preserved; reached from MY,
// no longer a bottom tab per the final IA §34). Reuses the existing per-subject
// consultation records as the first REAL section; nothing here deletes or
// fabricates records. Future sections (리포트 / 정기 운세) show a truthful 준비 중
// until their engines/schedulers are connected. Opened as a stack screen, so the
// native header provides the back action.
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
            <Text variant="bodyMedium" colorToken="textSecondary">
              지난 상담과 운세 리포트를 한곳에서 모아 봅니다.
            </Text>

            {/* Real section: consultation records (saved per subject). */}
            <Stack gap="sm">
              <Text variant="headingMedium">상담 기록</Text>
              <Card>
                <Stack gap="md">
                  <Text variant="bodyMedium">
                    상담 기록은 상담 대상별로 저장됩니다. AI 상담에서 대상을
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
              <Text variant="headingMedium">준비 중인 항목</Text>
              <Card>
                <Stack gap="md">
                  <Stack
                    direction="row"
                    gap="sm"
                    align="center"
                    style={styles.row}
                  >
                    <Text variant="bodyMedium">운세 리포트</Text>
                    <StatusBadge label="준비 중" tone="neutral" />
                  </Stack>
                  <Stack
                    direction="row"
                    gap="sm"
                    align="center"
                    style={styles.row}
                  >
                    <Text variant="bodyMedium">정기 운세 우편</Text>
                    <StatusBadge label="준비 중" tone="neutral" />
                  </Stack>
                </Stack>
              </Card>
              <Text variant="caption" colorToken="textSecondary">
                운세 리포트와 정기 운세 우편은 운세 엔진 연결 후 실제 분석
                결과가 준비되면 도착합니다.
              </Text>
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
