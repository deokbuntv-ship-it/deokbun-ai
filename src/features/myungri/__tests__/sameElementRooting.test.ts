// Day-Master SAME-ELEMENT rooting — deterministic FACT only. No root strength/rank/survivability.
import {
  getHiddenStems, getStemElement, getStemYinYang,
  HEAVENLY_STEMS, EARTHLY_BRANCHES,
  type EarthlyBranch, type HeavenlyStem,
} from '../../interpretation';
import { calculateSameElementRooting, type NatalPillarContext } from '../index';

// 甲 일간 (WOOD, YANG). 戊申년 丙子월 甲寅일 己辰시.
//   寅 지장간 = 戊(잔여) 丙(중기) 甲(정기) → 甲: SAME_STEM + SAME_POLARITY root, MAIN tier.
//   辰 지장간 = 乙(잔여) 癸(중기) 戊(정기) → 乙: SAME_ELEMENT only (WOOD, but YIN not YANG), RESIDUAL tier.
//   申 지장간 = 戊 壬 庚 (EARTH/WATER/METAL) — no WOOD.
//   子 지장간 = 壬 癸 (WATER) — no WOOD.
const RICH_NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'WU', branch: 'SHEN' },
    month: { stem: 'BING', branch: 'ZI' },
    day: { stem: 'JIA', branch: 'YIN' },
    hour: { stem: 'JI', branch: 'CHEN' },
  },
};

// 丙 일간 (FIRE). None of 申/子/辰/丑's 지장간 contain a FIRE stem — genuinely rootless for FIRE.
const ROOTLESS_NATAL: NatalPillarContext = {
  dayMaster: 'BING',
  pillars: {
    year: { stem: 'GENG', branch: 'SHEN' },
    month: { stem: 'REN', branch: 'ZI' },
    day: { stem: 'BING', branch: 'CHEN' },
    hour: { stem: 'JI', branch: 'CHOU' },
  },
};

