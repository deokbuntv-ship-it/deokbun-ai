
import { Platform, type TextStyle } from 'react-native';

// DESIGN_FREEZE_FINAL §02 — one family, hierarchy by WEIGHT (not by hue).
//
// The freeze specifies Pretendard (SIL OFL, Korean-optimised). No Pretendard binary is bundled in
// this repo and fabricating/downloading one is out of scope for a presentation pass, so:
//   • web  — Pretendard is requested FIRST in the stack; it renders wherever the face is available
//            (installed locally or served by the host) and falls back cleanly otherwise.
//   • native — stays on the system face until the owner drops the static 400/500/600/700 subsets in
//            and loads them via expo-font. Tracked as PRETENDARD_FONT_ASSET_REQUIRED.
// The fontFamily.regular…bold KEY STRUCTURE is unchanged, so that swap is a one-file edit later.
const systemFontFamily = Platform.select({
	ios: 'System',
	android: 'sans-serif',
	default: "'Pretendard Variable', Pretendard, -apple-system, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
}) as string;

export const fontFamily = {
	regular: systemFontFamily,
	medium: systemFontFamily,
	semibold: systemFontFamily,
	bold: systemFontFamily,
} as const;

export type FontFamilyToken = keyof typeof fontFamily;

export const fontWeight = {
	regular: '400',
	medium: '500',
	semibold: '600',
	bold: '700',
} as const;

type TypographyScaleToken = {
	fontSize: number;
	lineHeight: number;
	fontWeight: (typeof fontWeight)[keyof typeof fontWeight];
	fontFamily: string;
};

// Freeze scale. Existing token NAMES are kept so no call site changes; the values move to the
// design scale (display 28/38 · title 22/30 · section 17/24 · body 15/24 · small 13/20 · caption
// 12/16). Korean body copy never goes below 14px and never shrinks to solve a 360dp overflow —
// wrapping / ellipsis / layout does that instead.
export const typography = {
	displayLarge: { fontSize: 28, lineHeight: 38, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }, // display
	displayMedium: { fontSize: 24, lineHeight: 35, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }, // hero @360dp
	headingLarge: { fontSize: 22, lineHeight: 30, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }, // title
	headingMedium: { fontSize: 17, lineHeight: 24, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }, // section
	// AI 해석 본문 전용 — long-form Korean reading measure (freeze §02 "reading").
	reading: { fontSize: 16, lineHeight: 28, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	bodyLarge: { fontSize: 15, lineHeight: 24, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	bodyMedium: { fontSize: 14, lineHeight: 23, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	caption: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.medium, fontFamily: fontFamily.medium },
} satisfies Record<string, TypographyScaleToken>;

export type TypographyToken = keyof typeof typography;

// OS font-scaling ceilings (freeze §Adaptive). Body may grow to 1.3×, controls/tab labels to 1.2×,
// beyond which a 360dp layout collapses. Applied as <Text maxFontSizeMultiplier> defaults.
export const maxFontScale = { body: 1.3, control: 1.2 } as const;

// Long Korean must break on 어절 boundaries, and 덕/price digits must not jitter as they change.
// RN Web maps both through to CSS; native ignores unknown keys, so these are safe shared styles.
// `wordBreak` is a CSS property RN Web understands but RN's TextStyle does not declare; native
// simply ignores the unknown key, so the cast is the whole cost of getting keep-all on web.
export const koreanText = { wordBreak: 'keep-all' } as unknown as TextStyle;
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
