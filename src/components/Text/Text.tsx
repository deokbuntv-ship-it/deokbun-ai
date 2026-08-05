import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, typography, type TypographyToken, type SemanticColorToken } from '@/theme';

type TextProps = RNTextProps & {
  children: React.ReactNode;
  variant?: TypographyToken;
  colorToken?: SemanticColorToken;
  style?: StyleProp<TextStyle>;
};

export function Text({
  children,
  variant = 'bodyMedium',
  colorToken = 'textPrimary',
  style,
  ...rest
}: TextProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const typographyStyle = typography[variant];

  return (
    <RNText
      style={[
        {
          fontSize: typographyStyle.fontSize,
          lineHeight: typographyStyle.lineHeight,
          fontWeight: typographyStyle.fontWeight,
          fontFamily: typographyStyle.fontFamily,
          color: theme[colorToken],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
