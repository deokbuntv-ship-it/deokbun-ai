import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { getCandleAvailability, lightCandle } from '@/features/duk/dukWalletService';
import { useWallet } from '@/features/duk/useWallet';
import {
  candleCopy, candleInitialState, walletHeadline, walletStateOf, type CandleUiState,
} from '@/features/duk/consumerDukView';
import { CANDLE_DUK, DUK_PRICES, WELCOME_DUK, dukLabel } from '@/features/duk/pricing';
import { spacing } from '@/theme';

// 덕(Duk) wallet — store-independent consumer surface (Sprint J1). Read-only balance (server authority) + the free
// candle earn loop + how-덕-works. Purchase/top-up is a separate store-gated shell (/duk-topup). No client grant.
export default function WalletScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const wallet = useWallet();
  const [candle, setCandle] = useState<CandleUiState>('cooldown');

  const loadCandle = useCallback(async () => {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const a = await getCandleAvailability(nowEpoch); // server policy/time is authority
    setCandle(candleInitialState({ canLight: a.canLight }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void wallet.refresh();
    void loadCandle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onLightCandle = useCallback(async () => {
    setCandle('claiming');
    const r = await lightCandle(); // server-authoritative atomic grant; client never grants
    if (r.granted) {
      setCandle('granted');
      await refreshAfterGrant(wallet.refresh);
    } else {
      setCandle('cooldown'); // not eligible now (server said so)
    }
  }, [wallet]);

  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const headline = wallet.loading && !wallet.state
    ? walletHeadline('loading', 0)
    : walletHeadline(walletState, wallet.state?.totalSpendable ?? 0);

  return (
    <Screen padded={false} frame>
      <AppHeader title="덕" centerTitle onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          <Stack gap="xl">
            {/* Balance (server authority) */}
            <Card radius="xl">
              <Stack gap="xs">
                <Text variant="bodyMedium" colorToken="textSecondary">보유한 덕</Text>
                {wallet.loading && !wallet.state ? (
                  <ActivityIndicator />
                ) : (
                  <Text variant="headingLarge" style={styles.balance}>{headline}</Text>
                )}
                {!isAuthenticated ? (
                  <Button label="로그인하기" radius="lg" onPress={() => router.push('/login')} style={{ marginTop: spacing.sm }} />
                ) : null}
              </Stack>
            </Card>

            {/* Candle — the free daily earn loop */}
            {isAuthenticated ? (
              <Card radius="xl">
                <Stack gap="sm">
                  <Text variant="bodyLarge" style={styles.cardTitle}>오늘의 덕</Text>
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    하루에 한 번 촛불을 켜면 {dukLabel(CANDLE_DUK)}을 받아요.
                  </Text>
                  <Button
                    label={candleCopy(candle)}
                    radius="lg"
                    disabled={candle !== 'eligible'}
                    onPress={() => void onLightCandle()}
                  />
                </Stack>
              </Card>
            ) : null}

            {/* How 덕 works */}
            <Card radius="xl">
              <Stack gap="md">
                <Text variant="bodyLarge" style={styles.cardTitle}>덕은 이렇게 쓰여요</Text>
                <Text variant="bodyMedium" colorToken="textSecondary">덕은 상담과 궁합 등에 사용할 수 있어요.</Text>
                <View style={styles.line}><Text variant="bodyMedium">일반 상담</Text><Text variant="bodyMedium" style={styles.amount}>{dukLabel(DUK_PRICES.general)}</Text></View>
                <View style={styles.line}><Text variant="bodyMedium">궁합</Text><Text variant="bodyMedium" style={styles.amount}>{dukLabel(DUK_PRICES.compatibility)}</Text></View>
                <View style={[styles.line, styles.divider]}><Text variant="bodyMedium" colorToken="textSecondary">가입 시</Text><Text variant="bodyMedium" style={styles.amount}>+{dukLabel(WELCOME_DUK)}</Text></View>
                <View style={styles.line}><Text variant="bodyMedium" colorToken="textSecondary">하루 한 번 촛불</Text><Text variant="bodyMedium" style={styles.amount}>+{dukLabel(CANDLE_DUK)}</Text></View>
              </Stack>
            </Card>

            <Button label="덕 충전" variant="secondary" radius="lg" onPress={() => router.push('/duk-topup')} />
          </Stack>
        </View>
      </ScrollView>
    </Screen>
  );
}

async function refreshAfterGrant(refresh: () => Promise<void>): Promise<void> {
  try { await refresh(); } catch { /* non-blocking */ }
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  balance: { fontWeight: '700' },
  cardTitle: { fontWeight: '700' },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  amount: { fontWeight: '700' },
  divider: { borderTopWidth: 1, borderTopColor: '#E5E1D8', paddingTop: spacing.sm, marginTop: spacing.xs },
});
