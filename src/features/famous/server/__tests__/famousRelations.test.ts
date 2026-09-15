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
  relationMentionCount,
  sentenceDefects,
  unverifiedRelationClaims,
} from '../famousBodyPrompt';
import {
  SAMPLE_V4_EXACT_CHART,
  SAMPLE_V4_AUTUMN_CHART,
} from './famousBodySamples';

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

// ═══════════════════════════════════════════════════════════════════════════════════════════
// v7 — ⚠ **합성 반례.** 이 트랙의 핵심이다.
//
// 왜 실측만으로는 부족한가: clamp 트랙(v6)에서 규칙 후보 4개가 **실측 356문장에서 전부**
// tp 6/6 · 거짓 양성 0 이었다. 그런데 프롬프트가 요구하는 정상 문장 62개를 **새로 지어** 돌리자
// 넷 다 깨졌다(FP 11·7·5·5). **실측 통과는 아무것도 증명하지 않는다.**
//
// ⚠⚠ 이 두 집합은 **규칙을 넓힐 때마다 다시 돌려야 한다.** 실측 본문만 돌리고 "거짓 양성 0" 이라고
//    적으면 v6 과 같은 실수를 반복하는 것이다. 정상 집합에서 하나라도 죽으면 넓히지 말 것.
//
// 스냅샷 둘을 쓴다:
//   EXACT  — 천간합 임·정 ×2 · 자형 오·오 · 육합 오·미 ×2 · 방합 사·오·미
//   AUTUMN — 해 오·축 · 파 오·묘 · 반합 유·축 · 충 유·묘
// ═══════════════════════════════════════════════════════════════════════════════════════════

const EXACT = SAMPLE_V4_EXACT_CHART as unknown as FamousChartSnapshot;
const AUTUMN = SAMPLE_V4_AUTUMN_CHART as unknown as FamousChartSnapshot;
const rel = (body: string) => `## 글자끼리 어떻게 맞물리나 — 합·충·형\n\n${body}`;

