import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';

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
            <Text variant="displayMedium">마이</Text>

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
                    로그인하면 상담 대상과 상담 기록을 저장할 수 있어요.
                  </Text>
                  <Button label="로그인하기" onPress={() => router.push('/login')} />
                </Stack>
              </Card>
            )}

            {/* Quick links */}
            <Stack gap="sm">
              <Text variant="headingMedium">바로가기</Text>
              <Stack gap="sm">
                <Button
                  label="상담 대상 · 상담 시작"
                  variant="secondary"
                  onPress={() => router.push('/consult')}
                />
                <Button
                  label="오늘의 운세"
                  variant="secondary"
                  onPress={() => router.push('/today')}
                />
                <Button
                  label="운세 우편함"
                  variant="secondary"
                  onPress={() => router.push('/records')}
                />
                <Button
                  label="콘텐츠 둘러보기"
                  variant="secondary"
                  onPress={() => router.push('/content')}
                />
              </Stack>
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
  disclaimer: {
    paddingTop: 4,
    paddingHorizontal: 4,
  },
});
