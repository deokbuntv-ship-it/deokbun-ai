import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius } from '@/theme';
import { Text } from '@/components/Text';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? theme.primary : theme.backgroundElevated;
  const textColorToken = isPrimary ? 'primaryText' : 'textPrimary';

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
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
