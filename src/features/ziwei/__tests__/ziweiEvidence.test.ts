// Evidence adapter tests (directive §21). Verifies the ziwei chart becomes a
// BOUNDED, FACTS-ONLY EngineEvidence and that unavailable states pass through
// truthfully (no fabricated summary).
import { toZiweiEvidence } from '../adapters/ziweiEvidenceAdapter';
import { computeZiweiChart } from '../services/ziweiService';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';

const birth = (over: Partial<ZiweiBirthInput> = {}): ZiweiBirthInput => ({
  gender: 'female',
  birthYear: '1992',
  birthMonth: '3',
  birthDay: '9',
  birthHour: '7',
  birthMinute: '0',
  birthTimeAccuracy: 'exact',
  ...over,
});

describe('toZiweiEvidence', () => {
  it('maps an available chart to available evidence with factual summary + detail', () => {
    const ev = toZiweiEvidence(computeZiweiChart(birth()));
    expect(ev.availability).toBe('available');
    expect(ev.summary).toContain('命宮');
    expect(ev.summary).toContain('五行局');
    expect(ev.summary).toContain('命主');
    expect(typeof ev.detail).toBe('string');
    expect(ev.detail!.length).toBeGreaterThan(0);
  });

  it('passes through missing_birth_time with no fabricated summary', () => {
    const ev = toZiweiEvidence(computeZiweiChart(birth({ birthTimeAccuracy: 'unknown' })));
    expect(ev.availability).toBe('missing_birth_time');
    expect(ev.summary).toBeUndefined();
    expect(ev.detail).toBeUndefined();
  });

  it('maps unsupported/failed inputs to calculation_failed evidence', () => {
    const ev = toZiweiEvidence(computeZiweiChart(birth({ gender: null })));
    expect(ev.availability).toBe('calculation_failed');
    expect(ev.summary).toBeUndefined();
  });

  it('states facts, not interpretation (no verdict words in summary)', () => {
    const ev = toZiweiEvidence(computeZiweiChart(birth()));
    // The engine must not editorialize; summary is palace/star facts only.
    for (const verdict of ['좋다', '나쁘다', '강하다', '약하다', '길하다', '흉하다']) {
      expect(ev.summary).not.toContain(verdict);
    }
  });
});
