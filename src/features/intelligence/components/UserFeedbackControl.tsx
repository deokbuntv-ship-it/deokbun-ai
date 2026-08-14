import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { feedbackControlState, type FeedbackVerdict } from '@/features/intelligence';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Consumer feedback control "도움이 되었나요?" 👍 / 👎 (§20). HONEST SEAM: the write path is
// not wired in V1.0 (feedbackControlState().canPersist === false), so we NEVER show a fake
// "저장됨". When a persist path is later connected, pass `onSubmit` and the control records
// the verdict truthfully. Until then it acknowledges the tap locally without claiming
// persistence, and shows the unavailable note.
export function UserFeedbackControl({
  onSubmit,
}: {
  onSubmit?: (verdict: FeedbackVerdict) => Promise<void> | void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const control = feedbackControlState();
  const canPersist = control.canPersist && !!onSubmit;
  const [picked, setPicked] = useState<FeedbackVerdict | null>(null);

  const choose = (verdict: FeedbackVerdict) => {
    setPicked(verdict);
    if (canPersist && onSubmit) void onSubmit(verdict);
  };

  if (picked) {
    return (
      <Text variant="bodySmall" colorToken="textSecondary">
        {canPersist ? '피드백 고맙습니다.' : `피드백 고맙습니다. ${control.unavailableNote}`}
      </Text>
    );
  }

  const chip = (verdict: FeedbackVerdict, glyph: string, label: string) => (
    <Pressable
      onPress={() => choose(verdict)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Text variant="bodyMedium">{glyph}</Text>
      <Text variant="bodySmall" style={{ color: theme.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="bodySmall" colorToken="textSecondary">
        도움이 되었나요?
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {chip('helpful', '👍', '도움이 됐어요')}
        {chip('not_helpful', '👎', '아쉬웠어요')}
      </View>
    </View>
  );
}
