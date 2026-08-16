// Myungri pipeline FINAL CLOSURE — the 5 Codex material fixes (directive §8/§9/§12).
//   FIX 1  semantic rejection NEVER renders raw model text
//   FIX 2  timing validation covers ALL user-facing fields incl. followUps, against evidence anchors
//   FIX 3  full deterministic time-axis evidence (relationsToNatal / direction / active cycle / axis)
//   FIX 4  Solar/Lunar CANONICAL full-prompt equivalence
//   FIX 5  strict runtime grounding validation
// Only the LLM network call is mocked; grounding/prompt/parse/validate are the production path.
import { createHash } from 'crypto';

import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { renderGroundingContext, toSafeGrounding, GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { buildPrompt } from '@/features/chat/prompts/promptBuilder';
import {
  classifyConsultationOutput,
  SEMANTIC_REJECTION_MESSAGE,
} from '@/features/chat/prompts/structuredConsultation';
import { createChatService } from '@/features/chat/services/chatService';
import {
  buildConsultationGrounding,
  createSajuGroundingBuilder,
} from '@/features/chat/services/consultationGrounding';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000); // 2026 → current 세운 year
const deps = { digestProvider, nowEpochSeconds: NOW };
const groundingBuilder = createSajuGroundingBuilder(deps);
const allow = () => true;

const draft = (over: Record<string, unknown> = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '2024', birthMonth: '1', birthDay: '3',
      birthTimeAccuracy: 'exact', birthHour: '12', birthMinute: '0',
      approximateTimePeriod: null, birthPlace: '서울', ...over,
    },
  }) as unknown as ConsultationDraft;

const LONG =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운과 십신 배치가 이를 안정적으로 ' +
  '뒷받침합니다. 꾸준히 쌓아 올리는 방식이 잘 맞고, 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const structuredJson = (over: Record<string, unknown> = {}): string =>
  JSON.stringify({
    coreSummary: '차분하지만 추진력 있는 흐름입니다.',
    coreInterpretation: LONG,
    strengths: ['끈기', '분석력'],
    domainInterpretation: [{ title: '일·직업·사업', body: '전문성을 축적하는 흐름이 강합니다.' }],
    followUps: ['직업적으로 잘 맞는 방향은?', '올해 흐름은 어떤가요?'],
    ...over,
  });

const adapterReturning = (text: string): LLMAdapter => ({ async generateResponse() { return { text }; } });
const input = (userMessage: string, d: ConsultationDraft): ChatServiceInput => ({
  userMessage, draft: d, messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

// A well-formed available grounding with explicit timing anchors, for unit-level classifier tests.
const groundingWith = (o: {
  hasTiming?: boolean; ziwei?: string; qimen?: string; years?: number[];
} = {}): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: {
      availability: 'available', summary: '사주 …', sections: [{ label: '명식', lines: ['년 癸卯'] }],
      hasTimingEvidence: o.hasTiming ?? true, timingAnchors: { years: o.years ?? [2024, 2026], daewoonAgeSpan: { min: 2, max: 92 } },
    },
    ziwei: { availability: (o.ziwei ?? 'engine_not_connected') as never },
    qimen: { availability: (o.qimen ?? 'engine_not_connected') as never },
  },
});

beforeEach(() => clearZiweiCache());

// ── FIX 1: semantic rejection never renders raw ──────────────────────────────────────
describe('FIX 1 — semantic rejection never renders raw model text', () => {
  it('structured JSON with a false Qimen claim → SEMANTIC_REJECTED (no raw, safe message)', async () => {
    const bad = structuredJson({ coreInterpretation: `${LONG} 기문둔갑까지 함께 분석했습니다.` });
    const svc = createChatService(adapterReturning(bad), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeUndefined();
    expect(r.responseText).toBe(SEMANTIC_REJECTION_MESSAGE);
    expect(r.responseText).not.toContain('기문둔갑'); // raw unsafe text never leaks
  });

  it('RAW PROSE (not JSON) with a false Qimen claim → SEMANTIC_REJECTED (not shown as fallback)', async () => {
    const svc = createChatService(adapterReturning('기문둔갑 국을 보면 올해 대박입니다.'), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft()));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeUndefined();
    expect(r.responseText).toBe(SEMANTIC_REJECTION_MESSAGE);
    expect(r.responseText).not.toContain('기문');
  });

  it('harmless plain prose (no schema, no violation) → STRUCTURAL_FALLBACK (raw shown)', () => {
    const out = classifyConsultationOutput('안녕하세요. 오늘 기분은 어떠세요?', groundingWith({}));
    expect(out.kind).toBe('STRUCTURAL_FALLBACK');
  });

  it('classifier distinguishes the three outcomes', () => {
    expect(classifyConsultationOutput(structuredJson(), groundingWith({})).kind).toBe('ACCEPTED');
    expect(classifyConsultationOutput(structuredJson({ coreInterpretation: `${LONG} 당신은 신강 사주입니다.` }), groundingWith({})).kind).toBe('SEMANTIC_REJECTED');
    expect(classifyConsultationOutput('평범한 답변입니다.', groundingWith({})).kind).toBe('STRUCTURAL_FALLBACK');
  });
});

