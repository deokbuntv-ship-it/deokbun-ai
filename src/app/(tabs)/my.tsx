import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CandleStrip } from '@/components/Candle';
import { DukBalance } from '@/components/DukBalance';
import { LineIcon } from '@/components/LineIcon';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { buildBannerInfo, buildBannerLine } from '@/config/buildBanner';
import { useAuth } from '@/features/auth';
import { useConsultationSubjects } from '@/features/consultation';
import { walletStateOf } from '@/features/duk/consumerDukView';
import { getCandleAvailability } from '@/features/duk/dukWalletService';
import { CANDLE_DUK, dukLabel } from '@/features/duk/pricing';
import { useWallet } from '@/features/duk/useWallet';
import { unregisterOnLogout, useNotificationUnread } from '@/features/retention';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, radius, spacing } from '@/theme';

// D23 MY — DESIGN_FREEZE_FINAL.
//
// MY is a Personal Hub ("내 자산과 기록"), not a settings dump. The old 카테고리 → 서비스 → 덕 three-level
// path is gone: 덕 is the SECOND block, so it is one tap away and 충전 is one tap away.
//   ① 프로필 ② 🍀 나의 덕 (색면) ③ 🕯️초 / 👥대상자 / 🔔알림 3-up ④ 나의 기록 ⑤ 서비스 안내 ⑥ 로그아웃
// Only ASSETS (덕 · 촛불 · 대상자 · 알림) are cards; everything else is a plain H56 row.
type MyRow = { label: string; to: Href };

const RECORD_ROWS: MyRow[] = [
  { label: '분석 대상자 관리', to: '/subjects' },
  { label: '중요한 일정', to: '/life-events' },
  { label: '알림 설정', to: '/notification-settings' },
];
const POLICY_ROWS: MyRow[] = [
  // 문의하기 leads the group: it is the only row here someone opens because they need help,
  // and the privacy policy (legalContent.ts:86) promises this channel exists.
  { label: '문의하기', to: '/support' },
  { label: 'AI 생성 콘텐츠 안내', to: '/ai-notice' },
  { label: '개인정보 처리방침', to: '/privacy-policy' },
  { label: '서비스 이용약관', to: '/terms-of-service' },
  { label: '덕 유료 이용 정책', to: '/duk-policy' },
  { label: '환불·청약철회 정책', to: '/refund-policy' },
  { label: '미성년자 이용 안내', to: '/minor-policy' },
];

