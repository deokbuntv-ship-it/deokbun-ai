// 성향 생성기 — 합성 반례 (2026-09-19). CTO 판정 ⓑ 의 조건 6 을 그대로 못 박는다.
//   성향 서술 → 통과 / 결과 예측이 섞임 → 실패 / 엔진 엇갈림 → 겹치는 부분만 / 근거 없는 성향 → 실패
//
// 이 생성기의 존재 이유: 2026-09-19 실측에서 성향 질문 16건 중 12건이 "한 가지 성향으로 규정하기보다…"
// 로 거절됐다. 거절 자체가 틀린 것이 아니라, **사람 설명과 결과 예측을 같이 막은 것**이 문제였다.
import {
  buildDisposition, isDispositionOnly, dispositionInputFrom, parseElementCounts, parseStemTenGods,
  parseZiweiMainStar, type DispositionInput, type FiveElementKey,
} from '@/features/chat/server/dispositionProse';

const counts = (o: Partial<Record<FiveElementKey, number>>): Record<FiveElementKey, number> => ({
  WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0, ...o,
});

describe('성향 서술 — 사람 설명을 만든다', () => {
  it('십신이 뚜렷하면 십신으로 말한다 (우선순위 1)', () => {
    const r = buildDisposition({ stemTenGods: ['JEONG_GWAN', 'JEONG_GWAN', 'SIK_SIN'] });
    expect(r.text).toBe('정해진 틀 안에서 차분한 편이에요.');
    expect(r.basis[0].detail).toBe('천간 십신에 정관이 2번 나옵니다.');
  });

  it('십신이 동점이면 오행으로 내려간다 (오너 명식: 십신 동점 · 토 4)', () => {
    const r = buildDisposition({ stemTenGods: ['JEONG_JAE', 'JEONG_IN', 'SIK_SIN'], elementCounts: counts({ WOOD: 1, FIRE: 1, EARTH: 4, METAL: 1, WATER: 1 }) });
    expect(r.text).toBe('버티면서 중심을 잡는 편이에요.');
    expect(r.basis).toEqual([{ system: '명리', detail: '오행 분포에서 토가 가장 많습니다.' }]);
  });

  it('⚠ 십신이 있으면 오행이 뚜렷해도 십신이 이긴다', () => {
    const r = buildDisposition({
      elementCounts: counts({ WOOD: 5, FIRE: 1 }),
      stemTenGods: ['SIK_SIN', 'SIK_SIN', 'JEONG_JAE'],
    });
    expect(r.text).toBe('하나를 오래 파고드는 편이에요.');
    expect(r.basis[0].detail).toContain('식신이 2번');
  });

  it('자미두수 명궁 주성만 있어도 말한다', () => {
    const r = buildDisposition({ ziweiMainStar: '칠살' });
    expect(r.text).toBe('정면으로 부딪는 편이에요.');
    expect(r.basis).toEqual([{ system: '자미두수', detail: '명궁 주성이 칠살입니다.' }]);
  });

  it('⚠ 같은 명식이면 항상 같은 문구가 나온다 (결정론)', () => {
    const input: DispositionInput = {
      elementCounts: counts({ EARTH: 4, WOOD: 1 }), stemTenGods: ['JEONG_JAE'], ziweiMainStar: '천부',
    };
    const a = buildDisposition(input);
    for (let i = 0; i < 20; i += 1) expect(buildDisposition(input)).toEqual(a);
  });
});

describe('⚠ 근거 없는 성향 → 실패 (아무것도 말하지 않는다)', () => {
  it('재료가 없으면 null 이다', () => {
    expect(buildDisposition({})).toEqual({ text: null, basis: [] });
  });

  it('오행이 전부 동점이면 억지로 고르지 않는다', () => {
    const r = buildDisposition({ elementCounts: counts({ WOOD: 1, FIRE: 1, EARTH: 1, METAL: 1, WATER: 1 }) });
    expect(r.text).toBeNull();
  });

  it('십신이 전부 한 번씩이면 고르지 않는다 (지장간·월령 가중치를 만들지 않는다)', () => {
    const r = buildDisposition({ stemTenGods: ['JEONG_JAE', 'JEONG_IN', 'SIK_SIN'] });
    expect(r.text).toBeNull();
  });

  it('⚠ 표에 없는 자미두수 별은 짐작해 말하지 않는다', () => {
    expect(buildDisposition({ ziweiMainStar: '없는별' }).text).toBeNull();
  });
});

describe('⚠ 엔진이 엇갈리면 — 통째로 거절하지 않는다', () => {
  it('두 학문이 같은 결이면 하나로 말한다', () => {
    const r = buildDisposition({ elementCounts: counts({ EARTH: 3 }), ziweiMainStar: '천부' });
    // 토(버티면서 중심을 잡는 편)와 천부(안정된 자리를 지키는 편)는 다른 문구다 → 아래 케이스로 간다
    expect(r.text).not.toBeNull();
  });

  it('다른 결이면 근거가 뚜렷한 쪽 하나만 말하고, 다른 쪽은 근거로 남긴다', () => {
    const r = buildDisposition({ elementCounts: counts({ EARTH: 4, WOOD: 1 }), ziweiMainStar: '파군' });
    expect(r.text).toBe('버티면서 중심을 잡는 편이에요.'); // 명리 쪽으로 말한다
    expect(r.basis).toHaveLength(2); // 자미두수도 근거에는 남는다
    expect(r.basis.map((b) => b.system)).toEqual(['명리', '자미두수']);
    // ⚠ 두 학문을 하나로 합치지 않는다 — 근거가 학문별로 따로 남아 있어야 한다
    expect(r.basis[1].detail).toContain('파군');
  });

  it('⚠ 반례 — 거절 문구("규정하기보다")를 만들지 않는다', () => {
    const r = buildDisposition({ elementCounts: counts({ EARTH: 4 }), ziweiMainStar: '파군' });
    expect(r.text).not.toMatch(/규정하기보다|확정하기 어렵/);
  });
});