describe('⚠ v7 합성 반례 — 정상 문장 (거절 0)', () => {
  it.each([
    // ── 정확한 주장 · 한자 있음
    ['천간합', '월간 임(壬)과 일간 정(丁) 사이에 천간합(合)이 있습니다 (근거: 천간합 임·정 [월·일주 사이]).', 'EXACT'],
    ['천간합 두 번째', '월간 임과 시간 정 사이에도 천간합(合)이 있습니다 (근거: 천간합 임·정 [월·시주 사이]).', 'EXACT'],
    ['자형', '년지 오와 월지 오 사이에 자형(自刑)이 있습니다 (근거: 자형 오·오 [년·월주 사이]).', 'EXACT'],
    ['육합', '년지 오와 시지 미 사이에 육합(六合)이 있습니다 (근거: 육합 오·미 [년·시주 사이]).', 'EXACT'],
    ['방합', '사·오·미가 모여 방합(方合)을 이룹니다 (근거: 방합 사·오·미 · 국 오행 화).', 'EXACT'],
    ['해', '년지 오와 일지 축 사이에 해(害)가 있습니다 (근거: 해 오·축 [년·일주 사이]).', 'AUTUMN'],
    ['파', '년지 오와 시지 묘 사이에 파(破)가 있습니다 (근거: 파 오·묘 [년·시주 사이]).', 'AUTUMN'],
    ['반합', '월지 유와 일지 축 사이에 반합(半合)이 있습니다 (근거: 반합 유·축 · 국 오행 금).', 'AUTUMN'],
    ['충', '월지 유와 시지 묘 사이에 충(沖)이 있습니다 (근거: 충 유·묘 [월·시주 사이]).', 'AUTUMN'],
    // ── 정확한 주장 · **한자 없음** (v7 이 새로 검사하는 것 — 통과해야 한다)
    ['앵커 없는 천간합', '월간 임과 일간 정의 천간합이 있습니다 (근거: 천간합 임·정 [월·일주]).', 'EXACT'],
    ['앵커 없는 천간합 · 형성', '월간 임과 시간 정 사이에도 천간합이 형성되어 있습니다 (근거: 천간합 임·정 [월·시주]).', 'EXACT'],
    ['앵커 없는 해 · 입니다', '첫째 해는 년지 오와 일지 축 사이의 해입니다 (근거: 해 오·축 [년·일주 사이]).', 'AUTUMN'],
    ['앵커 없는 파', '년지 오와 시지 묘 사이의 파가 있습니다 (근거: 파 오·묘).', 'AUTUMN'],
    ['앵커 없는 반합 · 성립', '월지 유와 일지 축의 반합이 성립되어 있습니다 (근거: 반합 유·축).', 'AUTUMN'],
    // ── 부정 진술 (관계가 없다는 말은 맞는 문장이다)
    ['부정 · 충', '년지 오와 일지 축 사이에 충(沖)은 없습니다.', 'AUTUMN'],
    ['부정 · 삼합', '이 명식에는 년지 오와 시지 묘의 삼합(三合)이 없습니다.', 'AUTUMN'],
    ['부정 · 앵커 없음', '월지 유와 일지 축 사이에는 형이 없습니다.', 'AUTUMN'],
    ['부정 · 열거', '위에 적힌 것 말고 다른 충·형·합 등은 이 명식에 없습니다 (근거: 글자 관계 목록).', 'AUTUMN'],
    ['부정 · 천간합', '년간 무와 월간 신 사이에 천간합이 없습니다.', 'AUTUMN'],
    // ── 개념 정의 (참여 글자를 지목하지 않음)
    ['정의 · 해', '해(害)는 두 지지가 서로의 합을 방해하는 관계입니다.', 'AUTUMN'],
    ['정의 · 충', '충(沖)은 두 지지가 정면으로 부딪히는 관계를 말합니다.', 'AUTUMN'],
    ['정의 · 반합', '반합(半合)은 삼합 세 글자 중 둘만 모인 상태를 가리킵니다.', 'AUTUMN'],
    ['정의 · 열거', '글자 관계 풀이: 해·충·합 등은 관계의 이름이며 참여 글자와 함께 읽습니다.', 'AUTUMN'],
    ['정의 · 천간합', '천간합은 두 천간이 짝을 이루는 관계라는 뜻입니다.', 'EXACT'],
    // ── ⚠⚠ 해(害)의 **뜻 문장 안에 든 "합"** — 실측 5건. v7 의 최대 함정이다.
    //    엔진이 주는 해의 meaning 이 "두 지지가 서로의 합을 방해하는 관계" 라서 매 글마다 나온다.
    ['합을 방해 ①', '년지 오와 일지 축 사이에 해(害)가 있어 서로의 합을 방해하는 자리입니다 (근거: 해 오·축).', 'AUTUMN'],
    ['합을 방해 ②', '이 두 해 관계는 오와 축이 서로의 합을 방해하는 구조임을 보여 줍니다 (근거: 해의 뜻).', 'AUTUMN'],
    ['합을 방해 ③', '따라서 년지의 오와 일주의 축이 서로의 합을 방해하는 구조입니다 (근거: 해 오·축 [년·일주]).', 'AUTUMN'],
    // ── ⚠ 관계 이름이 **일상어**로 쓰인 문장. 한자 앵커가 도입된 원래 이유가 이것이다.
    ['일상어 · 해석', '년지 오와 일지 축을 해석하면 두 지지의 자리 관계가 보입니다.', 'AUTUMN'],
    ['일상어 · 파악', '월지 유와 시지 묘를 파악할 때는 계절 먼저 봅니다.', 'AUTUMN'],
    ['일상어 · 충분', '년지 오와 일지 축의 뿌리가 충분히 단단합니다.', 'AUTUMN'],
    ['일상어 · 종합', '월지 유와 일지 축을 종합하면 금 기운이 두텁습니다.', 'AUTUMN'],
    ['일상어 · 합계', '년지 오와 시지 묘의 합계는 두 글자입니다.', 'AUTUMN'],
    ['일상어 · 형태', '월지 유와 일지 축이 이루는 형태가 눈에 띕니다.', 'AUTUMN'],
    ['일상어 · 해당', '년지 오와 일지 축의 관계는 이 명식을 이해하는 데 해당합니다.', 'AUTUMN'],
    ['일상어 · 조합', '월지 유와 시지 묘를 조합해 읽으면 방향이 보입니다.', 'AUTUMN'],
    ['일상어 · 결합', '년지 오와 일지 축에서 결합이 일어나는지 살핍니다.', 'AUTUMN'],
    ['일상어 · 변형', '월지 유와 일지 축의 짜임이 변형이 되는 자리인지 봅니다.', 'AUTUMN'],
    ['일상어 · 분해', '년지 오와 시지 묘가 분해하면 각각 화와 목입니다.', 'AUTUMN'],
    ['일상어 · 통합', '월지 유와 일지 축을 통합적으로 보면 금의 방향입니다.', 'AUTUMN'],
    // ── 읽는 법 / 절차 (프롬프트가 요구하는 형태)
    ['절차 ①', '년지 오와 일지 축처럼 참여 글자를 함께 적는 습관을 들이십시오.', 'AUTUMN'],
    ['절차 ②', '다른 명식에서도 년지 오와 시지 묘처럼 어느 글자 사이인지를 먼저 확인하십시오.', 'AUTUMN'],
    ['절차 ③', '월지 유와 일지 축의 관계를 볼 때는 국 오행까지 함께 읽습니다.', 'AUTUMN'],
  ])('%s — 통과한다', (_label, sentence, chartKey) => {
    const chart = chartKey === 'EXACT' ? EXACT : AUTUMN;
    expect(unverifiedRelationClaims(rel(sentence), chart)).toEqual([]);
  });
});