// ── FIX 2: all-field + followUp timing validation against evidence anchors ────────────
describe('FIX 2 — timing validation covers all fields incl. followUps', () => {
  it('unsupported year (2029) in CORE prose → rejected', () => {
    const out = classifyConsultationOutput(structuredJson({ coreInterpretation: `${LONG} 2029년에 큰 변화가 옵니다.` }), groundingWith({}));
    expect(out.kind).toBe('SEMANTIC_REJECTED');
  });
  it('supported current year (2026) in prose → accepted', () => {
    const out = classifyConsultationOutput(structuredJson({ coreInterpretation: `${LONG} 2026년 현재 흐름을 봅니다.` }), groundingWith({}));
    expect(out.kind).toBe('ACCEPTED');
  });
  it('unsupported year in futureFlow → futureFlow stripped (result still accepted)', () => {
    const out = classifyConsultationOutput(structuredJson({ futureFlow: '2031년에 정점을 찍습니다.' }), groundingWith({}));
    expect(out.kind).toBe('ACCEPTED');
    if (out.kind === 'ACCEPTED') expect(out.result.futureFlow).toBeUndefined();
  });
  it('unsupported year in a followUp → that followUp removed', () => {
    const out = classifyConsultationOutput(
      structuredJson({ followUps: ['2035년 재물운을 더 볼까요?', '올해 흐름을 더 볼까요?'] }),
      groundingWith({}),
    );
    expect(out.kind).toBe('ACCEPTED');
    if (out.kind === 'ACCEPTED') {
      expect(out.result.followUps).toEqual(['올해 흐름을 더 볼까요?']);
    }
  });
  it('followUp asserting an unconnected engine → removed', () => {
    const out = classifyConsultationOutput(
      structuredJson({ followUps: ['기문 국으로 더 볼까요?', '성격을 더 볼까요?'] }),
      groundingWith({}),
    );
    if (out.kind === 'ACCEPTED') expect(out.result.followUps).toEqual(['성격을 더 볼까요?']);
    else throw new Error('expected accepted');
  });
});

// ── FIX 3: full deterministic time-axis evidence preserved ───────────────────────────
describe('FIX 3 — full time-axis evidence in grounding', () => {
  it('grounding carries direction/active-cycle/relationsToNatal/connected-axis + timing anchors', async () => {
    const g = await buildConsultationGrounding(draft(), deps);
    if (g.status !== 'available') throw new Error('expected available');
    const m = g.evidence.myungri;
    const labels = (m.sections ?? []).map((s) => s.label);
    expect(labels.some((l) => l.startsWith('대운'))).toBe(true); // label carries 순행/역행 direction
    expect(labels).toContain('세운·월운');
    expect(labels).toContain('시간축 연결(원국↔대운↔세운↔월운)'); // calculateMyungriTimeAxis was actually called
    // Sewoon relationsToNatal reaches the evidence (was previously dropped).
    const timeSection = m.sections?.find((s) => s.label === '세운·월운');
    expect(timeSection?.lines.join(' ')).toContain('세운');
    // structured timing anchors present (birth year + current 세운 year).
    expect(m.timingAnchors?.years).toContain(2024);
    expect(m.timingAnchors?.years).toContain(2026);
    expect(m.timingAnchors?.daewoonAgeSpan).toBeTruthy();
  });

  it('rendered prompt grounding carries the time-axis facts (not just present in the object)', async () => {
    const ctx = renderGroundingContext(await buildConsultationGrounding(draft(), deps));
    expect(ctx).toContain('대운');
    expect(ctx).toContain('세운');
    expect(ctx).toContain('시간축 연결'); // §5 evidence→prompt
    expect(ctx).toContain('START_OF_SPRING_IPCHUN'); // provenance still survives
  });
});

// ── FIX 4: Solar/Lunar canonical FULL-PROMPT equivalence ─────────────────────────────
describe('FIX 4 — Solar/Lunar canonical full-prompt equivalence', () => {
  const promptText = async (over: Record<string, unknown>) => {
    const d = draft(over);
    const ctx = selectConsultationContext(d);
    if (!ctx) throw new Error('no context');
    const g = await buildConsultationGrounding(d, deps);
    const msgs = buildPrompt({
      selectedContext: ctx, conversationSummary: null, recentMessages: [],
      currentUserMessage: '제 성격을 봐주세요.', grounding: g,
    });
    // Strip the clearly-marked NON-reasoning audit line — the only place the raw calendar may differ.
    return msgs.map((m) => m.content).join('\n===\n').split('\n').filter((l) => !l.startsWith('※ 입력 원본')).join('\n');
  };
  it('the same birth instant (solar 2024-01-03 ≡ lunar 2023-11-22) yields an IDENTICAL reasoning prompt', async () => {
    const solar = await promptText({});
    const lunar = await promptText({ calendarType: 'lunar', birthYear: '2023', birthMonth: '11', birthDay: '22' });
    expect(solar).toBe(lunar);
  });
  it('the raw input calendar is still preserved as audit metadata (differs, but non-reasoning)', async () => {
    const d = draft();
    const ctx = selectConsultationContext(d)!;
    const g = await buildConsultationGrounding(d, deps);
    const full = buildPrompt({ selectedContext: ctx, conversationSummary: null, recentMessages: [], currentUserMessage: 'x', grounding: g })
      .map((m) => m.content).join('\n');
    expect(full).toContain('※ 입력 원본');
    expect(full).toContain('2024.1.3'); // raw input (ctx.birthDate format) preserved for audit
  });
});

