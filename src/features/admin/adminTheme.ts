import { Platform } from 'react-native';

// Admin-only "Precision & Trust" palette (Stitch admin SSOT). Kept LOCAL to the
// admin feature so the shared consumer tokens (@/theme) — which the user-app
// FINAL depends on — are never touched. Desktop operational console: deep-navy
// sidebar, soft-gray canvas, white surfaces with 1px borders, teal/orange
// functional accents, JetBrains-Mono-style monospace for IDs/technical data.
export const adminTheme = {
  // Sidebar (dark)
  sidebarBg: '#08192A',
  sidebarBrand: '#FFFFFF',
  sidebarBrandSub: '#8CA0B3',
  sidebarText: '#9FB2C4',
  sidebarActiveBg: '#C3E6E6', // teal tint
  sidebarActiveText: '#08192A',
  sidebarBorder: 'rgba(255,255,255,0.08)',

  // Canvas / surfaces
  pageBg: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E9ECEF',
  tableHeaderBg: '#F1F3F5',
  rowHover: '#F8F9FA',

  // Text
  ink: '#1B1C1D',
  inkVariant: '#44474C',
  inkMuted: '#74777D',

  // Brand / functional
  navy: '#1A2B3C',
  teal: '#4A7C7C',
  orange: '#E67E22',
  success: '#2E7D53',
  successBg: '#E7F4EC',
  warning: '#B7791F',
  warningBg: '#FBF1E3',
  danger: '#BA1A1A',
  dangerBg: '#FDECEC',
  info: '#2C6E9B',
  infoBg: '#E7F0F6',
  neutralBg: '#EEF0F2',
} as const;

// Monospace stack for IDs / tokens / technical metadata (JetBrains Mono not
// bundled → platform monospace fallback).
export const adminMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  default: 'monospace',
}) as string;
