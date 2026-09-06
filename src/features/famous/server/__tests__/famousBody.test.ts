// 유명인 본문 — 금지 사항 자동 검사의 회귀 고정.
//
// ⚠ 이 파일이 지키는 세 가지는 서로 반대 방향이다.
//   (1) 금지 문장은 **반드시 걸린다.** 검사기가 조용히 약해지면 대운·인물 단정·날조된 글자 관계가
//       그대로 발행된다. 이 경로는 실존 인물의 이름을 달고 검색에 노출되는 글이라 되돌릴 수 없다.
//   (2) 실제로 나온 정상 본문은 **걸리지 않는다.** 규칙을 조금만 넓게 잡으면 멀쩡한 글까지 막히고,
//       그러면 운영자는 검사기를 우회한다. v1·v2 실측 6건을 함께 박아 둔다.
//       ⚠ 이 방어는 이미 값을 했다 — v2 를 만드는 동안 **정상 본문을 거절한 검사기 오류가 5건** 나왔다
//       (문장 분리자, 근거 괄호 위치, 부정형, 용어 풀이, 근거 괄호 안 인용).
//   (3) v1 → v2 의 **개선 폭 자체가 회귀 대상**이다. 근거 인용 0 → 18개 이상이 유지되어야 한다.
import {
  FAMOUS_BODY_FORBIDDEN,
  checkFamousBody,
  citationCount,
  claimCoverage,
  composeFamousBody,
  contradictsChart,
  leakySources,
  repeatedOpenings,
  ungloassedTerms,
  unsourcedSections,
} from '../famousBodyPrompt';

import { FAMOUS_BODY_SECTION_TITLES } from '../famousBodyPrompt';

import { GENERATED_BODIES, GENERATED_BODIES_V2, SAMPLE_V2_EXACT } from './famousBodySamples';

// 실제 위반 문장. "정규식이 이런 문자열에 맞는다" 가 아니라 "이런 **문장**이 걸린다" 를 본다.
const VIOLATIONS: { id: string; sentence: string }[] = [
  { id: 'FORTUNE_TIMELINE', sentence: '대운이 바뀌는 시기에는 흐름이 달라집니다.' },
  { id: 'FORTUNE_TIMELINE', sentence: '올해는 특히 재물의 기운이 강합니다.' },
  { id: 'FORTUNE_TIMELINE', sentence: '앞으로 3년 동안은 조심하는 편이 좋습니다.' },
  { id: 'PERSON_ASSERTION', sentence: '이 사람은 감정을 잘 드러내지 않습니다.' },
  { id: 'PERSON_ASSERTION', sentence: '그녀는 화 기운이 강한 사람입니다.' },
  { id: 'CAREER_LINK', sentence: '학당귀인이 있어 대학에 갔다고 볼 수 있습니다.' },
  { id: 'CAREER_LINK', sentence: '데뷔 시점의 흐름과도 맞아떨어집니다.' },
  // ⚠ v3: 합·충·형은 여기서 빠졌다. 엔진이 실제로 판정하므로 **단어 차단이 아니라 대조**로 옮겼다
  //    (`famousRelations.test.ts`). 여기 남는 것은 엔진이 끝내 판정하지 않는 것들이다.
  { id: 'INVENTED_RELATION', sentence: '일지와 시지가 원진에 놓여 있습니다.' },
  { id: 'INVENTED_RELATION', sentence: '천을귀인이 자리해 도움을 받습니다.' },
  { id: 'INVENTED_RELATION', sentence: '역마가 있어 움직임이 많은 배치입니다.' },
  { id: 'VERDICT', sentence: '전체적으로 좋은 사주라고 할 수 있습니다.' },
];

