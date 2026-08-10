import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';

// MY — clean, utilitarian account hub (§27). Sections: account · saved people ·
// records/reports (운세 우편함) · settings · logout. No internal auth IDs. Future
// surfaces (리포트, 알림) show a truthful 준비 중.
export default function MyScreen() {
  const router = useRouter();
  const { isAuthenticated, authState, signOut } = useAuth();
  const user = authState.user;

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            <Text variant="displayMedium">MY</Text>

            {/* Account — user-facing info only (no internal IDs). */}
            {isAuthenticated && user ? (
              <Card>
                <Stack gap="xs">
                  <Text variant="bodySmall" colorToken="textSecondary">
                    계정
                  </Text>
                  <Text variant="headingMedium">
                    {user.displayName || user.email || '사용자'}
                  </Text>
                  {user.email ? (
                    <Text variant="bodySmall" colorToken="textSecondary">
                      {user.email}
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            ) : (
              <Card>
                <Stack gap="md">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    로그인하면 저장된 사람과 상담 기록을 저장할 수 있어요.
                  </Text>
                  <Button label="로그인하기" onPress={() => router.push('/login')} />
                </Stack>
              </Card>
            )}

            {/* Saved people (§28) — managed in the consultation hub. */}
            <Stack gap="sm">
              <Text variant="headingMedium">저장된 사람</Text>
              <Stack gap="sm">
                <Button
                  label="상담 대상 관리"
                  variant="secondary"
                  onPress={() => router.push('/consult')}
                />
                <Button
                  label="새 대상 추가"
                  variant="secondary"
                  onPress={() => router.push('/birth-info')}
                />
              </Stack>
            </Stack>

            {/* Records / reports (§34) — 운세 우편함. */}
            <Stack gap="sm">
              <Text variant="headingMedium">기록 · 리포트</Text>
              <Stack gap="sm">
                <Button
                  label="운세 우편함"
                  variant="secondary"
                  onPress={() => router.push('/records')}
                />
              </Stack>
            </Stack>

            {/* Settings / notifications (§27) — future. */}
            <Stack gap="sm">
              <Text variant="headingMedium">알림 · 설정</Text>
              <Card>
                <Stack
                  direction="row"
                  gap="sm"
                  align="center"
                  style={styles.rowBetween}
                >
                  <Text variant="bodyMedium">알림 설정</Text>
                  <StatusBadge label="준비 중" tone="neutral" />
                </Stack>
              </Card>
            </Stack>

            {isAuthenticated ? (
              <Button
                label="로그아웃"
                variant="secondary"
                onPress={() => {
                  void signOut();
                }}
              />
            ) : null}

            <View style={styles.disclaimer}>
              <Text variant="caption" colorToken="textSecondary">
                덕분AI의 해석은 자기이해와 의사결정을 돕기 위한 참고 정보이며,
                의료·법률·투자 등 중대한 판단의 단독 근거로 사용하지 않습니다.
              </Text>
            </View>
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
  rowBetween: {
    justifyContent: 'space-between',
  },
  disclaimer: {
    paddingTop: 4,
    paddingHorizontal: 4,
  },
});
