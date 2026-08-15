// 원국 ↔ 대운 ↔ 세운 ↔ 월운 connected-axis tests. The headline case: a 삼합 that does NOT exist in
// the natal chart alone EMERGES once 세운 completes it — proving the axis is genuinely connected,
// not four isolated slices.
import {
  branchSetRelations,
  calculateMyungriTimeAxis,
  type NatalPillarContext,
  type TimeAxisLayer,
} from '../index';

const LUCK: ReadonlySet<TimeAxisLayer> = new Set(['DAEWOON', 'SEWOON', 'WOLWOON']);

// 일간 甲. Natal branches = 寅(년) · 戌(월) · 子(일). Note: 寅+戌 are two legs of 寅午戌 火局;
// the missing leg 午 is exactly the 2026 세운 지지 → the 局 completes on the axis.
const NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'REN', branch: 'YIN' },
    month: { stem: 'JIA', branch: 'XU' },
    day: { stem: 'JIA', branch: 'ZI' },
  },
};

describe('connected time-axis', () => {
  const axis = calculateMyungriTimeAxis({
    natal: NATAL,
    daewoonPillar: { stem: 'GENG', branch: 'CHEN' }, // 庚辰 대운
    targetYear: 2026,
    lunarMonth: 1,
  });
  if (axis.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('composes 세운 丙午 + 월운 庚寅 + active 대운 庚辰', () => {
    expect(axis.sewoon.pillar).toMatchObject({ stem: 'BING', branch: 'WU' });
    expect(axis.wolwoon?.pillar).toMatchObject({ stem: 'GENG', branch: 'YIN' });
    expect(axis.daewoon).toEqual({ stem: 'GENG', branch: 'CHEN' });
  });

  it('EMERGENCE: 寅午戌 火 삼합 is absent natal-only but present on the axis (세운 午 completes it)', () => {
    const natalOnly = branchSetRelations(['YIN', 'XU', 'ZI']); // 원국 지지만
    expect(natalOnly).toEqual([]);
    expect(axis.branchSetRelations).toContainEqual(
      expect.objectContaining({ kind: 'BRANCH_THREE_HARMONY', element: 'FIRE' }),
    );
  });

  it('세운 午 ↔ 일지 子 = 충 surfaces as a cross-layer relation (direction-agnostic pair)', () => {
    const hit = axis.crossLayerBranchRelations.find(
      (r) =>
        (r.from === 'SEWOON' && r.to === 'NATAL_DAY') ||
        (r.from === 'NATAL_DAY' && r.to === 'SEWOON'),
    );
    expect(hit?.relation.kind).toBe('BRANCH_CLASH');
  });

  it('every cross-layer relation involves at least one luck layer (no static natal-internal pairs)', () => {
    for (const r of [...axis.crossLayerStemRelations, ...axis.crossLayerBranchRelations]) {
      expect(LUCK.has(r.from) || LUCK.has(r.to)).toBe(true);
    }
  });

  it('year-only axis (no month) is AVAILABLE with wolwoon = null', () => {
    const yearOnly = calculateMyungriTimeAxis({ natal: NATAL, targetYear: 2026 });
    if (yearOnly.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(yearOnly.wolwoon).toBeNull();
    expect(yearOnly.daewoon).toBeNull(); // 대운 미지정
  });

  it('fail-closed: invalid natal context → INVALID_NATAL_CONTEXT', () => {
    const bad = calculateMyungriTimeAxis({
      natal: { ...NATAL, pillars: { ...NATAL.pillars, day: { stem: 'NOPE' as never, branch: 'ZI' } } },
      targetYear: 2026,
    });
    expect(bad.capability).toBe('UNAVAILABLE');
    if (bad.capability === 'UNAVAILABLE') expect(bad.reason).toBe('INVALID_NATAL_CONTEXT');
  });
});