describe('calculateSameElementRooting', () => {
  const r = calculateSameElementRooting(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('1. Day Master same-element hidden stem is detected', () => {
    expect(r.sameElementRoots.some((h) => h.sameElementAsDayMaster)).toBe(true);
    expect(r.sameElementRoots).toHaveLength(2);
  });

  it('2. same-STEM hidden stem is detected (寅 정기 甲)', () => {
    const jia = r.sameElementRoots.find((h) => h.position === 'DAY' && h.stem === 'JIA')!;
    expect(jia).toBeDefined();
    expect(jia.sameStemAsDayMaster).toBe(true);
    expect(jia.samePolarityAsDayMaster).toBe(true);
  });

  it('3. same element, OPPOSITE polarity is represented correctly (辰 잔여 乙)', () => {
    const yi = r.sameElementRoots.find((h) => h.position === 'HOUR' && h.stem === 'YI')!;
    expect(yi).toBeDefined();
    expect(yi.sameElementAsDayMaster).toBe(true);
    expect(yi.sameStemAsDayMaster).toBe(false);
    expect(yi.samePolarityAsDayMaster).toBe(false);
  });

  it('4. 본기/중기/여기 (MAIN/MIDDLE/RESIDUAL) roles are preserved', () => {
    const jia = r.sameElementRoots.find((h) => h.stem === 'JIA')!;
    const yi = r.sameElementRoots.find((h) => h.stem === 'YI')!;
    expect(jia.hiddenRole).toBe('MAIN');
    expect(yi.hiddenRole).toBe('RESIDUAL');
  });

  it('5. multiple roots remain SEPARATE facts, not merged/summed', () => {
    expect(r.sameElementRoots).toHaveLength(2);
    const ids = new Set(r.sameElementRoots.map((h) => h.factId));
    expect(ids.size).toBe(2); // distinct, stable, citable ids
  });

  it('6. no root → empty root fact set (never a fabricated/default entry)', () => {
    const rootless = calculateSameElementRooting(ROOTLESS_NATAL);
    if (rootless.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(rootless.sameElementRoots).toEqual([]);
    // the complete catalog (branches[].hiddenStems) is still non-empty — only the same-element
    // FILTER is empty; this proves the emptiness is a real filter result, not a computation failure.
    expect(rootless.branches.flatMap((b) => b.hiddenStems).length).toBeGreaterThan(0);
  });

  it('the complete hidden-stem catalog covers every branch, not pre-filtered to roots only', () => {
    expect(r.branches).toHaveLength(4);
    const shen = r.branches.find((b) => b.branch === 'SHEN')!;
    expect(shen.hiddenStems.map((h) => h.stem).sort()).toEqual(['GENG', 'REN', 'WU'].sort());
    expect(shen.hiddenStems.every((h) => h.sameElementAsDayMaster === false)).toBe(true);
  });

  it('15. fact output does not contain WEAK/STRONG or any strength label', () => {
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강/);
  });

  it('ruleVersion + fail-closed on invalid natal', () => {
    expect(r.ruleVersion).toBe('deokbunai.myungri-same-element-rooting.v1');
    const bad = calculateSameElementRooting({ dayMaster: 'JIA', pillars: {} as never });
    expect(bad.capability).toBe('UNAVAILABLE');
  });
});

// ══ EXHAUSTIVE — 10 Day Masters × 12 test branches (HARDENING §5) ══════════════════════════════
// Independent cross-check: EXPECTED values are computed here directly from the FROZEN primitives
// (getHiddenStems/getStemElement/getStemYinYang), not by re-calling calculateSameElementRooting's
// own internals — proving the provider correctly WIRES the frozen ground truth, not merely that it
// agrees with itself. No strength/rank/survivability interpretation anywhere in this block.
describe('EXHAUSTIVE — same-element rooting across all 10 Day Masters × 12 branches', () => {
  // A fixed, neutral 3-pillar base; only the HOUR branch varies across all 12 branches per case,
  // isolating exactly one branch's classification per assertion. Year/month/day stems are
  // deliberately far from every Day Master under test to avoid coincidental extra same-element hits
  // skewing the count this block asserts on (verified per-case against the HOUR branch only).
  const baseFor = (dayMaster: HeavenlyStem, hourBranch: EarthlyBranch): NatalPillarContext => ({
    dayMaster,
    pillars: {
      year: { stem: dayMaster, branch: 'ZI' }, // placeholder stem — this pillar's branch is what varies elsewhere; kept structurally valid
      month: { stem: dayMaster, branch: 'ZI' },
      day: { stem: dayMaster, branch: 'ZI' },
      hour: { stem: dayMaster, branch: hourBranch },
    },
  });

  for (const dayMaster of HEAVENLY_STEMS) {
    describe(`Day Master ${dayMaster}`, () => {
      const dmElement = getStemElement(dayMaster);
      const dmYinYang = getStemYinYang(dayMaster);
      if (!dmElement.ok || !dmYinYang.ok) throw new Error('frozen primitive failed for a valid stem');

      for (const hourBranch of EARTHLY_BRANCHES) {
        it(`HOUR=${hourBranch}: matches the independently-computed expectation`, () => {
          const natal = baseFor(dayMaster, hourBranch);
          const r = calculateSameElementRooting(natal);
          if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE for a fully valid chart');

          const hidden = getHiddenStems(hourBranch);
          if (!hidden.ok) throw new Error('frozen primitive failed for a valid branch');
          const expectedHourFacts = hidden.value.map((hs) => {
            const el = getStemElement(hs.stem);
            const yy = getStemYinYang(hs.stem);
            if (!el.ok || !yy.ok) throw new Error('frozen primitive failed for a valid hidden stem');
            return {
              stem: hs.stem, hiddenRole: hs.role,
              sameElementAsDayMaster: el.value === dmElement.value,
              sameStemAsDayMaster: hs.stem === dayMaster,
              samePolarityAsDayMaster: yy.value === dmYinYang.value,
            };
          });

          const actualHourBranch = r.branches.find((b) => b.position === 'HOUR')!;
          const actualHourFacts = actualHourBranch.hiddenStems.map((h) => ({
            stem: h.stem, hiddenRole: h.hiddenRole,
            sameElementAsDayMaster: h.sameElementAsDayMaster,
            sameStemAsDayMaster: h.sameStemAsDayMaster,
            samePolarityAsDayMaster: h.samePolarityAsDayMaster,
          }));
          expect(actualHourFacts).toEqual(expectedHourFacts);
        });
      }
    });
  }
});

// ══ order invariance / factId stability / duplicate-fact policy (HARDENING §11/§12/§14) ═════════
describe('order invariance', () => {
  it('output is independent of the pillars object literal key order', () => {
    const a: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const b: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        hour: { stem: 'JI', branch: 'CHEN' }, day: { stem: 'JIA', branch: 'YIN' },
        month: { stem: 'BING', branch: 'ZI' }, year: { stem: 'WU', branch: 'SHEN' },
      },
    };
    expect(calculateSameElementRooting(a)).toEqual(calculateSameElementRooting(b));
  });
});

