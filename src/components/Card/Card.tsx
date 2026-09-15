import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing, radius, shadows, type RadiusToken, type ShadowToken } from '@/theme';

// DESIGN_FREEZE_FINAL C17 — a Card exists for exactly FOUR jobs. Anything else is a plain section
// with a heading and a list, NOT a card (that is what turned the old Home into ten identical boxes).
//   content     — white + 1px line. The default.
//   interactive — pastel fill + chevron; the whole surface navigates.
//   reward      — pastel fill, NO border. 덕 / 촛불 / 생일.
//   status      — 3px left bar. Preparing / error system notices only.
export type CardUse = 'content' | 'interactive' | 'reward' | 'status';
export type CardTone = 'butter' | 'sage' | 'blush' | 'lavender' | 'sky';

type CardProps = ViewProps & {
  children: React.ReactNode;
  use?: CardUse;
  // Pastel family for interactive/reward, and the bar colour source for status.
  tone?: CardTone;
  // status only: overrides the bar colour (e.g. state.warn for 준비 중, state.error for 오류).
  statusColor?: string;
  elevation?: ShadowToken;
  // Corner radius token. Defaults to 'lg' (14) so the admin console — which also
  // uses Card — is unchanged. Consumer surfaces pass 'xl' (18, the freeze card radius).
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  use = 'content',
  tone = 'sage',
  statusColor,
  elevation = 'none',
  radius: radiusToken = 'lg',
  style,
  ...rest
}: CardProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const pastel = {
    butter: theme.surfaceButter,
    sage: theme.surfaceSage,
    blush: theme.surfaceBlush,
    lavender: theme.surfaceLavender,
    sky: theme.surfaceSky,
  }[tone];

  const filled = use === 'interactive' || use === 'reward';

  return (
    <View
      style={[
        {
          backgroundColor: filled ? pastel : theme.surface,
          borderRadius: radius[radiusToken],
          padding: spacing.lg,
          // reward is a colour PLANE — a border would fight the softness. The others keep the hairline.
          borderWidth: use === 'reward' ? 0 : 1,
          borderColor: filled ? 'transparent' : theme.border,
        },
        use === 'status'
          ? { borderLeftWidth: 3, borderLeftColor: statusColor ?? theme.warning }
          : null,
        shadows[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
