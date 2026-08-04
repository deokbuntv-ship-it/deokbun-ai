import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = ViewStyle & { boxShadow?: string };

function createShadow(elevation: number, opacity: number): ShadowStyle {
  return Platform.select<ShadowStyle>({
    web: {
      boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, ${opacity})`,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: elevation,
    },
  }) as ShadowStyle;
}

export const shadows = {
  none: {} as ShadowStyle,
  sm: createShadow(2, 0.08),
  md: createShadow(4, 0.12),
  lg: createShadow(8, 0.16),
  xl: createShadow(16, 0.2),
} as const;

export type ShadowToken = keyof typeof shadows;
