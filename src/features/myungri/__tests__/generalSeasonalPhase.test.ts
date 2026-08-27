// General 旺相休囚死 utility — deterministic FACT only. No 신강/신약 inference, no exact 司令.
import { generalSeasonalPhase, generalSeasonalPhaseForMonthBranch } from '../index';

describe('generalSeasonalPhase', () => {
  it('WOOD target vs WOOD reference → 旺 (same element = full command)', () => {
    const r = generalSeasonalPhase('WOOD', 'WOOD');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('WANG');
  });

  it('WOOD target vs WATER reference → 相 (reference generates target)', () => {
    const r = generalSeasonalPhase('WOOD', 'WATER');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('XIANG');
  });

  it('WOOD target vs FIRE reference → 休 (target generates reference)', () => {
    const r = generalSeasonalPhase('WOOD', 'FIRE');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('XIU');
  });

  it('WOOD target vs EARTH reference → 囚 (target controls reference)', () => {
    const r = generalSeasonalPhase('WOOD', 'EARTH');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('QIU');
  });

  it('WOOD target vs METAL reference → 死 (reference controls target)', () => {
    const r = generalSeasonalPhase('WOOD', 'METAL');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('SI');
  });

  it('14. seasonal phase RECOMPUTES when the reference (month) branch changes', () => {
    // 寅 (SPRING, WOOD) vs 申 (AUTUMN, METAL) — same target element, different month branch.
    const spring = generalSeasonalPhaseForMonthBranch('WOOD', 'YIN');
    const autumn = generalSeasonalPhaseForMonthBranch('WOOD', 'SHEN');
    if (spring.capability !== 'AVAILABLE' || autumn.capability !== 'AVAILABLE') {
      throw new Error('expected AVAILABLE');
    }
    expect(spring.phase).toBe('WANG'); // WOOD is the season itself in 寅월
    expect(autumn.phase).toBe('SI'); // METAL season directly overcomes WOOD
    expect(spring.phase).not.toBe(autumn.phase);
  });

  it('works generically for a non-Day-Master element too (an opposition/support candidate)', () => {
    // A METAL 官殺 candidate's OWN seasonal vitality, independent of any Day Master.
    const r = generalSeasonalPhaseForMonthBranch('METAL', 'SHEN');
    if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
    expect(r.phase).toBe('WANG');
  });

  it('fact output does not contain any strength/verdict language', () => {
    const r = generalSeasonalPhase('WOOD', 'WOOD');
    expect(JSON.stringify(r)).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강/);
  });
});
