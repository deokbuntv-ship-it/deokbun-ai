import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

import type { PillarView } from '../types';

// Presentation-only. Renders one pillar column (시/일/월/년) with its display
// slots. Values are ENGINE-provided (APP-28C); when null they render as a clear
// placeholder ("–") that never resembles a real calculated value.

function Cell({
  value,
  borderColor,
  backgroundColor,
}: {
  value: string | null;
  borderColor: string;
  backgroundColor: string;
}) {
  const hasValue = value !== null && value.length > 0;

  return (
    <View
      style={{
        width: '100%',
        minHeight: 44,
        borderWidth: 1,
        borderColor,
        borderRadius: radius.md,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <Text
        variant="bodyLarge"
        colorToken={hasValue ? 'textPrimary' : 'textSecondary'}
      >
        {hasValue ? value : '–'}
      </Text>
    </View>
  );
}

export function PillarColumn({ pillar }: { pillar: PillarView }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Stack style={{ flex: 1 }} gap="xs" align="center">
      <Text variant="bodyMedium">{pillar.columnLabel}</Text>
      {/* 천간 */}
      <Cell
        value={pillar.heavenlyStem}
        borderColor={theme.border}
        backgroundColor={theme.backgroundElevated}
      />
      {/* 지지 */}
      <Cell
        value={pillar.earthlyBranch}
        borderColor={theme.border}
        backgroundColor={theme.backgroundElevated}
      />
      <Stack gap="none" align="center">
        <Text variant="caption" colorToken="textSecondary">
          {pillar.ganzhiLabel ?? '간지 –'}
        </Text>
        <Text variant="caption" colorToken="textSecondary">
          {pillar.yinYang ?? '음양 –'}
        </Text>
        <Text variant="caption" colorToken="textSecondary">
          {pillar.element ?? '오행 –'}
        </Text>
      </Stack>
    </Stack>
  );
}
