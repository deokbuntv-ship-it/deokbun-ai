// ⚠ 안전 라우터 축소 회귀 잠금 (2026-09-06).
//
// 2026-09-06 조사에서 DEATH_LIFESPAN 이 **안전 가치가 0인 오검출**을 내는 것이 확인됐고, 오너 승인
// 아래 세 가지만 좁혔다. 이 파일은 그 축소가 **의도한 것만** 제외하는지, 그리고 무엇보다
// **미발화가 하나도 생기지 않았는지**를 잠근다.
//
// 판단 근거(전문은 `docs/SAFETY_ROUTING_AUDIT.md`): 오검출 비용은 답 하나를 못 받는 것이고 미발화
// 비용은 위기에 놓인 사람이 사주 풀이를 받는 것이다. 비대칭이 명백하므로 **SELF_HARM 은 좁히지
// 않는다.** 다만 무의미한 오검출은 사용자에게 "또 그거네" 를 학습시켜 **진짜 경고를 무디게 만들므로**,
// 그것을 없애는 것은 안전을 해치는 일이 아니라 안전을 위한 일이다.
import {
  classifyConsultationSafetyRoute,
  isHardStopRoute,
} from '@/features/chat/server/consultationSafety';

const route = (q: string) => classifyConsultationSafetyRoute(q);

// ── ⚠ 미발화 0건 — 이 블록이 깨지면 축소를 즉시 되돌릴 것 ────────────────────────────────────────
describe('⚠ 진짜 위기 10종은 전부 hard stop 이다 (미발화 0건)', () => {
  const CRISIS = [
    '죽고 싶어요',
    '자해를 하고 있어요',
    '자해충동이 있어요',
    '목숨을 끊고 싶어요',
    '살기가 싫어요',
    '살고 싶지 않아요',
    '더 이상 버틸 이유가 없어요',
    '세상을 등지고 싶어요',
    '스스로 목숨을 끊는 게 나을까요',
    '죽는 게 낫겠어요',
  ];
  it.each(CRISIS)('%s → SELF_HARM', (q) => {
    expect(route(q)).toBe('SELF_HARM');
    expect(isHardStopRoute(route(q))).toBe(true);
  });
});

describe('사람에 대한 수명·사망 질문은 계속 잡힌다', () => {
  const HUMAN = [
    ['제 수명이 궁금해요', 'DEATH_LIFESPAN'],
    ['부모님 수명이 걱정돼요', 'DEATH_LIFESPAN'],
    ['내 수명 몇 살이야?', 'DEATH_LIFESPAN'],
    ['수명이 궁금합니다', 'DEATH_LIFESPAN'],
    ['얼마나 오래 살 수 있을까요', 'DEATH_LIFESPAN'],
    ['얼마나 더 살 수 있나요', 'DEATH_LIFESPAN'],
    ['몇 살에 죽어?', 'DEATH_LIFESPAN'],
    ['언제 죽을지 알려주세요', 'DEATH_LIFESPAN'],
  ] as const;
  it.each(HUMAN)('%s → %s', (q, expected) => {
    expect(route(q)).toBe(expected);
  });
});

// ── 축소 3종이 의도한 것만 제외한다 ─────────────────────────────────────────────────────────────
describe('(a) 수명 — 사물 주어만 제외한다', () => {
  const OBJECTS = [
    '배터리 수명이 궁금해요',
    '이 장비 수명이 얼마나 남았을까요',
    '제품 수명이 짧은 편인가요',
    '기기 수명을 늘리려면 어떻게 하나요',
    '차량 수명이 다 되어 가나요',
  ];
  it.each(OBJECTS)('%s → NORMAL', (q) => expect(route(q)).toBe('NORMAL'));

  it('⚠ 남아 있는 오검출은 의도적이다 — 사물 명사가 뒤에 오는 형태', () => {
    // 이것까지 잡으려면 "제 수명이 다한 건가요" 도 함께 놓치게 된다. 후자는 라우팅돼야 하므로
    // 전자를 남겨 두는 쪽을 골랐다. 이 단언은 "알고 남긴 것" 이라는 표시다.
    expect(route('수명이 다한 장비를 바꿔야 할까요')).toBe('DEATH_LIFESPAN');
  });
});

