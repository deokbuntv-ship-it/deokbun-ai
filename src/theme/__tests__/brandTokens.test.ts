// DESIGN_FREEZE_FINAL — design-token invariants. These lock the frozen Deokbuni identity ("Warm White +
// Soft Pastel") so a future edit can't drift the ground colour, resurrect the retired Signature Orange,
// or ship a pastel surface whose only legal text colour is missing/inaccessible.
//
// Supersedes the Stitch-era invariants (signature orange #F28C33 + deep navy CTA), which the freeze retired.
import { colors } from '@/theme/colors'; // direct (barrel pulls RN via typography, unloadable in node jest)

// Minimal WCAG contrast (sRGB relative luminance) — enough to assert filled-CTA / text legibility.
function lum(hex: string): number {
  const h = hex.replace('#', '');
  const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
}
function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const L = colors.light;

describe('the frozen ground and CTA', () => {
  it('background is the frozen warm white #FDFBF6', () => {
    expect(L.background.toUpperCase()).toBe('#FDFBF6');
  });
  it('action.primary (brandPrimary) is the frozen ink #33302A', () => {
    expect(L.brandPrimary.toUpperCase()).toBe('#33302A');
  });
  it('structural primary and the CTA are ONE ink (single strong voice)', () => {
    expect(L.primary).toBe(L.brandPrimary);
  });
});

describe('Signature Orange is retired', () => {
  const RETIRED = ['#F28C33', '#DE7A24', '#FCEBDA', '#FFB781'];
  it.each(['light', 'dark'] as const)('no retired orange survives in the %s scheme', (scheme) => {
    const used = Object.values(colors[scheme]).map((v) => v.toUpperCase());
    RETIRED.forEach((hex) => expect(used).not.toContain(hex));
  });
});

describe('filled ink CTA is accessible', () => {
  it.each(['light', 'dark'] as const)('brandPrimaryText on brandPrimary meets WCAG AA in %s', (scheme) => {
    expect(contrast(colors[scheme].brandPrimaryText, colors[scheme].brandPrimary)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('body / meta / nav text clears 4.5:1 on the surfaces it is allowed on', () => {
  // textMuted is valid ONLY on surface.base and surface.raised — the pastels have their own on* colours.
  it.each([
    ['textPrimary', L.textPrimary],
    ['textSecondary', L.textSecondary],
    ['textMuted', L.textMuted],
    ['textNavInactive', L.textNavInactive],
  ])('%s on surface.base', (_n, c) => expect(contrast(c, L.background)).toBeGreaterThanOrEqual(4.5));

  it('textMuted also clears on surface.raised', () => {
    expect(contrast(L.textMuted, L.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('the inactive tab label is NOT lighter than muted (navigation text is essential)', () => {
    expect(L.textNavInactive).toBe(L.textMuted);
  });
});

describe('every pastel surface has exactly one legal, accessible text colour', () => {
  it.each([
    ['butter', L.surfaceButter, L.onButter],
    ['sage', L.surfaceSage, L.onSage],
    ['blush', L.surfaceBlush, L.onBlush],
    ['lavender', L.surfaceLavender, L.onLavender],
  ])('on%s clears 4.5:1 over surface.%s', (_n, bg, fg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  // The freeze's central accessibility rule: muted grey is UNREADABLE on the cream family
  // (4.30–4.46:1), so it must never be the answer for those surfaces.
  it.each([
    ['surface.sunken', L.backgroundElevated],
    ['line.hairline', L.lineHairline],
    ['surface.selected', L.backgroundSelected],
  ])('textMuted is NOT relied on over %s — textSecondary is', (_n, bg) => {
    expect(contrast(L.textSecondary, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('required semantic tokens exist in both schemes', () => {
  const keys = [
    'brandPrimary', 'brandPrimaryPressed', 'brandPrimarySoft', 'brandPrimaryText',
    'textMuted', 'textNavInactive', 'lineHairline', 'info',
    'surfaceButter', 'surfaceSage', 'surfaceBlush', 'surfaceLavender', 'surfaceSky',
    'onButter', 'onSage', 'onBlush', 'onLavender',
    'actionSecondaryBorder', 'actionDisabledBg', 'actionDisabledText',
  ] as const;
  it.each(keys)('light.%s is a hex color', (k) => {
    expect(colors.light[k]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
  it.each(keys)('dark.%s is a hex color', (k) => {
    expect(colors.dark[k]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('the engine identity palette is untouched', () => {
  it('accent.duk is the sage-family green used for 덕 numbers and success', () => {
    expect(L.success.toUpperCase()).toBe('#3F6B4A');
    expect(L.onSage).toBe(L.success);
  });
});
