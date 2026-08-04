const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F0F0F3',
  gray200: '#E0E1E6',
  gray300: '#C6C9D0',
  gray400: '#9CA0A8',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  red500: '#EF4444',
  green500: '#22C55E',
  amber500: '#F59E0B',
} as const;

export type Palette = typeof palette;

export type SemanticColors = {
  background: string;
  backgroundElevated: string;
  backgroundSelected: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  primaryText: string;
  success: string;
  warning: string;
  danger: string;
};

const lightColors = {
  background: palette.white,
  backgroundElevated: palette.gray50,
  backgroundSelected: palette.gray200,
  surface: palette.white,
  border: palette.gray200,
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textInverse: palette.white,
  primary: palette.blue600,
  primaryText: palette.white,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
} satisfies SemanticColors;

const darkColors = {
  background: palette.black,
  backgroundElevated: palette.gray800,
  backgroundSelected: palette.gray700,
  surface: palette.gray900,
  border: palette.gray700,
  textPrimary: palette.white,
  textSecondary: palette.gray400,
  textInverse: palette.gray900,
  primary: palette.blue500,
  primaryText: palette.white,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
} satisfies SemanticColors;

export const colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorScheme = keyof typeof colors;
export type SemanticColorToken = keyof SemanticColors;