describe('금지 사항 — 걸려야 하는 것', () => {
  it.each(VIOLATIONS)('$id: "$sentence"', ({ id, sentence }) => {
    const hits = checkFamousBody(`## 일간\n\n${sentence}`);
    expect(hits.map((h) => h.id)).toContain(id);
  });

  it('규칙마다 최소 한 건의 회귀 문장이 있다 — 새 규칙을 추가하면 여기도 늘어야 한다', () => {
    const covered = new Set(VIOLATIONS.map((v) => v.id));
    expect(FAMOUS_BODY_FORBIDDEN.map((r) => r.id).filter((id) => !covered.has(id))).toEqual([]);
  });

  it('어디에서 걸렸는지 인용을 함께 돌려준다 — 이유 없는 거절은 운영자가 못 고친다', () => {
    const [hit] = checkFamousBody('## 일간\n\n대운이 바뀌면 달라집니다.');
    expect(hit.excerpt).toContain('대운');
    expect(hit.why.length).toBeGreaterThan(0);
  });

  // ⚠ v3 정정: 엔진에 `calculateNatalRelations` 가 **실재한다.** v1~v2 는 "없다" 는 잘못된 전제 위에
  // 합·충·형 단어를 통째로 막았고, 그래서 실재하는 엔진 기능을 검사기가 막고 있었다.
  // 이제 그 자리는 화이트리스트 대조가 맡는다 — 단어가 아니라 **이 명식에 그 관계가 있는지**를 본다.
  it('INVENTED_RELATION 은 엔진이 판정하지 않는 것만 막는다', () => {
    expect(FAMOUS_BODY_FORBIDDEN.some((r) => r.id === 'INVENTED_RELATION')).toBe(true);
    const rule = FAMOUS_BODY_FORBIDDEN.find((r) => r.id === 'INVENTED_RELATION')!;
    // 엔진이 판정하는 것은 더 이상 단어로 막지 않는다.
    for (const ok of ['삼합', '방합', '육합', '반합', '충', '형', '파', '해']) {
      expect(rule.re.test(ok)).toBe(false);
    }
    // 엔진에 없는 것은 계속 막는다.
    for (const no of ['원진', '귀인', '신살', '공망', '역마', '도화', '화개']) {
      expect(rule.re.test(no)).toBe(true);
    }
  });

  // ⚠ `세운` 은 "세우다"의 관형형과 겹친다. 상담 스크러버가 같은 함정으로 답변 2건을 버렸고,
  // 여기서도 정상 본문 1건을 버렸다(실측: "일간을 중심으로 세운 판단은 …").
  it('일상어 "세운"(세우다)은 대운·세운으로 보지 않는다', () => {
    expect(checkFamousBody('## 일간\n\n일간을 중심으로 세운 판단은 통근부터 봅니다.')).toEqual([]);
    expect(checkFamousBody('## 일간\n\n기준을 먼저 세운 다음에 십성을 셉니다.')).toEqual([]);
    // 진짜 세운은 계속 막힌다.
    expect(checkFamousBody('## 일간\n\n이 세운은 흐름이 다릅니다.').map((v) => v.id))
      .toContain('FORTUNE_TIMELINE');
  });
});