describe('⚠ 결과 예측이 섞이면 실패 — 성향과 예측을 가른다', () => {
  it('생성기가 내는 문구는 전부 사람 설명이다', () => {
    const inputs: DispositionInput[] = [
      { elementCounts: counts({ WOOD: 3 }) }, { elementCounts: counts({ FIRE: 3 }) },
      { elementCounts: counts({ EARTH: 3 }) }, { elementCounts: counts({ METAL: 3 }) },
      { elementCounts: counts({ WATER: 3 }) },
      ...['자미', '천부', '태양', '태음', '무곡', '천동', '염정', '천기', '탐랑', '거문', '천상', '천량', '칠살', '파군']
        .map((s) => ({ ziweiMainStar: s })),
    ];
    for (const i of inputs) {
      const t = buildDisposition(i).text;
      expect(t).not.toBeNull();
      expect(isDispositionOnly(t!)).toBe(true);
    }
  });

  it('⚠ 결과·성공·실패가 붙으면 성향이 아니다', () => {
    expect(isDispositionOnly('앞에 나서는 편이에요.')).toBe(true);
    expect(isDispositionOnly('앞에 나서면 성공합니다.')).toBe(false);
    expect(isDispositionOnly('앞에 나서는 편이라 승진합니다.')).toBe(false);
    expect(isDispositionOnly('버티는 편이라 돈을 벌어요.')).toBe(false);
    expect(isDispositionOnly('정리하는 편이라 유리합니다.')).toBe(false);
  });

  it('⚠ 예측 어투가 붙으면 성향이 아니다', () => {
    expect(isDispositionOnly('밀고 가는 편이에요.')).toBe(true);
    expect(isDispositionOnly('밀고 가면 잘 됩니다.')).toBe(false);
    expect(isDispositionOnly('밀고 가게 될 것입니다.')).toBe(false);
  });

  it('⚠ 사람 설명 형태가 아니면 성향으로 인정하지 않는다', () => {
    expect(isDispositionOnly('올해 흐름이 좋습니다.')).toBe(false);
    expect(isDispositionOnly('')).toBe(false);
  });
});

// ── 근거 섹션 파서 ────────────────────────────────────────────────────────────
// 아래 줄은 **손으로 지어낸 것이 아니라** 2026-09-19 에 실제 프롬프트에서 뽑은 오너 명식의 근거다.
describe('근거 섹션에서 입력 뽑기 — 엔진을 다시 부르지 않는다', () => {
  const myungri = [
    { label: '명식(사주)', lines: ['년 辛未(辛未) · 월 乙未(乙未) · 일 丙戌(丙戌) · 시 戊子', '일간 丙'] },
    { label: '오행 분포', lines: ['목 1 · 화 1 · 토 4 · 금 1 · 수 1'] },
    {
      label: '십신·지장간',
      lines: [
        '년주: 천간 정재 / 지지 토 지장간 丁(여기·겁재) 乙(중기·정인) 己(정기·상관)',
        '월주: 천간 정인 / 지지 토 지장간 丁(여기·겁재) 乙(중기·정인) 己(정기·상관)',
        '일주: 천간 비견 / 지지 토 지장간 辛(여기·정재) 丁(중기·겁재) 戊(정기·식신)',
        '시주: 천간 식신 / 지지 수 지장간 壬(여기·편관) 癸(정기·정관)',
      ],
    },
  ];
  const ziwei = [{ label: '12궁', lines: ['명궁(寅): 자미, 천부', '형제(丑): 천기'] }];

  it('오행 개수를 그대로 읽는다', () => {
    expect(parseElementCounts(myungri)).toEqual({ WOOD: 1, FIRE: 1, EARTH: 4, METAL: 1, WATER: 1 });
  });

  it('⚠ 천간 십신에서 일주를 뺀다 (일간은 언제나 비견이라 정보가 없다)', () => {
    expect(parseStemTenGods(myungri)).toEqual(['JEONG_JAE', 'JEONG_IN', 'SIK_SIN']);
  });

  it('명궁 첫 주성을 읽는다', () => {
    expect(parseZiweiMainStar(ziwei)).toBe('자미');
  });

  it('오너 명식의 성향 — 십신 동점이라 오행으로 내려간다', () => {
    const r = buildDisposition(dispositionInputFrom(myungri, ziwei));
    expect(r.text).toBe('버티면서 중심을 잡는 편이에요.');
    expect(r.basis.map((b) => b.system)).toEqual(['명리', '자미두수']);
  });

  it('⚠ 형식이 다르면 조용히 없다고 한다 (틀린 성향보다 없는 편이 낫다)', () => {
    expect(parseElementCounts([{ label: '오행 분포', lines: ['알 수 없음'] }])).toBeNull();
    expect(parseElementCounts(undefined)).toBeNull();
    expect(parseStemTenGods(undefined)).toEqual([]);
    expect(parseZiweiMainStar([{ label: '12궁', lines: ['형제(丑): 천기'] }])).toBeNull();
    expect(buildDisposition(dispositionInputFrom(undefined, undefined)).text).toBeNull();
  });
});
