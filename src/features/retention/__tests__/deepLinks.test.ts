import { DEEP_LINK_TARGETS, isDeepLinkTarget, resolveDeepLinkPath } from '@/features/retention/deepLinks';

describe('deep-link allowlist (§17 — no open redirect)', () => {
  it('only allowlisted targets are accepted', () => {
    for (const t of DEEP_LINK_TARGETS) expect(isDeepLinkTarget(t)).toBe(true);
    expect(isDeepLinkTarget('https://evil.example')).toBe(false);
    expect(isDeepLinkTarget('javascript:alert(1)')).toBe(false);
    expect(isDeepLinkTarget('/arbitrary')).toBe(false);
    expect(isDeepLinkTarget(null)).toBe(false);
    expect(isDeepLinkTarget(42)).toBe(false);
  });

  it('every target resolves to a fixed INTERNAL relative route (never an external URL)', () => {
    for (const t of DEEP_LINK_TARGETS) {
      const path = resolveDeepLinkPath(t);
      expect(path.startsWith('/')).toBe(true);
      expect(path).not.toMatch(/^https?:|^javascript:|^\/\//);
    }
    expect(resolveDeepLinkPath('TODAY')).toBe('/today');
    expect(resolveDeepLinkPath('MONTHLY')).toBe('/monthly');
    expect(resolveDeepLinkPath('MAILBOX')).toBe('/inbox');
    expect(resolveDeepLinkPath('LIFE_EVENT')).toBe('/life-events');
  });

  it('REPORT encodes the id and falls back safely without one', () => {
    expect(resolveDeepLinkPath('REPORT', 'abc-123')).toBe('/report/abc-123');
    expect(resolveDeepLinkPath('REPORT', 'a/b?c')).toBe('/report/a%2Fb%3Fc');
    expect(resolveDeepLinkPath('REPORT', null)).toBe('/inbox');
  });
});
