// LEVEL 3 — INDEPENDENT GOLDEN VALIDATION for 자미두수 (iztro-default@2.5.8).
//
// INDEPENDENT ORACLE: `lunar-javascript@1.7.7` (MIT, 6tail) — a *separate* calendar
// implementation from iztro (iztro self-contains its own 干支 conversion). This is also the
// frozen SAJU/Daewoon basis (deokbunai.solar-term.v1), so these checks double as the §11
// cross-engine consistency check. lunar-javascript is used ONLY as a read-only oracle here.
//
// WHAT THIS INDEPENDENTLY VERIFIES (convention-invariant across 사주 ↔ 자미):
//   • DAY 干支 and HOUR 干支 — the continuous sexagenary day + hour rule is identical in both
//     systems, so iztro's value must match the independent oracle. A mismatch = a real bug.
//   • YEAR 干支 away from the 立春 boundary.
//   • Structural invariants (12 palaces, one 身宮, 命宮 present, 五行局/命主/身主 populated),
//     provenance (library/version), ruleSetVersion, and fail-closed behavior.
//
// WHAT THIS DOES NOT CLAIM (honest scope, classified in docs/ENGINE_GOLDEN_VALIDATION.md):
//   • The 14 major-star placements + 四化 table are SCHOOL-DEPENDENT (iztro `default` lineage).
//     They are NOT independently re-derived here (that needs an authoritative external chart —
//     REFERENCE UNCERTAINTY / class E). They stay under the existing CHARACTERIZATION lock.
//   • The MONTH 干支 intentionally differs 사주↔자미 (자미 = lunar-month 干支; 사주 = 節-month) —
//     a documented calendar-convention difference (class C/D), asserted as such below, NOT a bug.
import { Solar } from 'lunar-javascript';

import { computeZiweiChart } from '../services/ziweiService';
import { type ZiweiBirthInput } from '../adapters/ziweiInputAdapter';
import { ZIWEI_RULESET_VERSION } from '../adapters/iztroAdapter';

