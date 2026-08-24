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
  // ---- DESIGN_FREEZE_FINAL — "Warm White + Soft Pastel" (덕분이 디자인 시스템 v2) ----
  // Signature Orange (#F28C33) is RETIRED. The brand impression now comes from warm white dominance
  // (80–85% of every screen), five meaning-bearing pastels, ink CTAs, and typography — not one hue.
  // Semantic key NAMES below are unchanged from the previous system, so every call site follows
  // automatically; only the VALUES moved.
  surfaceBase: '#FDFBF6', // background — app-wide ground
  surfaceRaised: '#FFFFFF', // cards / sheets / inputs
  surfaceSunken: '#F6F1E7', // section bands, segmented tracks, inactive chips
  surfaceSelectedWarm: '#F0EADD', // pressed / selected fill
  // Pastels carry MEANING, never decoration: butter=today, sage=duk/reward, blush=relationship,
  // lavender=notice/mail, sky=monthly. Max 2 pastel families per screen.
  butter: '#FDF3D7',
  sage: '#E4EFE2',
  blush: '#FCE7E4',
  lavender: '#ECE9F6',
  sky: '#E5EEF3',
  inkText: '#2E2A24', // text.primary — 13.7:1 on surface.base
  inkSecondary: '#6B6357', // text.secondary — 6.0:1
  inkMutedWarm: '#776E60', // text.muted — 4.9:1. VALID ONLY on surface.base / surface.raised.
  onButter: '#7A5B12', // 5.6:1 on butter
  onSage: '#3F6B4A', // 5.6:1 on sage — also the 덕 accent
  onBlush: '#8E4640', // 5.9:1 on blush
  onLavender: '#5A5187',
  lineDefault: '#EBE4D6', // 1px card border
  lineHairline: '#F2EDE1', // list divider
  actionPrimary: '#33302A', // the ONE strong fill; the only heavy surface allowed over pastels
  actionPrimaryPressed: '#4A463D',
  actionPrimaryText: '#FDFBF6', // 12.8:1 on action.primary
  actionSecondaryBorder: '#DCD4C2',
  actionDisabledBg: '#EFEAE0',
  actionDisabledText: '#A79E8E',
  stateWarn: '#C8A94A',
  stateError: '#B0524A', // desaturated brick — errors / delete / unread badge
  // dark-scheme derivations (consumer is light-first; the freeze specifies light only, so dark keeps
  // the same ROLES with inverted ground and never reintroduces a retired hue)
  warmDarkBg: '#1A1B17',
  warmDarkElevated: '#24261F',
  warmDarkSelected: '#2E312A',
  warmDarkSurface: '#22231E',
  warmDarkBorder: '#3A3B34',
  warmDarkHairline: '#2C2E27',
  warmDarkText: '#F2F1EC',
  warmDarkTextVariant: '#C9C5BB',
  warmDarkTextMuted: '#A8A296',
  inkDark: '#EFEAE0', // action.primary inverted (light fill on dark ground)
  inkDarkPressed: '#D8D2C6',
  inkDarkText: '#1F1C18',
  inkDarkSoft: '#33302A',
  butterDark: '#3A3325',
  sageDark: '#26332A',
  blushDark: '#3A2A29',
  lavenderDark: '#2C2A38',
  skyDark: '#242F35',
  onButterDark: '#E8CE8A',
  onSageDark: '#9CCBA6',
  onBlushDark: '#E2A9A3',
  onLavenderDark: '#B7AEDD',
  dukDark: '#8FC39C',
  errorDark: '#E08A82',
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
  // Hairline divider for dense lists (lighter than `border`, which frames cards).
  lineHairline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string; // de-emphasized meta. NEVER on a pastel surface — use on* instead.
  textInverse: string;
  // Bottom-nav inactive label. Same value as textMuted by DESIGN INTENT: navigation text is
  // essential, so it must clear 4.5:1 — a lighter grey is not permitted here.
  textNavInactive: string;
  primary: string;
  primaryText: string;
  // brandPrimary = action.primary (#33302A ink). The ONE strong fill in the system; it is the only
  // heavy surface allowed to sit over a pastel. `primary` is the same ink so structural controls
  // (focus rings, selected borders, send button) read as one voice.
  brandPrimary: string;
  brandPrimaryPressed: string;
  brandPrimarySoft: string;
  brandPrimaryText: string;
  secondary: string;
  accent: string;
  accentSurface: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  // ---- Pastel surfaces + their ONLY legal text colors (freeze §01) ----
  surfaceButter: string;
  surfaceSage: string;
  surfaceBlush: string;
  surfaceLavender: string;
  surfaceSky: string;
  onButter: string;
  onSage: string;
  onBlush: string;
  onLavender: string;
  // ---- Action chrome ----
  actionSecondaryBorder: string;
  actionDisabledBg: string;
  actionDisabledText: string;
};

