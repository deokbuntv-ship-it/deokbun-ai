// 관계 화이트리스트 대조 · 생극 방향 · 문장 결함 — v3 신설 검사 3종의 회귀.
//
// ⚠ 왜 차단이 아니라 대조인가. v1~v2 의 `INVENTED_RELATION` 은 합·충·형 **단어를 막는** 정규식이었고,
// 그 근거는 "엔진이 그런 판정을 하지 않는다" 였다. **사실이 아니었다** —
// `calculateNatalRelations` 가 12종을 판정하고 있었고, 검사기가 실재하는 엔진 기능을 막고 있었다.
// 단어를 막으면 지어낸 관계와 진짜 관계를 구별하지 못한다. 대조는 구별한다.
import { buildFamousChart, type FamousChartSnapshot } from '../famousChart';
import {
  checkFamousBody,
  checkRelationClaims,
  phaseDirectionErrors,
  sentenceDefects,
  unverifiedRelationClaims,
} from '../famousBodyPrompt';

const deps = { digestProvider: { async sha256Utf8() { return 'a'.repeat(64); } } } as never;
const birth = (over: Record<string, unknown> = {}) =>
  ({
    displayName: '예시', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '6', birthDay: '21',
    birthTimeAccuracy: 'exact', birthHour: '13', birthMinute: '20',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as never;

const md = (body: string) => `## 일간은 무엇으로 서 있나 — 통근\n\n${body}`;

describe('엔진이 실제로 판정하는 것', () => {
  it('12종 관계를 담고, 판정이 없으면 빈 배열이다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    const names = r.snapshot.relations.map((x) => x.name);
    // 1990-06-21 13:20 서울 — 실측: 천간합 2 · 자형 1 · 육합 2 · 방합 1
    expect(names).toEqual([
      '천간합(合)', '천간합(合)', '자형(自刑)', '육합(六合)', '육합(六合)', '방합(方合)',
    ]);
    // 뜻 라벨이 전부 붙어 있어야 한다 — 톤 제어의 출발점이다.
    for (const rel of r.snapshot.relations) expect(rel.meaning.length).toBeGreaterThan(10);
  });

  it('⚠ 뜻 라벨이 한쪽으로 기울지 않는다 — Premium V3 의 실패를 되풀이하지 않는다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    for (const rel of r.snapshot.relations) {
      // 가치 판단어가 라벨에 들어가면 그 자체가 자동 번역이다.
      expect(rel.meaning).not.toMatch(/나쁘|좋습니|불행|위험|사고|다치/);
      // 양면으로 적혔는지 — "이기도 / 하기도" 형태를 쓴다.
      expect(rel.meaning).toMatch(/기도 하|이기도|되기도/);
    }
  });
});

