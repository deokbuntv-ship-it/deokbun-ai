import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// Golden Flow V4 — the ONE honest analysis loading state (docs/GOLDEN_FLOW_V4_UX.md §H/§10).
// It NEVER claims real engine progress: no "명리 분석 중", no "자미두수 33%", no fake steps or
// progress bar. Calm, premium, alive — a single primary line + an optional rotating subtitle
// that is deliberately non-committal about what is happening under the hood. The rotating
// copy is presentation only; it does not represent any backend state.

const PRIMARY = '덕분이가 지금 질문과 흐름을 함께 살펴보고 있어요.';

// Non-progress, non-engine subtitles. None implies a stage or a percentage.
const SUBTITLES = [
  '필요한 관점을 함께 살펴보는 중이에요…',
  '질문의 맥락을 천천히 짚어보고 있어요…',
  '중요한 부분부터 정리하고 있어요…',
];

export function ConsultationLoading() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const pulse = useRef(new Animated.Value(0.4)).current;

  // Rotate the subtitle calmly (presentation only). No timers that imply progress.
  useEffect(() => {
    const id = setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % SUBTITLES.length);
    }, 2600);
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
            {PRIMARY}
          </Text>
        </View>
        <Text variant="bodySmall" colorToken="textSecondary" accessibilityLiveRegion="polite">
          {SUBTITLES[subtitleIndex]}
        </Text>
      </Stack>
    </Card>
  );
}
