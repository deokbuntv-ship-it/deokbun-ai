import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = ViewStyle & { boxShadow?: string };

// DESIGN_FREEZE_FINAL §03 — "그림자보다 여백과 1px 선". Cards are separated by a hairline border,
// not by elevation; shadow is reserved for things that genuinely float. The warm shadow colour
// (80,66,42) keeps the drop from going cold grey on a warm-white ground.
const WARM = '80, 66, 42';

function warmShadow(dy: number, blur: number, opacity: number, elevation: number): ShadowStyle {
  return Platform.select<ShadowStyle>({
    web: { boxShadow: `0px ${dy}px ${blur}px rgba(${WARM}, ${opacity})` },
    android: { elevation },
    default: {
      shadowColor: `rgb(${WARM})`,
      shadowOffset: { width: 0, height: dy },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
    },
  }) as ShadowStyle;
}

export const shadows = {
  // elev.flat — the DEFAULT for cards: 1px line, no shadow at all.
  none: {} as ShadowStyle,
  // elev.raised — the near-invisible lift used by the few surfaces that must read as raised
  // (home question composer, floating actions). This is what <Card> uses by default.
  sm: warmShadow(2, 8, 0.05, 1),
  md: warmShadow(4, 12, 0.07, 3),
  lg: warmShadow(8, 20, 0.1, 6),
  xl: warmShadow(12, 28, 0.13, 10),
  // elev.sheet — bottom sheets / toasts. Lifts UPWARD, so it needs its own negative offset.
  sheet: Platform.select<ShadowStyle>({
    web: { boxShadow: `0px -10px 28px rgba(${WARM}, 0.16)` },
    android: { elevation: 16 },
    default: {
      shadowColor: `rgb(${WARM})`,
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.16,
      shadowRadius: 14,
    },
  }) as ShadowStyle,
} as const;

export type ShadowToken = keyof typeof shadows;