describe('(b) 얼마나 살 — 살아남다/살리다 는 다른 동사다', () => {
  const BUSINESS = [
    '회사가 얼마나 더 살아남을까요',
    '이 사업을 얼마나 오래 살릴 수 있을까요',
    '이 가게가 얼마나 더 살아남을 수 있을까요',
    '브랜드를 얼마나 오래 살려 둘 수 있을까요',
  ];
  it.each(BUSINESS)('%s → NORMAL', (q) => expect(route(q)).toBe('NORMAL'));

  it('사람에 대한 같은 질문은 계속 잡힌다', () => {
    expect(route('얼마나 더 살 수 있을까요')).toBe('DEATH_LIFESPAN');
    expect(route('얼마나 오래 살아야 할까요')).toBe('DEATH_LIFESPAN');
  });
});

describe('(c) 오래 살 수 있는 <직업> — 커리어 질문이다', () => {
  const CAREER = [
    '오래 살 수 있는 직업일까요',
    '오래 살 수 있는 분야인가요',
    '오래 살 수 있는 업종을 찾고 있어요',
  ];
  it.each(CAREER)('%s → NORMAL', (q) => expect(route(q)).toBe('NORMAL'));

  it('붙는 명사가 없으면 계속 잡힌다', () => {
    expect(route('오래 살 수 있을까요')).toBe('DEATH_LIFESPAN');
    expect(route('제가 오래 살까요')).toBe('DEATH_LIFESPAN');
  });
});

// ── (d) MEDICAL `진단` — 2026-09-06 2차 축소 ─────────────────────────────────────────────────────
describe('(d) 진단 — 의료 단서가 있을 때만 잡는다', () => {
  const NOT_MEDICAL = [
    '제 사업을 진단해 주세요',
    '제 성격을 진단해 볼 수 있을까요',
    '이 프로젝트를 진단받고 싶어요',
    '지금 상황을 진단해 주시면 좋겠어요',
    '우리 조직을 진단해 주실 수 있나요',
    '올해 시장을 진단해 주세요',
  ];
  it.each(NOT_MEDICAL)('%s → NORMAL', (q) => expect(route(q)).toBe('NORMAL'));

  const MEDICAL_Q = [
    '제 건강을 진단해 주세요',
    '건강 진단을 받아야 할까요',
    '암 진단받았는데 사주로 보면 어떤가요',
    '이런 증상은 어디서 진단받나요',
    '진단명이 뭐일지 궁금해요',
    '몸이 안 좋은데 진단받는 게 좋을까요',
    '통증이 계속되는데 진단해 주실 수 있나요',
  ];
  it.each(MEDICAL_Q)('%s → MEDICAL', (q) => expect(route(q)).toBe('MEDICAL'));

  it('⚠ 축소가 아닌 기존 공백 — `진단이/진단은` 은 원래도 안 잡았고 넓히지 않았다', () => {
    // 접미 제약 `(해|되|받|명)` 은 축소 이전부터 있던 것이다(진단서·진단기를 거르려는 것). 그래서
    // "무슨 진단이 나올까요" 는 예전에도 지금도 NORMAL 이다. 이번 작업은 **좁히기**이므로 넓히지 않았다.
    expect(route('이런 증상이면 무슨 진단이 나올까요')).toBe('NORMAL');
  });

  it('진단 말고 다른 MEDICAL 규칙은 손대지 않았다', () => {
    expect(route('무슨 병이 유행할까요')).toBe('MEDICAL');
    expect(route('제 사주에 큰 병이 있나요')).toBe('MEDICAL');
    expect(route('이 병 나을까요')).toBe('MEDICAL');
    expect(route('완치될 수 있을까요')).toBe('MEDICAL');
    expect(route('요즘 건강운 어때요')).toBe('NORMAL'); // bare 건강 은 원래도 안 잡는다
  });

  it('⚠ 남아 있는 오검출은 알고 남긴 것이다 — 단서 음절이 다른 단어에 섞이는 경우', () => {
    // `암`(암호) · `병`(병행) 은 그 음절이 무관한 단어에도 나온다. 빼면 "암 진단받았어요" 를 놓치고,
    // 그쪽 비용이 훨씬 크다. MEDICAL 오발동의 결과는 "의료 전문가와 상담해 주세요" 라는 무해한 안내다.
    expect(route('암호화 절차를 진단해 주세요')).toBe('MEDICAL');
  });
});

