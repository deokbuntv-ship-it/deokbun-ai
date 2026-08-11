// Coverage for the structural cross-analysis combiner (directive §22). It must
// NEVER merge engines into one verdict and must mark <2 available as insufficient.
import { crossAnalyze, crossAnalyzeDomain, LIFE_DOMAINS, type EngineSignal } from '../index';

const s = (engine: EngineSignal['engine'], available: boolean, polarity?: EngineSignal['polarity']): EngineSignal => ({
  engine, available, polarity,
});

describe('crossAnalyzeDomain (structural, no invented rules)', () => {
  it('is insufficient_evidence with fewer than 2 available engines', () => {
    expect(crossAnalyzeDomain('wealth', []).agreement).toBe('insufficient_evidence');
    expect(crossAnalyzeDomain('wealth', [s('saju', true, 'positive')]).agreement).toBe('insufficient_evidence');
    // an available engine with no polarity does not count
    expect(crossAnalyzeDomain('wealth', [s('saju', true, 'positive'), s('ziwei', true)]).agreement).toBe('insufficient_evidence');
    // unavailable engines never count
    expect(crossAnalyzeDomain('wealth', [s('saju', true, 'positive'), s('ziwei', false, 'positive')]).agreement).toBe('insufficient_evidence');
  });

  it('is aligned when ≥2 available engines share one polarity', () => {
    const r = crossAnalyzeDomain('career', [s('saju', true, 'positive'), s('ziwei', true, 'positive')]);
    expect(r.agreement).toBe('aligned');
    expect(r.availableCount).toBe(2);
  });

  it('is conflicting when positive and caution coexist', () => {
    const r = crossAnalyzeDomain('risk', [s('saju', true, 'positive'), s('qimen', true, 'caution')]);
    expect(r.agreement).toBe('conflicting');
  });

  it('is complementary when neutral mixes with one side (no direct conflict)', () => {
    const r = crossAnalyzeDomain('timing', [s('saju', true, 'neutral'), s('ziwei', true, 'positive')]);
    expect(r.agreement).toBe('complementary');
  });

  it('preserves each engine signal independently (never merged)', () => {
    const signals = [s('saju', true, 'positive'), s('ziwei', true, 'caution'), s('qimen', false)];
    const r = crossAnalyzeDomain('wealth', signals);
    expect(r.signals).toHaveLength(3);
    expect(r.signals.map((x) => x.engine)).toEqual(['saju', 'ziwei', 'qimen']);
  });
});

describe('crossAnalyze (all domains)', () => {
  it('returns one result per life domain, defaulting missing domains to insufficient', () => {
    const results = crossAnalyze({ wealth: [s('saju', true, 'positive'), s('ziwei', true, 'positive')] });
    expect(results).toHaveLength(LIFE_DOMAINS.length);
    const wealth = results.find((r) => r.domain === 'wealth')!;
    expect(wealth.agreement).toBe('aligned');
    const health = results.find((r) => r.domain === 'health')!;
    expect(health.agreement).toBe('insufficient_evidence');
  });
});
