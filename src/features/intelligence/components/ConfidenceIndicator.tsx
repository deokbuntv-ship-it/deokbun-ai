import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// Consumer confidence chip (§12). FAIL-CLOSED: the adapter passes '' for insufficient/
// absent confidence, and this component renders NOTHING then — unknown is NEVER shown as
// "낮음". It only draws a label the adapter actually produced.
export function ConfidenceIndicator({ label }: { label: string }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  if (!label) return null;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: theme.backgroundElevated,
        borderRadius: 999,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
      }}
    >
      <Text variant="caption" colorToken="textSecondary">
        신뢰도
      </Text>
      <Text variant="caption" style={{ color: theme.textPrimary, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}
