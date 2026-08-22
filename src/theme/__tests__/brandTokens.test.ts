// FINAL brand system — design-token invariants (§2/§3/§4/§39). These lock the Deokbuni identity so a future
// edit can't silently drift the signature orange, flip the CTA to navy, or ship an inaccessible filled CTA.
import { colors } from '@/theme/colors'; // direct (barrel pulls RN via typography, unloadable in node jest)

// Minimal WCAG contrast (sRGB relative luminance) — enough to assert filled-CTA / muted-text legibility.
function lum(hex: string): number {
  const h = hex.replace('#', '');
  const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
}
function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe('signature orange is canonical and reused (§3)', () => {
  it('brandPrimary is the intended warm orange #F28C33', () => {
    expect(colors.light.brandPrimary.toUpperCase()).toBe('#F28C33');
  });
  it('brandPrimary and accent are the SAME orange (one canonical value, not two)', () => {
    expect(colors.light.brandPrimary).toBe(colors.light.accent);
  });
  it('the CTA orange is NOT the navy structure color (primary stays navy)', () => {
    expect(colors.light.brandPrimary).not.toBe(colors.light.primary);
    expect(colors.light.primary.toUpperCase()).toBe('#1A2B3C');
  });
});

describe('warm white dominates (§2)', () => {
  it('background is the warm white', () => {
    expect(colors.light.background.toUpperCase()).toBe('#F9F7F2');
  });
});

describe('filled orange CTA is accessible (§39)', () => {
  it('brandPrimaryText on brandPrimary meets WCAG AA (>=4.5) in light', () => {
    expect(contrast(colors.light.brandPrimaryText, colors.light.brandPrimary)).toBeGreaterThanOrEqual(4.5);
  });
  it('brandPrimaryText on brandPrimary meets WCAG AA (>=4.5) in dark', () => {
    expect(contrast(colors.dark.brandPrimaryText, colors.dark.brandPrimary)).toBeGreaterThanOrEqual(4.5);
  });
  it('textMuted stays legible on the warm-white background (>=4.5)', () => {
    expect(contrast(colors.light.textMuted, colors.light.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('required semantic tokens exist in both schemes (§3)', () => {
  const keys = ['brandPrimary', 'brandPrimaryPressed', 'brandPrimarySoft', 'brandPrimaryText', 'textMuted', 'info'] as const;
  it.each(keys)('light.%s is a hex color', (k) => {
    expect(colors.light[k]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
  it.each(keys)('dark.%s is a hex color', (k) => {
    expect(colors.dark[k]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