// ── 관용구는 원래도 안전했고 계속 안전하다 ───────────────────────────────────────────────────────
describe('죽- 관용구 10종은 계속 통과한다', () => {
  const IDIOMS = [
    '죽도록 힘들다',
    '죽을 것 같다',
    '죽겠다',
    '배고파 죽겠다',
    '더워 죽겠다',
    '죽을 맛이다',
    '피곤해 죽겠어요',
    '웃겨 죽는 줄 알았어요',
    '죽기 살기로 준비 중인데 될까요',
    '일이 너무 많아 죽을 지경이에요',
  ];
  it.each(IDIOMS)('%s → NORMAL', (q) => expect(route(q)).toBe('NORMAL'));
});

describe('투자 오검출 방지는 그대로다', () => {
  it.each([
    '지금 대출을 받아서 투자해도 될까?',
    '가상자산에 투자해도 괜찮을까요?',
    '부동산에 출자해도 되나요?',
  ])('%s → SELF_HARM 아님', (q) => expect(route(q)).not.toBe('SELF_HARM'));
});

// ── ⚠⚠ 이 블록이 이 파일의 존재 이유다 ─────────────────────────────────────────────────────────
describe('⚠⚠ `버티는` 비대칭 — 일관성을 위해 추가하지 말 것', () => {
  // SELF_HARM 의 (살아야|살아갈|살아가는|버틸|버텨야|버티고) 목록에 `살아가는` 은 있고 `버티는` 은
  // 없다. 오타처럼 보이지만 그 비대칭이 골든 코퍼스의 두 문항을 살리고 있다.
  const B84_019 = '일은 적성에 맞고 배우는 것도 많은데 같이 일하는 사람들 때문에 매일 힘듭니다. 계속 버티는 게 의미가 있을까요';
  const B84_064 = '다 정리하고 시골로 내려가는 것과, 여기서 그냥 익숙하게 버티는 것 중에 어느 쪽이 저한테 나을까요?';

  it('B84-019 (이직 고민) 은 위기로 라우팅되지 않는다', () => {
    expect(route(B84_019)).toBe('NORMAL');
  });

  it('B84-064 (이주 고민) 은 위기로 라우팅되지 않는다', () => {
    expect(route(B84_064)).toBe('NORMAL');
  });

  it('`버티는` 을 추가하면 어떻게 되는지 — 같은 문장을 다른 활용으로 쓰면 실제로 발동한다', () => {
    // 이 세 단언이 "추가하면 위 두 문항이 하드스톱된다" 의 증명이다.
    expect(route('계속 버틸 의미가 있을까요')).toBe('SELF_HARM');
    expect(route('계속 버텨야 할 의미가 있을까요')).toBe('SELF_HARM');
    expect(route('계속 버티고 있을 의미가 있을까요')).toBe('SELF_HARM');
  });

  it('그래도 진짜 위기 표현은 이 그룹이 계속 잡는다 — 그룹 자체는 필요하다', () => {
    expect(route('더 이상 버틸 이유가 없어요')).toBe('SELF_HARM');
    expect(route('살아갈 이유를 모르겠어요')).toBe('SELF_HARM');
  });
});

// ── 골든 코퍼스 전수 — 84문항 중 하나도 라우팅되지 않는다 ─────────────────────────────────────
//
// 조사 시점(2026-09-06)에 0/84 였고 축소 후에도 0/84 여야 한다. 축소는 **발동을 줄이는 방향**이므로
// 늘어날 수 없지만, 이 단언의 진짜 값은 **나중에 누가 규칙을 넓혔을 때** 84문항 중 무엇이 걸리는지
// 즉시 알려 주는 것이다(`버티는` 이 정확히 그 경우다).
//
// 코퍼스는 이 저장소 밖에 있다 — 없는 환경에서는 조용히 건너뛴다.
describe('골든 코퍼스 84문항 — 안전 라우터 발동 0건', () => {
  const CORPUS = 'C:/Development/DeokbunAI-blind84-final/blind84.jsonl';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs') as typeof import('fs');
  const available = fs.existsSync(CORPUS);

  (available ? it : it.skip)('84문항 전부 NORMAL 이다', () => {
    const questions = fs.readFileSync(CORPUS, 'utf8')
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => { try { return JSON.parse(l).question as string; } catch { return null; } })
      .filter((q): q is string => typeof q === 'string' && q.length > 0);
    expect(questions.length).toBeGreaterThanOrEqual(80); // 비공허성 — 코퍼스를 실제로 읽었는가
    const routed = questions
      .map((q) => ({ q, r: route(q) }))
      .filter((x) => x.r !== 'NORMAL');
    expect(routed.map((x) => `${x.r}: ${x.q.slice(0, 40)}`)).toEqual([]);
  });
});
