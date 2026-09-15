// Ziwei evidence STRUCTURED sections (directive §35). Verifies toZiweiEvidence emits the
// prompt-ready `sections` (명반 기준 / 12궁 / 사화 / 근거·한계) + provenance + limitations +
// hasTimingEvidence=false, and that unavailable states carry no fabricated sections. Facts only.
import { toZiweiEvidence } from '../adapters/ziweiEvidenceAdapter';
import { computeZiweiChart } from '../services/ziweiService';
import type { ZiweiBirthInput } from '../adapters/ziweiInputAdapter';

const birth = (over: Partial<ZiweiBirthInput> = {}): ZiweiBirthInput => ({
  gender: 'male',
  birthYear: '2024',
  birthMonth: '1',
  birthDay: '3',
  birthHour: '12',
  birthMinute: '0',
  birthTimeAccuracy: 'exact',
  ...over,
});

describe('toZiweiEvidence — structured sections (§35)', () => {
  const ev = toZiweiEvidence(computeZiweiChart(birth()));

  it('is available with backward-compatible summary/detail', () => {
    expect(ev.availability).toBe('available');
    expect(ev.summary).toContain('命宮');
    expect(typeof ev.detail).toBe('string');
    expect(ev.detail!.length).toBeGreaterThan(0);
  });

  it('emits labeled sections: 명반 기준 / 12궁 / 근거·한계', () => {
    const labels = (ev.sections ?? []).map((s) => s.label);
    expect(labels).toContain('명반 기준');
    expect(labels).toContain('12궁');
    expect(labels).toContain('근거·한계');
  });

  it('명반 기준 carries 命宮/五行局/命主/身主 facts', () => {
    const basis = ev.sections?.find((s) => s.label === '명반 기준');
    const text = basis?.lines.join(' ') ?? '';
    expect(text).toContain('命宮');
    expect(text).toContain('五行局');
    expect(text).toContain('命主');
    expect(text).toContain('身主');
  });

  it('12궁 lists all twelve palaces', () => {
    const palaces = ev.sections?.find((s) => s.label === '12궁');
    expect(palaces?.lines).toHaveLength(12);
  });

  it('근거·한계 carries provider/version + convention difference + characterization limitation', () => {
    const prov = ev.sections?.find((s) => s.label === '근거·한계');
    const text = prov?.lines.join(' ') ?? '';
    expect(text).toContain('iztro');
    expect(text).toContain('iztro-default@2.5.8'); // ruleSetVersion pinned
    expect(text).toContain('가정:'); // deterministic assumptions (parity with Saju evidence)
    expect(text).toContain('fixLeap'); // real leap-month policy assumption
    expect(text).toContain('관례'); // Saju↔Ziwei month-干支 convention difference (not a bug)
    expect(text).toContain('한계'); // star/四化 characterization limitation stated honestly
  });

  it('hasTimingEvidence is false — natal only, does NOT unlock futureFlow', () => {
    expect(ev.hasTimingEvidence).toBe(false);
  });

  it('states facts, not interpretation (no verdict words anywhere in the sections)', () => {
    const all = (ev.sections ?? []).flatMap((s) => s.lines).join(' ');
    for (const verdict of ['좋다', '나쁘다', '강하다고 봅니다', '길하다', '흉하다']) {
      expect(all).not.toContain(verdict);
    }
  });

  it('missing_birth_time → no fabricated sections', () => {
    const u = toZiweiEvidence(computeZiweiChart(birth({ birthTimeAccuracy: 'unknown' })));
    expect(u.availability).toBe('missing_birth_time');
    expect(u.sections).toBeUndefined();
    expect(u.summary).toBeUndefined();
  });
});
