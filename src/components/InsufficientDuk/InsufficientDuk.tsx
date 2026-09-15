import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { insufficientView } from '@/features/duk/consumerDukView';
import { dukLabel, type DukProduct } from '@/features/duk/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C07 — "덕이 조금 부족해요".
//
// NEVER an Alert. A modal here would tear the user out of the flow at the exact moment they need to
// see three numbers and two ways forward, so this is always an in-flow block.
//
// Every number is the AUTHORITATIVE server snapshot passed straight through insufficientView(); this
// component performs no arithmetic on balances. The primary action is likewise the view's decision
// (light today's candle if eligible, otherwise come back tomorrow) — the UI does not re-decide it.
type InsufficientDukProps = {
  product: DukProduct;
  /** Server snapshot. Never client-computed. */
  snapshot: { balance: number; required: number; shortfall: number };
  /** Server candle eligibility — drives CANDLE vs TOMORROW. */
  candleEligible: boolean;
  onCandle: () => void;
  onTopup: () => void;
  style?: StyleProp<ViewStyle>;
};

export function InsufficientDuk({
  product,
  snapshot,
  candleEligible,
  onCandle,
  onTopup,
  style,
}: InsufficientDukProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const view = insufficientView(product, snapshot, candleEligible);

  const Row = ({ label, value, strong }: { label: string; value: number; strong?: boolean }) => (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={{ color: theme.onBlush }}>
        {label}
      </Text>
      <Text variant="bodyMedium" numeric style={{ color: theme.onBlush, fontWeight: strong ? '700' : '600' }}>
        {dukLabel(value)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.block, { backgroundColor: theme.surfaceBlush }, style]}>
      <Stack gap="sm">
        <Text variant="bodyLarge" style={{ color: theme.onBlush, fontWeight: '700' }}>
          🍀 덕이 조금 부족해요
        </Text>
        <View>
          <Row label="지금 있는 덕" value={view.available} />
          <Row label={`${view.productLabel}에 필요한 덕`} value={view.required} />
          <Row label="더 필요한 덕" value={view.shortfall} strong />
        </View>
        <Button
          label={view.primaryAction === 'CANDLE' ? '🕯️ 오늘의 초 확인하기' : '내일 다시 받을 수 있어요'}
          radius="lg"
          onPress={onCandle}
        />
        {view.topupAvailable ? (
          <Button label="덕 충전하기" variant="secondary" radius="lg" onPress={onTopup} />
        ) : null}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: radius.xl, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: 30 },
});
