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

// ══ EXHAUSTIVE — all 5×5 element combinations + rotational consistency (HARDENING §8) ══════════
import type { FiveElement } from '../../interpretation';

describe('EXHAUSTIVE — all 5 Five-Elements × all 5 reference elements', () => {
  const ELEMENTS: readonly FiveElement[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];
  // Independently-derived expectation via cycle index arithmetic (see tenGodFacts.test.ts's same
  // pattern) — written separately from generalSeasonalPhase.ts's own ELEMENT_YANG_STEM/
  // TEN_GOD_TO_PHASE tables, so this is a genuine cross-check, not a restatement.
  const idx = (el: FiveElement) => ELEMENTS.indexOf(el);
  const expectedPhase = (target: FiveElement, reference: FiveElement): string => {
    if (target === reference) return 'WANG';
    if ((idx(reference) + 1) % 5 === idx(target)) return 'XIANG'; // reference generates target
    if ((idx(target) + 1) % 5 === idx(reference)) return 'XIU'; // target generates reference
    if ((idx(target) + 2) % 5 === idx(reference)) return 'QIU'; // target controls reference
    if ((idx(reference) + 2) % 5 === idx(target)) return 'SI'; // reference controls target
    throw new Error(`unreachable: ${target} vs ${reference}`);
  };

  for (const target of ELEMENTS) {
    for (const reference of ELEMENTS) {
      it(`${target} vs ${reference} → ${expectedPhase(target, reference)}`, () => {
        const r = generalSeasonalPhase(target, reference);
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        expect(r.phase).toBe(expectedPhase(target, reference));
      });
    }
  }

  it('rotational consistency: for any fixed target, all 5 references yield all 5 DISTINCT phases exactly once', () => {
    for (const target of ELEMENTS) {
      const phases = ELEMENTS.map((reference) => {
        const r = generalSeasonalPhase(target, reference);
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        return r.phase;
      });
      expect(new Set(phases).size).toBe(5); // WANG/XIANG/XIU/QIU/SI, each exactly once — a bijection
    }
  });

  it('rotational consistency: for any fixed reference, all 5 targets yield all 5 DISTINCT phases exactly once', () => {
    for (const reference of ELEMENTS) {
      const phases = ELEMENTS.map((target) => {
        const r = generalSeasonalPhase(target, reference);
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        return r.phase;
      });
      expect(new Set(phases).size).toBe(5);
    }
  });

  it('WANG is reflexive and unique: target===reference iff phase===WANG', () => {
    for (const target of ELEMENTS) {
      for (const reference of ELEMENTS) {
        const r = generalSeasonalPhase(target, reference);
        if (r.capability !== 'AVAILABLE') throw new Error('expected AVAILABLE');
        expect(r.phase === 'WANG').toBe(target === reference);
      }
    }
  });

  it('output never contains a strength verdict for any of the 25 combinations', () => {
    for (const target of ELEMENTS) {
      for (const reference of ELEMENTS) {
        const json = JSON.stringify(generalSeasonalPhase(target, reference));
        expect(json).not.toMatch(/WEAK|STRONG|극신약|신약|중화|신강|극신강/);
      }
    }
  });
});
