
import { Platform } from 'react-native';

const systemFontFamily = Platform.select({
	ios: 'System',
	android: 'sans-serif',
	default: 'system-ui',
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

export const typography = {
	displayLarge: { fontSize: 32, lineHeight: 40, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold },
	displayMedium: { fontSize: 28, lineHeight: 36, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold },
	headingLarge: { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold },
	headingMedium: { fontSize: 20, lineHeight: 28, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold },
	bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular, fontFamily: fontFamily.regular },
	caption: { fontSize: 11, lineHeight: 14, fontWeight: fontWeight.medium, fontFamily: fontFamily.medium },
} satisfies Record<string, TypographyScaleToken>;

export type TypographyToken = keyof typeof typography;
