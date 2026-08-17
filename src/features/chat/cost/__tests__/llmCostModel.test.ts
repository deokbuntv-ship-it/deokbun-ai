// LLM cost model (Overnight Sprint §3/§15/§16). Verifies the pricing + KRW arithmetic
// against hand-computed values and the target-band classification. Deterministic.
import {
  GPT_5_MINI_PRICING,
  GPT_5_NANO_PRICING,
  DEFAULT_USD_KRW,
  estimateQaCostKrw,
  costKrwForProfile,
  weightedAverageKrw,
  monthlyKrw,
  classifyCostTarget,
  BEFORE_PROFILE,
  AFTER_PROFILES,
} from '../llmCostModel';

describe('gpt-5-mini pricing (verified 2026-08)', () => {
  it('matches the published per-1M USD prices', () => {
    expect(GPT_5_MINI_PRICING).toMatchObject({
      model: 'gpt-5-mini',
      unit: 'per_1m_tokens',
      inputUnitPrice: 0.25,
      cachedInputUnitPrice: 0.025,
      outputUnitPrice: 2.0,
    });
    expect(GPT_5_NANO_PRICING.outputUnitPrice).toBe(0.4); // 5× cheaper output than mini
  });
});

describe('estimateQaCostKrw — hand-computed KRW', () => {
  it('prices input + output at the per-1M rate and converts at the FX assumption', () => {
    // 3000 in * 0.25/1M = $0.00075 ; 3500 out * 2/1M = $0.0070 ; total $0.00775 ; *1350 = ₩10.4625
    const krw = estimateQaCostKrw({ model: 'gpt-5-mini', inputTokens: 3000, outputTokens: 3500 });
    expect(krw).toBeCloseTo(10.4625, 3);
  });
  it('bills cached input at the cheaper cached rate', () => {
    // 1200 cached * 0.025/1M + 1800 normal * 0.25/1M = $0.00003 + $0.00045 = $0.00048 ; out 0 ; *1350 = ₩0.648
    const krw = estimateQaCostKrw({ model: 'gpt-5-mini', inputTokens: 3000, cachedInputTokens: 1200, outputTokens: 0 });
    expect(krw).toBeCloseTo(0.648, 3);
  });
  it('returns null for an unpriced model (never a fake ₩0)', () => {
    expect(estimateQaCostKrw({ model: 'mystery-model', inputTokens: 100, outputTokens: 100 })).toBeNull();
  });
});

describe('BEFORE vs AFTER (reasoning-effort routing) + scale', () => {
  it('BEFORE ≈ ₩10.5/Q&A (medium effort, no routing)', () => {
    expect(costKrwForProfile(BEFORE_PROFILE)).toBeCloseTo(10.4625, 2);
  });
  it('AFTER per-complexity: SIMPLE < STANDARD < DEEP, all far below BEFORE', () => {
    const s = costKrwForProfile(AFTER_PROFILES.SIMPLE);
    const st = costKrwForProfile(AFTER_PROFILES.STANDARD);
    const d = costKrwForProfile(AFTER_PROFILES.DEEP);
    expect(s).toBeCloseTo(2.7675, 2); // 2600*0.25/1M + 700*2/1M = $0.00205 *1350
    expect(st).toBeCloseTo(4.2525, 2);
    expect(d).toBeCloseTo(7.29, 2);
    expect(s).toBeLessThan(st);
    expect(st).toBeLessThan(d);
    expect(d).toBeLessThan(costKrwForProfile(BEFORE_PROFILE)); // even DEEP beats the old flat cost
  });
  it('weighted average lands in the low single digits (≈ ₩4) — a ~60% cut from BEFORE', () => {
    const avg = weightedAverageKrw();
    expect(avg).toBeGreaterThan(3);
    expect(avg).toBeLessThan(5);
    expect(avg).toBeLessThan(costKrwForProfile(BEFORE_PROFILE) * 0.45); // >55% reduction
  });
  it('monthly scale scales linearly with volume', () => {
    const avg = weightedAverageKrw();
    expect(monthlyKrw(30_000)).toBeCloseTo(avg * 30_000, 2);
    expect(monthlyKrw(900_000)).toBeCloseTo(avg * 900_000, 2);
  });
  it('classifies per-Q&A cost into the directive bands', () => {
    expect(classifyCostTarget(1.5)).toBe('TARGET_A');
    expect(classifyCostTarget(2.8)).toBe('TARGET_B');
    expect(classifyCostTarget(4.2)).toBe('WARNING');
    expect(classifyCostTarget(7.3)).toBe('UNSUSTAINABLE_FOR_FREE_BETA');
  });
});
