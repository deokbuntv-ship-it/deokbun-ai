import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LineIcon, type LineIconName } from '@/components/LineIcon';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { unregisterOnLogout } from '@/features/retention';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 07_MY (§25). Grouped into understandable consumer sections — 서비스 / 알림 / 약관·안내 — instead of one long
// undifferentiated list. Real auth/subject features; no internal auth IDs shown. Every row routes to a real
// screen (policies are DRAFT surfaces, owner-owned).
type MyRow = { icon: LineIconName; label: string; to: Href };

const SERVICE_ROWS: MyRow[] = [
  { icon: 'wallet', label: '덕', to: '/wallet' },
  { icon: 'people', label: '분석 대상자 관리', to: '/subjects' },
];
const ALERT_ROWS: MyRow[] = [
  { icon: 'gear', label: '알림 설정', to: '/notification-settings' },
  { icon: 'calendar', label: '중요한 일정', to: '/life-events' },
];
const POLICY_ROWS: MyRow[] = [
  { icon: 'sparkle', label: 'AI 생성 콘텐츠 안내', to: '/ai-notice' },
  { icon: 'shield', label: '개인정보 처리방침', to: '/privacy-policy' },
  { icon: 'shield', label: '서비스 이용약관', to: '/terms-of-service' },
  { icon: 'wallet', label: '덕 유료 이용 정책', to: '/duk-policy' },
  { icon: 'shield', label: '환불·청약철회 정책', to: '/refund-policy' },
  { icon: 'shield', label: '미성년자 이용 안내', to: '/minor-policy' },
];

export default function MyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { isAuthenticated, authState, signOut } = useAuth();
  const user = authState.user;
  const name = user?.displayName || user?.email || '사용자';

  const chevron = (
    <Text variant="bodyLarge" style={{ color: theme.textMuted, fontWeight: '600' }}>›</Text>
  );

  const RowGroup = ({ title, rows }: { title: string; rows: MyRow[] }) => (
    <Stack gap="sm">
      <Text variant="caption" colorToken="textMuted" style={styles.sectionLabel}>{title}</Text>
      <Card radius="xl">
        <View>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={() => router.push(r.to)}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              style={[styles.row, i > 0 ? { borderTopWidth: 1, borderTopColor: theme.border } : null]}
            >
              <LineIcon name={r.icon} size={22} color={theme.secondary} />
              <Text variant="bodyLarge" style={styles.rowLabel}>{r.label}</Text>
              {chevron}
            </Pressable>
          ))}
        </View>
      </Card>
    </Stack>
  );

  return (
    <Screen padded={false}>
      <AppHeader title="MY" centerTitle showBell />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="xl">
            {/* 내 정보 — tap → 분석 대상자 관리 (canonical SELF birth lives there), one tap away (§9). */}
            {isAuthenticated && user ? (
              <Card radius="xl">
                <Pressable
                  onPress={() => router.push('/subjects')}
                  accessibilityRole="button"
                  accessibilityLabel="내 정보 및 분석 대상자 관리"
                  style={styles.accountRow}
                >
                  <Avatar label={name} size={64} />
                  <Stack gap="xs" style={styles.flex1}>
                    <Text variant="headingMedium" style={styles.accountName}>{name}</Text>
                    {user.email ? (
                      <Text variant="bodyLarge" colorToken="textSecondary">{user.email}</Text>
                    ) : null}
                    <Text variant="bodySmall" colorToken="textSecondary">내 정보 · 분석 대상자 관리</Text>
                  </Stack>
                  {chevron}
                </Pressable>
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

            <RowGroup title="서비스" rows={SERVICE_ROWS} />
            <RowGroup title="알림" rows={ALERT_ROWS} />
            <RowGroup title="약관 및 안내" rows={POLICY_ROWS} />

            {isAuthenticated ? (
              <Pressable
                onPress={async () => {
                  // Disable this user's push devices WHILE still authenticated (owner RLS), then sign out (§J8.6).
                  await unregisterOnLogout().catch(() => {});
                  await signOut();
                }}
                accessibilityRole="button"
                accessibilityLabel="로그아웃"
                style={styles.logout}
              >
                <Text variant="bodyLarge" colorToken="danger" style={styles.rowLabel}>로그아웃</Text>
              </Pressable>
            ) : null}

            <Text variant="caption" colorToken="textSecondary" style={styles.disclaimer}>
              덕분이의 해석은 자기이해와 의사결정을 돕기 위한 참고 정보이며,
              의료·법률·투자 등 중대한 판단의 단독 근거로 사용하지 않습니다.
            </Text>
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  flex1: { flex: 1 },
  accountName: { fontWeight: '700' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionLabel: { fontWeight: '700', paddingHorizontal: spacing.xs, letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
  rowLabel: { flex: 1, fontWeight: '600' },
  logout: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing.sm },
  disclaimer: { paddingTop: spacing.lg, paddingHorizontal: spacing.xs, borderRadius: radius.none },
});
