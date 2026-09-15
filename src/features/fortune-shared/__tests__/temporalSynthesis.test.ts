// Product-level temporal synthesis — categorical combination of base + 대운/세운 tiers. NO base-tier change,
// NO numbers. Covers the §31 matrix.
import { synthesizeBackground } from '../temporalSynthesis';

describe('synthesizeBackground', () => {
  it('base supportive + background supportive → REINFORCED', () => {
    expect(synthesizeBackground('FAVORABLE', ['STEADY', 'FAVORABLE']).state).toBe('REINFORCED');
    expect(synthesizeBackground('STEADY', ['FAVORABLE', null]).state).toBe('REINFORCED');
  });
  it('base strained + background strained → REINFORCED', () => {
    expect(synthesizeBackground('CAUTION', ['CAUTION', 'DYNAMIC']).state).toBe('REINFORCED');
  });
  it('base strained + background supportive → BUFFERED', () => {
    const s = synthesizeBackground('CAUTION', ['FAVORABLE', 'STEADY']);
    expect(s.state).toBe('BUFFERED');
    expect(s.summary).toMatch(/불안한 것은 아니/);
  });
  it('base supportive + background strained → MIXED', () => {
    const s = synthesizeBackground('FAVORABLE', ['CAUTION', 'DYNAMIC']);
    expect(s.state).toBe('MIXED');
    expect(s.summary).toMatch(/무리하게 밀어붙이지/);
  });
  it('conflicting backgrounds (one supportive, one strained) → NEUTRAL (no clear modulation)', () => {
    expect(synthesizeBackground('FAVORABLE', ['FAVORABLE', 'CAUTION']).state).toBe('NEUTRAL');
  });
  it('no background available → NEUTRAL with empty summary', () => {
    const s = synthesizeBackground('CAUTION', [null, null]);
    expect(s.state).toBe('NEUTRAL');
    expect(s.summary).toBe('');
  });
  it('every non-neutral state carries a plain-language summary with no 간지/십신/강약 terms', () => {
    for (const s of [
      synthesizeBackground('FAVORABLE', ['FAVORABLE']),
      synthesizeBackground('CAUTION', ['CAUTION']),
      synthesizeBackground('CAUTION', ['FAVORABLE']),
      synthesizeBackground('FAVORABLE', ['CAUTION']),
    ]) {
      expect(s.summary.length).toBeGreaterThan(0);
      expect(s.summary).not.toMatch(/신강|신약|용신|격국|甲|寅|십신|세력/);
    }
  });
});
