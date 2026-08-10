import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { FORTUNE_SLOT_LABELS, FORTUNE_SLOT_ORDER } from '@/features/fortune';

// 오늘의 운세 — presentation/nav foundation only.
//
// The canonical fortune engine is not connected yet, so this screen shows a
// truthful "준비 중" state and NEVER fabricates scores or interpretation. The
// section labels below are the UI contract (오늘의 핵심 흐름/주의할 점/행동
// 가이드/상세 해석); their bodies will render ONLY when real canonical data
// arrives from the engine (see src/features/fortune).
export default function TodayFortuneScreen() {
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
              <Text variant="displayMedium">오늘의 운세</Text>
              <Text variant="bodyMedium" colorToken="textSecondary">
                하루의 흐름을 확인하고 오늘을 준비해 보세요.
              </Text>
            </Stack>

            {/* Truthful engine state — no fabricated fortune values. */}
            <Card>
              <Stack gap="sm">
                <Text variant="headingMedium">운세 엔진 연결 준비 중</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  정확한 해석을 위해 운세 계산 엔진을 연결하고 있습니다. 준비가
                  완료되면 이곳에서 오늘의 운세를 확인할 수 있어요. 지금은 임의의
                  점수나 해석을 보여 드리지 않습니다.
                </Text>
              </Stack>
            </Card>

            {/* Presentation slots (labels only) so the layout is understood
                ahead of the engine. Bodies stay empty until real data exists. */}
            <Stack gap="sm">
              <Text variant="headingMedium">곧 제공될 항목</Text>
              <Stack gap="sm">
                {FORTUNE_SLOT_ORDER.map((key) => (
                  <Card key={key}>
                    <Stack
                      direction="row"
                      gap="sm"
                      align="center"
                      style={styles.slotRow}
                    >
                      <Text variant="bodyMedium">{FORTUNE_SLOT_LABELS[key]}</Text>
                      <StatusBadge label="준비 중" tone="neutral" />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>

            {/* Discovery: consultation is available now. */}
            <Card>
              <Stack gap="md">
                <Text variant="bodyMedium">
                  지금은 상담으로 더 깊이 있는 해석을 받아보실 수 있어요.
                </Text>
                <Button
                  label="상담 시작하기"
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
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  slotRow: {
    justifyContent: 'space-between',
  },
});
