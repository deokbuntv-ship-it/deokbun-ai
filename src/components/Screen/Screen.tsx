import { Platform, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ConsumerMaxContentWidth } from '@/constants/theme';
import { colors, spacing } from '@/theme';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
  padded?: boolean;
  // Web-only: centre the body at the consumer reading measure (480dp) so a wide viewport does not
  // stretch Korean body copy past a comfortable line length. The surplus stays surface.base — never a
  // second column and never a contrasting gutter. Off by default: native, the admin console, and the
  // public site (which also use <Screen>) are unaffected.
  frame?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CANVAS_MAX = ConsumerMaxContentWidth;

export function Screen({ children, padded = true, frame = false, style, ...rest }: ScreenProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const inner = (
    <View
      style={[
        {
          flex: 1,
          width: '100%',
          maxWidth: frame && Platform.OS === 'web' ? CANVAS_MAX : undefined,
          backgroundColor: theme.background,
          paddingHorizontal: padded ? spacing.screenHorizontal : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (frame && Platform.OS === 'web') {
    // Centered phone canvas with a subtle gutter on wide viewports.
    return (
      <View style={{ flex: 1, width: '100%', alignItems: 'center', backgroundColor: theme.background }}>
        {inner}
      </View>
    );
  }

  return inner;
}
