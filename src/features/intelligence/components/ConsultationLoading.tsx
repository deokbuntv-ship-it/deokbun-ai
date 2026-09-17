import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';
import { phaseFor, subtitleFor } from './consultationLoadingPhases';

// Golden Flow V4 — the ONE honest analysis loading state (docs/GOLDEN_FLOW_V4_UX.md §H/§10).
// It NEVER claims real engine progress: no "명리 분석 중", no "자미두수 33%", no fake steps or
// progress bar. Calm, premium, alive — a single primary line + an optional rotating subtitle
// that is deliberately non-committal about what is happening under the hood. The rotating
// copy is presentation only; it does not represent any backend state.

// 2026-09-19 — 문구를 **경과 시간대별**로 바꾼다(`consultationLoadingPhases.ts`).
// staging 실측 813건에서 절반이 15.5초·열에 하나가 35.1초를 넘었다. 오래 기다리는 사람에게는
// 같은 문구를 되풀이하지 말고 결을 바꿔 준다. 단계나 남은 시간은 여전히 말하지 않는다.

export function ConsultationLoading() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const pulse = useRef(new Animated.Value(0.4)).current;

  // Rotate the subtitle calmly (presentation only). No timers that imply progress.
  useEffect(() => {
    const id = setInterval(() => setSubtitleIndex((i) => i + 1), 2600);
    return () => clearInterval(id);
  }, []);

  // 경과 시간만 센다. 화면에 숫자로 보여 주지 않는다 — 어느 구간의 문구를 쓸지 고르는 데만 쓴다.
  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, []);

  // A soft breathing pulse on the dot — "alive", not a spinner/particles.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Card radius="xl">
      <Stack gap="xs">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Animated.View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.secondary, opacity: pulse }}
          />
          <Text variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '600' }}>
            {phaseFor(elapsedMs).primary}
          </Text>
        </View>
        <Text variant="bodySmall" colorToken="textSecondary" accessibilityLiveRegion="polite">
          {subtitleFor(elapsedMs, subtitleIndex)}
        </Text>
      </Stack>
    </Card>
  );
}
