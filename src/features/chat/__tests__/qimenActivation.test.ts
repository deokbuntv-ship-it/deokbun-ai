// Qimen activation — deterministic timing/decision vs natal classification (directive §2/§15) +
// question instant (Asia/Seoul). Rule-based, never LLM-decided; a domain noun alone ("투자 성향은?")
// must NOT activate Qimen.
import {
  classifyTimingQuestion,
  epochToSeoulQueryTime,
  resolveQimenActivation,
} from '@/features/chat/selectors/qimenActivation';

describe('classifyTimingQuestion — APPLICABLE (timing/decision/choice/action/flow)', () => {
  it.each([
    '이 사업 시작해도 될까?',
    '지금 투자해도 될까?',
    '이번 계약 괜찮을까?',
    '이직하는 게 좋을까?',
    '지금 움직이는 게 좋을까?',
    '이번 달에 계약하면 어떨까?',
    '상대에게 연락해도 될까?',
    '언제 움직이는 게 좋을까?',
    'A와 B 중 어느 쪽이 유리할까?',
    '현재 상황이 어떻게 흘러갈까?',
  ])('"%s" → timing', (q) => expect(classifyTimingQuestion(q)).toBe(true));
});

describe('classifyTimingQuestion — NOT applicable (natal)', () => {
  it.each([
    '내 성격은 어떤 편이야?',
    '내 타고난 재물운은?',
    '내 직업 성향은 어때?',
    '내 배우자운은?',
    '내 사주 구조는?',
    '투자 성향은 어떤가요?', // domain noun but a NATAL disposition question → not timing
  ])('"%s" → natal', (q) => expect(classifyTimingQuestion(q)).toBe(false));

  it('empty/whitespace → not timing', () => {
    expect(classifyTimingQuestion('   ')).toBe(false);
    expect(classifyTimingQuestion('')).toBe(false);
  });
});

describe('epochToSeoulQueryTime (UTC+9 fixed, V1 Korea policy)', () => {
  it('UTC instant → Asia/Seoul civil wall-clock', () => {
    // 2024-01-15 01:00 UTC = 2024-01-15 10:00 KST
    expect(epochToSeoulQueryTime(Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000))).toEqual({
      year: 2024, month: 1, day: 15, hour: 10,
    });
  });
  it('day rollover across the +9 offset', () => {
    // 2024-01-15 20:00 UTC = 2024-01-16 05:00 KST
    expect(epochToSeoulQueryTime(Math.floor(Date.UTC(2024, 0, 15, 20, 0, 0) / 1000))).toEqual({
      year: 2024, month: 1, day: 16, hour: 5,
    });
  });
});

describe('resolveQimenActivation — fresh per question (§18)', () => {
  const now = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
  it('timing question → questionTime at the given instant, in the PROVIDER\'s time basis', () => {
    const q = resolveQimenActivation('지금 이 계약을 해도 될까?', now);
    expect(q.isTimingQuestion).toBe(true);
    // V3 §24 — 10:00 KST is 09:00 CST. lunar-javascript / qimen-dunjia derive 절기 and 시진 from CST wall
    // time, so the query must be CST. Passing Seoul wall time (hour 10) shifted every board by one hour and
    // could land the wrong 시진 — and, at a term boundary, the wrong 국 entirely.
    expect(q.questionTime).toEqual({ year: 2024, month: 1, day: 15, hour: 9 });
  });
  it('natal question → NO questionTime (never fabricated)', () => {
    const q = resolveQimenActivation('제 타고난 성격은?', now);
    expect(q.isTimingQuestion).toBe(false);
    expect(q.questionTime).toBeNull();
  });
});
