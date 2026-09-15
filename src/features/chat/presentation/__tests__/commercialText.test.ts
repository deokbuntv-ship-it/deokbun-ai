// Commercial-text hygiene (V4 §8/§9/§44/§69). Locks the internal-terminology detector + the
// conservative engine-label stripper used as presentation-layer defense-in-depth.
import { containsInternalTerminology, containsRawGanji, stripEngineLabels } from '../commercialText';

describe('containsRawGanji — raw 천간지지 hanja must not reach the consumer answer (§20)', () => {
  it('flags raw stems/branches / combinations', () => {
    expect(containsRawGanji('寅卯의 기운이 강해집니다')).toBe(true);
    expect(containsRawGanji('일간 甲木을 중심으로')).toBe(true);
    expect(containsRawGanji('丙午 세운')).toBe(true);
  });
  it('does NOT flag ordinary translated Korean prose', () => {
    expect(containsRawGanji('변화와 이동의 흐름이 강해지는 시기입니다')).toBe(false);
    expect(containsRawGanji('사업운은 좋은 편입니다. 5월을 먼저 추천합니다.')).toBe(false);
  });
});

describe('containsInternalTerminology — never let internal/dev terms reach the user', () => {
  it('flags the exact leak patterns the owner called out', () => {
    expect(containsInternalTerminology('명리 관점(엔진: SAJU)에서 보면')).toBe(true);
    expect(containsInternalTerminology('자미두수(engine: iztro)')).toBe(true);
    expect(containsInternalTerminology('신강·신약이나 용신은 V1에서는 계산되지 않았습니다')).toBe(true);
    expect(containsInternalTerminology('grounding 근거가 부족합니다')).toBe(true);
    expect(containsInternalTerminology('사주 근거(제공됨)')).toBe(true);
    expect(containsInternalTerminology('내부 schema 를 참고하면')).toBe(true);
  });

  it('does NOT flag a clean, natural commercial answer', () => {
    const clean =
      '2027년에는 사업 흐름이 점차 안정되는 편이에요. 사주에서 보면 확장보다 정비가 어울리는 시기이고, ' +
      '자미두수에서는 사람과의 관계가 기회를 여는 열쇠가 됩니다.';
    expect(containsInternalTerminology(clean)).toBe(false);
  });
});

describe('stripEngineLabels — removes only the specific internal labels, never prose', () => {
  it('strips (엔진: …) / (engine: …) / (제공됨) labels and tidies spacing', () => {
    expect(stripEngineLabels('명리 관점(엔진: SAJU)에서 보면 안정적입니다')).toBe(
      '명리 관점에서 보면 안정적입니다',
    );
    expect(stripEngineLabels('자미두수 (engine: iztro) 관점')).toBe('자미두수 관점');
    expect(stripEngineLabels('사주 근거 (제공됨)')).toBe('사주 근거');
  });
  it('leaves a clean answer untouched', () => {
    const clean = '사주에서 보면 올해는 기반을 다지기 좋은 흐름이에요.';
    expect(stripEngineLabels(clean)).toBe(clean);
  });
});
