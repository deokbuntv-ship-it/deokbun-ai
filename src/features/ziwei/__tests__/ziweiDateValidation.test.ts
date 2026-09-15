// Codex Ziwei closure PART A (civil-date validity, fail-closed) + PART B (evidence validation honesty).
// Impossible Gregorian/lunar dates must NEVER become a trusted Ziwei chart; the prompt-facing evidence
// must not overstate independent validation of provider placements (命宮/五行局/…).
import { toZiweiBirthInput, type ZiweiBirthSource } from '../adapters/ziweiBirthMapper';
import { toZiweiEvidence } from '../adapters/ziweiEvidenceAdapter';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';
import { computeZiweiChart } from '../services/ziweiService';

const solar = (y: string, mo: string, d: string): ZiweiBirthInput => ({
  gender: 'male', birthYear: y, birthMonth: mo, birthDay: d,
  birthHour: '12', birthMinute: '0', birthTimeAccuracy: 'exact',
});
const lunar = (y: string, mo: string, d: string, leap = false): ZiweiBirthInput =>
  toZiweiBirthInput({
    gender: 'male', calendarType: 'lunar', lunarMonthType: leap ? 'leap' : 'regular',
    birthYear: y, birthMonth: mo, birthDay: d, birthHour: '12', birthMinute: '0', birthTimeAccuracy: 'exact',
  } as ZiweiBirthSource);

// ── PART A — strict Gregorian civil-date validation ──────────────────────────────────
describe('Ziwei Gregorian civil-date validation (PART A)', () => {
  it.each([
    ['2024', '2', '29'], // leap Feb
    ['2023', '2', '28'],
    ['2024', '4', '30'],
    ['2024', '1', '31'],
  ])('VALID solar %s-%s-%s → available', (y, mo, d) => {
    expect(computeZiweiChart(solar(y, mo, d)).availability).toBe('available');
  });

  it.each([
    ['2024', '2', '30'], // Feb never has 30
    ['2023', '2', '29'], // non-leap Feb
    ['2024', '4', '31'], // Apr has 30
    ['2024', '1', '32'],
    ['2024', '0', '10'], // month 0
    ['2024', '13', '10'], // month 13
    ['2024', '5', '0'], // day 0
  ])('IMPOSSIBLE solar %s-%s-%s → unsupported_case (fail-closed, never rolled over)', (y, mo, d) => {
    const r = computeZiweiChart(solar(y, mo, d));
    expect(r.availability).toBe('unsupported_case');
    expect(r.chart).toBeNull();
  });
});

// ── PART A2 — lunar input validity (reuses lunar-javascript; no new lunar validator) ──
describe('Ziwei lunar input validity (PART A2)', () => {
  it('VALID lunar 2023-11-22 → solar 2024-1-3 → available (Solar/Lunar equivalence preserved)', () => {
    const z = lunar('2023', '11', '22');
    expect([z.birthYear, z.birthMonth, z.birthDay]).toEqual(['2024', '1', '3']);
    expect(computeZiweiChart(z).availability).toBe('available');
  });
  it('LEAP lunar 2020-04-15 → solar 2020-6-6 → available (leap-month preserved)', () => {
    const z = lunar('2020', '4', '15', true);
    expect([z.birthYear, z.birthMonth, z.birthDay]).toEqual(['2020', '6', '6']);
    expect(computeZiweiChart(z).availability).toBe('available');
  });
  it.each([
    ['2020', '13', '15'], // impossible lunar month
    ['2020', '2', '31'], // impossible lunar day (only 30)
  ])('IMPOSSIBLE lunar %s-%s-%s → NOT available (conversion failure never treated as solar)', (y, mo, d) => {
    expect(computeZiweiChart(lunar(y, mo, d)).availability).not.toBe('available');
  });
});

// ── time-accuracy regression ─────────────────────────────────────────────────────────
describe('Ziwei time-accuracy (regression)', () => {
  it('approximate / unknown → missing_birth_time; exact → available', () => {
    expect(computeZiweiChart({ ...solar('1990', '8', '15'), birthTimeAccuracy: 'approximate' }).availability).toBe('missing_birth_time');
    expect(computeZiweiChart({ ...solar('1990', '8', '15'), birthTimeAccuracy: 'unknown' }).availability).toBe('missing_birth_time');
    expect(computeZiweiChart(solar('1990', '8', '15')).availability).toBe('available');
  });
});

// ── PART B — evidence validation honesty ─────────────────────────────────────────────
describe('Ziwei evidence validation honesty (PART B)', () => {
  const ev = toZiweiEvidence(computeZiweiChart(solar('2024', '1', '3')));
  const prov = ev.sections?.find((s) => s.label === '근거·한계')?.lines.join(' ') ?? '';

  it('placements (命宮/五行局/…) are characterization-locked, NOT independently verified', () => {
    expect(prov).toContain('특성 고정'); // characterization-locked
    expect(prov).toContain('독립 검증된 것이 아닙니다');
    expect(prov).not.toMatch(/오행국[^\n]{0,12}검증되었/); // no false "五行局 verified" claim
    expect(prov).not.toMatch(/명궁[^\n]{0,12}검증되었/); // no false "命宮 verified" claim
  });
  it('ONLY the 干支 calendar foundation is marked independently cross-validated', () => {
    expect(prov).toContain('간지');
    expect(prov).toContain('교차 검증');
  });
  it('states the no-timezone/LMT limitation honestly (what the code actually does)', () => {
    expect(prov).toMatch(/타임존|LMT|지방시/);
  });
  it('provider identity + pinned ruleSetVersion remain present', () => {
    expect(prov).toContain('iztro');
    expect(prov).toContain('iztro-default@2.5.8');
  });
});
