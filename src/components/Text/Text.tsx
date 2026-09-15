import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, typography, koreanText, maxFontScale, tabularNums, type TypographyToken, type SemanticColorToken } from '@/theme';

type TextProps = RNTextProps & {
  children: React.ReactNode;
  variant?: TypographyToken;
  colorToken?: SemanticColorToken;
  // Duk amounts / prices / dates — fixes digit width so a counting number never jitters (freeze §02).
  numeric?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Text({
  children,
  variant = 'bodyMedium',
  colorToken = 'textPrimary',
  numeric = false,
  // OS font-scaling ceiling (freeze §Adaptive): body may grow to 1.3×. Beyond that a 360dp layout
  // collapses. Callers with tighter chrome (buttons, tab labels) pass maxFontScale.control.
  maxFontSizeMultiplier = maxFontScale.body,
  style,
  ...rest
}: TextProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const typographyStyle = typography[variant];

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        {
          fontSize: typographyStyle.fontSize,
          lineHeight: typographyStyle.lineHeight,
          fontWeight: typographyStyle.fontWeight,
          fontFamily: typographyStyle.fontFamily,
          color: theme[colorToken],
        },
        // Long Korean must break on 어절 boundaries, never mid-word (freeze §02).
        koreanText,
        numeric ? tabularNums : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
