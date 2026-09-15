// FINAL V1 consumer bottom navigation — ONE source of truth (owner nav decision).
// Order: 홈 · 상담 · 궁합 · 운세우편함 · MY. Both the primary tab bar (app-tabs.web) and the detail-screen
// mirror (DetailBottomNav) consume THIS list so labels/routes/order never drift. The native NativeTabs
// bar (app-tabs.tsx) mirrors the same order literally (NativeTabs children can't be data-driven), and
// the glyphs live in ConsumerNavGlyph so the icon set is single-source too.
export type ConsumerNavKey = 'home' | 'consult' | 'compatibility' | 'inbox' | 'my';
export type ConsumerNavRoute = '/' | '/consult' | '/compatibility' | '/inbox' | '/my';

export type ConsumerNavItem = { key: ConsumerNavKey; label: string; route: ConsumerNavRoute };

export const CONSUMER_NAV_ITEMS: readonly ConsumerNavItem[] = [
  { key: 'home', label: '홈', route: '/' },
  { key: 'consult', label: '상담', route: '/consult' },
  { key: 'compatibility', label: '궁합', route: '/compatibility' },
  { key: 'inbox', label: '운세우편함', route: '/inbox' },
  { key: 'my', label: 'MY', route: '/my' },
];
