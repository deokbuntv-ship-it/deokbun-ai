// Qimen V1 closure — Codex REJECTED material fixes A (civil-date trust) + B (Qimen-claim / consensus
// coverage) + E (activation minors). Only the LLM network call is mocked; grounding/validate are real.
import { createHash } from 'crypto';

import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import {
  classifyTimingQuestion,
  resolveQimenActivation,
} from '@/features/chat/selectors/qimenActivation';
import { createChatService } from '@/features/chat/services/chatService';
import { buildConsultationGrounding, createSajuGroundingBuilder } from '@/features/chat/services/consultationGrounding';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache, computeQimenBoard, toQimenEvidence } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000); // KST 2024-01-15 10:00 → 小寒 (provider-supported)
const deps = { digestProvider, nowEpochSeconds: NOW };
const builder = createSajuGroundingBuilder(deps);
const allow = () => true;
const draft = (over: Record<string, unknown> = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
      birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울', ...over,
    },
  }) as unknown as ConsultationDraft;
const LONG =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
  '꾸준히 쌓아 올리는 방식이 잘 맞고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다. ';
const json = (core: string) => JSON.stringify({ coreSummary: '차분한 흐름입니다.', coreInterpretation: core, strengths: ['끈기'], followUps: ['어떤 방식이 맞을까요?'] });
const adapterReturning = (text: string): LLMAdapter => ({ async generateResponse() { return { text }; } });
const input = (userMessage: string, d: ConsultationDraft): ChatServiceInput => ({
  userMessage, draft: d, messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
});
beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

// ── PART A — impossible civil datetime never becomes a Qimen board ────────────────────
describe('PART A — Qimen civil-date trust boundary', () => {
  const q = (year: number, month: number, day: number) => ({ isTimingQuestion: true, questionTime: { year, month, day, hour: 10 } });
  it.each([[2024, 2, 29], [2023, 2, 28], [2024, 4, 30], [2024, 1, 31]])(
    'VALID %s-%s-%s → available',
    (y, m, d) => expect(computeQimenBoard(q(y, m, d)).availability).toBe('available'),
  );
  it.each([[2024, 2, 30], [2023, 2, 29], [2024, 4, 31], [2024, 1, 32], [2024, 0, 10], [2024, 13, 10], [2024, 5, 0]])(
    'IMPOSSIBLE %s-%s-%s → unsupported_case (never rolled over, never a trusted board)',
    (y, m, d) => {
      const r = computeQimenBoard(q(y, m, d));
      expect(r.availability).toBe('unsupported_case');
      expect(r.board).toBeNull();
      expect(toQimenEvidence(r).availability).not.toBe('available'); // no Qimen facts promoted
      expect(toQimenEvidence(r).summary).toBeUndefined();
    },
  );
});

