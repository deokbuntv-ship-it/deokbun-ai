import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { sessionTurnCopy } from '@/features/duk/consumerDukView';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C12 — the remaining-question line above the composer.
//
// THE RULE THIS COMPONENT EXISTS TO ENFORCE: the client never counts sends. `successfulTurnCount`
// and `turnLimit` are the SERVER's session state, and the remaining count is derived from them by
// sessionTurnCopy(). A failed or errored turn does not consume a successful turn, so a send that
// fails must leave this line unchanged — which is exactly what happens when the only input is the
// server's own count. No optimistic decrement, ever.
//
// Renders nothing when there is no active paid session, so the copy is never misleading.
type SessionMeterProps = {
  session: { active: boolean; successfulTurnCount: number; turnLimit: number } | null;
  /** Overrides the copy for the 궁합 follow-up ("이번 궁합 · 남은 질문 N번"). */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function SessionMeter({ session, label, style }: SessionMeterProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  if (!session?.active && !label) return null;
  const text = label ?? sessionTurnCopy(session!);

  return (
    <View style={[styles.row, style]} accessibilityRole="text">
      <View style={[styles.dot, { backgroundColor: theme.onSage }]} />
      <Text
        variant="bodySmall"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ fontSize: 11.5, fontWeight: '600', color: theme.textSecondary }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 20, paddingHorizontal: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
