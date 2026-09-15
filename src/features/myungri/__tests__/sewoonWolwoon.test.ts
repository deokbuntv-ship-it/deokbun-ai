// 세운 · 월운 behavioral tests. Expectations are hand-derived from canonical 명리 and cross-checked
// against the frozen pillar/ten-god rules the modules reuse:
//   • 2026 세운 = 丙午 (floorMod(2026-4,60)=42 → 丙午).
//   • 丙年 寅월(月1) = 庚寅 (五虎遁: 丙辛之年庚寅頭).
//   • Day master 甲: 丙=식신(WOOD→FIRE 同性), 庚=편관/칠살(金剋木 同性).
import { calculateSewoon, calculateWolwoon, type NatalPillarContext } from '../index';

// A fully-valid natal chart (일간 甲): 庚午년 戊寅월 甲子일 乙丑시.
const NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'GENG', branch: 'WU' },
    month: { stem: 'WU', branch: 'YIN' },
    day: { stem: 'JIA', branch: 'ZI' },
    hour: { stem: 'YI', branch: 'CHOU' },
  },
};

describe('세운 (Sewoon)', () => {
  const r = calculateSewoon({ targetYear: 2026, natal: NATAL });
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('2026 → 丙午 (BING/WU) via the frozen year-pillar rule', () => {
    expect(r.pillar.stem).toBe('BING');
    expect(r.pillar.branch).toBe('WU');
  });

  it('천간 십신 = 식신(EATING_GOD); 지지 정기(午→丁) 십신 = 상관(HURTING_OFFICER)', () => {
    expect(r.tenGods.stemTenGod).toBe('EATING_GOD');
    expect(r.tenGods.branchMainTenGod).toBe('HURTING_OFFICER');
    expect(r.tenGods.hiddenStemTenGods).toHaveLength(3); // 午 = 丙(여기)·己(중기)·丁(정기)
  });

  it('원국 관계: 午 vs 日支 子 = 충; vs 月支 寅 = 반합 火', () => {
    const dayClash = r.relationsToNatal.branch.find((x) => x.position === 'DAY');
    expect(dayClash?.relation.kind).toBe('BRANCH_CLASH');
    const monthHalf = r.relationsToNatal.branch.find((x) => x.position === 'MONTH');
    expect(monthHalf?.relation.kind).toBe('BRANCH_HALF_THREE_HARMONY');
    expect(monthHalf?.relation).toMatchObject({ harmonyElement: 'FIRE' });
  });

  it('provenance records the reused frozen rule versions (truthful lineage)', () => {
    expect(r.provenance.tenGodRuleVersion).toBe('deokbunai.saju-ten-gods.v1');
    expect(r.provenance.hiddenStemRuleVersion).toBe('deokbunai.saju-hidden-stems.v1');
    expect(r.provenance.relationRuleVersion).toBe('deokbunai.myungri-pillar-relations.v1');
    expect(r.ruleVersion).toBe('deokbunai.myungri-sewoon.v1');
  });

  it('fail-closed: invalid day master / non-integer year', () => {
    const badDm = calculateSewoon({ targetYear: 2026, natal: { ...NATAL, dayMaster: 'NOPE' as never } });
    expect(badDm.capability).toBe('UNAVAILABLE');
    if (badDm.capability === 'UNAVAILABLE') expect(badDm.reason).toBe('INVALID_DAY_MASTER');
    const badYear = calculateSewoon({ targetYear: 2026.5, natal: NATAL });
    if (badYear.capability === 'UNAVAILABLE') expect(badYear.reason).toBe('INVALID_TARGET_YEAR');
    else throw new Error('expected UNAVAILABLE');
  });
});

describe('월운 (Wolwoon)', () => {
  const r = calculateWolwoon({ targetYear: 2026, lunarMonth: 1, natal: NATAL });
  if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');

  it('2026 寅월(月1) → 庚寅 (五虎遁 from 세운 년간 丙)', () => {
    expect(r.yearPillar.stem).toBe('BING'); // 세운 년주 丙午
    expect(r.pillar.stem).toBe('GENG');
    expect(r.pillar.branch).toBe('YIN');
  });

  it('천간 십신 = 편관/칠살(SEVEN_KILLINGS); 지지 정기(寅→甲) 십신 = 비견(PEER)', () => {
    expect(r.tenGods.stemTenGod).toBe('SEVEN_KILLINGS');
    expect(r.tenGods.branchMainTenGod).toBe('PEER');
  });

  it('세운과의 관계: 월지 寅 vs 세운 午 = 반합 火', () => {
    expect(r.relationToSewoon.branch.some((x) => x.kind === 'BRANCH_HALF_THREE_HARMONY')).toBe(true);
  });

  it('원국 관계: 월간 庚 vs 日干 甲 = 충; vs 時干 乙 = 합(乙庚)', () => {
    const dayStem = r.relationsToNatal.stem.find((x) => x.position === 'DAY');
    expect(dayStem?.relation.kind).toBe('STEM_CLASH');
    const hourStem = r.relationsToNatal.stem.find((x) => x.position === 'HOUR');
    expect(hourStem?.relation.kind).toBe('STEM_COMBINATION');
  });

  it('fail-closed: month ordinal out of 1..12', () => {
    for (const m of [0, 13, 1.5]) {
      const bad = calculateWolwoon({ targetYear: 2026, lunarMonth: m, natal: NATAL });
      expect(bad.capability).toBe('UNAVAILABLE');
      if (bad.capability === 'UNAVAILABLE') expect(bad.reason).toBe('INVALID_MONTH_ORDINAL');
    }
  });
});