describe('⚠ v7 합성 반례 — 틀린 문장 (전부 잡힌다)', () => {
  it.each([
    // ── ① 근거 괄호가 구제하던 형태 (v6 실측)
    ['⚠ 실측 v6 ① — 근거 구제', '년간 경과 월간 임 사이에 천간합(合)이 있습니다 (근거: 천간합 임·정 [월·일주 사이]).', 'EXACT'],
    ['근거만 맞음 · 육합', '일간 정과 시간 정 사이에 육합(六合)이 있습니다 (근거: 육합 오·미 [년·시주 사이]).', 'EXACT'],
    ['근거만 맞음 · 방합', '년지 오와 월지 오 사이에 방합(方合)이 있습니다 (근거: 방합 사·오·미).', 'EXACT'],
    // ── ② 한자 앵커가 없어 검사조차 안 되던 형태 (v6 실측)
    ['⚠ 실측 v6 ① — 앵커 없음', '년간 경과 시간 정 사이에도 천간합이 형성되어 있습니다 (근거: 천간합 임·정 [월·시주 사이]).', 'EXACT'],
    ['앵커 없음 + 글자 틀림 · 육합', '년지 오와 일지 사의 육합이 있습니다 (근거: 육합 오·미).', 'EXACT'],
    ['앵커 없음 + 글자 틀림 · 충', '월지 유와 일지 오 사이의 충이 형성되어 있습니다 (근거: 충 유·묘).', 'AUTUMN'],
    ['앵커 없음 + 글자 틀림 · 파', '년지 오와 시지 축 사이의 파입니다 (근거: 파 오·묘).', 'AUTUMN'],
    ['앵커 없음 + 없는 관계', '년간 무와 월간 신의 천간합이 있습니다 (근거: 천간합).', 'AUTUMN'],
    // ── 관계 이름은 맞고 글자가 틀림
    ['글자 틀림 · 육합', '년지 오와 일지 사 사이에 육합(六合)이 있습니다 (근거: 육합 오·미).', 'EXACT'],
    ['글자 틀림 · 해', '년지 오와 시지 묘 사이에 해(害)가 있습니다 (근거: 해 오·축).', 'AUTUMN'],
    ['글자 틀림 · 충', '월지 유와 일지 오 사이에 충(沖)이 있습니다 (근거: 충 유·묘).', 'AUTUMN'],
    // ── 글자는 맞고 관계 이름이 틀림
    ['반합↔삼합', '월지 유와 일지 축 사이에 삼합(三合)이 있습니다 (근거: 반합 유·축).', 'AUTUMN'],
    ['방합↔삼합', '사·오·미가 모여 삼합(三合)을 이룹니다 (근거: 방합 사·오·미).', 'EXACT'],
    ['파↔충', '년지 오와 시지 묘 사이에 충(沖)이 있습니다 (근거: 파 오·묘).', 'AUTUMN'],
    ['해↔파', '년지 오와 일지 축 사이에 파(破)가 있습니다 (근거: 해 오·축).', 'AUTUMN'],
    ['반합↔육합', '월지 유와 일지 축의 육합(六合)이 있습니다 (근거: 반합 유·축).', 'AUTUMN'],
    // ── 엔진이 판정하지 않은 관계
    ['없는 관계 · 삼형', '년지 오와 일지 축 사이에 삼형(三刑)이 있습니다.', 'AUTUMN'],
    ['없는 관계 · 방합', '월지 유와 시지 묘 사이에 방합(方合)이 있습니다.', 'AUTUMN'],
    ['없는 관계 · 충', '년지 오와 월지 오 사이에 충(沖)이 있습니다.', 'EXACT'],
    ['없는 관계 · 천간충', '월간 임과 일간 정 사이에 천간충(沖)이 있습니다.', 'EXACT'],
  ])('%s — 잡힌다', (_label, sentence, chartKey) => {
    const chart = chartKey === 'EXACT' ? EXACT : AUTUMN;
    expect(unverifiedRelationClaims(rel(sentence), chart).length).toBeGreaterThan(0);
  });
});