// ── PART B — Qimen-claim / consensus coverage at the live-render boundary ─────────────
describe('PART B — false-Qimen + false-consensus rejection (fail-closed to safe message)', () => {
  const svc = (core: string) => createChatService(adapterReturning(json(core)), allow, builder);
  const rejectedForNatal = async (core: string) => {
    const r = await svc(core).sendMessage(input('제 타고난 성격은?', draft())); // natal → Qimen not_applicable
    if (!r.success) throw new Error('unexpected');
    return r.structuredResult === undefined;
  };
  const acceptedForTiming = async (core: string) => {
    const r = await svc(core).sendMessage(input('지금 이 사업을 시작해도 될까요?', draft())); // timing → 3 engines
    if (!r.success) throw new Error('unexpected');
    return r.structuredResult !== undefined;
  };

  it('missed Qimen references are now rejected when Qimen not available', async () => {
    expect(await rejectedForNatal(`${LONG}기문에서 값부가 좋은 자리에 있습니다.`)).toBe(true);
    expect(await rejectedForNatal(`${LONG}기문 결과가 지금은 유리합니다.`)).toBe(true);
    expect(await rejectedForNatal(`${LONG}기문국에서는 문이 열려 있습니다.`)).toBe(true);
    expect(await rejectedForNatal(`${LONG}값부의 위치가 좋습니다.`)).toBe(true);
  });
  it('formal three-engine consensus is rejected (all forms), even when all three are available', async () => {
    expect(await acceptedForTiming(`${LONG}세 학문이 완전히 일치합니다.`)).toBe(false);
    expect(await acceptedForTiming(`${LONG}명리, 자미두수, 기문둔갑이 모두 같은 결론입니다.`)).toBe(false);
    expect(await acceptedForTiming(`${LONG}세 엔진이 100% 동일한 결과를 보여줍니다.`)).toBe(false);
  });
  it('separate sourced perspectives (no agreement claim) are ACCEPTED', async () => {
    expect(
      await acceptedForTiming(`${LONG}명리에서는 안정적인 기운이, 자미두수에서는 유연한 구조가, 질문 시점의 기문에서는 신중함이 각각 다른 각도로 보입니다.`),
    ).toBe(true);
  });
  it('rejected content never leaks as raw text (fail-closed at the live-render boundary)', async () => {
    const r = await svc(`${LONG}세 엔진이 100% 동일한 결과를 보여줍니다.`).sendMessage(input('지금 이 사업을 시작해도 될까요?', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeUndefined();
    expect(r.responseText).not.toContain('100%'); // raw unsafe text discarded
  });
});

// ── PART E — activation minors ───────────────────────────────────────────────────────
describe('PART E — activation false-positives + follow-up transitions', () => {
  it('natal statements containing 지금/이번 달 but NO decision are NOT timing', () => {
    expect(classifyTimingQuestion('나는 지금 어떤 직업 성향을 가진 사람이야?')).toBe(false);
    expect(classifyTimingQuestion('내 사주에서 이번 달이라는 표현 말고 타고난 성향을 봐줘')).toBe(false);
  });
  it('natal→timing→natal: Qimen not_applicable → available → not_applicable (no stale leak)', async () => {
    const svc = createChatService(adapterReturning(json(LONG)), allow, builder);
    const q1 = await svc.sendMessage(input('제 성격은 어떤가요?', draft()));
    const q2 = await svc.sendMessage(input('그럼 지금 이 계약을 해도 될까요?', draft()));
    const q3 = await svc.sendMessage(input('그럼 제 타고난 강점은?', draft()));
    const qi = (r: typeof q1) => (r.success && r.structuredResult?.grounding.status === 'available' ? r.structuredResult.grounding.evidence.qimen.availability : 'X');
    expect(qi(q1)).toBe('not_applicable');
    expect(qi(q2)).toBe('available');
    expect(qi(q3)).toBe('not_applicable'); // timing-turn Qimen board does not leak into the natal turn
  });
  it('two eligible questions at DISTINCT instants → distinct question times', () => {
    const t1 = resolveQimenActivation('지금 이 계약을 해도 될까요?', Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000));
    const t2 = resolveQimenActivation('지금 이 계약을 해도 될까요?', Math.floor(Date.UTC(2024, 0, 15, 5, 0, 0) / 1000));
    expect(t1.questionTime).not.toEqual(t2.questionTime); // fresh per instant, not blindly reused
    expect(t2.questionTime?.hour).toBe(t1.questionTime!.hour + 4);
  });
});

// ── PART A production path: the invalid civil date must not reach a trusted board ─────
describe('PART A — production grounding never surfaces an impossible-date board', () => {
  it('a client-crafted impossible question time → Qimen unsupported, not trusted', async () => {
    // The engine is the trust point: even if an invalid QimenQueryTime is constructed, it fails closed.
    expect(toQimenEvidence(computeQimenBoard({ isTimingQuestion: true, questionTime: { year: 2024, month: 2, day: 30, hour: 10 } })).availability).not.toBe('available');
    // The live grounding path derives the question time from the server-injected instant (always a real
    // date) — Saju/Ziwei still available, consultation not crashed.
    const g = await buildConsultationGrounding(draft(), deps, '지금 이 사업을 시작해도 될까요?');
    if (g.status !== 'available') throw new Error('expected available');
    expect(g.evidence.myungri.availability).toBe('available');
  });
});
