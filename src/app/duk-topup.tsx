import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { DetailBottomNav } from '@/components/DetailBottomNav';
import { Screen } from '@/components/Screen';
import { Stack } from '@/components/Stack';
import { StateView } from '@/components/StateView';
import { Text } from '@/components/Text';
import { useAuth } from '@/features/auth';
import { walletStateOf } from '@/features/duk/consumerDukView';
import { TOPUP_PACKS, dukLabel } from '@/features/duk/pricing';
import { useWallet } from '@/features/duk/useWallet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConsumerLayout } from '@/hooks/useConsumerLayout';
import { colors, radius, spacing } from '@/theme';

// D19 덕 충전 — DESIGN_FREEZE_FINAL.
//
// PREPARATION-ONLY in this build: store/business provisioning is deferred (05B). The purchase authority
// is untouched — no store API is called here, no product id is fabricated, and no buy path can report a
// fake success. The ONLY thing the store flag changes is the button.
//
// The layout is IDENTICAL in both states, which is the point of the freeze's rule here: when the store
// opens, this screen does not get rebuilt — the flag flips and the "준비 중" pill becomes "구매".
//
// Pack information (수량 · 라벨 · 가격) renders at FULL contrast even while inactive. Dimming the packs
// with opacity would drag every descendant below AA and hide the very information the user came for;
// inactivity belongs on the control, never on the content.
export default function DukTopupScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { hPad, maxWidth } = useConsumerLayout();
  const { isAuthenticated } = useAuth();
  const wallet = useWallet();


  const walletState = walletStateOf({
    signedOut: !isAuthenticated,
    error: wallet.error,
    totalSpendable: wallet.loading && !wallet.state ? undefined : wallet.state?.totalSpendable ?? (wallet.error ? null : 0),
  });
  const balance = wallet.state?.totalSpendable ?? 0;
  const balanceKnown = walletState === 'loaded' || walletState === 'zero';

  return (
    <Screen padded={false}>
      <AppHeader
        title="덕 충전"
        centerTitle
        showBack
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/wallet'))}
        showBell
      />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.wrapper, { maxWidth }]}>
          <Stack gap="lg">
            {/* 보유 덕 요약 */}
            <View style={[styles.balance, { backgroundColor: theme.surfaceSage }]}>
              <Text variant="bodyMedium" numeric style={{ color: theme.onSage, fontWeight: '700' }}>
                {balanceKnown ? `🍀 지금 ${dukLabel(balance)} 있어요` : '🍀 덕을 불러오는 중…'}
              </Text>
            </View>

            <StateView
              kind="preparing"
              title="덕 충전은 준비 중이에요"
              description="스토어 결제가 열리면 바로 알려드릴게요. 그동안은 🕯️ 오늘의 초로 덕을 모을 수 있어요."
            />

            {TOPUP_PACKS.map((p) => (
              <Card key={p.internalKey} radius="xl">
                <View style={styles.packRow}>
                  <View style={[styles.packTile, { backgroundColor: theme.surfaceSage }]}>
                    <Text style={styles.packEmoji}>🍀</Text>
                  </View>
                  <Stack gap="xs" style={styles.flex1}>
                    <View style={styles.packTitleRow}>
                      <Text variant="bodyLarge" numeric style={styles.packAmount}>
                        {dukLabel(p.duk)}
                      </Text>
                      <View style={[styles.packTag, { backgroundColor: theme.backgroundElevated }]}>
                        <Text variant="caption" colorToken="textSecondary" style={styles.packTagText}>
                          {p.firstOnly ? `${p.label} · 처음 한 번` : p.label}
                        </Text>
                      </View>
                    </View>
                    {p.priceKrwHint != null ? (
                      <Text variant="bodySmall" colorToken="textSecondary" numeric>
                        ₩{p.priceKrwHint.toLocaleString()}
                      </Text>
                    ) : null}
                  </Stack>
                  {/* Inactivity lives on the CONTROL, at full contrast (#EFEAE0 / #4C463B ≈ 6.7:1) — not
                      as an opacity wash over the pack, which would take the price and amount down with it.
                      05B attaches the verified purchase control in this exact slot; nothing else moves. */}
                  <View style={[styles.soonPill, { backgroundColor: theme.actionDisabledBg }]}>
                    <Text variant="bodySmall" style={styles.soonText}>
                      준비 중
                    </Text>
                  </View>
                </View>
              </Card>
            ))}

            <Text variant="caption" colorToken="textMuted" style={styles.foot}>
              결제는 Google Play / App Store를 통해 이루어지며, 충전한 덕은 환불 정책에 따라 처리됩니다.
              덕은 현금으로 교환하거나 다른 계정에 넘길 수 없어요.
            </Text>
          </Stack>
        </View>
      </ScrollView>

      {/* 충전 is reached from MY / the wallet, so the bar keeps MY active (freeze D19). */}
      <DetailBottomNav active="my" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: spacing.md, paddingBottom: 40, alignItems: 'center' },
  wrapper: { width: '100%', alignSelf: 'center' },
  balance: { borderRadius: radius.xl, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 48, justifyContent: 'center' },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  packTile: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  packEmoji: { fontSize: 22, lineHeight: 28 },
  packTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  packAmount: { fontWeight: '700' },
  packTag: { borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  packTagText: { fontWeight: '600' },
  soonPill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  soonText: { color: '#4C463B', fontWeight: '700' },
  flex1: { flex: 1, minWidth: 0 },
  foot: { paddingTop: spacing.sm, paddingHorizontal: spacing.xs, lineHeight: 18 },
});
