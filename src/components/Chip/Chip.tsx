import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, maxFontScale, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C19 — pill chip, 12.5/600. Selected = the ink PLANE (not a tint), so selection
// reads instantly without spending part of the screen's two-pastel budget. `tone` gives the tonal
// chip used for keywords / 흐름 labels. Comfortable 44px tap target. Static when `onPress` is omitted.
export type ChipTone = 'neutral' | 'butter' | 'sage' | 'blush' | 'lavender' | 'sky';

type ChipProps = {
  label: string;
  selected?: boolean;
  tone?: ChipTone;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  tone = 'neutral',
  onPress,
  accessibilityLabel,
  style,
}: ChipProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const toned = {
    neutral: { bg: theme.surface, fg: theme.textSecondary, border: theme.border },
    butter: { bg: theme.surfaceButter, fg: theme.onButter, border: 'transparent' },
    sage: { bg: theme.surfaceSage, fg: theme.onSage, border: 'transparent' },
    blush: { bg: theme.surfaceBlush, fg: theme.onBlush, border: 'transparent' },
    lavender: { bg: theme.surfaceLavender, fg: theme.onLavender, border: 'transparent' },
    sky: { bg: theme.surfaceSky, fg: theme.textPrimary, border: 'transparent' },
  }[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      // Visual pill is 34dp tall (freeze C19) but the TOUCH target must stay 44dp — hitSlop buys the
      // missing 10dp without inflating the layout.
      hitSlop={{ top: 5, bottom: 5, left: 4, right: 4 }}
      style={({ pressed }) => [
        {
          paddingVertical: 6,
          paddingHorizontal: spacing.md,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: selected ? theme.brandPrimary : toned.border,
          backgroundColor: selected
            ? theme.brandPrimary
            : pressed
              ? theme.backgroundSelected
              : toned.bg,
          minHeight: 34,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style as ViewStyle,
      ]}
    >
      <Text
        variant="bodySmall"
        maxFontSizeMultiplier={maxFontScale.control}
        numberOfLines={1}
        style={{
          fontSize: 12.5,
          fontWeight: '600',
          color: selected ? theme.brandPrimaryText : toned.fg,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
