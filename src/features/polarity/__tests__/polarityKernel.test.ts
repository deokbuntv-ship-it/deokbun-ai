// Sprint C §3/§14 — the shared polarity kernel's exact behavior + the no-ranking-score invariant.
import {
  derivePolarity,
  polarityTierFromValence,
  valenceFromRelations,
  type PolarityTier,
} from '@/features/polarity/polarityKernel';

const rel = (o: { stemH?: number; stemF?: number; branchH?: number; branchF?: number }) =>
  ({
    stem: [
      ...Array.from({ length: o.stemH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_COMBINATION' } })),
      ...Array.from({ length: o.stemF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_CLASH' } })),
    ],
    branch: [
      ...Array.from({ length: o.branchH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_HALF_THREE_HARMONY' } })),
      ...Array.from({ length: o.branchF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_PUNISHMENT' } })),
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe('valenceFromRelations — stem + branch tally', () => {
  it('counts STEM_COMBINATION + harmony branches as harmony, STEM_CLASH + friction branches as friction', () => {
    expect(valenceFromRelations(rel({ stemH: 1, branchH: 2, stemF: 1, branchF: 1 }))).toEqual({ harmony: 3, friction: 2 });
  });
  it('ignores unrelated / empty relations', () => {
    expect(valenceFromRelations(rel({}))).toEqual({ harmony: 0, friction: 0 });
  });
});

describe('polarityTierFromValence — 4-way categorical threshold', () => {
  const cases: [number, number, PolarityTier][] = [
    [1, 0, 'FAVORABLE'],
    [3, 0, 'FAVORABLE'],
    [0, 0, 'STEADY'],
    [2, 2, 'DYNAMIC'], // exact tie → DYNAMIC
    [3, 1, 'DYNAMIC'],
    [1, 3, 'CAUTION'],
    [0, 1, 'CAUTION'],
  ];
  it.each(cases)('h=%i f=%i → %s', (h, f, tier) => {
    expect(polarityTierFromValence(h, f)).toBe(tier);
  });

  it('derivePolarity carries the evidence tally alongside the tier', () => {
    expect(derivePolarity(rel({ branchH: 1, stemF: 1 }))).toEqual({ tier: 'DYNAMIC', evidence: { harmony: 1, friction: 1 } });
  });
});

describe('no invented ranking (§0.C/§14)', () => {
  it('the kernel exposes no ordering / score / sort helper — only categorical tier + internal evidence', () => {
    // The module surface is intentionally: valenceFromRelations, polarityTierFromValence, derivePolarity.
    // There is no compare(), no rank(), no score(). A tier is a label; harmony/friction are not a public score.
    const mod = require('@/features/polarity/polarityKernel');
    const exported = Object.keys(mod).sort();
    expect(exported).toEqual(['derivePolarity', 'polarityTierFromValence', 'valenceFromRelations']);
  });
});