// ── FIX 5: strict runtime grounding validation ───────────────────────────────────────
describe('FIX 5 — strict runtime grounding validation', () => {
  it('valid grounding passes; malformed shapes degrade to UNAVAILABLE', () => {
    expect(toSafeGrounding(groundingWith({})).status).toBe('available');
    expect(toSafeGrounding(null).status).toBe('unavailable');
    // bad availability enum
    expect(toSafeGrounding({ status: 'available', evidence: { myungri: { availability: 'HELLO' }, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status).toBe('unavailable');
    // malformed sections (lines not string[])
    expect(toSafeGrounding({ status: 'available', evidence: { myungri: { availability: 'available', summary: 's', sections: [{ label: 'x', lines: [1, 2] }] }, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status).toBe('unavailable');
    // available but NO usable fact (no summary, no sections) → mis-wire → unavailable
    expect(toSafeGrounding({ status: 'available', evidence: { myungri: { availability: 'available' }, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status).toBe('unavailable');
    // invalid unavailable reason enum
    expect(toSafeGrounding({ status: 'unavailable', reason: 'NOPE' } as unknown as ConsultationGrounding).status).toBe('unavailable');
    expect(toSafeGrounding(GROUNDING_UNAVAILABLE).status).toBe('unavailable');
  });

  it('a grounding builder that returns malformed grounding does NOT crash the consultation', async () => {
    const badBuilder = async () => ({ status: 'available', evidence: { myungri: { availability: 'available' } } } as unknown as ConsultationGrounding);
    const svc = createChatService(adapterReturning(structuredJson()), allow, badBuilder);
    const r = await svc.sendMessage(input('풀이', draft()));
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.meta?.grounded).toBe(false); // degraded to fail-closed, never crashed
  });
});

// ── §8 five real consultation scenarios ──────────────────────────────────────────────
describe('§8 five consultation scenarios (distinct expected behavior)', () => {
  it('성격 · 직업 · 재물 · 흐름 · follow-up all produce safe grounded results', async () => {
    const scenarios = [
      { q: '내 성격의 장점과 단점을 알려줘', json: structuredJson({ strengths: ['공감력'] }), expect: '공감력' },
      { q: '나한테 어떤 일이나 사업 방식이 잘 맞아?', json: structuredJson({ domainInterpretation: [{ title: '일', body: '전문성 축적형입니다.' }] }), expect: '전문성' },
      { q: '재물 흐름에서 어떤 점을 봐야 해?', json: structuredJson({ domainInterpretation: [{ title: '재물', body: '중년 이후 축적이 강합니다.' }] }), expect: '축적' },
      { q: '앞으로의 흐름을 알려줘', json: structuredJson({ futureFlow: '대운 흐름상 향후 몇 년은 안정적입니다.' }), future: true },
      { q: '그럼 올해는 어떤가요?', json: structuredJson({ futureFlow: '세운 기준 올해가 분기점으로 보입니다.' }), future: true },
    ];
    for (const s of scenarios) {
      const svc = createChatService(adapterReturning(s.json), allow, groundingBuilder);
      const r = await svc.sendMessage(input(s.q, draft()));
      if (!r.success) throw new Error(`failed: ${s.q}`);
      expect(r.structuredResult).toBeDefined();
      expect(r.meta?.grounded).toBe(true);
      if (s.expect) expect(r.responseText).toContain(s.expect);
      // relative-timing futureFlow (no fabricated year) is accepted because timing evidence exists.
      if (s.future) expect(r.structuredResult?.futureFlow).toBeTruthy();
    }
  });
});

// ── §9 residual adversarial coverage (summary-only, malformed JSON) ──────────────────
describe('§9 adversarial — summary-only + malformed JSON', () => {
  it('summary-only JSON → no structuredResult (substance gate)', async () => {
    const svc = createChatService(adapterReturning('{"coreSummary":"좋습니다."}'), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft()));
    if (!r.success) return;
    expect(r.structuredResult).toBeUndefined();
  });
  it('malformed JSON with no violation → safe plain-text fallback (no crash)', async () => {
    const svc = createChatService(adapterReturning('그냥 평범한 문장 답변입니다.'), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', draft()));
    if (!r.success) return;
    expect(r.structuredResult).toBeUndefined();
    expect(r.responseText).toBe('그냥 평범한 문장 답변입니다.');
  });
});
