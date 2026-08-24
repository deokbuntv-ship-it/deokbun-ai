import { readFileSync } from 'fs';
import { resolve } from 'path';

// Regression lock for the Today-Home runtime crash (P0 2026-08-19). Two DISTINCT defects
// shipped together with Today Fortune V1 and both surfaced on the Home render:
//
//   1. REAL crash — the 오늘의 운세 card wrapped a <Card> containing a CTA <Button> inside a
//      <Pressable>. On React-Native-Web BOTH a `<Pressable accessibilityRole="button">` and a
//      <Button> render as real <button> elements, so this produced a <button> nested in a
//      <button> — invalid DOM that throws a hydration error ("<button> cannot be a descendant
//      of <button>"). Fix: the card body is display-only; a single CTA <Button> is the one
//      interactive control (no wrapping Pressable).
//
//   2. Benign-but-flagged warning — the '@/features/intelligence' barrel re-exports its own
//      presentation adapters, and those adapters imported the constants they need BACK from the
//      barrel, forming a require cycle (index → presentation/X → index) that Metro reports as
//      "uninitialized values". Fix: adapters import from the SOURCE modules, never the barrel.
//
// These are pure source-contract checks (the jest runner is node-only — no RN render), chosen
// over a brittle snapshot: they assert the exact anti-patterns that caused the crash cannot
// return, without pinning unrelated markup.
const SRC = resolve(__dirname, '..', '..');
const read = (rel: string) => readFileSync(resolve(SRC, rel), 'utf8');

describe('intelligence presentation adapters do not import the barrel (require-cycle contract)', () => {
  // The barrel (index.ts) re-exports each of these files, so any import of
  // '@/features/intelligence' from inside them re-forms the cycle. They must depend DOWNWARD on
  // the contract source modules (../assessment, ../versions, ../quality, ...) only.
  const PRESENTATION_MODULES = [
    'features/intelligence/presentation/assessmentView.ts',
    'features/intelligence/presentation/assessmentDetailView.ts',
    'features/intelligence/presentation/intelligenceViews.ts',
    'features/intelligence/presentation/labels.ts',
  ];

  it.each(PRESENTATION_MODULES)('%s does not import from the barrel', (rel) => {
    const src = read(rel);
    expect(src).not.toMatch(/from\s+['"]@\/features\/intelligence['"]/);
  });
});

describe('Home 오늘 hero exposes ONE interactive control (no nested <button>)', () => {
  const home = read('app/(tabs)/index.tsx');
  // DESIGN_FREEZE_FINAL D05 changed the shape: the hero is now a single tappable butter plane whose
  // CTA is TEXT ("오늘의 운세 보기 〉", 13.5/700 + underline — the freeze bans making a text CTA look
  // like a filled control). The original crash contract is unchanged and still enforced: exactly one
  // interactive node, so RN-Web can never emit a <button> inside a <button>.
  const hero = home.slice(home.indexOf('{/* ① 오늘'), home.indexOf('{/* ② 🍀 덕'));

  it('the hero region contains no <Button> (it is a Pressable plane with a text CTA)', () => {
    expect(hero.length).toBeGreaterThan(0);
    expect(hero).not.toMatch(/<Button\b/);
  });

  it('the hero has exactly one Pressable', () => {
    expect((hero.match(/<Pressable\b/g) ?? []).length).toBe(1);
  });

  it('the hero CTA is text, and it navigates to /today', () => {
    expect(hero).toMatch(/오늘의 운세 보기/);
    expect(hero).toMatch(/onPress=\{openToday\}/);
    expect(home).toMatch(/router\.push\('\/today'\)/);
  });

  it('the cost strip is a single Pressable too (no button-in-button)', () => {
    // Slice ends at the one-shot welcome card, which legitimately owns its own Button.
    const strip = home.slice(home.indexOf('{/* ③ 비용 안내'), home.indexOf('{/* 가입 축하'));
    expect(strip.length).toBeGreaterThan(0);
    expect((strip.match(/<Pressable\b/g) ?? []).length).toBe(1);
    expect(strip).not.toMatch(/<Button\b/);
  });
});

describe('InsightCard cannot render a <button> inside a <button>', () => {
  const insight = read('components/InsightCard/InsightCard.tsx');

  it('only becomes a whole-card Pressable when there is no CTA button', () => {
    // Guard: the outer Pressable branch is gated on `!ctaLabel`, so a CTA <Button> (which is
    // itself a button) is never wrapped by the card-level Pressable button.
    expect(insight).toMatch(/onPress\s*&&\s*!ctaLabel/);
  });
});
