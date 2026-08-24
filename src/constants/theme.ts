/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Aligned to DESIGN_FREEZE_FINAL (Warm White + Soft Pastel) so the native bottom nav / legacy
// surfaces match the frozen consumer design. (Semantic tokens live in @/theme.)
export const Colors = {
  light: {
    text: '#2E2A24',
    background: '#FDFBF6',
    backgroundElement: '#F6F1E7',
    backgroundSelected: '#F0EADD',
    textSecondary: '#6B6357',
  },
  dark: {
    text: '#F2F1EC',
    background: '#1A1B17',
    backgroundElement: '#24261F',
    backgroundSelected: '#2E312A',
    textSecondary: '#C9C5BB',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
// Measured 800 — shared by the admin console and the public site. DO NOT change it.
export const MaxContentWidth = 800;
// Consumer reading measure (DESIGN_FREEZE_FINAL Adaptive): >= 480dp viewports centre the body at
// 480 and let the surplus stay as surface.base margin. Never split into columns or a 2-up grid —
// the reading flow is the point.
export const ConsumerMaxContentWidth = 480;
