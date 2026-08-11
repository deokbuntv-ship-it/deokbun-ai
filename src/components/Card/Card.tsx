import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius, shadows, type RadiusToken, type ShadowToken } from '@/theme';

type CardProps = ViewProps & {
  children: React.ReactNode;
  elevation?: ShadowToken;
  // Corner radius token. Defaults to 'lg' (12) so the admin console — which also
  // uses Card — is unchanged. Consumer (Stitch) surfaces pass 'xl' (16).
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, elevation = 'sm', radius: radiusToken = 'lg', style, ...rest }: CardProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius[radiusToken],
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