// 干支 Chinese → Korean (iztro emits ko-KR romanized 干支 in chineseDate).
const STEM: Record<string, string> = { 甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무', 己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계' };
const BRANCH: Record<string, string> = { 子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해' };
const gzToKo = (cn: string): string => (STEM[cn[0]] ?? '?') + (BRANCH[cn[1]] ?? '?');

// Independent 干支 from lunar-javascript for a solar datetime.
function oracleGanZhi(y: number, mo: number, d: number, h: number) {
  const ec = Solar.fromYmdHms(y, mo, d, h, 0, 0).getLunar().getEightChar();
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
}

const birth = (o: Partial<ZiweiBirthInput> & { y: string; mo: string; d: string; h: string; g: 'male' | 'female' }): ZiweiBirthInput => ({
  gender: o.g,
  birthYear: o.y,
  birthMonth: o.mo,
  birthDay: o.d,
  birthHour: o.h,
  birthMinute: '0',
  birthTimeAccuracy: 'exact',
});

// GOLDEN FIXTURES — provenance: input is a solar birth; the expected DAY/HOUR/YEAR 干支 come
// from the INDEPENDENT lunar-javascript oracle (not from iztro). Non-子時 hours only for the
// strict day-干支 assert (子時 day-boundary is a separate observation).
const FIXTURES: { id: string; y: number; mo: number; d: number; h: number; g: 'male' | 'female'; note: string }[] = [
  { id: 'baseline-1990', y: 1990, mo: 8, d: 15, h: 14, g: 'male', note: '立秋 era · 未時 (characterization anchor)' },
  { id: 'baseline-1990-f', y: 1990, mo: 8, d: 15, h: 14, g: 'female', note: 'gender variant (大限 direction)' },
  { id: 'summer-solstice', y: 2000, mo: 6, d: 21, h: 12, g: 'male', note: '夏至 · 午時' },
  { id: 'leap-month-2020', y: 2020, mo: 5, d: 25, h: 10, g: 'female', note: '윤4월(leap) era · 巳時' },
  { id: 'post-lichun', y: 1984, mo: 2, d: 10, h: 8, g: 'male', note: '立春 직후(year 干支 stable) · 辰時' },
  { id: 'spring-equinox', y: 2001, mo: 3, d: 21, h: 18, g: 'male', note: '春分 · 酉時' },
  { id: 'evening', y: 1988, mo: 11, d: 11, h: 22, g: 'female', note: '亥時' },
  { id: 'dawn', y: 1995, mo: 6, d: 15, h: 4, g: 'female', note: '寅時' },
  { id: 'morning', y: 1979, mo: 9, d: 3, h: 9, g: 'male', note: '辰時 · pre-1980' },
  { id: 'afternoon', y: 2010, mo: 12, d: 8, h: 16, g: 'female', note: '申時' },
];

describe('LEVEL 3 · ziwei independent golden — day/hour/year 干支 match lunar-javascript (§6)', () => {
  it.each(FIXTURES)('$id ($note): available + independent 干支 (day/hour/year)', (fx) => {
    const r = computeZiweiChart(birth({ y: String(fx.y), mo: String(fx.mo), d: String(fx.d), h: String(fx.h), g: fx.g }));
    expect(r.availability).toBe('available');
    if (r.availability !== 'available') return;
    const c = r.chart;

    // provenance + rule lock
    expect(c.library).toBe('iztro');
    expect(c.ruleSetVersion).toBe(ZIWEI_RULESET_VERSION); // iztro-default@2.5.8
    expect(c.palaces).toHaveLength(12);
    expect(c.palaces.filter((p) => p.isBodyPalace)).toHaveLength(1); // exactly one 身宮
    expect(c.palaces.some((p) => p.earthlyBranch === c.soulPalaceBranch)).toBe(true); // 命宮 present
    expect(c.fiveElementsClass.length).toBeGreaterThan(0);
    expect(c.soul.length).toBeGreaterThan(0);
    expect(c.body.length).toBeGreaterThan(0);

    // INDEPENDENT 干支 (day + hour are convention-invariant; year stable away from 立春)
    const gz = oracleGanZhi(fx.y, fx.mo, fx.d, fx.h);
    expect(c.chineseDate).toContain(gzToKo(gz.day)); // DAY 干支 — a mismatch is a real bug
    expect(c.chineseDate).toContain(gzToKo(gz.hour)); // HOUR 干支
    expect(c.chineseDate).toContain(gzToKo(gz.year)); // YEAR 干支
  });
});

describe('LEVEL 3 · ziwei ↔ 사주 MONTH 干支 convention difference (documented C/D, not a bug)', () => {
  it('1990-08-15: 자미(iztro)=lunar-month 干支; 사주(oracle)=節-month 干支 — they differ by design', () => {
    const r = computeZiweiChart(birth({ y: '1990', mo: '8', d: '15', h: '14', g: 'male' }));
    if (r.availability !== 'available') throw new Error('expected available');
    const solar = Solar.fromYmdHms(1990, 8, 15, 14, 0, 0);
    const lunar = solar.getLunar();
    const sajuMonth = lunar.getEightChar().getMonth(); // 節-based → 甲申
    // iztro's chineseDate carries the LUNAR-month 干支 (癸未=계미), which is NOT the 節-month.
    expect(r.chart.chineseDate).not.toContain(gzToKo(sajuMonth)); // 자미 ≠ 사주 month 干支
    // ...and iztro's month IS the lunar month branch (未 = 미) — internally correct for 자미.
    expect(r.chart.chineseDate).toContain('미'); // 未 branch (lunar 6월)
  });
});

describe('LEVEL 3 · ziwei fail-closed (§14) — never fabricates a chart', () => {
  it('approximate/unknown birth time → missing_birth_time (no invented 시진)', () => {
    const r = computeZiweiChart({ ...birth({ y: '1990', mo: '8', d: '15', h: '', g: 'male' }), birthTimeAccuracy: 'unknown' });
    expect(r.availability).toBe('missing_birth_time');
    expect(r.chart).toBeNull();
  });
  it('missing gender → unsupported_case', () => {
    const r = computeZiweiChart({ ...birth({ y: '1990', mo: '8', d: '15', h: '14', g: 'male' }), gender: null });
    expect(r.availability).toBe('unsupported_case');
  });
  it('hour out of range → unsupported_case', () => {
    const r = computeZiweiChart(birth({ y: '1990', mo: '8', d: '15', h: '25', g: 'male' }));
    expect(r.availability).toBe('unsupported_case');
  });
});

describe('LEVEL 3 · ziwei 子時 day-boundary — observation (§13), not fabricated', () => {
  it('00시 birth is available and handled (早子時 index 0); day 干支 boundary recorded, not forced', () => {
    const r = computeZiweiChart(birth({ y: '1993', mo: '7', d: '7', h: '0', g: 'male' }));
    expect(r.availability).toBe('available'); // fail-closed still produces a real chart at 子시
    // Intentionally NOT asserting the day 干支 here: the 早/晚子時 day-boundary is a documented
    // time-policy question (class D) reconciled at product level, not in this engine.
  });
});
