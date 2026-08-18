import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type { CompatibilityResultMeta } from '@/features/chat/server';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// The deterministic 궁합 TIER card (§19/§30). Renders the SERVER-computed overall tier + the three
// dimension signals. It is honest by construction: a categorical tier (no fabricated %), and every
// dimension shows its plain-language verdict. NO raw 간지 / engine terms reach the user here.
export function CompatibilityTierCard({ meta }: { meta: CompatibilityResultMeta }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const signalColor = (signal: string): string => {
    if (signal === 'POSITIVE') return theme.secondary;
    if (signal === 'WATCH') return theme.accent;
    return theme.textSecondary;
  };

  return (
    <Card radius="xl">
      <Stack gap="md">
        <Stack gap="xs">
          <Text variant="bodySmall" colorToken="textSecondary">
            종합 궁합
          </Text>
          <Text variant="headingMedium" style={{ fontWeight: '700', color: theme.primary }}>
            {meta.overallLabel}
          </Text>
          {meta.reducedPrecision ? (
            <Text variant="bodySmall" colorToken="textSecondary">
              ※ 한 분 이상 출생시간이 정확하지 않아 세부 정밀도는 제한될 수 있어요.
            </Text>
          ) : null}
        </Stack>

        <Stack gap="sm">
          {meta.dimensions.map((d) => (
            <View key={d.key} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
              <View
                style={{
                  marginTop: 3,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: signalColor(d.signal),
                }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {d.title}
                </Text>
                <Text variant="bodySmall" colorToken="textSecondary" style={{ lineHeight: 20 }}>
                  {d.verdict}
                </Text>
              </View>
            </View>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
