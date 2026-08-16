// TRI-ENGINE (SAJU natal + ZIWEI natal + QIMEN question-time) consultation E2E (directive §14–§22).
// Real grounding path; only the LLM network call is mocked. Qimen activates ONLY for a timing/decision
// question, at the QUESTION instant (Asia/Seoul) — never the birth. Provider-supported instant chosen
// so the Qimen board is available (2024-01-15 10시 KST = 小寒); an unsupported 節氣 fails closed.
import { createHash } from 'crypto';

import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { renderGroundingContext } from '@/features/chat/prompts/grounding';
import { createChatService } from '@/features/chat/services/chatService';
import { buildConsultationGrounding, createSajuGroundingBuilder } from '@/features/chat/services/consultationGrounding';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
// KST 2024-01-15 10:00 (= UTC 01:00) → 小寒, a provider-supported 節氣 → Qimen board available.
const NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const deps = { digestProvider, nowEpochSeconds: NOW };
const builder = createSajuGroundingBuilder(deps);
const allow = () => true;

// 1990-08-15 14:00 남 — Saju (1970–2050) + Ziwei (exact time) both available; age ~34 at NOW.
const draft = (over: Record<string, unknown> = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '1990', birthMonth: '8', birthDay: '15',
      birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
      approximateTimePeriod: null, birthPlace: '서울', ...over,
    },
  }) as unknown as ConsultationDraft;

const LONG_SAJU =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운과 십신 배치가 이를 안정적으로 ' +
  '뒷받침합니다. 꾸준히 쌓아 올리는 방식이 잘 맞고, 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const structuredJson = (over: Record<string, unknown> = {}): string =>
  JSON.stringify({
    coreSummary: '차분하지만 추진력 있는 흐름입니다.',
    coreInterpretation: LONG_SAJU,
    strengths: ['끈기', '분석력'],
    followUps: ['어떤 방식이 잘 맞을까요?'],
    ...over,
  });
