import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// Shared status badge (§77). Always conveys meaning by TEXT + subtle color tint —
// never color alone (§88). Tone maps to a semantic theme color.
export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

function tint(hex: string, alpha: string): string {
  // Accept #rrggbb → #rrggbbAA (subtle background). Falls back to the color itself.
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alpha}` : hex;
}

export function StatusBadge({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const fg =
    tone === 'success'
      ? theme.success
      : tone === 'warning'
        ? theme.warning
        : tone === 'danger'
          ? theme.danger
          : tone === 'primary'
            ? theme.primary
            : tone === 'info'
              ? theme.primary
              : theme.textSecondary;
  const bg = tone === 'neutral' ? theme.backgroundElevated : tint(fg, '1f');

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: bg,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <Text variant="caption" style={{ color: fg, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
