import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { feedbackControlState, type FeedbackVerdict } from '@/features/intelligence';
import { REPORT_ENTRY_LABEL } from '@/features/intelligence/aiContentReport';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Consumer feedback control "도움이 되었나요?" 👍 / 👎 (§20). HONEST SEAM: the write path is
// not wired in V1.0 (feedbackControlState().canPersist === false), so we NEVER show a fake
// "저장됨". When a persist path is later connected, pass `onSubmit` and the control records
// the verdict truthfully. Until then it acknowledges the tap locally without claiming
// persistence, and shows the unavailable note.
//
// ⚠ 신고(2026-09-11 추가)는 **투표와 다른 것**이다. 구글 AI 생성 콘텐츠 정책이 "앱을
// 벗어나지 않고 불쾌한 콘텐츠를 신고할 수 있어야 한다" 를 요구한다. 투표를 눌러 이 컨트롤이
// 인사말로 바뀐 뒤에도 신고 입구는 **계속 보여야 한다** — 👍 를 누른 뒤에 문제를 발견하는
// 일이 실제로 일어나기 때문이다.
export function UserFeedbackControl({
  onSubmit,
  initialVerdict,
  onReport,
  reported,
}: {
  onSubmit?: (verdict: FeedbackVerdict) => Promise<void> | void;
  // Restores the previously-chosen verdict on reload (§31) so 👍/👎 stays selected.
  initialVerdict?: FeedbackVerdict | null;
  /** 신고 시트를 여는 콜백. 주지 않으면 신고 입구를 그리지 않는다. */
  onReport?: () => void;
  /** 이미 신고한 답변인가. 다시 누르지 못하게 하고 상태를 보인다. */
  reported?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const control = feedbackControlState();
  const canPersist = control.canPersist && !!onSubmit;
  const [picked, setPicked] = useState<FeedbackVerdict | null>(initialVerdict ?? null);

  const choose = (verdict: FeedbackVerdict) => {
    setPicked(verdict);
    if (canPersist && onSubmit) void onSubmit(verdict);
  };

  const reportEntry = onReport ? (
    <Pressable
      onPress={reported ? undefined : onReport}
      disabled={reported}
      accessibilityRole="button"
      accessibilityLabel={reported ? '신고 접수됨' : REPORT_ENTRY_LABEL}
      aria-disabled={!!reported}
      style={{ paddingVertical: spacing.xs }}
    >
      <Text variant="caption" colorToken="textSecondary" style={{ textDecorationLine: reported ? 'none' : 'underline' }}>
        {reported ? '신고 접수됨' : REPORT_ENTRY_LABEL}
      </Text>
    </Pressable>
  ) : null;

  if (picked) {
    return (
      <View style={{ gap: spacing.xs }}>
        <Text variant="bodySmall" colorToken="textSecondary">
          {canPersist ? '피드백 고맙습니다.' : `피드백 고맙습니다. ${control.unavailableNote}`}
        </Text>
        {reportEntry}
      </View>
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
      {reportEntry}
    </View>
  );
}
