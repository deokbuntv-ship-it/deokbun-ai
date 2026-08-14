import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  toExplainabilityView,
  type LabelTone,
} from '@/features/intelligence';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { toneColor } from './tone';

// Consumer Explainability "왜 이렇게 해석했나요?" (§10). Approved structure:
//   활용된 관점 (only the engines actually used) · 종합하면 (their summaries) ·
//   분석 범위 (each engine's honest state).
// FAIL-CLOSED: it NEVER lists all three engines by default — the adapter decides which
// engines are "used" from the backend data (§10/§27). When grounding is unavailable it
// shows the reason, not an empty perspective list.
function ScopeRow({ label, state, tone }: { label: string; state: string; tone: LabelTone }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
      <Text variant="bodySmall" colorToken="textSecondary">
        {label}
      </Text>
      <Text variant="bodySmall" style={{ color: toneColor(tone, theme), fontWeight: '600' }}>
        {state}
      </Text>
    </View>
  );
}

export function InterpretationEvidenceSheet({ grounding }: { grounding: ConsultationGrounding }) {
  const view = toExplainabilityView(grounding);

  if (view.status === 'unavailable') {
    return (
      <Card radius="xl">
        <Stack gap="xs">
          <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
            왜 이렇게 해석했나요?
          </Text>
          <Text variant="bodyMedium" colorToken="textSecondary">
            아직 계산 근거가 연결되지 않아, 근거를 함께 보여드리지 못했어요. 확인 가능한 내용부터
            설명드릴게요.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card radius="xl">
      <Stack gap="md">
        <Text variant="bodyLarge" style={{ fontWeight: '700' }}>
          왜 이렇게 해석했나요?
        </Text>

        {view.usedPerspectives.length > 0 ? (
          <Stack gap="xs">
            <Text variant="bodySmall" colorToken="textSecondary">
              활용된 관점
            </Text>
            {view.usedPerspectives.map((p) => (
              <View key={p.engineLabel} style={{ gap: 2 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {p.engineLabel}
                </Text>
                {p.summary ? (
                  <Text variant="bodyMedium" colorToken="textSecondary">
                    {p.summary}
                  </Text>
                ) : null}
              </View>
            ))}
          </Stack>
        ) : (
          <Text variant="bodyMedium" colorToken="textSecondary">
            이번 답변에 직접 활용된 계산 관점은 없어요.
          </Text>
        )}

        <View style={{ height: 1, backgroundColor: colors.light.border, opacity: 0.4 }} />

        <Stack gap="xs">
          <Text variant="bodySmall" colorToken="textSecondary">
            분석 범위
          </Text>
          {view.scope.map((s) => (
            <ScopeRow key={s.engineLabel} label={s.engineLabel} state={s.stateLabel} tone={s.tone} />
          ))}
        </Stack>
        <View style={{ marginTop: spacing.xs }}>
          <Text variant="caption" colorToken="textSecondary">
            활용된 관점만 표시하며, 사용되지 않은 관점은 그대로 '미사용'으로 남겨둬요.
          </Text>
        </View>
      </Stack>
    </Card>
  );
}
