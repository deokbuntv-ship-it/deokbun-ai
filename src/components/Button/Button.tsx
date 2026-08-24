import { ActivityIndicator, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius, maxFontScale, type RadiusToken } from '@/theme';
import { Text } from '@/components/Text';

// Button hierarchy (DESIGN_FREEZE_FINAL C03). ONE Primary per screen.
//   brand    — Primary. H52, action.primary ink fill. The default, so consumer CTAs need no prop.
//   primary  — same ink fill; kept as a distinct name for the (unchanged) admin console call sites.
//   secondary— H48, white surface + 1px action.secondaryBorder.
//   tonal    — H48, pastel fill chosen by `tone` (reward / relationship affordances).
//   tertiary — H44, text only.
//   danger   — H48, white surface + soft red border (destructive is quiet, not loud).
// Disabled uses the disabled TOKENS, never opacity: opacity would drag the label's effective
// contrast below AA and make an informative control unreadable (freeze §Acceptance).
type ButtonVariant = 'brand' | 'primary' | 'secondary' | 'tertiary' | 'tonal' | 'danger';
type ButtonTone = 'butter' | 'sage' | 'blush' | 'lavender' | 'sky';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  // Pastel fill for `tonal`. Ignored by every other variant.
  tone?: ButtonTone;
  disabled?: boolean;
  loading?: boolean;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<ButtonVariant, number> = {
  brand: 52,
  primary: 52,
  secondary: 48,
  tonal: 48,
  danger: 48,
  tertiary: 44,
};

export function Button({
  label,
  variant = 'brand',
  tone = 'sage',
  disabled,
  loading = false,
  radius: radiusToken = 'md',
  style,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const isDisabled = disabled || loading;

  const toneFill = {
    butter: theme.surfaceButter,
    sage: theme.surfaceSage,
    blush: theme.surfaceBlush,
    lavender: theme.surfaceLavender,
    sky: theme.surfaceSky,
  }[tone];
  const toneText = {
    butter: theme.onButter,
    sage: theme.onSage,
    blush: theme.onBlush,
    lavender: theme.onLavender,
    sky: theme.textPrimary,
  }[tone];

  const fill: Record<ButtonVariant, string> = {
    brand: theme.brandPrimary,
    primary: theme.primary,
    danger: theme.surface,
    secondary: theme.surface,
    tonal: toneFill,
    tertiary: 'transparent',
  };
  const borderColor: Partial<Record<ButtonVariant, string>> = {
    secondary: theme.actionSecondaryBorder,
    danger: '#E8CFCB',
  };
  const pressedFill: Partial<Record<ButtonVariant, string>> = {
    brand: theme.brandPrimaryPressed,
    primary: theme.brandPrimaryPressed,
    secondary: theme.backgroundSelected,
    danger: theme.backgroundSelected,
    tertiary: theme.backgroundSelected,
  };
  const labelColor =
    variant === 'brand' || variant === 'primary'
      ? theme.brandPrimaryText
      : variant === 'danger'
        ? theme.danger
        : variant === 'tonal'
          ? toneText
          : theme.textPrimary;

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          backgroundColor: isDisabled
            ? theme.actionDisabledBg
            : (pressed && pressedFill[variant]) || fill[variant],
          borderRadius: radius[radiusToken],
          borderWidth: borderColor[variant] && !isDisabled ? 1 : 0,
          borderColor: borderColor[variant],
          paddingVertical: spacing.sm,
          paddingHorizontal: variant === 'tertiary' ? spacing.sm : spacing.lg,
          minHeight: HEIGHT[variant],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {/* Loading keeps the label in place (opacity 0) and overlays a spinner, so width/height never jump. */}
      <Text
        variant="bodyLarge"
        maxFontSizeMultiplier={maxFontScale.control}
        numberOfLines={1}
        style={{
          fontSize: 15.5,
          fontWeight: '600',
          color: isDisabled ? theme.actionDisabledText : labelColor,
          opacity: loading ? 0 : 1,
        }}
      >
        {label}
      </Text>
      {loading ? (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={theme.actionDisabledText} />
        </View>
      ) : null}
    </Pressable>
  );
}