const adapterReturning = (text: string): LLMAdapter => ({ async generateResponse() { return { text }; } });
const input = (userMessage: string, d: ConsultationDraft): ChatServiceInput => ({
  userMessage, draft: d, messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

// ── §15/§16 activation + prompt delivery ─────────────────────────────────────────────
describe('tri-engine grounding — Qimen activation (§15/§16)', () => {
  it('a timing/decision question → SAJU + ZIWEI + QIMEN all available; Qimen facts reach the prompt', async () => {
    const g = await buildConsultationGrounding(draft(), deps, '지금 이 사업을 시작해도 될까요?');
    if (g.status !== 'available') throw new Error('expected available');
    expect(g.evidence.myungri.availability).toBe('available');
    expect(g.evidence.ziwei.availability).toBe('available');
    expect(g.evidence.qimen.availability).toBe('available');
    const ctx = renderGroundingContext(g);
    expect(ctx).toContain('기문둔갑');
    expect(ctx).toMatch(/陽遁|陰遁/); // Qimen board fact
    expect(ctx).toContain('值符'); // 값부 fact
    expect(ctx).toContain('질문 시점'); // question-time note in the prompt
    expect(ctx).toContain('엔진 구분'); // three-engine attribution discipline
  });

  it('a NATAL question → Qimen not_applicable (never always-on); Saju+Ziwei still available', async () => {
    const g = await buildConsultationGrounding(draft(), deps, '제 타고난 성격과 강점은 어떤가요?');
    if (g.status !== 'available') throw new Error('expected available');
    expect(g.evidence.myungri.availability).toBe('available');
    expect(g.evidence.ziwei.availability).toBe('available');
    expect(g.evidence.qimen.availability).toBe('not_applicable');
  });
});

// ── §17 degraded / fail-closed ───────────────────────────────────────────────────────
describe('Qimen degraded / fail-closed (§17)', () => {
  it('timing question but provider-unsupported 節氣 → Qimen calculation_failed; consultation still works', async () => {
    // KST 2026-06-01 (小满) — qimen-dunjia throws for this term → fail-closed, never a fabricated board.
    const depsUnsupported = { digestProvider, nowEpochSeconds: Math.floor(Date.UTC(2026, 5, 1, 1, 0, 0) / 1000) };
    const g = await buildConsultationGrounding(draft(), depsUnsupported, '지금 투자해도 될까요?');
    if (g.status !== 'available') throw new Error('expected available (Saju/Ziwei still work)');
    expect(g.evidence.qimen.availability).toBe('calculation_failed');
    expect(g.evidence.myungri.availability).toBe('available'); // Saju not sacrificed for Qimen failure
  });
});

// ── §17 structured-output safety (Qimen claims / three-engine consensus) ─────────────
describe('tri-engine structured-output safety (§17)', () => {
  const svc = (json: string) => createChatService(adapterReturning(json), allow, builder);

  it('a Qimen claim is ALLOWED when Qimen is available (timing question)', async () => {
    const json = structuredJson({ coreInterpretation: `${LONG_SAJU} 질문 시점의 기문둔갑 국을 보면 값부의 위치가 지금 상황의 성격을 보여 줍니다.` });
    const r = await svc(json).sendMessage(input('지금 이 사업을 시작해도 될까요?', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeDefined(); // qimen available → grounded claim blessed
  });
  it('a Qimen claim is REJECTED for a NATAL question (Qimen not_applicable)', async () => {
    const json = structuredJson({ coreInterpretation: `${LONG_SAJU} 기문 국을 보면 지금 움직이는 게 좋습니다.` });
    const r = await svc(json).sendMessage(input('제 타고난 성격은?', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeUndefined(); // not_applicable → raw discarded
  });
  it('"세 학문이 모두 일치" → rejected even when all three engines are available (no formal cross-map)', async () => {
    const json = structuredJson({ coreInterpretation: `${LONG_SAJU} 세 학문이 모두 같은 결론을 가리킵니다.` });
    const r = await svc(json).sendMessage(input('지금 이 사업을 시작해도 될까요?', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeUndefined();
  });
  it('per-perspective separation (no consensus claim) is ACCEPTED', async () => {
    const json = structuredJson({ coreInterpretation: `${LONG_SAJU} 자미두수 명반과 질문 시점의 기문둔갑 국은 각각 다른 각도에서 상황을 보여 줍니다.` });
    const r = await svc(json).sendMessage(input('지금 이 계약을 진행해도 될까요?', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeDefined();
  });
});

// ── §18 follow-up: Qimen re-activates fresh per question instant ──────────────────────
describe('follow-up re-activates Qimen per question (§18)', () => {
  it('natal turn → Qimen not_applicable; timing follow-up → Qimen freshly available', async () => {
    const svc = createChatService(adapterReturning(structuredJson()), allow, builder);
    const first = await svc.sendMessage(input('제 성격은 어떤가요?', draft()));
    if (!first.success) throw new Error('unexpected');
    const g1 = first.structuredResult?.grounding;
    if (g1?.status !== 'available') throw new Error('expected available');
    expect(g1.evidence.qimen.availability).toBe('not_applicable');

    const follow = await svc.sendMessage(input('그럼 지금 이 계약을 해도 될까요?', draft()));
    if (!follow.success) throw new Error('unexpected');
    const g2 = follow.structuredResult?.grounding;
    if (g2?.status !== 'available') throw new Error('expected available');
    expect(g2.evidence.qimen.availability).toBe('available'); // re-activated at the follow-up's question time
  });
});

// ── §22 five real consultation scenarios (4 timing + 1 natal) ────────────────────────
describe('five consultation scenarios (§22)', () => {
  it('4 decision/timing questions activate Qimen; 1 natal question does not', async () => {
    const cases: { q: string; qimen: 'available' | 'not_applicable' }[] = [
      { q: '지금 이 사업을 시작해도 될까요?', qimen: 'available' },
      { q: '이번 계약을 진행해도 괜찮을까요?', qimen: 'available' },
      { q: '지금 이직하는 게 좋을까요?', qimen: 'available' },
      { q: '지금 이 투자를 해도 될까요?', qimen: 'available' },
      { q: '제 타고난 성격과 강점을 봐주세요.', qimen: 'not_applicable' },
    ];
    for (const c of cases) {
      const g = await buildConsultationGrounding(draft(), deps, c.q);
      if (g.status !== 'available') throw new Error(`unavailable: ${c.q}`);
      expect(g.evidence.qimen.availability).toBe(c.qimen);
    }
  });
});
