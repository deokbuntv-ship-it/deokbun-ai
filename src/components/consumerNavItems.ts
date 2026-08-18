// Single source of truth for the consumer bottom-navigation items (홈 · 상담 · 운세우편함 · MY).
//
// The primary tab bar is a layout-bound navigator (NativeTabs on native / expo-router-ui Tabs on web,
// in components/app-tabs*.tsx) that only wraps the (tabs) group — it cannot be dropped onto a pushed
// detail route. So detail screens that need the same navigation (e.g. /report/[id], the 우편함 child)
// render a lightweight ConsumerBottomNav that reuses THIS list, keeping the item set/order/routes in one
// place. The item set here mirrors app-tabs*.tsx exactly (asserted by a test) so the two can't drift.
export type ConsumerNavKey = 'home' | 'consult' | 'inbox' | 'my';

export type ConsumerNavRoute = '/' | '/consult' | '/inbox' | '/my';

export type ConsumerNavItem = {
  key: ConsumerNavKey;
  label: string;
  route: ConsumerNavRoute;
};

export const CONSUMER_NAV_ITEMS: readonly ConsumerNavItem[] = [
  { key: 'home', label: '홈', route: '/' },
  { key: 'consult', label: '상담', route: '/consult' },
  { key: 'inbox', label: '운세우편함', route: '/inbox' },
  { key: 'my', label: 'MY', route: '/my' },
];
