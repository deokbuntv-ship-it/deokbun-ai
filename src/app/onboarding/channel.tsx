import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StateView } from '@/components/StateView';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { initialKakaoChannelState, kakaoChannelAddUrl } from '@/features/onboarding';
import { colors, spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// OPTIONAL post-consent step (§2/§3) — "카카오톡으로 덕분이 소식을 받아보세요". This is NOT a required gating step:
// 건너뛰기 is always available and both paths continue to the birth step. Marketing consent (recorded on the
// terms step) and adding the channel are SEPARATE — this screen never implies the marketing opt-in added the
// channel. The external Kakao connection is not configured yet, so the add action is an honest 준비 중 state
// (EXTERNAL_NOT_CONFIGURED) and NO connected-success is ever faked. When configured, "추가" opens Kakao's own
// channel page — we still never assert the add succeeded (unverifiable), so no CHANNEL_CONNECTED is fabricated.
export default function OnboardingChannelScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const state = initialKakaoChannelState();
  const addUrl = kakaoChannelAddUrl();
  const available = state === 'CHANNEL_CONNECTION_AVAILABLE' && !!addUrl;

  // Continue to the required flow (resolver → birth). Used by BOTH skip and add — the step never blocks.
  const proceed = () => router.replace('/onboarding');

  const onAdd = () => {
    if (addUrl) void Linking.openURL(addUrl).catch(() => {});
    proceed(); // we opened Kakao's page; we do not claim the channel was added.
  };

  return (
    <Screen padded={false} frame>
      <AppHeader title="카카오 채널" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Text variant="bodySmall" colorToken="textSecondary">선택 사항</Text>
              <Text variant="headingLarge">카카오톡으로{'\n'}덕분이 소식을 받아보세요</Text>
            </Stack>

            <Card radius="xl">
              <Stack gap="sm">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  덕분이 채널을 추가하면 오늘의 운세·이번 달 흐름 같은 소식을 카카오톡으로 받아볼 수 있어요.
                </Text>
                <Text variant="bodyMedium" colorToken="textSecondary">
                  선택 사항이라 지금 건너뛰어도 서비스 이용에는 전혀 문제가 없어요.
                </Text>
                {/* Explicit separation (§2/§3): marketing consent ≠ channel added. */}
                <View style={[styles.note, { backgroundColor: theme.backgroundElevated }]}>
                  <Text variant="bodySmall" colorToken="textSecondary">
                    ‘마케팅 정보 수신 동의’와 ‘카카오 채널 추가’는 별개예요. 소식은 채널을 추가해야 받을 수 있어요.
                  </Text>
                </View>
              </Stack>
            </Card>

            <Stack gap="sm">
              {available ? (
                <Button label="카카오 채널 추가" radius="lg" onPress={onAdd} />
              ) : (
                // Honest EXTERNAL_NOT_CONFIGURED state — a disabled control + a truthful preparation note. No
                // tap does anything, so a channel-add can never be faked as successful.
                <>
                  <StateView
                    kind="preparing"
                    title="채널 연결은 준비 중이에요"
                    description="연결이 열리면 MY에서 다시 설정할 수 있어요."
                  />
                  <Button label="채널 추가하기 · 준비 중" radius="lg" disabled onPress={proceed} />
                </>
              )}
              <Button label="건너뛰기" variant="tertiary" radius="lg" onPress={proceed} />
            </Stack>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  note: { borderRadius: 8, padding: spacing.md },
});
