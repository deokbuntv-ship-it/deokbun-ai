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
  // ---- Stitch FINAL design system (SSOT: docs/design-reference) ----
  // "Warm Guidance": warm white, deep navy, muted teal, warm orange.
  warmWhite: '#F9F7F2', // background (Layer 0)
  warmSurfaceLow: '#F5F3EE', // subtle tonal elevation
  warmSurfaceHigh: '#EAE8E3', // selected/tonal
  borderWarm: '#E5E1D8', // 1px card/nav border
  navy: '#1A2B3C', // primary (Deep Navy) — structure/headings, NOT the CTA color
  teal: '#5E8B8E', // secondary (Muted Teal)
  // SIGNATURE ORANGE — the Deokbuni brand CTA/accent. `orange` is canonical (reused, not re-picked).
  // Filled CTAs use dark ink text on it (7.5:1, AA) — the Kakao-yellow pattern; white on this hue fails AA.
  orange: '#F28C33', // brandPrimary
  orangePressed: '#DE7A24', // brandPrimaryPressed (deeper, press feedback)
  orangeSoft: '#FCEBDA', // brandPrimarySoft (warm tint — soft fills, selected-soft, Duk chip bg)
  ink: '#1B1C19', // on-surface text
  inkVariant: '#44474C', // on-surface-variant
  inkMuted: '#6B7280', // textMuted (de-emphasized meta; ~4.7:1 on warm white)
  tealTint: '#EAF3F3', // teal ~10% surface (chips/insight)
  // dark-scheme derivations (consumer is light-first; keep dark on-hue)
  navyDark: '#4F6073',
  tealDark: '#A0CFD2',
  orangeDark: '#FFB781',
  orangeDarkPressed: '#E7A06C',
  orangeSoftDark: '#3A2E22',
  warmDarkBg: '#1A1B17',
  warmDarkElevated: '#24261F',
  warmDarkSelected: '#2E312A',
  warmDarkSurface: '#22231E',
  warmDarkBorder: '#3A3B34',
  warmDarkText: '#F2F1EC',
  warmDarkTextVariant: '#C4C6CD',
  tealTintDark: '#22322F',
  red500: '#EF4444',
  green500: '#22C55E',
  amber500: '#F59E0B',
  blue400: '#60A5FA',
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
  textMuted: string; // de-emphasized meta (dates, counts, hints)
  textInverse: string;
  primary: string;
  primaryText: string;
  // brandPrimary = SIGNATURE ORANGE — the consumer CTA / selected / Duk-reward accent (§2/§3). `primary`
  // (navy) is reserved for structure/headings, NOT filled CTAs. brandPrimaryText is dark ink (AA on orange).
  brandPrimary: string;
  brandPrimaryPressed: string;
  brandPrimarySoft: string;
  brandPrimaryText: string;
  // Stitch: `secondary` = muted teal (calm/secondary actions), `accent` = warm
  // orange (sparingly — focus/notify), `accentSurface` = teal tint (chips/insight).
  secondary: string;
  accent: string;
  accentSurface: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

const lightColors = {
  background: palette.warmWhite,
  backgroundElevated: palette.warmSurfaceLow,
  backgroundSelected: palette.warmSurfaceHigh,
  surface: palette.white,
  border: palette.borderWarm,
  textPrimary: palette.ink,
  textSecondary: palette.inkVariant,
  textMuted: palette.inkMuted,
  textInverse: palette.white,
  primary: palette.navy,
  primaryText: palette.white,
  brandPrimary: palette.orange,
  brandPrimaryPressed: palette.orangePressed,
  brandPrimarySoft: palette.orangeSoft,
  brandPrimaryText: palette.ink,
  secondary: palette.teal,
  accent: palette.orange,
  accentSurface: palette.tealTint,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
  info: palette.blue600,
} satisfies SemanticColors;

const darkColors = {
  background: palette.warmDarkBg,
  backgroundElevated: palette.warmDarkElevated,
  backgroundSelected: palette.warmDarkSelected,
  surface: palette.warmDarkSurface,
  border: palette.warmDarkBorder,
  textPrimary: palette.warmDarkText,
  textSecondary: palette.warmDarkTextVariant,
  textMuted: palette.gray400,
  textInverse: palette.ink,
  primary: palette.navyDark,
  primaryText: palette.white,
  brandPrimary: palette.orangeDark,
  brandPrimaryPressed: palette.orangeDarkPressed,
  brandPrimarySoft: palette.orangeSoftDark,
  brandPrimaryText: palette.warmDarkBg,
  secondary: palette.tealDark,
  accent: palette.orangeDark,
  accentSurface: palette.tealTintDark,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
  info: palette.blue400,
} satisfies SemanticColors;

export const colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorScheme = keyof typeof colors;
export type SemanticColorToken = keyof SemanticColors;

// ---- Five-element (오행) TILE colors (APP-28E, additive) ----
// Traditional 오행 color scheme (천을귀인 만세력은 색 체계 참고만; UI 미복제):
//   WOOD=GREEN, FIRE=RED, EARTH=YELLOW, METAL=WHITE, WATER=BLACK.
// The ENGINE's FiveElement identity is the ONLY authority; the APP maps it to a
// tile { background, glyph, border }. A per-element tile (not just glyph color) is
// used so METAL reads as WHITE and WATER as BLACK. Every tile carries a visible
// border so the WHITE tile survives a light background and the BLACK tile survives
// a dark background. DeokbunAI keeps its rounded/light modern look (radius + border).
export type FiveElementColorKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type FiveElementTile = {
  background: string;
  glyph: string;
  border: string;
};

const lightFiveElementTiles = {
  wood: { background: '#2E7D32', glyph: '#FFFFFF', border: '#1B5E20' }, // green
  fire: { background: '#C62828', glyph: '#FFFFFF', border: '#8E1B1B' }, // red
  earth: { background: '#F2C14E', glyph: '#1F2937', border: '#C9971F' }, // yellow/ochre, dark glyph
  // METAL is white on a (usually white) surface → stronger gray-600 border so the
  // tile boundary stays visible (APP-29A). Identity color unchanged.
  metal: { background: '#FFFFFF', glyph: '#111827', border: '#4B5563' }, // white, black glyph, strong border
  water: { background: '#111827', glyph: '#FFFFFF', border: '#4B5563' }, // near-black, white glyph
} as const satisfies Record<FiveElementColorKey, FiveElementTile>;

const darkFiveElementTiles = {
  wood: { background: '#2E7D32', glyph: '#FFFFFF', border: '#66BB6A' },
  fire: { background: '#C62828', glyph: '#FFFFFF', border: '#EF5350' },
  earth: { background: '#E6B23A', glyph: '#1F2937', border: '#F2C14E' }, // yellow, dark glyph
  metal: { background: '#F3F4F6', glyph: '#111827', border: '#9CA3AF' }, // near-white, black glyph
  // WATER is near-black on a near-black dark surface → stronger gray-400 border so
  // the tile boundary stays visible (APP-29A). Identity color unchanged.
  water: { background: '#0B1220', glyph: '#FFFFFF', border: '#9CA3AF' }, // near-black, strong border on dark
} as const satisfies Record<FiveElementColorKey, FiveElementTile>;

export const fiveElementTiles = {
  light: lightFiveElementTiles,
  dark: darkFiveElementTiles,
} as const;
