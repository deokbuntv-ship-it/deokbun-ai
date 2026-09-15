import { resolveZiweiInput } from '../adapters/ziweiInputAdapter';
import { ZIWEI_RULESET_VERSION } from '../adapters/iztroAdapter';
import { timeIndexFromHour } from '../domain/ziweiTypes';
import { computeZiweiChart } from '../services/ziweiService';

const birth = (hour: number, minute = 0) => ({
  gender: 'male' as const,
  birthYear: '1990', birthMonth: '8', birthDay: '15',
  birthHour: String(hour), birthMinute: String(minute), birthTimeAccuracy: 'exact' as const,
});

describe('Ziwei V1 conformance additions', () => {
  it('pins the provider hour boundary policy, including distinct early/late Zi indices', () => {
    expect([22, 23, 0, 1].map(timeIndexFromHour)).toEqual([11, 12, 0, 1]);
    expect(resolveZiweiInput(birth(23))).toMatchObject({ ok: true, input: { timeIndex: 12 } });
    expect(resolveZiweiInput(birth(0))).toMatchObject({ ok: true, input: { timeIndex: 0 } });
  });

  it('documents the current minute-granularity limitation: minutes do not alter provider input', () => {
    expect(resolveZiweiInput(birth(11, 0))).toEqual(resolveZiweiInput(birth(11, 59)));
  });

  it('characterization-locks star placement for iztro-default@2.5.8', () => {
    const result = computeZiweiChart(birth(11));
    expect(result.availability).toBe('available');
    if (result.availability !== 'available') return;
    expect(result.chart.ruleSetVersion).toBe(ZIWEI_RULESET_VERSION);
    expect(result.chart.soulPalaceBranch).toBe('축');
    expect(result.chart.fiveElementsClass).toBe('화육국');
    const placements = Object.fromEntries(result.chart.palaces.map((palace) => [
      palace.name, palace.majorStars.map((star) => star.name),
    ]));
    expect(placements).toMatchObject({
      명궁: ['자미', '파군'], 관록: ['염정', '탐랑'], 재백: ['무곡', '칠살'], 복덕: ['천부'],
    });
  });
});