describe('⚠ v7 — 근거 괄호는 판정에 쓰지 않는다', () => {
  it('본문이 맞으면 근거가 없어도 통과한다', () => {
    expect(unverifiedRelationClaims(rel('월간 임과 일간 정 사이에 천간합(合)이 있습니다.'), EXACT)).toEqual([]);
  });

  it('⚠ 본문이 틀리면 근거가 맞아도 잡힌다 — 독자는 본문을 읽는다', () => {
    const bad = unverifiedRelationClaims(
      rel('년간 경과 월간 임 사이에 천간합(合)이 있습니다 (근거: 천간합 임·정 [월·일주 사이]).'),
      EXACT,
    );
    expect(bad).toHaveLength(1);
    expect(bad[0].anchor).toBe('합');
  });

  it('근거 괄호 안의 글자만으로는 대조가 성립하지 않는다', () => {
    // 본문에 글자가 하나도 없으면 정의문으로 보고 넘긴다 — 근거로 끌어와 통과시키지 않는다.
    const claims = checkRelationClaims(rel('두 자리 사이에 육합(六合)이 있습니다 (근거: 육합 오·미).'), EXACT);
    expect(claims).toEqual([]);
  });
});

describe('⚠ v7 — 분모를 함께 낸다', () => {
  // "관계 9/9" 라고 보고했는데 그 분모가 **검사된 것**이었다. 검사에서 빠진 문장은 세지도 않았다.
  // 두 수가 다르면 검사가 못 본 문장이 있다는 뜻이다.
  it('관계를 주장한 문장 수와 실제 대조된 수를 따로 센다', () => {
    const md = rel(
      '월간 임과 일간 정 사이에 천간합(合)이 있습니다. '
      + '년지 오와 월지 오 사이에 자형(自刑)이 있습니다. '
      + '년지 오와 시지 미 사이에 육합이 있습니다.',
    );
    expect(relationMentionCount(md)).toBe(3);
    expect(checkRelationClaims(md, EXACT)).toHaveLength(3);
  });

  it('정의문·부정문은 분모에도 들어가지 않는다', () => {
    const md = rel('해(害)는 두 지지가 서로의 합을 방해하는 관계입니다. 년지 오와 일지 축 사이에 충(沖)은 없습니다.');
    expect(relationMentionCount(md)).toBe(0);
  });
});

describe('⚠ v7 이 **못 잡는 것** — 알고 넣는다 (세 번째 구멍)', () => {
  // 참여 글자 대조는 `members.every((m) => body.includes(m))` 다. 관계의 참여 글자가 **같은 글자
  // 둘**(자형 오·오)이면, 본문이 엉뚱한 두 번째 글자를 대도 첫 글자만 있으면 통과한다 —
  // 이 대조는 **빠진 글자**는 잡지만 **여분으로 붙은 틀린 글자**는 못 본다.
  //
  // ⚠ 넓히지 않은 이유: 잡으려면 "자리+글자 쌍이 전부 참여 글자여야 한다" 는 규칙이 필요한데,
  //   그러면 `년지 오와 월지 오의 자형(自刑)은 일지 사와는 무관합니다` 처럼 **한 문장에서 다른
  //   자리를 함께 언급하는 정상 문장**이 죽는다. 이 프로젝트는 거짓 양성이 **누적 25건**이고
  //   전부 정상 본문을 거절했다. 못 잡는 값이 정상 문장을 버리는 값보다 싸다.
  //
  // ⚠ 이 테스트를 "고치려고" 규칙을 넓히지 말 것. 넓힐 때는 위 정상 43개를 **반드시** 다시 돌린다.
  it('자기관계(오·오)에서 두 번째 글자가 틀려도 통과한다 — 측정된 천장', () => {
    expect(
      unverifiedRelationClaims(rel('월지 오와 시지 축의 자형(自刑)이 있습니다 (근거: 자형 오·오).'), EXACT),
    ).toEqual([]);
  });
});
