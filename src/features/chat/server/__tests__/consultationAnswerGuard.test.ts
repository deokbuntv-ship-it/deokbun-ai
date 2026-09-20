// 상담 답변 검사기 + 되묻기 생성기 — 합성 반례 (2026-09-19, PART 2-5).
// 항목마다 **걸려야 할 것**과 **통과해야 할 것**을 각각 둔다. 검사기 자신을 먼저 검증한다.
import {
  checkAnswer, axesTouched, splitSentences, MAX_ANSWER_ATTEMPTS,
} from '@/features/chat/server/consultationAnswerGuard';
import { pickAskBack, allAskBacks } from '@/features/chat/server/askBackPrompts';

/**
 * 모든 규칙을 통과하는 본문. PART 2-2 의 구조를 그대로 따른다:
 *   성향 → 이번 시기 → 어떻게 → 되묻기
 * 길이를 200자 위로 맞춰 두었으므로, 개별 항목을 깨뜨릴 때 이 문장을 고쳐 쓴다.
 */
const GOOD = [
  '버티면서 중심을 잡는 편이에요.',
  '이번 달은 맡은 자리에서 누가 어디까지 하는지가 흐릿해지는 때라, 평소보다 부딪히는 일이 늘어요.',
  '그럴 땐 참지 마시고 그 자리에서 한 번 짚고 넘어가는 게 나아요.',
  '괜히 담아 두면 다음 달까지 끌고 가게 되거든요.',
  '말을 세게 할 필요는 없고, 어디까지가 내 몫인지만 분명히 해 두면 돼요.',
  '그러면 같은 일로 또 부딪히는 횟수가 줄어들어요. 이런 흐름에서는 그게 제일 잘 통해요.',
  '혹시 요즘 누가 자꾸 걸리세요?',
].join(' ');

describe('통과 기준점 — 규칙을 다 지킨 답은 통과해야 한다', () => {
  it('GOOD 본문은 전 항목을 통과한다', () => {
    const r = checkAnswer(GOOD);
    expect(r.failures).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.askBack).toBe('혹시 요즘 누가 자꾸 걸리세요?');
  });
});

describe('길이', () => {
  it('⚠ 짧으면 걸린다', () => {
    expect(checkAnswer('버티는 편이에요. 이번 달은 그래요. 혹시 요즘 누가 걸리세요?').failures.some((f) => f.key === '길이')).toBe(true);
  });
  it('⚠ 길면 걸린다', () => {
    expect(checkAnswer(GOOD + ' ' + '같은 흐름이 이어지는 편이에요.'.repeat(20)).failures.some((f) => f.key === '길이')).toBe(true);
  });
});

describe('편안함 — 조심·확인 요구', () => {
  it('⚠ 두 문장 이상이면 걸린다', () => {
    const bad = GOOD.replace('괜히 담아 두면 다음 달까지 끌고 가게 되거든요.', '한 번 더 확인하고 넘어가시면 돼요. 조건도 점검해 두시면 돼요.');
    expect(checkAnswer(bad).failures.some((f) => f.key === '조심과다')).toBe(true);
  });
  it('⚠ 반례 — 한 문장이면 통과한다', () => {
    expect(checkAnswer(GOOD).failures.some((f) => f.key === '조심과다')).toBe(false);
  });
});

describe('말투', () => {
  it('⚠ 보고서 말투를 잡는다', () => {
    const bad = GOOD.replace('이런 흐름에서는 그게 제일 잘 통해요.', '그게 유리합니다.');
    const f = checkAnswer(bad).failures.map((x) => x.key);
    expect(f).toContain('보고서말투');
    expect(f).toContain('합쇼체');
  });
  it('⚠ 반례 — ~해요체는 잡지 않는다', () => {
    const f = checkAnswer(GOOD).failures.map((x) => x.key);
    expect(f).not.toContain('보고서말투');
    expect(f).not.toContain('합쇼체');
    expect(f).not.toContain('해요체부족');
  });
});

describe('되묻기', () => {
  it('⚠ 없으면 걸린다', () => {
    expect(checkAnswer(GOOD.replace('혹시 요즘 누가 자꾸 걸리세요?', '편하게 지내시면 돼요.')).failures.some((f) => f.key === '되묻기수')).toBe(true);
  });
  it('⚠ 두 개면 걸린다', () => {
    expect(checkAnswer(GOOD + ' 언제부터 그러셨어요?').failures.some((f) => f.key === '되묻기수')).toBe(true);
  });
  it('⚠ 마지막이 아니면 걸린다', () => {
    expect(checkAnswer(GOOD + ' 그렇게 보시면 돼요.').failures.some((f) => f.key === '되묻기위치')).toBe(true);
  });
});

describe('성향 한 조각 — 사람 설명이어야 한다', () => {
  it('⚠ 없으면 걸린다', () => {
    const bad = GOOD.replace('버티면서 중심을 잡는 편이에요.', '이번 달 흐름을 보겠어요.');
    expect(checkAnswer(bad).failures.some((f) => f.key === '성향없음')).toBe(true);
  });
  it('⚠ 결과 예측이 섞이면 걸린다 (앞에 나서면 성공합니다)', () => {
    const bad = GOOD.replace('버티면서 중심을 잡는 편이에요.', '버티는 편이라 이번에 승진합니다.');
    const f = checkAnswer(bad).failures.map((x) => x.key);
    expect(f).toContain('성향아닌예측');
  });
  it('⚠ 반례 — 사람 설명만 있으면 통과한다', () => {
    expect(checkAnswer(GOOD).failures.some((f) => f.key.startsWith('성향'))).toBe(false);
  });
});