describe('factId stability (HARDENING §12)', () => {
  const r = calculateSameElementRooting(RICH_NATAL);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  const allFacts = r.branches.flatMap((b) => b.hiddenStems);

  it('factIds are identical across two independent computations of the same chart', () => {
    const r2 = calculateSameElementRooting({ ...RICH_NATAL });
    if (r2.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r2.branches.flatMap((b) => b.hiddenStems).map((h) => h.factId)).toEqual(
      allFacts.map((h) => h.factId),
    );
  });

  it('every factId encodes position + branch + hiddenRole + stem — structural identity, not array index', () => {
    for (const fact of allFacts) {
      expect(fact.factId).toBe(`hidden-stem:${fact.position}:${fact.branch}:${fact.hiddenRole}:${fact.stem}`);
    }
  });

  it('no factId contains Korean text or any display-text dependency', () => {
    for (const fact of allFacts) expect(fact.factId).not.toMatch(/[가-힣]/);
  });

  it('all factIds within one chart are unique (no accidental collision across branches)', () => {
    const ids = allFacts.map((h) => h.factId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('duplicate-fact policy (HARDENING §14)', () => {
  it('the SAME stem appearing in two different branches is genuinely two distinct facts with distinct factIds — not merged', () => {
    // 甲 Day Master repeated at YEAR/MONTH/DAY all as 寅-adjacent placeholders would coincide; use a
    // natal where the identical hidden stem 戊 (EARTH) appears in both 申(YEAR) and 辰(HOUR) 지장간.
    const natal: NatalPillarContext = {
      dayMaster: 'JIA',
      pillars: {
        year: { stem: 'WU', branch: 'SHEN' }, month: { stem: 'BING', branch: 'ZI' },
        day: { stem: 'JIA', branch: 'YIN' }, hour: { stem: 'JI', branch: 'CHEN' },
      },
    };
    const r = calculateSameElementRooting(natal);
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const wuFacts = r.branches.flatMap((b) => b.hiddenStems).filter((h) => h.stem === 'WU');
    expect(wuFacts.length).toBeGreaterThanOrEqual(2); // 申's MAIN + 辰's MAIN, both 戊
    expect(new Set(wuFacts.map((h) => h.factId)).size).toBe(wuFacts.length); // each kept separate
    expect(new Set(wuFacts.map((h) => h.position)).size).toBe(wuFacts.length); // distinguished by position
  });
});

describe('EXHAUSTIVE — every hidden-stem role appears in the catalog with correct predicates', () => {
  // 辰 gives all three roles (여기/중기/본기) in one branch — MAIN(戊,EARTH), MIDDLE(癸,WATER),
  // RESIDUAL(乙,WOOD) — verified against a WOOD Day Master so exactly one role (RESIDUAL) is a root.
  const natal: NatalPillarContext = {
    dayMaster: 'JIA',
    pillars: {
      year: { stem: 'JIA', branch: 'ZI' },
      month: { stem: 'JIA', branch: 'ZI' },
      day: { stem: 'JIA', branch: 'ZI' },
      hour: { stem: 'JIA', branch: 'CHEN' },
    },
  };
  const r = calculateSameElementRooting(natal);
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
  const chen = r.branches.find((b) => b.branch === 'CHEN')!;

  it('all three tiers are present and independently tagged', () => {
    const byRole = Object.fromEntries(chen.hiddenStems.map((h) => [h.hiddenRole, h]));
    expect(byRole.MAIN.stem).toBe('WU');
    expect(byRole.MAIN.sameElementAsDayMaster).toBe(false);
    expect(byRole.MIDDLE.stem).toBe('GUI');
    expect(byRole.MIDDLE.sameElementAsDayMaster).toBe(false);
    expect(byRole.RESIDUAL.stem).toBe('YI');
    expect(byRole.RESIDUAL.sameElementAsDayMaster).toBe(true);
  });
});
