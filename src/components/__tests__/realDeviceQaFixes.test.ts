// Real-device QA (Android staging) — structural guards for the shared-component fixes so the icons/nav/card
// regressions can't silently return. Source-scan (no RN render harness in this node suite).
import * as fs from 'fs';
import * as path from 'path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.resolve(__dirname, '..', rel));

describe('native icons render (react-native-svg) — #1/#3/#4', () => {
  it('native LineIcon draws via react-native-svg (no longer a null no-op)', () => {
    const src = read('LineIcon/LineIcon.tsx');
    expect(src).toMatch(/from 'react-native-svg'/);
    expect(src).not.toMatch(/:\s*null\s*\{\s*return null/);
    expect(src).toMatch(/case 'bell':/); // bell icon present so the header bell shows on device
  });
  it('native ConsumerNavGlyph draws via react-native-svg', () => {
    const src = read('ConsumerNavGlyph.tsx');
    expect(src).toMatch(/from 'react-native-svg'/);
    expect(src).toMatch(/case 'home':/);
  });
});

describe('bottom nav is one authoritative implementation with orange active — #1', () => {
  it('DetailBottomNav is a single file (web duplicate removed)', () => {
    expect(exists('DetailBottomNav.tsx')).toBe(true);
    expect(exists('DetailBottomNav.web.tsx')).toBe(false);
  });
  it('DetailBottomNav renders the shared glyph + signature-orange active state', () => {
    const src = read('DetailBottomNav.tsx');
    expect(src).toMatch(/ConsumerNavGlyph/);
    expect(src).toMatch(/isActive\s*\?\s*theme\.brandPrimary/);
    expect(src).toMatch(/CONSUMER_NAV_ITEMS/);
  });
});

describe('InsightCard meta wraps instead of overflowing — #2', () => {
  const src = read('InsightCard/InsightCard.tsx');
  it('the meta row wraps and the timestamp can shrink', () => {
    expect(src).toMatch(/flexWrap:\s*'wrap'/);
    expect(src).toMatch(/flexShrink:\s*1/);
  });
});
