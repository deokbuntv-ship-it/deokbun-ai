// Consumer bottom nav — single source of truth (owner FINAL nav decision). Locks the 5-item order so the
// tab bar (app-tabs.web), native tabs, and the detail mirror (DetailBottomNav) can never drift.
// FINAL: 홈 · 상담 · 궁합 · 운세우편함 · MY, with 궁합 as the 3rd primary tab.
import { CONSUMER_NAV_ITEMS } from '../consumerNav';

describe('CONSUMER_NAV_ITEMS', () => {
  it('is exactly 5 items in the FINAL order', () => {
    expect(CONSUMER_NAV_ITEMS.map((i) => i.key)).toEqual(['home', 'consult', 'compatibility', 'inbox', 'my']);
  });

  it('places 궁합 as the 3rd tab, routing to /compatibility', () => {
    const third = CONSUMER_NAV_ITEMS[2];
    expect(third.key).toBe('compatibility');
    expect(third.label).toBe('궁합');
    expect(third.route).toBe('/compatibility');
  });

  it('maps every key to its expected label + route', () => {
    expect(CONSUMER_NAV_ITEMS).toEqual([
      { key: 'home', label: '홈', route: '/' },
      { key: 'consult', label: '상담', route: '/consult' },
      { key: 'compatibility', label: '궁합', route: '/compatibility' },
      { key: 'inbox', label: '운세우편함', route: '/inbox' },
      { key: 'my', label: 'MY', route: '/my' },
    ]);
  });
});
