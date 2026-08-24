import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type { CandleUiState } from '@/features/duk/consumerDukView';
import { dukLabel } from '@/features/duk/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C05 / D18-C — 오늘의 초.
//
// The ritual is the point: an unlit candle actually catches light, and only THEN does the balance
// move. Two invariants this component exists to protect:
//   1. NO optimistic increment. `granted` is only ever reached after the server confirms; a failed
//      grant must never show a balance that rises and falls back.
//   2. NO fabricated countdown. Cooldown copy says "내일" unless the server supplied
//      nextAvailableAtEpoch, in which case the real time is shown.
// Reward amount and cooldown come from the server (economy_policy) — this file hardcodes neither.

// Shape-based candle. Stands in for the `candle-lit` / `candle-unlit` illustration slots until the
// commissioned art lands; it is the sanctioned fallback, not a placeholder box.
function CandleGraphic({ lit, size = 64, animate }: { lit: boolean; size?: number; animate: boolean }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const flicker = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lit || !animate) {
      flicker.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit, animate, flicker]);

  const bodyW = size * 0.34;
  const bodyH = size * 0.58;
  const flameH = size * 0.3;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      {lit ? (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 0.78,
              height: size * 0.78,
              borderRadius: size * 0.39,
              backgroundColor: theme.surfaceButter,
              bottom: bodyH * 0.55,
              opacity: flicker.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] }),
            },
          ]}
        />
      ) : null}
      {lit ? (
        <Animated.View
          style={{
            width: flameH * 0.56,
            height: flameH,
            borderTopLeftRadius: flameH * 0.28,
            borderTopRightRadius: flameH * 0.28,
            borderBottomLeftRadius: flameH * 0.34,
            borderBottomRightRadius: flameH * 0.34,
            backgroundColor: '#E9A93C',
            marginBottom: 2,
            transform: [
              { scale: flicker.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) },
              { translateY: flicker.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
            ],
          }}
        />
      ) : (
        // unlit — just the wick
        <View style={{ width: 2, height: size * 0.12, backgroundColor: theme.textSecondary, borderRadius: 1, marginBottom: 2 }} />
      )}
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderRadius: bodyW * 0.28,
          backgroundColor: lit ? '#FBEFD2' : theme.backgroundElevated,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      />
    </View>
  );
}

