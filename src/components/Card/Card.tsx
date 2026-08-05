import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius, shadows, type ShadowToken } from '@/theme';

type CardProps = ViewProps & {
  children: React.ReactNode;
  elevation?: ShadowToken;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, elevation = 'sm', style, ...rest }: CardProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: theme.border,
        },
        shadows[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
