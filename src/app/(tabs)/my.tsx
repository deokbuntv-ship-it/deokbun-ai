import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LineIcon } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 07_MY (Stitch my). Account card → 분석 대상자 관리 → 설정/약관 → 로그아웃.
// Connected to real auth/subject features; no internal auth IDs are shown.
// 설정/약관 screens don't exist yet, so they carry a truthful 준비 중 marker.
export default function MyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { isAuthenticated, authState, signOut } = useAuth();
  const user = authState.user;
  const name = user?.displayName || user?.email || '사용자';

  return (
    <Screen padded={false}>
      <AppHeader title="MY" centerTitle />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <Stack gap="xl">
            {/* Account */}
            {isAuthenticated && user ? (
              <Card radius="xl">
                <Stack direction="row" gap="md" align="center">
                  <Avatar label={name} size={64} />
                  <Stack gap="xs" style={styles.flex1}>
                    <Text variant="headingMedium" style={styles.accountName}>
                      {name}
                    </Text>
                    {user.email ? (
                      <Text variant="bodyLarge" colorToken="textSecondary">
                        {user.email}
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>
              </Card>
            ) : (
              <Card radius="xl">
                <Stack gap="md">
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    로그인하면 분석 대상자와 상담 기록을 저장할 수 있어요.
                  </Text>
                  <Button label="로그인하기" radius="lg" onPress={() => router.push('/login')} />
                </Stack>
              </Card>
            )}

            {/* 분석 대상자 관리 */}
            <Card radius="xl">
              <Pressable
                onPress={() => router.push('/subjects')}
                accessibilityRole="button"
                style={styles.row}
              >
                <LineIcon name="people" size={22} color={theme.secondary} />
                <Text variant="bodyLarge" style={styles.rowLabel}>
                  분석 대상자 관리
                </Text>
                <Text variant="bodyLarge" style={styles.chevron}>
                  ›
                </Text>
              </Pressable>
            </Card>

            {/* 설정 / 약관 (future) */}
            <Card radius="xl">
              <View>
                <View style={styles.rowStatic}>
                  <LineIcon name="gear" size={22} color={theme.secondary} />
                  <Text variant="bodyLarge" style={styles.rowLabel}>
                    설정
                  </Text>
                  <StatusBadge label="준비 중" tone="neutral" pill />
                </View>
                <View style={[styles.rowStatic, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                  <LineIcon name="shield" size={22} color={theme.secondary} />
                  <Text variant="bodyLarge" style={styles.rowLabel}>
                    약관 및 정책
                  </Text>
                  <StatusBadge label="준비 중" tone="neutral" pill />
                </View>
              </View>
            </Card>

            {/* 로그아웃 */}
            {isAuthenticated ? (
              <Pressable
                onPress={() => {
                  void signOut();
                }}
                accessibilityRole="button"
                style={styles.logout}
              >
                <Text variant="bodyLarge" colorToken="danger" style={styles.rowLabel}>
                  로그아웃
                </Text>
              </Pressable>
            ) : null}

            <Text variant="caption" colorToken="textSecondary" style={styles.disclaimer}>
              덕분AI의 해석은 자기이해와 의사결정을 돕기 위한 참고 정보이며,
              의료·법률·투자 등 중대한 판단의 단독 근거로 사용하지 않습니다.
            </Text>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  flex1: {
    flex: 1,
  },
  accountName: {
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  rowStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontWeight: '600',
  },
  chevron: {
    color: '#C6C9D0',
    fontWeight: '600',
  },
  logout: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.xl,
  },
  disclaimer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.none,
  },
});
