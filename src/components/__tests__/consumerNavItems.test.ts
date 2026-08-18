// Locks the consumer bottom-navigation IA (Commercial UX V4 §13): the item set/order/routes are the
// single source of truth reused by ConsumerBottomNav on detail screens. This must stay in sync with the
// primary tab bar (components/app-tabs*.tsx: 홈 · 상담 · 운세우편함 · MY) — if the tab bar changes, this
// test should change with it, deliberately.
import { CONSUMER_NAV_ITEMS } from '@/components/consumerNavItems';

describe('CONSUMER_NAV_ITEMS', () => {
  it('is exactly the 4-tab consumer IA, in order, with the correct routes', () => {
    expect(CONSUMER_NAV_ITEMS).toEqual([
      { key: 'home', label: '홈', route: '/' },
      { key: 'consult', label: '상담', route: '/consult' },
      { key: 'inbox', label: '운세우편함', route: '/inbox' },
      { key: 'my', label: 'MY', route: '/my' },
    ]);
  });

  it('has unique keys and internal absolute routes', () => {
    const keys = CONSUMER_NAV_ITEMS.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const item of CONSUMER_NAV_ITEMS) {
      expect(item.route.startsWith('/')).toBe(true);
    }
  });
});
