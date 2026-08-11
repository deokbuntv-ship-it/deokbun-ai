import { Platform, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
  padded?: boolean;
  // Web-only: render inside a centered mobile "phone" canvas (max ~430px) with a
  // gutter, so pushed consumer screens match the mobile-first Stitch FINAL frame
  // on desktop web. Off by default — native, admin console, and the public site
  // (which also use <Screen>) are unaffected.
  frame?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CANVAS_MAX = 430;

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
      <View style={{ flex: 1, width: '100%', alignItems: 'center', backgroundColor: theme.backgroundSelected }}>
        {inner}
      </View>
    );
  }

  return inner;
}