describe('화이트리스트 대조 — 관계 주장', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('엔진이 판정한 관계는 통과한다', () => {
    const body = md('년지 오와 시지 미가 하나로 묶이는 자리입니다 (근거: 오와 미의 육합(六合)).');
    expect(unverifiedRelationClaims(body, chart)).toEqual([]);
  });

  it('세트 관계도 참여 글자가 다 있으면 통과한다', () => {
    const body = md('세 글자가 한 계절로 모입니다 (근거: 사·오·미의 방합(方合) 화 국).');
    expect(unverifiedRelationClaims(body, chart)).toEqual([]);
  });

  // ⚠ v1 의 실제 실패 문장. 글자는 맞는데 **이름이 틀렸다** — 사·오·미는 삼합이 아니라 방합이다.
  it('⚠ "사와 오, 미의 삼합" — 글자는 맞고 이름이 틀린 경우를 잡는다', () => {
    const body = md('사와 오, 미의 삼합(三合)이 화 기운을 더합니다.');
    const bad = unverifiedRelationClaims(body, chart);
    expect(bad.length).toBe(1);
    expect(bad[0].anchor).toBe('삼합');
  });

  it('이름은 맞는데 글자가 틀린 경우를 잡는다', () => {
    const body = md('자와 오의 육합(六合)이 성립합니다.');
    expect(unverifiedRelationClaims(body, chart).length).toBe(1);
  });

  it('엔진이 아예 판정하지 않은 종류를 잡는다', () => {
    const body = md('일지와 월지가 정면으로 부딪힙니다 (근거: 오와 자의 충(沖)).');
    expect(unverifiedRelationClaims(body, chart).length).toBe(1);
  });

  // ⚠ 부정문 오검출 방지. 득령/실령 검사에서 같은 오검출을 네 번 겪었다.
  it('"충(沖)이 없습니다" 는 맞는 문장이므로 통과한다', () => {
    const body = md('이 명식에는 글자끼리 정면으로 부딪히는 충(沖)이 없습니다.');
    expect(unverifiedRelationClaims(body, chart)).toEqual([]);
  });

  // ⚠ 실측 거짓 양성: 용어를 **정의**하는 문장을 사례 주장으로 보고 정상 본문을 버렸다.
  //    이 명식에 실제로 있는 관계(육합)를 정의만 하는 문장은 대조할 대상이 없다.
  it('이 명식에 있는 관계를 정의만 하는 문장은 넘어간다 — 참여 글자를 지목하지 않았다', () => {
    const body = md('육합(六合)은 두 지지가 하나로 묶이는 관계를 뜻합니다.');
    expect(checkRelationClaims(body, chart)).toEqual([]);
  });

  // 반대로 **이 명식에 없는** 관계는 정의만 해도 잡는다 — 프롬프트가 자료에 있는 것만 쓰라고 한다.
  it('이 명식에 없는 관계는 정의만 해도 잡는다', () => {
    const body = md('해(害)는 두 지지가 서로의 합을 방해하는 관계를 뜻합니다.');
    expect(unverifiedRelationClaims(body, chart).length).toBe(1);
  });

  it('참여 글자를 틀리게 지목하면 잡는다', () => {
    const body = md('년지 자와 일지 미 사이에 육합(六合)이 있습니다.');
    expect(unverifiedRelationClaims(body, chart).length).toBe(1);
  });

  it('한자를 안 단 일상어는 관계 주장으로 보지 않는다', () => {
    // 해석·파악·충분·종합 — 전부 관계 글자를 품고 있지만 한자 앵커가 없다.
    const body = md('이 배치를 해석할 때는 충분히 종합적으로 파악하는 것이 좋습니다.');
    expect(checkRelationClaims(body, chart)).toEqual([]);
  });

  it('관계가 하나도 없는 명식에서 관계를 말하면 전부 걸린다', () => {
    const empty = { relations: [] } as Pick<FamousChartSnapshot, 'relations'>;
    const body = md('년지와 월지의 충(沖)이 눈에 띕니다.');
    expect(unverifiedRelationClaims(body, empty).length).toBe(1);
  });
});

describe('금지 목록은 엔진이 판정하지 않는 것만 남는다', () => {
  it('원진·귀인·신살·역마·도화·화개는 계속 막힌다 — 엔진에 없다', () => {
    for (const w of ['원진', '귀인', '신살', '역마', '도화', '화개', '공망']) {
      const hits = checkFamousBody(md(`이 자리에 ${w}이 있습니다.`));
      if (w === '공망') { expect(hits.map((h) => h.id)).toContain('INVENTED_RELATION'); continue; }
      expect(hits.map((h) => h.id)).toContain('INVENTED_RELATION');
    }
  });

  it('⚠ 합·충·형·파·해는 더 이상 단어로 막지 않는다 — 대조가 대신한다', () => {
    for (const w of ['삼합', '방합', '육합', '반합', '충', '형', '파', '해']) {
      expect(checkFamousBody(md(`${w}에 대해 씁니다.`)).map((h) => h.id)).not.toContain('INVENTED_RELATION');
    }
  });
});

describe('⚠ 생극 방향 — 이름이 아니라 방향이 틀린 경우', () => {
  const mc = (direction: string) =>
    ({ monthCommand: { season: '가을', phase: '휴(休)', phaseMeaning: 'x', inCommand: false, direction } }) as never;

  // 실측: 휴(休)를 옳게 풀어 놓고 바로 다음 절에서 "월령이 일간을 생해" 라고 뒤집었다.
  it('휴(일간이 계절을 생함)인데 "월령이 일간을 생해" 라고 쓰면 잡는다', () => {
    const body = md('일간의 계절 단계는 휴로 되어 있어 월령이 일간을 생해 내보내는 역할을 합니다.');
    expect(phaseDirectionErrors(body, mc('DAY_GENERATES_SEASON')).length).toBe(1);
  });

  it('같은 문장이 방향대로 쓰이면 통과한다', () => {
    const body = md('일간의 계절 단계는 휴여서 일간이 계절을 생하며 힘을 내보내는 자리입니다.');
    expect(phaseDirectionErrors(body, mc('DAY_GENERATES_SEASON'))).toEqual([]);
  });

  it('극 방향도 본다', () => {
    const body = md('이 배치에서는 계절이 일간을 극하는 흐름이 이어집니다.');
    expect(phaseDirectionErrors(body, mc('DAY_CONTROLS_SEASON')).length).toBe(1);
    expect(phaseDirectionErrors(body, mc('SEASON_CONTROLS_DAY'))).toEqual([]);
  });

  it('계절↔일간 쌍이 아니면 판정하지 않는다 — 애매하면 통과시킨다', () => {
    const body = md('지장간의 을이 일간을 생하는 자리로 읽힙니다.');
    expect(phaseDirectionErrors(body, mc('DAY_GENERATES_SEASON'))).toEqual([]);
  });

  it('월령 판정이 없으면 아무것도 보지 않는다', () => {
    const body = md('월령이 일간을 생합니다.');
    expect(phaseDirectionErrors(body, { monthCommand: null })).toEqual([]);
  });
});