describe('실측 본문 — v1·v2 모두 거짓 양성이 없어야 한다', () => {
  const ALL = [
    ...GENERATED_BODIES.map((b) => ({ ...b, ver: 'v1' })),
    ...GENERATED_BODIES_V2.map((b) => ({ ...b, ver: 'v2' })),
  ];

  it.each(ALL)('$ver $key: 금지어 0건', ({ body }) => {
    expect(checkFamousBody(body)).toEqual([]);
  });

  it.each(ALL)('$ver $key: 같은 문두 반복 없음', ({ body }) => {
    expect(repeatedOpenings(body)).toEqual([]);
  });

  it.each(ALL)('$ver $key: 근거 없는 섹션 없음', ({ ver, body }) => {
    // v1 은 근거 표기 자체가 없던 시절이라 이 검사의 대상이 아니다.
    if (ver === 'v1') return;
    expect(unsourcedSections(body)).toEqual([]);
  });

  // v1·v2 는 다섯 섹션이었다. v3 부터 관계 섹션이 붙어 여섯이다 — 과거 실측을 다시 쓰지 않는다.
  it.each(ALL)('$ver $key: 다섯 섹션 (v1·v2 당시 구조)', ({ body }) => {
    expect(body.match(/^## /gm)?.length).toBe(5);
  });

  it('⚠ 실측 본문 어디에도 대운·세운이 없다', () => {
    for (const { body } of ALL) expect(body).not.toMatch(/대운|세운|월운|연운/);
  });
});

describe('v1 → v2 개선 폭 — 이것이 줄면 회귀다', () => {
  it('v1 은 근거 인용이 하나도 없었다', () => {
    for (const { body } of GENERATED_BODIES) expect(citationCount(body)).toBe(0);
  });

  it('v2 는 본문당 근거 인용이 18개 이상이다', () => {
    for (const { key, body } of GENERATED_BODIES_V2) {
      expect({ key, cites: citationCount(body) >= 18 }).toEqual({ key, cites: true });
    }
  });

  it('v2 는 문장의 85% 이상에 근거가 붙어 있다', () => {
    for (const { key, body } of GENERATED_BODIES_V2) {
      const c = claimCoverage(body).reduce(
        (a, s) => ({ s: a.s + s.sentences, q: a.q + s.sourced }),
        { s: 0, q: 0 },
      );
      expect({ key, ok: c.q / c.s >= 0.85 }).toEqual({ key, ok: true });
    }
  });

  it('v2 는 v1 보다 길다 — 근거를 붙이면 글이 길어진다', () => {
    for (let i = 0; i < 3; i += 1) {
      expect(GENERATED_BODIES_V2[i].body.length).toBeGreaterThan(GENERATED_BODIES[i].body.length);
    }
  });
});

describe('근거 표기 검사', () => {
  it('근거가 하나도 없는 섹션을 잡는다', () => {
    const md = [
      '## 일간',
      '',
      '이 일간은 뿌리가 아주 튼튼합니다. 계절도 뒤에서 받쳐 주고 있습니다. 전체적으로 안정적인 구조입니다.',
    ].join('\n');
    expect(unsourcedSections(md)).toEqual(['일간']);
  });

  it('개념을 푸는 도입 문장 하나는 근거가 없어도 된다 — 섹션에 하나만 있으면 통과', () => {
    const md = '## 일간\n\n통근은 뿌리를 두는 것입니다. 이 일간은 뿌리가 있습니다 (근거: 년지 오에 통근).';
    expect(unsourcedSections(md)).toEqual([]);
  });

  // ⚠ 실측 거짓 양성 5건의 회귀 잠금. 하나하나가 정상 본문을 거절했던 형태다.
  it('마침표 뒤에 붙은 근거를 앞 문장의 것으로 센다', () => {
    const md = '## 일간\n\n뿌리가 튼튼합니다. (근거: 년지 오에 통근) 계절도 받쳐 줍니다. (근거: 득령)';
    const [s] = claimCoverage(md);
    expect(s).toEqual({ title: '일간', sentences: 2, sourced: 2 });
    expect(repeatedOpenings(md)).toEqual([]);
  });

  it('근거 괄호를 문장으로 세지 않는다 — "(근거: " 가 문두로 잡히면 안 된다', () => {
    const md = [
      '## 일간',
      '',
      '뿌리가 있습니다. (근거: 월지 오) 계절이 받칩니다. (근거: 월지 오) 힘이 모입니다. (근거: 월지 오)',
    ].join('\n');
    expect(repeatedOpenings(md)).toEqual([]);
  });

  it('자료의 항목 이름을 가리키는 근거를 잡는다', () => {
    expect(leakySources('(근거: 【월령 — 계절】)').length).toBe(1);
    expect(leakySources('(근거: 투간 항목들과 숨은 지장간 목록)').length).toBe(1);
    expect(leakySources('(근거: 자료의 "무리의 뜻" 줄)').length).toBe(1);
  });

  it('관측값을 제대로 인용하면 "표기" 라는 말이 있어도 통과한다', () => {
    expect(leakySources('(근거: 비겁 4가 겁재·비견으로 표기됨)')).toEqual([]);
    expect(leakySources('(근거: 월지 유·가을, 일간의 계절 단계 휴 — 실령)')).toEqual([]);
  });
});

describe('명식 모순 검사 — 사실이 뒤집힌 경우', () => {
  const chart = (inCommand: boolean) =>
    ({ monthCommand: { season: '가을', phase: '휴(休)', phaseMeaning: 'x', inCommand } }) as never;

  // ⚠ 실측: 득령인 명식에 "일간이 실령(旺·득령의 상태로 계절의 힘을 얻은 자리)에 있어" 라고 썼다.
  // 단어는 실령, 풀이는 득령 — 다른 검사는 전부 통과시킨다. 배우러 온 독자에게 반대를 가르친다.
  it('반대말을 단정하면 잡는다', () => {
    expect(contradictsChart('일간이 득령하여 힘을 얻었습니다.', chart(false)).length).toBe(1);
    expect(contradictsChart('일간은 실령 상태입니다.', chart(true)).length).toBe(1);
  });

  it('다른 계절 단계를 쓰면 잡는다', () => {
    expect(contradictsChart('계절 단계는 왕(旺)입니다.', chart(false)).length).toBe(1);
    expect(contradictsChart('계절 단계는 휴(休)입니다.', chart(false))).toEqual([]);
  });

  // 아래 넷은 전부 **정상 문장**이다. 하나씩 실측에서 거짓 양성을 냈다.
  it.each([
    ['부정형', '일간은 득령하지 못했습니다.'],
    ['짝 나열', '득령·실령 여부 → 십성 순으로 봅니다.'],
    ['질문형', '먼저 득령인지 실령인지 확인합니다.'],
    ['용어 풀이', '득령(得令, 계절의 힘을 얻은 상태)을 볼 때'],
    ['근거 괄호 안', '그렇습니다 (근거: 통근·월령 득령·투간).'],
  ])('%s 은 모순이 아니다: "%s"', (_label, text) => {
    expect(contradictsChart(text, chart(false))).toEqual([]);
  });

  it('실측 v2 본문 3건에 모순이 없다', () => {
    // 세 건 다 실제 명식과 대조해 통과한 것들이다.
    for (const { body } of GENERATED_BODIES_V2) {
      expect(contradictsChart(body, { monthCommand: null })).toEqual([]);
    }
  });
});

describe('반복 검사 — 1차 생성에서 실제로 나온 실패', () => {
  // ⚠ 실측: 모든 문장이 "이런 명식은" 으로 시작하는 글이 나왔다. 금지 규칙은 하나도 어기지 않았다.
  const REPETITIVE = [
    '## 일간 — 이 명식의 중심',
    '',
    '이런 명식은 화 기운이 중심이 되는 경향이 있습니다. 이런 명식은 표현이 앞서는 경향이 있습니다.'
      + ' 이런 명식은 결정을 빨리 내리는 경향이 있습니다. 이런 명식은 뒷심이 약한 경향이 있습니다.',
  ].join('\n');

  it('절반을 넘는 같은 문두를 잡아낸다', () => {
    const [hit] = repeatedOpenings(REPETITIVE);
    expect(hit.opening).toBe('이런 명식은');
    expect(hit.count * 2).toBeGreaterThan(hit.total);
  });

  it('금지 규칙으로는 잡히지 않는다 — 그래서 별도 검사가 필요했다', () => {
    expect(checkFamousBody(REPETITIVE)).toEqual([]);
  });

  it('문장이 셋 미만인 섹션은 판정하지 않는다 — 짧은 글은 반복이 아니다', () => {
    expect(repeatedOpenings('## 일간\n\n이런 명식은 화가 강한 편입니다. 이런 명식은 뿌리가 깊습니다.')).toEqual([]);
  });
});

describe('용어 풀이 — 막지 않고 알린다', () => {
  it('풀이 없이 쓴 십성을 집어낸다', () => {
    expect(ungloassedTerms('## 일간\n\n겁재가 강한 자리입니다.')).toContain('겁재');
  });

  it('한 번이라도 괄호 풀이가 붙으면 통과한다 — 매번 붙이라는 뜻이 아니다', () => {
    const text = '## 일간\n\n겁재(같은 오행의 다른 극)가 있습니다. 겁재의 자리를 봅니다.';
    expect(ungloassedTerms(text)).not.toContain('겁재');
  });

  // ⚠ 관측이지 규칙이 아니다. v2 는 검사 대상 용어를 12개 → 21개로 늘렸고(무리 이름·통근·투간 추가)
  // 실측 3건 모두 무리 이름 일부를 풀이 없이 쓴다. 발행을 막지는 않고 운영자에게 뜬다.
  // 값을 박아 두는 이유는 프롬프트를 손볼 때 이 숫자가 어느 쪽으로 움직였는지 보이게 하기 위해서다.
  it('v2 실측 3건의 풀이 없는 용어 수 (0 이 되면 기대값을 줄인다)', () => {
    const counts = GENERATED_BODIES_V2.map((b) => ({ key: b.key, n: ungloassedTerms(b.body).length }));
    expect(counts).toEqual([
      { key: 'exact', n: 5 },
      { key: 'no-hour', n: 5 },
      { key: 'autumn', n: 5 },
    ]);
  });
});

describe('본문 조립', () => {
  // ⚠ v3 에서 **여섯 섹션**이 됐다. 관계에 자리를 안 주면 모델이 관계를 아예 쓰지 않는다 —
  // 근거에 넣기만 했을 때 실측 2/2 에서 관계 서술 0건이었다.
  it('여섯 섹션을 제목과 함께 마크다운으로 잇는다', () => {
    const md = composeFamousBody({
      dayMaster: '가.', monthCommand: '나.', tenGods: '다.',
      hiddenStems: '라.', relations: '마.', howToRead: '바.',
    });
    expect(md.match(/^## /gm)?.length).toBe(6);
    for (const t of ['가.', '나.', '다.', '라.', '마.', '바.']) expect(md).toContain(t);
  });

  it('관계 섹션이 합·충 자리에 있다', () => {
    const md = composeFamousBody({
      dayMaster: 'a', monthCommand: 'b', tenGods: 'c', hiddenStems: 'd', relations: 'e', howToRead: 'f',
    });
    expect(md).toContain('## 글자끼리 어떻게 맞물리나 — 합·충·형');
  });

  // ⚠ 섹션 제목이 자리 이름이 아니라 **개념 이름**이어야 한다 (v1 → v2 의 핵심 변경).
  it('제목이 개념을 담는다 — 표의 칸 이름을 목차로 쓰지 않는다', () => {
    const titles = Object.values(FAMOUS_BODY_SECTION_TITLES).join(' ');
    for (const concept of ['통근', '월령', '십성', '투간', '합·충·형', '읽는 법']) {
      expect(titles).toContain(concept);
    }
    // v2 실측도 당시 개념 제목이었다 — 되돌아가지 않았는지 함께 본다.
    expect((SAMPLE_V2_EXACT.match(/^## .+$/gm) ?? []).join(' ')).toContain('통근');
  });
});
