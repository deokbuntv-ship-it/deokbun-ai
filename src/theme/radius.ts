export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