describe('문장 결함 — 기계로 확실히 잡히는 것만', () => {
  // 전부 직전 트랙 실측 문장이다.
  it('같은 말 3회 연속', () => {
    expect(sentenceDefects('지지의 지지(地支) 지지기반과 연결됩니다').length).toBe(1);
  });

  it('내용 없는 괄호', () => {
    expect(sentenceDefects('투간(透干)입니다(정의: 지장간과 투간 설명).').length).toBe(1);
  });

  it('세미콜론', () => {
    expect(sentenceDefects('먼저 통근을 봅니다; 그다음 월령입니다.')[0]).toContain('세미콜론');
  });

  it('문체 이탈', () => {
    expect(sentenceDefects('인성은 일간을 생하는 것으로 본다.')[0]).toContain('문체 이탈');
  });

  it('정상 문장은 잡지 않는다', () => {
    const ok = '통근(通根, 천간이 지지 속에 같은 오행의 뿌리를 두는 것)은 일간을 받쳐 줍니다.';
    expect(sentenceDefects(ok)).toEqual([]);
  });

  // ⚠ 못 잡는 것을 못 잡는다고 못박는다. 억지로 잡으려다 정상 문장을 거절하는 쪽이 더 나쁘다.
  it('오타와 어색한 조사는 잡지 못한다 — 알고 남긴 한계다', () => {
    expect(sentenceDefects('천간으로 올라오지 않은 채로 숨아 있어')).toEqual([]);
    expect(sentenceDefects('비견(같은 오행 임)와 겁재')).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// v3 실측 3건 — 관계를 연 뒤의 회귀 고정.
//
// ⚠ 이 블록이 지키는 것: **관계를 열었는데 날조가 늘지 않았다**는 사실. 열기 전에는 검사기가
// 단어를 막아서 날조가 원천적으로 불가능했다(대신 진짜 관계도 못 썼다). 이제는 쓸 수 있으므로,
// 쓴 것이 전부 엔진 판정과 맞는지를 계속 확인해야 한다.
// ═══════════════════════════════════════════════════════════════════════════════
describe('v3 실측 — 관계를 열고도 날조 0', () => {
  const { GENERATED_BODIES_V3 } = require('./famousBodySamples') as {
    GENERATED_BODIES_V3: readonly { key: string; body: string; chart: never }[];
  };

  it.each(GENERATED_BODIES_V3)('$key: 관계 주장이 전부 엔진 판정과 일치', ({ body, chart }) => {
    expect(unverifiedRelationClaims(body, chart)).toEqual([]);
  });

  it.each(GENERATED_BODIES_V3)('$key: 관계를 실제로 썼다 (열어 둔 값이 있다)', ({ body, chart }) => {
    const claims = checkRelationClaims(body, chart);
    // v2 까지는 0건이었다. 관계를 쓰지 않으면 여는 의미가 없다.
    expect(claims.length).toBeGreaterThan(0);
    expect(claims.every((c) => c.matched !== null)).toBe(true);
  });

  it.each(GENERATED_BODIES_V3)('$key: ⚠ 생극 방향 오류 0', ({ body, chart }) => {
    expect(phaseDirectionErrors(body, chart)).toEqual([]);
  });

  it.each(GENERATED_BODIES_V3)('$key: 금지어 0 · 문두 반복 0 · 대운세운 0', ({ body }) => {
    expect(checkFamousBody(body)).toEqual([]);
    expect(body).not.toMatch(/대운|월운|연운/);
  });

  // ⚠ 관계를 부정으로만 쓰지 않았는지. Premium V3 의 실패(합=얽힘 자동 번역)를 되풀이하지 않는다.
  it('형·파·해를 부정 단정으로 쓰지 않았다', () => {
    for (const { body } of GENERATED_BODIES_V3) {
      expect(body).not.toMatch(/사고가|다치|불행|나쁜 자리|위험합니다|흉/);
    }
  });

  // ⚠ 세미콜론은 clamp 가 없앤다. 남아 있으면 clamp 를 안 거친 경로가 생긴 것이다.
  it('세미콜론 0 — clamp 가 작동했다', () => {
    for (const { body } of GENERATED_BODIES_V3) expect(body).not.toContain(';');
  });
});
