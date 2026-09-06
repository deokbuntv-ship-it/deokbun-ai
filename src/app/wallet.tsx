import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Candle, CandleGrantSheet } from '@/components/Candle';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { DukBalance } from '@/components/DukBalance';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import { getCandleAvailability, lightCandle } from '@/features/duk/dukWalletService';
import { useWallet } from '@/features/duk/useWallet';
import { candleInitialState, walletStateOf, type CandleUiState } from '@/features/duk/consumerDukView';
import { CANDLE_DUK, DUK_PRICES, WELCOME_DUK, dukLabel } from '@/features/duk/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, spacing } from '@/theme';

// D18 덕 지갑 — DESIGN_FREEZE_FINAL.
//
// One screen must answer five questions: 덕이 뭐야 / 몇 개 있어 / 어떻게 받아 / 어디에 써 / 어디서 충전해.
// The section order below IS that answer, and "덕은 어디에 쓰나요" deliberately shows 5/12/50 up front so
// the user already understands the price before they ever reach a paid entry point.
//
// Economy authority is unchanged and entirely server-side: the 24h cooldown, idempotent grant, and
// reward amount are decided by the RPC. This screen's only jobs are to reflect that state honestly and
// to make the ritual visible:
//   • the balance NEVER moves optimistically — `granted` is reached only after the server confirms;
//   • a failed light says the balance did not change, so no one watches 덕 appear and vanish;
//   • cooldown copy shows a clock time ONLY when the server supplied nextAvailableAt.
export default function WalletScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { isAuthenticated } = useAuth();
  const wallet = useWallet();

  const [candle, setCandle] = useState<CandleUiState>('cooldown');
  const [candleReward, setCandleReward] = useState<number>(CANDLE_DUK);
  const [nextAvailableAtEpoch, setNextAvailableAtEpoch] = useState<number | null>(null);
  const [grantSheet, setGrantSheet] = useState(false);
  const [grantedAmount, setGrantedAmount] = useState(0);

  const loadCandle = useCallback(async () => {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const a = await getCandleAvailability(nowEpoch); // server policy/time is authority
    setCandle(candleInitialState({ canLight: a.canLight }));
    setCandleReward(a.rewardAmount);
    setNextAvailableAtEpoch(a.nextAvailableAtEpoch);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void wallet.refresh();
    void loadCandle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onLightCandle = useCallback(async () => {
    if (candle === 'claiming') return; // re-tap guard; the RPC is idempotent regardless
    setCandle('claiming');
    const r = await lightCandle(); // server-authoritative atomic grant; client never grants
    if (r.status === 'granted') {
      setCandle('granted');
      setGrantedAmount(r.rewardAmount);
      // Refresh FIRST, then celebrate — the sheet must show the server's balance, not a prediction.
      await refreshAfterGrant(wallet.refresh);
      setNextAvailableAtEpoch(r.nextAvailableAt ? Math.floor(new Date(r.nextAvailableAt).getTime() / 1000) : null);
      setGrantSheet(true);
    } else if (r.status === 'error') {
      setCandle('error'); // transient failure — offer retry, do NOT imply cooldown
    } else {
      setCandle('cooldown'); // genuinely not eligible now (server said so)
      setNextAvailableAtEpoch(r.nextAvailableAt ? Math.floor(new Date(r.nextAvailableAt).getTime() / 1000) : null);
    }
  }, [candle, wallet]);

  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const displayWalletState = wallet.loading && !wallet.state ? 'loading' : walletState;
  const balance = wallet.state?.totalSpendable ?? 0;
  const balanceText = dukLabel(balance);

  const SpendRow = ({ emoji, label, sub, amount }: { emoji: string; label: string; sub: string; amount: number }) => (
    <ListRow
      label={label}
      sublabel={sub}
      leading={<Text style={styles.emoji}>{emoji}</Text>}
      showChevron={false}
      trailing={
        <Text variant="bodyMedium" numeric style={{ fontWeight: '700' }}>
          {dukLabel(amount)}
        </Text>
      }
    />
  );

  const EarnRow = ({ emoji, label, sub, amount }: { emoji: string; label: string; sub: string; amount: number }) => (
    <ListRow
      label={label}
      sublabel={sub}
      leading={<Text style={styles.emoji}>{emoji}</Text>}
      showChevron={false}
      trailing={
        <Text variant="bodyMedium" numeric style={{ color: theme.success, fontWeight: '700' }}>
          +{dukLabel(amount)}
        </Text>
      }
    />
  );

  return (
    <Screen padded={false}>
      <AppHeader title="덕" centerTitle showBack onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} showBell />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="xl">
            {/* ① 나의 덕 — the balance plane. Card tap and 충전 are SIBLING controls so the top-up tap is
                never swallowed by the card's own destination. */}
            {isAuthenticated ? (
              <DukBalance
                variant="card"
                state={displayWalletState}
                total={balance}
                onTopup={() => router.push('/duk-topup')}
              />
            ) : (
              <StateView
                kind="empty"
                emoji="🍀"
                title="로그인하면 보유한 덕을 볼 수 있어요"
                actionLabel="로그인하기"
                onAction={() => router.push('/login')}
              />
            )}

            {/* A read failure must never be shown to a paying user as "0덕" — offer the retry instead.
                ⚠ 2026-09-06: 여기가 `walletState` 를 직접 봤다. `walletStateOf` 는 잔액이 undefined 면
                'error' 를 돌려주므로 **아직 불러오는 중에도 "불러오지 못했어요" 가 떴다** — 돈 화면에
                가짜 실패다. 바로 위 잔액 카드는 이미 `displayWalletState`(로딩과 실패를 구분한 값)를
                쓰고 있었으므로, 두 변수 중 잘못된 쪽을 본 것이었다. */}
            {isAuthenticated && displayWalletState === 'error' ? (
              <StateView
                kind="error"
                title="덕 정보를 불러오지 못했어요"
                description="네트워크를 확인하고 다시 시도해 주세요."
                actionLabel="다시 시도"
                onAction={() => void wallet.refresh()}
              />
            ) : null}

            {/* ② 한 줄 정의 */}
            <Text variant="bodyMedium" colorToken="textSecondary">
              덕은 상담과 궁합을 이용할 때 쓰는 덕분이의 이용 단위예요.
            </Text>

            {/* ③ 오늘의 초 — the free earn loop, as a ritual rather than a "+1덕" label. */}
            {isAuthenticated ? (
              <Candle
                state={candle}
                rewardAmount={candleReward}
                nextAvailableAtEpoch={nextAvailableAtEpoch}
                balanceText={balanceText}
                onLight={() => void onLightCandle()}
              />
            ) : null}

            {/* ④ 덕을 얻는 방법 */}
            <Stack gap="xs">
              <Text variant="headingMedium">덕을 얻는 방법</Text>
              <View>
                <EarnRow emoji="🎉" label="가입할 때" sub="계정당 한 번" amount={WELCOME_DUK} />
                <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} />
                <EarnRow emoji="🕯️" label="오늘의 초" sub="하루에 한 번" amount={candleReward} />
              </View>
            </Stack>

            {/* ⑤ 덕은 어디에 쓰나요 — the price is learned HERE, before any paid entry point. */}
            <Stack gap="xs">
              <Text variant="headingMedium">덕은 어디에 쓰나요?</Text>
              <View>
                <SpendRow emoji="💬" label="일반 상담" sub="질문 5번까지 이어서" amount={DUK_PRICES.general} />
                <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} />
                <SpendRow emoji="💕" label="궁합" sub="두 사람의 관계 해석" amount={DUK_PRICES.compatibility} />
                <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} />
                <SpendRow emoji="📖" label="프리미엄 리포트" sub="길게 읽는 종합 해석" amount={DUK_PRICES.premium_report} />
              </View>
            </Stack>

            <Button label="덕 충전하기" variant="secondary" radius="lg" onPress={() => router.push('/duk-topup')} />

            {/* ⑥ 정책 링크 */}
            <View>
              <ListRow label="덕 유료 이용 정책" onPress={() => router.push('/duk-policy')} />
              <View style={[styles.divider, { backgroundColor: theme.lineHairline }]} />
              <ListRow label="환불·청약철회 정책" onPress={() => router.push('/refund-policy')} />
            </View>
          </Stack>
        </View>
      </ScrollView>

      <CandleGrantSheet
        visible={grantSheet}
        rewardAmount={grantedAmount}
        balanceText={balanceText}
        onClose={() => {
          setGrantSheet(false);
          setCandle('cooldown');
        }}
      />

      {/* The wallet is reached from MY, so the bar keeps MY active (freeze D18). */}
      <DetailBottomNav active="my" />
    </Screen>
  );
}

async function refreshAfterGrant(refresh: () => Promise<void>): Promise<void> {
  try { await refresh(); } catch { /* non-blocking */ }
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  divider: { height: 1 },
  emoji: { fontSize: 22, lineHeight: 28 },
});
