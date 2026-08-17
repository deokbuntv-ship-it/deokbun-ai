import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ConsultationState } from '@/features/intelligence/types/consultationViewModel';
import { colors, spacing } from '@/theme';

// The truthful consultation states (§13). Each is an HONEST message — never a fabricated
// fallback reading. The copy distinguishes user-fixable (birth time), transient (network),
// and structural (engine disconnected / partial / conflict / analysis failed) states so
// the user knows what, if anything, they can do. `onRetry` reuses the existing chat retry
// infra (§13) and is shown only for retryable states.
// The `ConsultationState` type now lives in a runtime-neutral module (§2); re-exported for compat.
export type { ConsultationState };

const COPY: Record<ConsultationState, { title: string; body: string; retryable: boolean }> = {
  engine_conflict: {
    title: '관점이 엇갈려요',
    body: '분석 관점 사이에 상충이 있어, 단정하기보다 가능성을 함께 살펴봤어요.',
    retryable: false,
  },
  partial_analysis: {
    title: '일부만 확인됐어요',
    body: '확인된 근거까지만 정리했어요. 나머지는 근거가 모이면 이어서 안내드릴게요.',
    retryable: false,
  },
  analysis_failure: {
    title: '분석을 마치지 못했어요',
    body: '이번 요청을 처리하는 중 문제가 있었어요. 잠시 후 다시 시도해 주세요.',
    retryable: true,
  },
  network_error: {
    title: '연결이 불안정해요',
    body: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
    retryable: true,
  },
  birth_time_unknown: {
    title: '출생 시간이 필요해요',
    body: '태어난 시간을 모르면 시(時) 기반 해석은 생략돼요. 아는 범위 안에서 먼저 안내드릴게요.',
    retryable: false,
  },
  confidence_unavailable: {
    title: '신뢰도는 아직 표시하지 않아요',
    body: '확인된 근거가 충분하지 않아 신뢰도를 함께 보여드리지 않았어요.',
    retryable: false,
  },
  engine_disconnected: {
    title: '아직 계산 근거가 연결되지 않았어요',
    body: '검증된 계산 근거가 연결되기 전에는 강함·보통 같은 판단을 만들지 않아요.',
    retryable: false,
  },
};

export function ConsultationStateNotice({
  state,
  onRetry,
}: {
  state: ConsultationState;
  onRetry?: () => void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const { title, body, retryable } = COPY[state];
  return (
    <Card radius="xl">
      <Stack gap="xs">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent }} />
          <Text variant="bodyLarge" style={{ fontWeight: '700', color: theme.textPrimary }}>
            {title}
          </Text>
        </View>
        <Text variant="bodyMedium" colorToken="textSecondary">
          {body}
        </Text>
        {retryable && onRetry ? (
          <View style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <Button label="다시 시도" variant="secondary" onPress={onRetry} />
          </View>
        ) : null}
      </Stack>
    </Card>
  );
}
