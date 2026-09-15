// §10/§11 — 세운·월운 canonical DATE attribution: 세운 year rolls at 立春, 월운 month rolls at the
// twelve 節 (Jie). A Gregorian- or lunar-month change alone must NOT move 월운; only the active
// Jie interval does. Reuses the SAME frozen attribution the natal chart now uses.
import {
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  type NatalPillarContext,
} from '../index';
import { EARTHLY_BRANCH_LABELS, HEAVENLY_STEM_LABELS, gregorianToCivilDayOrdinal } from '../../interpretation';

const UNIX0 = gregorianToCivilDayOrdinal({ year: 1970, month: 1, day: 1 });
const kst = (y: number, mo: number, d: number, h = 12): number =>
  (gregorianToCivilDayOrdinal({ year: y, month: mo, day: d }) - UNIX0) * 86_400 + h * 3_600 - 32_400;
const gz = (p: { stem: string; branch: string }) =>
  HEAVENLY_STEM_LABELS[p.stem as keyof typeof HEAVENLY_STEM_LABELS].hanja +
  EARTHLY_BRANCH_LABELS[p.branch as keyof typeof EARTHLY_BRANCH_LABELS].hanja;

const NATAL: NatalPillarContext = {
  dayMaster: 'JIA',
  pillars: {
    year: { stem: 'GENG', branch: 'WU' },
    month: { stem: 'WU', branch: 'YIN' },
    day: { stem: 'JIA', branch: 'ZI' },
  },
};

const sewoon = (epoch: number) => {
  const r = calculateSewoonForInstant({ natal: NATAL, instantEpochSeconds: epoch });
  if (r.capability !== 'AVAILABLE') throw new Error('sewoon unavailable');
  return r;
};
const wolwoon = (epoch: number) => {
  const r = calculateWolwoonForInstant({ natal: NATAL, instantEpochSeconds: epoch });
  if (r.capability !== 'AVAILABLE') throw new Error('wolwoon unavailable');
  return r;
};

describe('§10 세운 — 立春 year boundary', () => {
  it('2024-01-03 (before 立春) → 癸卯 (2023 Saju year), NOT 甲辰', () => {
    expect(gz(sewoon(kst(2024, 1, 3)).pillar)).toBe('癸卯');
  });
  it('2024-06-01 (after 立春) → 甲辰 (2024 Saju year)', () => {
    expect(gz(sewoon(kst(2024, 6, 1)).pillar)).toBe('甲辰');
  });
  it('立春-day: forenoon → 癸卯, evening → 甲辰 (never Jan 1 / lunar new year)', () => {
    expect(gz(sewoon(kst(2024, 2, 4, 6)).pillar)).toBe('癸卯');
    expect(gz(sewoon(kst(2024, 2, 4, 22)).pillar)).toBe('甲辰');
  });
});

describe('§11 월운 — 節(Jie) month boundary', () => {
  it('驚蟄 boundary: 寅월(丙寅) before → 卯월(丁卯) after', () => {
    const before = wolwoon(kst(2024, 3, 4)); // 寅월 of 甲辰
    const after = wolwoon(kst(2024, 3, 6)); // 卯월 of 甲辰
    expect(before.lunarMonth).toBe(1);
    expect(after.lunarMonth).toBe(2);
    expect(gz(before.pillar)).toBe('丙寅');
    expect(gz(after.pillar)).toBe('丁卯');
  });

  it('Gregorian month change WITHOUT a Jie does NOT change 월운 (Feb 25 → Mar 1 both 寅월 丙寅)', () => {
    expect(gz(wolwoon(kst(2024, 2, 25)).pillar)).toBe('丙寅');
    expect(gz(wolwoon(kst(2024, 3, 1)).pillar)).toBe('丙寅'); // still 寅월 (驚蟄 is Mar 5)
  });

  it('a mid-month day and a later same-月 day share the 월운 pillar (Jie interval, not the date)', () => {
    expect(gz(wolwoon(kst(2024, 3, 6)).pillar)).toBe(gz(wolwoon(kst(2024, 3, 20)).pillar));
  });
});
