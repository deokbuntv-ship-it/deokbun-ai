import { ActivityIndicator, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius, type RadiusToken } from '@/theme';
import { Text } from '@/components/Text';

// Button hierarchy (§8). `brand` = signature-orange primary CTA and is the DEFAULT, so consumer screens get
// the brand CTA with no prop. `primary` = deep navy, kept for the admin console (which passes it explicitly)
// and any structural button. secondary (subtle surface), tertiary (text-only), danger (destructive).
type ButtonVariant = 'brand' | 'primary' | 'secondary' | 'tertiary' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  // Corner radius token. Defaults to 'md' (8) so the admin console — which also
  // uses Button — is unchanged. Consumer (Stitch) CTAs pass 'lg' (12).
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'brand',
  disabled,
  loading = false,
  radius: radiusToken = 'md',
  style,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const isDisabled = disabled || loading;

  const fill: Record<ButtonVariant, string> = {
    brand: theme.brandPrimary,
    primary: theme.primary,
    danger: theme.danger,
    secondary: theme.backgroundElevated,
    tertiary: 'transparent',
  };
  const pressedFill: Partial<Record<ButtonVariant, string>> = {
    brand: theme.brandPrimaryPressed,
  };
  const textColorToken =
    variant === 'brand'
      ? 'brandPrimaryText'
      : variant === 'primary' || variant === 'danger'
        ? 'primaryText'
        : variant === 'tertiary'
          ? 'primary'
          : 'textPrimary';
  const spinnerColor = theme[textColorToken];

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          backgroundColor: (pressed && pressedFill[variant]) || fill[variant],
          borderRadius: radius[radiusToken],
          paddingVertical: spacing.md,
          paddingHorizontal: variant === 'tertiary' ? spacing.sm : spacing.lg,
          minHeight: 48, // comfortable tap target (§39)
          alignItems: 'center',
          justifyContent: 'center',
          // pressed feedback: filled variants without a dedicated pressed fill dim slightly.
          opacity: isDisabled ? 0.4 : pressed && !pressedFill[variant] ? 0.7 : 1,
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {/* Loading keeps the label in place (opacity 0) and overlays a spinner, so width/height never jump (§8/§30). */}
      <Text variant="bodyMedium" colorToken={textColorToken} style={{ fontWeight: '600', opacity: loading ? 0 : 1 }}>
        {label}
      </Text>
      {loading ? (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={spinnerColor} />
        </View>
      ) : null}
    </Pressable>
  );
}
