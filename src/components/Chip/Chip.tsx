import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

// Pill chip (§43) for period tabs, quick-entry categories, question prompts, and
// relationship types. Selected/unselected is obvious (border + tinted surface +
// weight). Comfortable 44px tap target. When `onPress` is omitted it renders as
// a static (non-interactive) chip.
type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
  style,
}: ChipProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: selected ? theme.primary : theme.border,
          backgroundColor: selected ? theme.primary : theme.surface,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style as ViewStyle,
      ]}
    >
      <Text
        variant="bodySmall"
        colorToken={selected ? 'primaryText' : 'textPrimary'}
        style={{ fontWeight: selected ? '700' : '500' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
