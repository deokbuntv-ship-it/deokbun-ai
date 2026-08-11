// Ziwei engine tests (directive §13/§16/§25).
//
// HONESTY (§14): the assertions below are STRUCTURAL (12 palaces, one 身宮, 五行局
// present), DETERMINISM (same input → identical chart), and INPUT-HANDLING
// (missing time / gender). The one fixed-input block is a CHARACTERIZATION LOCK —
// it pins the OUTPUT of iztro@2.5.8 so an accidental library upgrade/behavior
// change is caught. It is NOT a claim of independent astrological correctness;
// verified golden fixtures require independent references (Owner/Codex — see
// docs/ZIWEI_SCHOOL_DIFFERENCES.md). No value here was hand-computed by Claude as
// ground truth.
import { timeIndexFromHour } from '../domain/ziweiTypes';
import { computeZiweiChart } from '../services/ziweiService';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';

const birth = (over: Partial<ZiweiBirthInput> = {}): ZiweiBirthInput => ({
  gender: 'male',
  birthYear: '1990',
  birthMonth: '8',
  birthDay: '15',
  birthHour: '11',
  birthMinute: '30',
  birthTimeAccuracy: 'exact',
  ...over,
});

describe('timeIndexFromHour (iztro 0–12 convention)', () => {
  it('maps hours to 时辰 index with 早子/晚子 split', () => {
    expect(timeIndexFromHour(0)).toBe(0); // 早子
    expect(timeIndexFromHour(1)).toBe(1); // 丑
    expect(timeIndexFromHour(11)).toBe(6); // 午
    expect(timeIndexFromHour(12)).toBe(6); // 午
    expect(timeIndexFromHour(13)).toBe(7); // 未
    expect(timeIndexFromHour(23)).toBe(12); // 晚子
  });
  it('clamps out-of-range hours', () => {
    expect(timeIndexFromHour(-5)).toBe(0);
    expect(timeIndexFromHour(99)).toBe(12);
  });
});

describe('computeZiweiChart — availability gating (never fabricates)', () => {
  it('requires an exact birth time (no invented 시진)', () => {
    expect(computeZiweiChart(birth({ birthTimeAccuracy: 'unknown' })).availability).toBe('missing_birth_time');
    expect(computeZiweiChart(birth({ birthTimeAccuracy: 'approximate' })).availability).toBe('missing_birth_time');
    expect(computeZiweiChart(birth({ birthTimeAccuracy: null })).availability).toBe('missing_birth_time');
  });
  it('requires gender', () => {
    expect(computeZiweiChart(birth({ gender: null })).availability).toBe('unsupported_case');
  });
  it('requires a complete numeric birth date', () => {
    expect(computeZiweiChart(birth({ birthDay: '' })).availability).toBe('unsupported_case');
    expect(computeZiweiChart(birth({ birthMonth: 'x' })).availability).toBe('unsupported_case');
  });
  it('rejects out-of-range hour', () => {
    expect(computeZiweiChart(birth({ birthHour: '24' })).availability).toBe('unsupported_case');
  });
});

describe('computeZiweiChart — structural correctness of the natal chart', () => {
  const result = computeZiweiChart(birth());

  it('produces an available chart', () => {
    expect(result.availability).toBe('available');
    expect(result.chart).not.toBeNull();
  });
  it('has 12 palaces and exactly one 身宮', () => {
    const chart = result.chart!;
    expect(chart.palaces).toHaveLength(12);
    expect(chart.palaces.filter((p) => p.isBodyPalace)).toHaveLength(1);
  });
  it('populates 命宮 branch, 五行局, 命主/身主, and the 命宮 is present among palaces', () => {
    const chart = result.chart!;
    expect(chart.soulPalaceBranch).toBeTruthy();
    expect(chart.fiveElementsClass).toBeTruthy();
    expect(chart.soul).toBeTruthy();
    expect(chart.body).toBeTruthy();
    expect(chart.palaces.some((p) => p.earthlyBranch === chart.soulPalaceBranch)).toBe(true);
  });
  it('tracks library + rule-set versions for reproducibility', () => {
    const chart = result.chart!;
    expect(chart.library).toBe('iztro');
    expect(chart.libraryVersion).toBe('2.5.8');
    expect(chart.ruleSetVersion).toContain('iztro-default');
  });
  it('flattens 四化 with a landing palace when present', () => {
    const chart = result.chart!;
    for (const t of chart.transformations) {
      expect(t.star).toBeTruthy();
      expect(t.transformation).toBeTruthy();
      expect(chart.palaces.some((p) => p.name === t.palaceName)).toBe(true);
    }
  });
});

describe('computeZiweiChart — DETERMINISM', () => {
  it('produces byte-identical charts for identical input', () => {
    const a = computeZiweiChart(birth());
    const b = computeZiweiChart(birth());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('CHARACTERIZATION LOCK — iztro@2.5.8 output for a fixed input', () => {
  // NOT an independent-correctness claim; locks library behavior across upgrades.
  const chart = computeZiweiChart(birth({ birthHour: '11' })).chart!; // 1990-08-15, 午時, 男
  it('命宮 branch / 五行局 are stable', () => {
    expect(chart.soulPalaceBranch).toBe('축');
    expect(chart.fiveElementsClass).toBe('화육국');
    expect(chart.lunarDate).toContain('六月');
  });
});