/** Honest cooldown line: a clock time ONLY when the server gave us one. */
function cooldownLine(nextAvailableAtEpoch: number | null): string {
  if (nextAvailableAtEpoch == null) return '다음 초는 내일 다시 밝힐 수 있어요.';
  const d = new Date(nextAvailableAtEpoch * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `다음 초는 ${hh}:${mm} 이후에 다시 밝힐 수 있어요.`;
}

/** Reduce-motion: flicker and glow pulse stop, and only the final state remains. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (active) setReduce(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduce(v));
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

type CandleProps = {
  state: CandleUiState;
  /** Server reward amount (economy_policy.candle_reward). */
  rewardAmount: number;
  /** Server-supplied next-eligible time; null → the copy says "내일", never a made-up clock. */
  nextAvailableAtEpoch?: number | null;
  /** Shown in the error copy so the user can see the balance did NOT move. */
  balanceText?: string;
  errorReason?: string;
  onLight?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Full 5-state card (wallet). */
export function Candle({
  state,
  rewardAmount,
  nextAvailableAtEpoch = null,
  balanceText,
  errorReason,
  onLight,
  style,
}: CandleProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const reduceMotion = useReduceMotion();
  const lit = state === 'granted' || state === 'cooldown';

  if (state === 'error') {
    return (
      <Card use="status" statusColor={theme.danger} radius="xl" style={style}>
        <Stack gap="sm">
          <Text variant="bodyLarge" style={styles.title}>
            초를 밝히지 못했어요
          </Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            {errorReason ?? '연결이 잠시 끊겼어요.'}
          </Text>
          {/* The reassurance comes FIRST in the user's mind — say the money is safe before offering retry. */}
          <Text variant="bodyMedium" colorToken="textSecondary">
            {balanceText ? `덕은 지급되지 않았어요. 잔액은 그대로 ${balanceText}이에요.` : '덕은 지급되지 않았어요. 잔액은 그대로예요.'}
          </Text>
          <Button label="다시 시도" radius="lg" onPress={onLight} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card use={lit ? 'reward' : 'content'} tone="butter" radius="xl" style={style}>
      <Stack direction="row" gap="md" align="center">
        <CandleGraphic lit={lit} size={62} animate={!reduceMotion} />
        <Stack gap="xs" style={styles.flex1}>
          <Text variant="bodyLarge" style={[styles.title, lit ? { color: theme.onButter } : null]}>
            {lit ? '오늘의 초를 밝혔어요' : '🕯️ 오늘의 초'}
          </Text>
          <Text
            variant="bodyMedium"
            colorToken={lit ? 'onButter' : 'textSecondary'}
            style={lit ? undefined : { color: theme.textSecondary }}
          >
            {state === 'cooldown'
              ? cooldownLine(nextAvailableAtEpoch)
              : state === 'granted'
                ? `+${dukLabel(rewardAmount)}을 받았어요.`
                : `하루에 한 번, 오늘의 초를 밝혀보세요. 초를 밝히면 +${dukLabel(rewardAmount)}을 받을 수 있어요.`}
          </Text>
        </Stack>
      </Stack>
      {state === 'eligible' || state === 'claiming' ? (
        <Button
          label={state === 'claiming' ? '받는 중' : '초 밝히기'}
          radius="lg"
          loading={state === 'claiming'}
          // Re-tap during the request is blocked here AND idempotently on the server.
          disabled={state === 'claiming'}
          onPress={onLight}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Card>
  );
}

/** Compact tile for Home / MY. Never lights the candle itself — it routes to the wallet ritual. */
export function CandleStrip({
  lit,
  hint,
  onPress,
  style,
}: {
  lit: boolean;
  hint: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const reduceMotion = useReduceMotion();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`오늘의 초 — ${hint}`}
      style={({ pressed }) => [
        styles.strip,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.surfaceButter },
        style as ViewStyle,
      ]}
    >
      <CandleGraphic lit={lit} size={38} animate={!reduceMotion} />
      <View style={styles.flexShrink}>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.onButter, fontWeight: '700' }}>
          오늘의 초
        </Text>
        <Text variant="bodySmall" numberOfLines={2} style={{ color: theme.onButter, fontSize: 12, lineHeight: 16 }}>
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * D18-C state C — the grant moment. Opened ONLY after the server confirms the grant, and it shows
 * the balance the server returned; nothing here is predicted.
 */
export function CandleGrantSheet({
  visible,
  rewardAmount,
  balanceText,
  onClose,
}: {
  visible: boolean;
  rewardAmount: number;
  balanceText: string;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const reduceMotion = useReduceMotion();
  const rise = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (!visible) {
      rise.setValue(reduceMotion ? 1 : 0);
      return;
    }
    if (reduceMotion) {
      rise.setValue(1); // final state only
      return;
    }
    Animated.timing(rise, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [visible, reduceMotion, rise]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.grantBody}>
        <CandleGraphic lit size={96} animate={!reduceMotion} />
        <Text variant="headingLarge" style={styles.grantTitle}>
          오늘의 초를 밝혔어요
        </Text>
        <Animated.View
          style={[
            styles.grantChip,
            {
              backgroundColor: theme.surfaceSage,
              opacity: rise,
              transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            },
          ]}
        >
          <Text variant="bodyLarge" numeric style={{ color: theme.onSage, fontWeight: '700' }}>
            🍀 +{dukLabel(rewardAmount)}
          </Text>
        </Animated.View>
        <Text variant="bodyMedium" colorToken="textSecondary" numeric>
          {`지금 ${balanceText} 있어요.`}
        </Text>
      </View>
      <Button label="확인" radius="lg" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  grantBody: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  grantTitle: { textAlign: 'center' },
  grantChip: { borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: spacing.lg },
  title: { fontWeight: '700' },
  flex1: { flex: 1, minWidth: 0 },
  flexShrink: { flex: 1, minWidth: 0 },
  strip: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 76,
  },
});
