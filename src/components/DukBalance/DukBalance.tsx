import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { walletHeadline, type WalletLoadState } from '@/features/duk/consumerDukView';
import { dukLabel } from '@/features/duk/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C04 — the ONE 덕 balance surface, shared by Home, MY, the wallet, and the
// price-confirm sheet so the number is identical everywhere.
//
// The balance is ALWAYS the server total. This component takes it as a prop and renders it; it never
// sums, caches, or optimistically adjusts. Loading and error are first-class states with the exact
// wallet copy (walletHeadline), because a blank or zero balance during a fetch reads as "you have no
// 덕" — the single most damaging thing this screen can lie about.
export type DukBalanceVariant = 'chip' | 'card' | 'inline';

type DukBalanceProps = {
  variant: DukBalanceVariant;
  state: WalletLoadState;
  /** Server-authoritative spendable total. Only read when `state === 'loaded' | 'zero'`. */
  total: number;
  /** card/chip: opens the wallet. */
  onPress?: () => void;
  /**
   * card only: the 충전 action. Rendered as a SIBLING control, never nested inside the card's own
   * press target — nesting would let the card swallow the top-up tap (freeze D23 "중첩 금지").
   */
  onTopup?: () => void;
  /** inline only: the cost being confirmed, shown beside the balance. */
  required?: number;
  style?: StyleProp<ViewStyle>;
};

function amountText(state: WalletLoadState, total: number): string {
  return state === 'loaded' || state === 'zero' ? dukLabel(total) : walletHeadline(state, total);
}

export function DukBalance({ variant, state, total, onPress, onTopup, required, style }: DukBalanceProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const known = state === 'loaded' || state === 'zero';

  if (variant === 'chip') {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`덕 잔액 ${amountText(state, total)}`}
        style={({ pressed }) => [
          styles.chip,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceSage },
          style as ViewStyle,
        ]}
      >
        <Text style={styles.emojiSm}>🍀</Text>
        <Text variant="bodySmall" numeric={known} style={{ color: theme.onSage, fontWeight: '700' }} numberOfLines={1}>
          {amountText(state, total)}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineRow, style]}>
        <Text variant="bodyMedium" colorToken="textSecondary" style={styles.flex1}>
          지금 있는 덕
        </Text>
        <Text variant="bodyMedium" numeric={known} style={{ color: theme.onSage, fontWeight: '700' }}>
          {required != null ? `${amountText(state, total)} · 필요 ${dukLabel(required)}` : amountText(state, total)}
        </Text>
      </View>
    );
  }

  // card — the reward plane. Two destinations on one surface, so they are two sibling Pressables.
  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceSage }, style]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel="덕 지갑 열기"
        style={styles.cardMain}
      >
        <Text style={styles.emojiLg}>🍀</Text>
        <View style={styles.flexShrink}>
          <Text variant="bodySmall" style={{ color: theme.onSage, fontWeight: '600' }}>
            나의 덕
          </Text>
          <Text
            variant="headingLarge"
            numeric={known}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: theme.onSage, fontSize: known ? 26 : 17, lineHeight: known ? 34 : 24 }}
          >
            {amountText(state, total)}
          </Text>
        </View>
      </Pressable>
      {onTopup ? (
        <Pressable
          onPress={onTopup}
          accessibilityRole="button"
          accessibilityLabel="덕 충전하기"
          style={({ pressed }) => [
            styles.topup,
            { backgroundColor: pressed ? theme.brandPrimaryPressed : theme.brandPrimary },
          ]}
        >
          <Text variant="bodySmall" style={{ color: theme.brandPrimaryText, fontWeight: '700' }}>
            충전
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 76,
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minWidth: 0 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  topup: {
    minHeight: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSm: { fontSize: 13, lineHeight: 18 },
  emojiLg: { fontSize: 26, lineHeight: 32 },
  flex1: { flex: 1 },
  flexShrink: { flex: 1, minWidth: 0 },
});
