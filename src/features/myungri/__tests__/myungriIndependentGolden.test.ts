// LEVEL 3 — INDEPENDENT GOLDEN VALIDATION for the Myungri time-axis, plus an ENGINE-12
// regression guard on the exact frozen surface this module depends on.
//
// INDEPENDENT ORACLES (separate implementations, not the code under test):
//   • 세운 year pillar  ← `lunar-javascript@1.7.7` calendar (getYearGan/getYearZhi at a mid-year
//     date, unambiguous vs any 立春/설날 boundary). My pillar comes from arithmetic floorMod —
//     a different derivation path, so a match is a real cross-check.
//   • 십신 (ten-gods)   ← a first-principles 生剋 + 陰陽 oracle written HERE in Hanja, independent
//     of the frozen `calculateTenGod` the module reuses.
//   • 월운 month stem   ← the 五虎遁訣 table (甲己丙, 乙庚戊, 丙辛庚, 丁壬壬, 戊癸甲), independent of
//     the frozen `calculateMonthPillar` formula.
import { Solar } from 'lunar-javascript';

import { calculateSewoon, calculateWolwoon, type NatalPillarContext } from '../index';
import {
  calculateSajuDaewoon,
  calculateTenGod,
  calculateYearPillar,
  DAEWOON_GOLDEN_FIXTURES,
  DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION,
  DEOKBUNAI_SAJU_TEN_GODS_VERSION,
  DEOKBUNAI_SAJU_V1_RULE_VERSION,
  EARTHLY_BRANCH_LABELS,
  getHiddenStems,
  HEAVENLY_STEM_LABELS,
} from '../../interpretation';

const NATAL: NatalPillarContext = {
  dayMaster: 'JIA', // 甲 (day-master carrier; 세운 pillar is independent of it)
  pillars: {
    year: { stem: 'GENG', branch: 'WU' },
    month: { stem: 'WU', branch: 'YIN' },
    day: { stem: 'JIA', branch: 'ZI' },
  },
};

const stemHanja = (stem: string) => HEAVENLY_STEM_LABELS[stem as keyof typeof HEAVENLY_STEM_LABELS].hanja;
const branchHanja = (branch: string) => EARTHLY_BRANCH_LABELS[branch as keyof typeof EARTHLY_BRANCH_LABELS].hanja;

const YEARS = [1984, 1990, 2000, 2008, 2020, 2024, 2026, 2044];

describe('세운 year pillar — independent lunar-javascript oracle', () => {
  it.each(YEARS)('%i → 干支 matches lunar-javascript', (y) => {
    const r = calculateSewoon({ targetYear: y, natal: NATAL });
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    const lunar = Solar.fromYmd(y, 6, 1).getLunar() as unknown as {
      getYearGan(): string;
      getYearZhi(): string;
    };
    expect(stemHanja(r.pillar.stem)).toBe(lunar.getYearGan());
    expect(branchHanja(r.pillar.branch)).toBe(lunar.getYearZhi());
  });
});

// ── independent 십신 oracle (first principles, Hanja-keyed) ───────────────────
const EL: Record<string, string> = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const YANG: Record<string, boolean> = { 甲: true, 乙: false, 丙: true, 丁: false, 戊: true, 己: false, 庚: true, 辛: false, 壬: true, 癸: false };
const GEN: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CTRL: Record<string, string> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };
function oracleTenGod(dayHanja: string, targetHanja: string): string {
  const de = EL[dayHanja];
  const te = EL[targetHanja];
  const same = YANG[dayHanja] === YANG[targetHanja];
  if (de === te) return same ? 'PEER' : 'ROB_WEALTH';
  if (GEN[de] === te) return same ? 'EATING_GOD' : 'HURTING_OFFICER';
  if (CTRL[de] === te) return same ? 'INDIRECT_WEALTH' : 'DIRECT_WEALTH';
  if (CTRL[te] === de) return same ? 'SEVEN_KILLINGS' : 'DIRECT_OFFICER';
  return same ? 'INDIRECT_RESOURCE' : 'DIRECT_RESOURCE';
}

describe('세운 천간 십신 — independent first-principles oracle', () => {
  it.each(YEARS)('%i stem ten-god matches the independent 生剋/陰陽 oracle', (y) => {
    const r = calculateSewoon({ targetYear: y, natal: NATAL });
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.tenGods.stemTenGod).toBe(oracleTenGod('甲', stemHanja(r.pillar.stem)));
  });
});

// ── independent 五虎遁 month-stem oracle ──────────────────────────────────────
const WUHU: Record<string, string> = { 甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲' };
const MONTH_BRANCH_HANJA = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

describe('월운 — independent 五虎遁 + month-branch-sequence oracle', () => {
  it.each([2024, 2025, 2026, 2027])('%i: 寅월 stem = 五虎遁(년간), branch sequence 寅→丑', (y) => {
    const yearGan = stemHanja(calculateYearPillar(y).ok ? (calculateYearPillar(y) as { ok: true; value: { stem: string } }).value.stem : 'JIA');
    for (let m = 1; m <= 12; m += 1) {
      const r = calculateWolwoon({ targetYear: y, lunarMonth: m, natal: NATAL });
      if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
      expect(branchHanja(r.pillar.branch)).toBe(MONTH_BRANCH_HANJA[m - 1]);
      if (m === 1) expect(stemHanja(r.pillar.stem)).toBe(WUHU[yearGan]);
    }
  });
});

// ── ENGINE-12 regression guard (frozen dependency surface unchanged by this build) ───
describe('ENGINE-12 regression guard — frozen dependency surface', () => {
  it('frozen pillar / ten-god / hidden-stem primitives still yield canonical values', () => {
    const p = calculateYearPillar(1984);
    expect(p.ok).toBe(true);
    if (p.ok) {
      expect(p.value.stem).toBe('JIA');
      expect(p.value.branch).toBe('ZI'); // 1984 = 甲子
    }
    const tg = calculateTenGod('JIA', 'GENG');
    expect(tg.ok).toBe(true);
    if (tg.ok) expect(tg.value).toBe('SEVEN_KILLINGS'); // 金剋木 同性
    const hs = getHiddenStems('WU');
    expect(hs.ok).toBe(true);
    if (hs.ok) expect(hs.value.find((x) => x.role === 'MAIN')?.stem).toBe('DING'); // 午 정기 丁
  });

  it('frozen rule-version constants match what Myungri provenance claims (no silent drift)', () => {
    expect(DEOKBUNAI_SAJU_TEN_GODS_VERSION).toBe('deokbunai.saju-ten-gods.v1');
    expect(DEOKBUNAI_SAJU_HIDDEN_STEMS_VERSION).toBe('deokbunai.saju-hidden-stems.v1');
    expect(typeof DEOKBUNAI_SAJU_V1_RULE_VERSION).toBe('string');
    expect(DEOKBUNAI_SAJU_V1_RULE_VERSION.length).toBeGreaterThan(0);
  });

  it('ENGINE-12 Daewoon surface present (function + non-empty golden fixtures)', () => {
    expect(typeof calculateSajuDaewoon).toBe('function');
    expect(Array.isArray(DAEWOON_GOLDEN_FIXTURES)).toBe(true);
    expect(DAEWOON_GOLDEN_FIXTURES.length).toBeGreaterThan(0);
  });
});
