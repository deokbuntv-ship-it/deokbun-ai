// Day-Master SAME-ELEMENT rooting — deterministic FACT only. No root strength/rank/survivability.
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
