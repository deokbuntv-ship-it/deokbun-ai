// Special-pattern PREREQUISITE facts — raw counts/positions ONLY, deterministic. No pattern verdict.
import {
  calculateSameElementRooting, calculateSpecialPatternPrerequisites, type NatalPillarContext,
} from '../index';

const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

describe('calculateSpecialPatternPrerequisites', () => {
  const r = calculateSpecialPatternPrerequisites(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('exposes RAW element counts, never weighted/percent', () => {
    // visible (non-DAY) stems: 戊(EARTH) 丙(FIRE) 己(EARTH)
    expect(r.visibleElementCounts).toEqual({ WOOD: 0, FIRE: 1, EARTH: 2, METAL: 0, WATER: 0 });
    expect(Object.values(r.hiddenElementCounts).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
  });

  it('exposes same-element-root POSITIONS only, no strength/rank judgment', () => {
    expect(r.sameElementRootPositions).toHaveLength(2);
    expect(r.sameElementRootPositions.map((p) => p.position).sort()).toEqual(['DAY', 'HOUR'].sort());
  });

  it('exposes 5-role category presence (비겁/인성/식상/재성/관성) without a support/drain side tag', () => {
    expect(r.roleCategoryPresence).toHaveLength(5);
    const wealth = r.roleCategoryPresence.find((x) => x.role === 'WEALTH')!;
    expect(wealth.visibleCount).toBeGreaterThan(0); // 戊/己 are WEALTH-category vs 甲 DM
    for (const entry of r.roleCategoryPresence) {
      const asRecord = entry as unknown as Record<string, unknown>;
      expect(asRecord.side).toBeUndefined();
      expect(asRecord.support).toBeUndefined();
      expect(asRecord.drain).toBeUndefined();
    }
  });

  it('never emits a special-pattern verdict of any kind', () => {
    const asRecord = r as unknown as Record<string, unknown>;
    expect(asRecord.congCaiCandidate).toBeUndefined();
    expect(asRecord.congGuanShaCandidate).toBeUndefined();
    expect(asRecord.congErCandidate).toBeUndefined();
    expect(asRecord.specialPatternScore).toBeUndefined();
    expect(asRecord.specialPatternConfirmed).toBeUndefined();
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/CONFIRMED|CANDIDATE|從强|從財|從官殺|從兒|專旺|WEAK|STRONG|극신약|신약|중화|신강|극신강/);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-special-pattern-prerequisites.v1');
    const bad = calculateSpecialPatternPrerequisites({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
  });
});

// ══ order invariance / identity contract / provenance cross-check (HARDENING §11/§12/§13/§14) ══
describe('order invariance', () => {
  it('output is independent of the pillars object literal key order', () => {
    const a: NatalPillarContext = { ...RICH_NATAL };
    const b: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        hour: RICH_NATAL.pillars.hour!, day: RICH_NATAL.pillars.day,
        month: RICH_NATAL.pillars.month, year: RICH_NATAL.pillars.year,
      },
    };
    expect(calculateSpecialPatternPrerequisites(a)).toEqual(calculateSpecialPatternPrerequisites(b));
  });
});

describe('identity contract — no synthesized factId in this provider (documented, not a gap)', () => {
  // Unlike sameElementRooting/tenGodFacts, this provider emits AGGREGATES (counts, position lists),
  // not one-fact-per-occurrence records — so there is no natural per-record factId to mint. Instead,
  // the fixed `role` enum (exactly 5 values, exhaustive, non-overlapping) IS the stable identity for
  // roleCategoryPresence entries, and `position`+`branch` IS the stable identity for
  // sameElementRootPositions entries. Both are already covered by the exhaustive tests above; this
  // block only pins down that the identity SCHEME itself (role-as-key / position+branch-as-key) is
  // complete and non-duplicated, which is what a factId would otherwise have guaranteed.
  const r = calculateSpecialPatternPrerequisites(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('roleCategoryPresence is a complete partition — all 5 roles present, each exactly once', () => {
    const roles = r.roleCategoryPresence.map((x) => x.role);
    expect(new Set(roles).size).toBe(5);
    expect(roles.sort()).toEqual(['OFFICER', 'OUTPUT', 'PARALLEL', 'RESOURCE', 'WEALTH'].sort());
  });

  it('no HiddenStemFact-style factId field leaks in unexpectedly (would contradict this documented contract)', () => {
    const asRecord = r as unknown as Record<string, unknown>;
    expect(asRecord.factId).toBeUndefined();
    for (const entry of r.roleCategoryPresence) {
      expect((entry as unknown as Record<string, unknown>).factId).toBeUndefined();
    }
  });
});

describe('provenance cross-check — sameElementRootPositions is a REDUCTION of sameElementRooting, not a second derivation (HARDENING §13/§14)', () => {
  it('positions match calculateSameElementRooting(natal).sameElementRoots exactly, in the same order', () => {
    const r = calculateSpecialPatternPrerequisites(RICH_NATAL);
    const rooting = calculateSameElementRooting(RICH_NATAL);
    if (r.capability !== 'AVAILABLE' || rooting.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.sameElementRootPositions).toEqual(
      rooting.sameElementRoots.map((h) => ({ position: h.position, branch: h.branch })),
    );
  });
});