export default function MyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { isAuthenticated, authState, signOut } = useAuth();
  const user = authState.user;
  const name = user?.displayName || user?.email || '사용자';

  const wallet = useWallet();
  const { subjects } = useConsultationSubjects();
  const { unreadCount } = useNotificationUnread();

  useEffect(() => {
    if (isAuthenticated) void wallet.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const [candleEligible, setCandleEligible] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void getCandleAvailability(Math.floor(Date.now() / 1000))
      .then((a) => {
        if (active) setCandleEligible(a.canLight);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const displayWalletState = wallet.loading && !wallet.state ? 'loading' : walletState;

  const RowGroup = ({ title, rows }: { title: string; rows: MyRow[] }) => (
    <Stack gap="xs">
      <Text variant="headingMedium">{title}</Text>
      <View>
        {rows.map((r, i) => (
          <View key={r.label}>
            {i > 0 ? <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} /> : null}
            <ListRow label={r.label} onPress={() => router.push(r.to)} />
          </View>
        ))}
      </View>
    </Stack>
  );

  return (
    <Screen padded={false}>
      <AppHeader title="MY" centerTitle showBell />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            {/* ① 프로필 — the account row. Tapping goes to 분석 대상자 관리, where the canonical SELF
                birth profile lives. */}
            {isAuthenticated && user ? (
              <Pressable
                onPress={() => router.push('/subjects')}
                accessibilityRole="button"
                accessibilityLabel="내 정보 및 분석 대상자 관리"
                style={({ pressed }) => [
                  styles.accountRow,
                  { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
                ]}
              >
                <Avatar label={name} size={52} />
                <Stack gap="xs" style={styles.flex1}>
                  <Text variant="headingLarge" numberOfLines={1} style={styles.accountName}>
                    {name}
                  </Text>
                  {user.email ? (
                    <Text variant="bodySmall" colorToken="textSecondary" numberOfLines={1}>
                      {user.email}
                    </Text>
                  ) : null}
                </Stack>
                <LineIcon name="chevron-right" size={18} color={theme.textMuted} />
              </Pressable>
            ) : (
              <Stack gap="md">
                <Text variant="bodyMedium" colorToken="textSecondary">
                  로그인하면 분석 대상자와 상담 기록을 저장할 수 있어요.
                </Text>
                <Button label="로그인하기" radius="lg" onPress={() => router.push('/login')} />
              </Stack>
            )}

            {/* ② 나의 덕 — the second entry point into the economy. Card tap → 지갑, 충전 pill → 충전;
                two SIBLING controls, because nesting them would let the card swallow the 충전 tap. */}
            {isAuthenticated ? (
              <DukBalance
                variant="card"
                state={displayWalletState}
                total={wallet.state?.totalSpendable ?? 0}
                onPress={() => router.push('/wallet')}
                onTopup={() => router.push('/duk-topup')}
              />
            ) : null}

            {/* ③ 3-up assets. Every tile flexes with minWidth 0 and its label is one ellipsised line,
                so 360dp holds three tiles without a horizontal scroll. */}
            {isAuthenticated ? (
              <View style={styles.threeUp}>
                <CandleStrip
                  lit={candleEligible === false}
                  hint={
                    candleEligible === null
                      ? '확인 중'
                      : candleEligible
                        ? `+${dukLabel(CANDLE_DUK)}`
                        : '내일 다시'
                  }
                  onPress={() => router.push('/wallet')}
                />
                <Pressable
                  onPress={() => router.push('/subjects')}
                  accessibilityRole="button"
                  accessibilityLabel="분석 대상자 관리"
                  style={({ pressed }) => [
                    styles.tile,
                    { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceSky },
                  ]}
                >
                  <Text style={styles.tileEmoji}>👥</Text>
                  <Text variant="bodySmall" numberOfLines={1} ellipsizeMode="tail" style={styles.tileLabel}>
                    분석 대상자
                  </Text>
                  <Text variant="caption" colorToken="textSecondary" numeric numberOfLines={1}>
                    {`${subjects.length}명`}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/notifications')}
                  accessibilityRole="button"
                  accessibilityLabel="알림 센터"
                  style={({ pressed }) => [
                    styles.tile,
                    { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceLavender },
                  ]}
                >
                  <Text style={styles.tileEmoji}>🔔</Text>
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.tileLabel, { color: theme.onLavender }]}
                  >
                    알림
                  </Text>
                  <Text variant="caption" numeric numberOfLines={1} style={{ color: theme.onLavender }}>
                    {unreadCount > 0 ? `새 소식 ${unreadCount > 9 ? '9+' : unreadCount}` : '새 소식 없음'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <RowGroup title="나의 기록" rows={RECORD_ROWS} />
            <RowGroup title="서비스 안내" rows={POLICY_ROWS} />

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
                <Text variant="bodyLarge" colorToken="textSecondary" style={styles.logoutLabel}>
                  로그아웃
                </Text>
              </Pressable>
            ) : null}

            {/* 계정 탈퇴 — directly under 로그아웃, not buried. Apple requires an in-app deletion
                path (App Store Review 5.1.1(v)) and the privacy policy already promises one.
                Quieter than 로그아웃 because it is rarer, never HIDDEN because hiding it is the
                dark pattern the guideline exists to prevent. */}
            {isAuthenticated ? (
              <Pressable
                onPress={() => router.push('/account-delete')}
                accessibilityRole="button"
                accessibilityLabel="계정 탈퇴"
                style={styles.deleteAccount}
              >
                <Text variant="bodySmall" colorToken="textMuted">
                  계정 탈퇴
                </Text>
              </Pressable>
            ) : null}

            <Text variant="caption" colorToken="textMuted" style={styles.disclaimer}>
              덕분이의 해석은 자기이해와 의사결정을 돕기 위한 참고 정보이며,
              의료·법률·투자 등 중대한 판단의 단독 근거로 사용하지 않습니다.
            </Text>

            {/* ⚠ 내부 테스트 빌드에서만 보인다. 스토어 빌드(production 프로필)에서는 `null` 이라
                아무것도 그려지지 않는다 — `buildBanner.test.ts` 가 양방향으로 잠근다.
                왜 필요한가: 오너가 폰에서 레이아웃을 볼 때, 그 빌드가 어느 DB 를 보는지 화면에
                없으면 남긴 데이터가 어디에 쌓였는지 나중에 알 수 없다(H5 가 그 사고였다). */}
            {buildBannerLine(buildBannerInfo()) ? (
              <Text variant="caption" colorToken="textMuted" style={styles.buildBanner}>
                {buildBannerLine(buildBannerInfo())}
              </Text>
            ) : null}
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  flex1: { flex: 1, minWidth: 0 },
  accountName: { fontWeight: '700' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    borderRadius: radius.xl,
  },
  threeUp: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
    minHeight: 76,
    justifyContent: 'center',
  },
  tileEmoji: { fontSize: 20, lineHeight: 26 },
  tileLabel: { fontWeight: '700' },
  divider: { height: 1 },
  logout: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing.sm },
  logoutLabel: { fontWeight: '600' },
  deleteAccount: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  disclaimer: { paddingTop: spacing.lg, paddingHorizontal: spacing.xs, lineHeight: 18 },
  // 내부 빌드 전용 한 줄. 눈에 띄되 화면을 차지하지 않게 — 오너가 확인용으로만 본다.
  buildBanner: { paddingTop: spacing.sm, paddingHorizontal: spacing.xs, opacity: 0.7 },
});