const lightColors = {
  background: palette.surfaceBase,
  backgroundElevated: palette.surfaceSunken,
  backgroundSelected: palette.surfaceSelectedWarm,
  surface: palette.surfaceRaised,
  border: palette.lineDefault,
  lineHairline: palette.lineHairline,
  textPrimary: palette.inkText,
  textSecondary: palette.inkSecondary,
  textMuted: palette.inkMutedWarm,
  textInverse: palette.actionPrimaryText,
  textNavInactive: palette.inkMutedWarm,
  primary: palette.actionPrimary,
  primaryText: palette.actionPrimaryText,
  brandPrimary: palette.actionPrimary,
  brandPrimaryPressed: palette.actionPrimaryPressed,
  brandPrimarySoft: palette.surfaceSelectedWarm,
  brandPrimaryText: palette.actionPrimaryText,
  secondary: palette.inkSecondary,
  accent: palette.actionPrimary,
  accentSurface: palette.sky,
  success: palette.onSage,
  warning: palette.stateWarn,
  danger: palette.stateError,
  info: palette.onLavender,
  surfaceButter: palette.butter,
  surfaceSage: palette.sage,
  surfaceBlush: palette.blush,
  surfaceLavender: palette.lavender,
  surfaceSky: palette.sky,
  onButter: palette.onButter,
  onSage: palette.onSage,
  onBlush: palette.onBlush,
  onLavender: palette.onLavender,
  actionSecondaryBorder: palette.actionSecondaryBorder,
  actionDisabledBg: palette.actionDisabledBg,
  actionDisabledText: palette.actionDisabledText,
} satisfies SemanticColors;

const darkColors = {
  background: palette.warmDarkBg,
  backgroundElevated: palette.warmDarkElevated,
  backgroundSelected: palette.warmDarkSelected,
  surface: palette.warmDarkSurface,
  border: palette.warmDarkBorder,
  lineHairline: palette.warmDarkHairline,
  textPrimary: palette.warmDarkText,
  textSecondary: palette.warmDarkTextVariant,
  textMuted: palette.warmDarkTextMuted,
  textInverse: palette.inkDarkText,
  textNavInactive: palette.warmDarkTextMuted,
  primary: palette.inkDark,
  primaryText: palette.inkDarkText,
  brandPrimary: palette.inkDark,
  brandPrimaryPressed: palette.inkDarkPressed,
  brandPrimarySoft: palette.inkDarkSoft,
  brandPrimaryText: palette.inkDarkText,
  secondary: palette.warmDarkTextVariant,
  accent: palette.inkDark,
  accentSurface: palette.skyDark,
  success: palette.dukDark,
  warning: palette.amber500,
  danger: palette.errorDark,
  info: palette.onLavenderDark,
  surfaceButter: palette.butterDark,
  surfaceSage: palette.sageDark,
  surfaceBlush: palette.blushDark,
  surfaceLavender: palette.lavenderDark,
  surfaceSky: palette.skyDark,
  onButter: palette.onButterDark,
  onSage: palette.onSageDark,
  onBlush: palette.onBlushDark,
  onLavender: palette.onLavenderDark,
  actionSecondaryBorder: palette.warmDarkBorder,
  actionDisabledBg: palette.warmDarkElevated,
  actionDisabledText: '#7C776D',
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
// a dark background. NOT part of the consumer redesign — engine identity colors are
// frozen because 만세력 accuracy depends on them.
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
