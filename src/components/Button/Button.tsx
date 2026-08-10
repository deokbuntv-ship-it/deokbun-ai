import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius } from '@/theme';
import { Text } from '@/components/Text';

// Button hierarchy (§15): primary (filled brand), secondary (subtle surface),
// tertiary (text-only), danger (destructive). primary/secondary keep their prior
// look so existing screens are unchanged; tertiary/danger are additive.
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.danger
        : variant === 'tertiary'
          ? 'transparent'
          : theme.backgroundElevated;
  const textColorToken =
    variant === 'primary' || variant === 'danger'
      ? 'primaryText'
      : variant === 'tertiary'
        ? 'primary'
        : 'textPrimary';

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          backgroundColor,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: variant === 'tertiary' ? spacing.sm : spacing.lg,
          minHeight: 44, // comfortable tap target (§5)
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      <Text variant="bodyMedium" colorToken={textColorToken} style={{ fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}