describe('시기 한 조각 — 월 단위까지만 요구한다', () => {
  it('⚠ 없으면 걸린다', () => {
    const bad = GOOD.replace('이번 달은', '요 며칠은').replace('다음 달까지', '나중까지').replace('이런 흐름에서는', '그 흐름에서는');
    expect(checkAnswer(bad).failures.some((f) => f.key === '시기없음')).toBe(true);
  });
  it('⚠ 반례 — "이번 달"이면 통과한다 (일진이 없으므로 "중순"은 요구하지 않는다)', () => {
    expect(checkAnswer(GOOD).failures.some((f) => f.key === '시기없음')).toBe(false);
  });
});

describe('짚는 대상 1개', () => {
  it('⚠ 두 영역이면 걸린다', () => {
    const bad = GOOD.replace('평소보다 부딪히는 일이 늘어요.', '직장도 사람 관계도 함께 흔들려요.');
    expect(checkAnswer(bad).failures.some((f) => f.key === '축둘이상')).toBe(true);
  });
  it('⚠ 반례 — 애매한 말은 세지 않는다', () => {
    expect(axesTouched('크게 벌이기보다 정돈하세요.')).toEqual([]);
    expect(axesTouched('경쟁 관계에서 역할 다툼이 생깁니다.')).toEqual([]);
  });
});

describe('새로 넣은 세 항목', () => {
  it('⚠ 쉼표 이어붙임을 잡는다 (E안 2차에서 세 답 모두에 있던 버릇)', () => {
    const bad = GOOD.replace('버티면서 중심을 잡는 편이에요.', '버티면서 중심을 잡는 편이에요, 그래서 이번 달이 그래요.');
    expect(checkAnswer(bad).failures.some((f) => f.key === '쉼표이어붙임')).toBe(true);
  });
  it('⚠ 전문 용어를 본문에 드러내면 잡는다', () => {
    const bad = GOOD.replace('이번 달은', '사주 근거로는 이번 달은');
    expect(checkAnswer(bad).failures.some((f) => f.key === '전문용어노출')).toBe(true);
  });
  it('⚠ "일 운"을 하루로 읽으면 잡는다', () => {
    const bad = GOOD.replace('맡은 자리에서', '일상에서');
    expect(checkAnswer(bad).failures.some((f) => f.key === '오독')).toBe(true);
  });
});

describe('기존 검사 유지', () => {
  it('⚠ 금지표현·톤을 잡는다', () => {
    expect(checkAnswer(GOOD.replace('이런 흐름에서는 그게 제일 잘 통해요.', '세 학문이 모두 일치해요.')).failures.some((f) => f.key === '금지표현')).toBe(true);
    expect(checkAnswer(GOOD.replace('이런 흐름에서는 그게 제일 잘 통해요.', '반드시 그렇게 돼요.')).failures.some((f) => f.key === '톤')).toBe(true);
  });
  it('⚠ 반례 — 적합도 평가는 단정으로 세지 않는다', () => {
    expect(checkAnswer(GOOD).failures.some((f) => f.key === '톤')).toBe(false);
  });
});

describe('되묻기 생성기 — 서버가 만든다 (PART 2-4)', () => {
  it('⚠ 후보 전부가 검사기의 되묻기 조건을 통과한다', () => {
    for (const q of allAskBacks()) {
      expect(q.endsWith('?')).toBe(true);
      expect(q.length).toBeLessThanOrEqual(32);
      expect(q).not.toMatch(/인가요\?|입니까\?/); // 사무적 종결 금지
      expect(q).toMatch(/(누가|누구|어떤|무슨|무엇|어디|언제|요즘|최근|지금)/); // 사람·때·일을 구체적으로 묻는다
      expect(q).not.toMatch(/(정리|상황|영역|측면|사항|계획|여부|방향|조정|점검)/); // 개념어 금지
    }
  });

  it('같은 대화·같은 영역이면 같은 되묻기가 나온다 (결정론)', () => {
    const a = pickAskBack({ domain: 'WORK', seed: 'conv-1' });
    for (let i = 0; i < 20; i += 1) expect(pickAskBack({ domain: 'WORK', seed: 'conv-1' })).toBe(a);
  });

  it('⚠ 직전에 쓴 되묻기는 피한다', () => {
    const first = pickAskBack({ domain: 'RELATION', seed: 'c' });
    const second = pickAskBack({ domain: 'RELATION', seed: 'c', previous: first });
    expect(second).not.toBe(first);
  });

  it('영역마다 다른 후보를 쓴다', () => {
    expect(pickAskBack({ domain: 'WORK', seed: 'x' })).not.toBe(pickAskBack({ domain: 'RELATION', seed: 'x' }));
  });

  it('모르는 영역은 일반 후보로 떨어진다', () => {
    expect(allAskBacks()).toContain(pickAskBack({ domain: 'GENERAL', seed: null }));
  });
});

describe('보조', () => {
  it('모델 시도는 2회다 = 첫 시도 + 재생성 1회 (CTO 판정 2026-09-19 · 비용 최대 2배)', () => {
    expect(MAX_ANSWER_ATTEMPTS).toBe(2);
  });
  it('문장 나누기', () => {
    expect(splitSentences('가. 나? 다!')).toEqual(['가.', '나?', '다!']);
  });
});
