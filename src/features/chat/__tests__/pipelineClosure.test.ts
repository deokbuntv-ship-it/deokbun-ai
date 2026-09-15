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
  hasTiming?: boolean; ziwei?: string; qimen?: string; years?: number[]; months?: number[];
  referenceYear?: number | null; ageSpan?: { min: number; max: number } | null; hasMonthly?: boolean;
} = {}): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: {
      availability: 'available', summary: '사주 …', sections: [{ label: '명식', lines: ['년 癸卯'] }],
      hasTimingEvidence: o.hasTiming ?? true,
      timingAnchors: {
        years: o.years ?? [2024, 2026],
        referenceYear: o.referenceYear === undefined ? 2026 : o.referenceYear,
        daewoonAgeSpan: o.ageSpan === undefined ? { min: 2, max: 92 } : o.ageSpan,
        hasMonthlyEvidence: o.hasMonthly ?? true,
        ...(o.months ? { months: o.months } : {}),
      },
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

// ── Future-month grounding (Answer-Seeking Engine P0-C) ──────────────────────────────
describe('future-month grounding — a specific month claim is gated by grounded 월운', () => {
  const yA = { years: [2024, 2026, 2027] };

  it('grounded month → a "2027년 2월" suitability claim is ACCEPTED', () => {
    const out = classifyConsultationOutput(
      structuredJson({ coreInterpretation: `${LONG} 2027년 2월은 이사 시기로 좋은 편입니다.` }),
      groundingWith({ ...yA, months: [202702] }),
    );
    expect(out.kind).toBe('ACCEPTED');
  });

  it('UNgrounded month within a grounded year → REJECTED (closes the year-only leak, §14)', () => {
    const out = classifyConsultationOutput(
      structuredJson({ coreInterpretation: `${LONG} 2027년 3월이 가장 좋습니다.` }),
      groundingWith({ ...yA, months: [202702] }), // only Feb grounded, not March
    );
    expect(out.kind).toBe('SEMANTIC_REJECTED');
  });

  it('year grounded but NO month evidence → a bare "2027년 2월" claim is REJECTED (leak closed)', () => {
    const out = classifyConsultationOutput(
      structuredJson({ coreInterpretation: `${LONG} 2027년 2월이 이사에 가장 좋습니다.` }),
      groundingWith({ ...yA }), // years include 2027, but months absent
    );
    expect(out.kind).toBe('SEMANTIC_REJECTED');
  });

  it('a year-level claim (no month) is unaffected — still ACCEPTED', () => {
    const out = classifyConsultationOutput(
      structuredJson({ coreInterpretation: `${LONG} 2027년은 이사에 좋은 흐름입니다.` }),
      groundingWith({ ...yA }),
    );
    expect(out.kind).toBe('ACCEPTED');
  });

  it('END-TO-END: a "2027년 2월" question grounds that month from the frozen engine', async () => {
    const g = await buildConsultationGrounding(draft(), deps, '2027년 2월에 이사하면 어때?');
    if (g.status !== 'available') throw new Error('expected available');
    const anchors = g.evidence.myungri.timingAnchors;
    expect(anchors?.months ?? []).toContain(202702); // Feb 2027 is a grounded month anchor
    expect(anchors?.years ?? []).toContain(2027);
    const monthLines = (g.evidence.myungri.sections ?? []).flatMap((s) => s.lines).join(' ');
    expect(monthLines).toContain('2027년 2월'); // the compact 월운 row is rendered
    // and now the LLM MAY assert a Feb-2027 suitability judgment (validated against this grounding)
    const out = classifyConsultationOutput(
      structuredJson({ coreInterpretation: `${LONG} 2027년 2월은 이사 시기로 우선순위가 높은 편입니다.` }),
      g,
    );
    expect(out.kind).toBe('ACCEPTED');
  });

  it('a NON-month question grounds ZERO months (cost guard §36)', async () => {
    const g = await buildConsultationGrounding(draft(), deps, '내 성격은 어때?');
    if (g.status !== 'available') throw new Error('expected available');
    expect(g.evidence.myungri.timingAnchors?.months ?? []).toEqual([]);
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

// ── PATCH #2 · FIX A — relative + age/month timing (Codex re-review §9) ────────────────
describe('PATCH#2 FIX A — relative timing / age / month claims', () => {
  const kind = (over: Record<string, unknown>, g = groundingWith({})) => classifyConsultationOutput(structuredJson(over), g).kind;

  it('"내년" with NO next-year evidence → rejected; WITH next-year evidence → accepted', () => {
    expect(kind({ coreInterpretation: `${LONG} 내년에 큰 재물운이 들어옵니다.` })).toBe('SEMANTIC_REJECTED');
    expect(kind({ coreInterpretation: `${LONG} 내년에 큰 재물운이 들어옵니다.` }, groundingWith({ years: [2024, 2026, 2027] }))).toBe('ACCEPTED');
  });
  it('"내후년" unsupported → rejected', () => {
    expect(kind({ coreInterpretation: `${LONG} 내후년에 전환점이 옵니다.` })).toBe('SEMANTIC_REJECTED');
  });
  it('"올해" (= reference year, in anchors) → accepted', () => {
    expect(kind({ coreInterpretation: `${LONG} 올해는 무난하게 흘러갑니다.` })).toBe('ACCEPTED');
  });
  it('numeric relative offset "3년 뒤" not in anchors → rejected', () => {
    expect(kind({ coreInterpretation: `${LONG} 3년 뒤에 큰 변화가 옵니다.` })).toBe('SEMANTIC_REJECTED');
  });
  it('age claim with NO Daewoon age span → rejected (fail-closed)', () => {
    expect(kind({ coreInterpretation: `${LONG} 45세부터 크게 달라집니다.` }, groundingWith({ ageSpan: null }))).toBe('SEMANTIC_REJECTED');
  });
  it('age claim WITHIN the Daewoon span → accepted; OUTSIDE → rejected', () => {
    expect(kind({ coreInterpretation: `${LONG} 45세 무렵 안정됩니다.` })).toBe('ACCEPTED'); // span 2~92
    expect(kind({ coreInterpretation: `${LONG} 120세에 정점을 찍습니다.` })).toBe('SEMANTIC_REJECTED');
  });
  it('"중년 이후" / "40대" without age span → rejected; with span → accepted', () => {
    expect(kind({ coreInterpretation: `${LONG} 중년 이후 흐름이 좋아집니다.` }, groundingWith({ ageSpan: null }))).toBe('SEMANTIC_REJECTED');
    expect(kind({ coreInterpretation: `${LONG} 중년 이후 흐름이 좋아집니다.` })).toBe('ACCEPTED');
    expect(kind({ coreInterpretation: `${LONG} 40대에 자리를 잡습니다.` })).toBe('ACCEPTED'); // 40-49 within 2~92
  });
  it('"다음 달" never supported; "이번 달" needs 월운 evidence', () => {
    expect(kind({ coreInterpretation: `${LONG} 다음 달에 반드시 큰 계약이 성사됩니다.` })).toBe('SEMANTIC_REJECTED');
    expect(kind({ coreInterpretation: `${LONG} 이번 달은 무난한 흐름입니다.` })).toBe('ACCEPTED');
    expect(kind({ coreInterpretation: `${LONG} 이번 달은 무난한 흐름입니다.` }, groundingWith({ hasMonthly: false }))).toBe('SEMANTIC_REJECTED');
  });
  it('unsupported timing in domainInterpretation / strengths / cautions → rejected', () => {
    expect(kind({ domainInterpretation: [{ title: '재물', body: '2033년에 크게 법니다.' }] })).toBe('SEMANTIC_REJECTED');
    expect(kind({ strengths: ['2040년에 정점을 찍습니다'] })).toBe('SEMANTIC_REJECTED');
    expect(kind({ cautions: ['2038년을 조심하십시오'] })).toBe('SEMANTIC_REJECTED');
  });
  it('unsupported timing in futureFlow → stripped (still accepted); in followUp → that chip removed', () => {
    const fut = classifyConsultationOutput(structuredJson({ futureFlow: '2031년에 정점입니다.' }), groundingWith({}));
    expect(fut.kind).toBe('ACCEPTED');
    if (fut.kind === 'ACCEPTED') expect(fut.result.futureFlow).toBeUndefined();
    const fu = classifyConsultationOutput(structuredJson({ followUps: ['내후년 재물운을 볼까요?', '성격을 더 볼까요?'] }), groundingWith({}));
    if (fu.kind === 'ACCEPTED') expect(fu.result.followUps).toEqual(['성격을 더 볼까요?']);
    else throw new Error('expected accepted');
  });
  it('VAGUE relative language (향후 몇 년, 앞으로) is NOT flagged', () => {
    expect(kind({ coreInterpretation: `${LONG} 앞으로 몇 년은 꾸준함이 중요합니다.` })).toBe('ACCEPTED');
    expect(kind({ futureFlow: '향후 몇 년은 안정적인 편입니다.' })).toBe('ACCEPTED');
  });
});

// ── PATCH #2 · FIX B — full deterministic evidence reaches the PROMPT ─────────────────
describe('PATCH#2 FIX B — complete evidence in the rendered prompt', () => {
  it('1990 birth: prompt carries full Daewoon ten-gods + direction + active cycle + provenance + assumptions + limitations', async () => {
    // 1990-08-15 14:00: in the frozen Saju range, exact time → Daewoon available; age ≈ 36 → an active cycle exists.
    const g = await buildConsultationGrounding(draft({ birthYear: '1990', birthMonth: '8', birthDay: '15', birthHour: '14' }), deps);
    if (g.status !== 'available') throw new Error('expected available');
    const ctx = renderGroundingContext(g);
    expect(/대운.*(순행|역행)/.test(ctx)).toBe(true); // direction
    expect(ctx).toContain('세 '); // start~end age range
    expect(ctx).toContain('〈현재〉'); // active Daewoon cycle (age ~36 falls in a cycle)
    expect(ctx).toContain('지지'); // branch/main-qi ten-god (full profile, not stem-only)
    expect(ctx).toContain('지장간'); // hidden-stem ten-gods
    expect(ctx).toContain('시간축 연결'); // connected axis relations
    expect(ctx).toContain('ruleVersions'); // provenance
    expect(ctx).toContain('도출 근거'); // time-axis provenance lineage
    expect(ctx).toContain('가정:'); // real assumptions preserved
    expect(ctx).toContain('한계(계산):'); // real limitations preserved
    expect(ctx).toContain('세운');
    expect(ctx).toContain('월운');
  });
});

// ── PATCH #2 · FIX C — extended strict-grounding adversarial matrix ───────────────────
describe('PATCH#2 FIX C — grounding matrix (referenceYear / span order / assessmentSummary)', () => {
  const bad = (myungri: unknown): ConsultationGrounding =>
    ({ status: 'available', evidence: { myungri, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding);
  const base = { availability: 'available', summary: 's', sections: [{ label: 'x', lines: ['y'] }] };

  it('invalid referenceYear type → UNAVAILABLE', () => {
    expect(toSafeGrounding(bad({ ...base, timingAnchors: { years: [2026], referenceYear: 'soon' } })).status).toBe('unavailable');
  });
  it('startAge > endAge in daewoonAgeSpan → UNAVAILABLE', () => {
    expect(toSafeGrounding(bad({ ...base, timingAnchors: { years: [2026], daewoonAgeSpan: { min: 90, max: 10 } } })).status).toBe('unavailable');
  });
  it('years not a number array → UNAVAILABLE', () => {
    expect(toSafeGrounding(bad({ ...base, timingAnchors: { years: ['2026'] } })).status).toBe('unavailable');
  });
  it('hasMonthlyEvidence wrong type → UNAVAILABLE', () => {
    expect(toSafeGrounding(bad({ ...base, timingAnchors: { years: [2026], hasMonthlyEvidence: 'yes' } })).status).toBe('unavailable');
  });
  it('malformed assessmentSummary → UNAVAILABLE', () => {
    expect(toSafeGrounding({ status: 'available', assessmentSummary: 42, evidence: { myungri: base, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status).toBe('unavailable');
  });
  it('valid anchors (referenceYear + span + monthly) → AVAILABLE', () => {
    expect(toSafeGrounding(bad({ ...base, timingAnchors: { years: [2024, 2026], referenceYear: 2026, daewoonAgeSpan: { min: 2, max: 92 }, hasMonthlyEvidence: true } })).status).toBe('available');
  });
});

// ── PATCH #3 · FIX #1 — raw ENGINE-12 Daewoon metadata reaches the PROMPT ─────────────
describe('PATCH#3 FIX #1 — ENGINE-12 Daewoon ordinal/provenance/assumptions/limitations in prompt', () => {
  it('1990 chart: prompt carries cycle ordinal + daewoon ruleVersion + provenance + assumptions + limitations', async () => {
    const g = await buildConsultationGrounding(draft({ birthYear: '1990', birthMonth: '8', birthDay: '15', birthHour: '14' }), deps);
    if (g.status !== 'available') throw new Error('expected available');
    const ctx = renderGroundingContext(g);
    expect(/제\d+대운/.test(ctx)).toBe(true); // canonical cycle ordinal (not renumbered)
    expect(ctx).toContain('deokbunai.saju-daewoon.v1'); // ENGINE-12 ruleVersion
    expect(ctx).toContain('대운 도출(ENGINE-12)'); // provenance line present
    expect(ctx).toContain('YANG_MALE_YIN_FEMALE_FORWARD'); // direction rule basis
    expect(ctx).toContain('lunar-javascript'); // solar-term provider identity
    expect(ctx).toContain('deokbunai.solar-term-lunarjs-adapter.v1'); // adapterRuleVersion (A1)
    expect(ctx).toContain('FIXED_UTC_PLUS_08'); // sourceTimeBasis (A1)
    expect(ctx).toContain('THREE_DAYS_OF_SOLAR_TERM_INTERVAL_EQUALS_ONE_SYMBOLIC_YEAR'); // ENGINE-12 assumption
    expect(ctx).toContain('ROUNDED_START_AGE_IS_PRESENTATION_GRADE_NOT_ASTRONOMICAL_PRECISION'); // rounded-age limitation
    expect(ctx).toContain('SAME_UTC_MINUTE_AS_A_JIE_BOUNDARY_IS_AMBIGUOUS'); // boundary-ambiguity limitation
    expect(ctx).toContain('V1_SUPPORTED_BIRTH_RANGE_1970_01_01_THROUGH_2050_12_31'); // supported-range limitation
  });
});

// ── PATCH #3 · FIX #2 — strict AVAILABLE shape validation matrix (§15 cases 1–20) ─────
describe('PATCH#3 FIX #2 — strict AVAILABLE shape / referenceYear / age-span matrix', () => {
  const okSections = [{ label: '명식', lines: ['년 癸卯'] }];
  const okBase = { availability: 'available', summary: 's', sections: okSections };
  const st = (myungri: unknown) =>
    toSafeGrounding({ status: 'available', evidence: { myungri, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status;
  const anchors = (a: Record<string, unknown>) => ({ ...okBase, timingAnchors: { years: [2026], ...a } });

  it('AVAILABLE content matrix (1–8)', () => {
    expect(st({ availability: 'available', sections: okSections })).toBe('unavailable'); // 1 no summary
    expect(st({ ...okBase, summary: '   ' })).toBe('unavailable'); // 2 whitespace summary
    expect(st({ availability: 'available', summary: 's' })).toBe('unavailable'); // 3 no sections
    expect(st({ ...okBase, sections: [] })).toBe('unavailable'); // 4 empty sections
    expect(st({ ...okBase, sections: [{ label: '', lines: ['y'] }] })).toBe('unavailable'); // 5 empty label
    expect(st({ ...okBase, sections: [{ label: '  ', lines: ['y'] }] })).toBe('unavailable'); // 6 whitespace label
    expect(st({ ...okBase, sections: [{ label: 'x', lines: [] }] })).toBe('unavailable'); // 7 empty lines
    expect(st({ ...okBase, sections: [{ label: 'x', lines: ['   '] }] })).toBe('unavailable'); // 8 whitespace lines
  });
  it('referenceYear matrix (9–12)', () => {
    expect(st(anchors({ referenceYear: 2026.5 }))).toBe('unavailable'); // 9 fractional
    expect(st(anchors({ referenceYear: -1 }))).toBe('unavailable'); // 10 negative
    expect(st(anchors({ referenceYear: NaN }))).toBe('unavailable'); // 11 NaN
    expect(st(anchors({ referenceYear: Infinity }))).toBe('unavailable'); // 12 Infinity
  });
  it('age-span matrix (13–18)', () => {
    expect(st(anchors({ daewoonAgeSpan: { min: -1, max: 50 } }))).toBe('unavailable'); // 13 negative min
    expect(st(anchors({ daewoonAgeSpan: { min: 2, max: -1 } }))).toBe('unavailable'); // 14 negative max
    expect(st(anchors({ daewoonAgeSpan: { min: 33.5, max: 50 } }))).toBe('unavailable'); // 15 fractional min
    expect(st(anchors({ daewoonAgeSpan: { min: 2, max: 42.5 } }))).toBe('unavailable'); // 16 fractional max
    expect(st(anchors({ daewoonAgeSpan: { min: 50, max: 10 } }))).toBe('unavailable'); // 17 reversed
    expect(st(anchors({ daewoonAgeSpan: { min: NaN, max: Infinity } }))).toBe('unavailable'); // 18 NaN/Infinity
  });
  it('valid AVAILABLE stays available (19); valid UNAVAILABLE stays unavailable (20)', () => {
    expect(st(okBase)).toBe('available'); // 19
    expect(st(anchors({ referenceYear: 2026, daewoonAgeSpan: { min: 2, max: 92 } }))).toBe('available'); // 19b valid anchors
    expect(toSafeGrounding(GROUNDING_UNAVAILABLE).status).toBe('unavailable'); // 20
  });
  it('out-of-range / non-integer years → unavailable', () => {
    expect(st({ ...okBase, timingAnchors: { years: [1800] } })).toBe('unavailable'); // out of sanity range
    expect(st({ ...okBase, timingAnchors: { years: [2026.5] } })).toBe('unavailable'); // fractional year
    expect(st({ ...okBase, timingAnchors: { years: ['2026'] } })).toBe('unavailable'); // non-number
  });
});

// ── PATCH #4 · A2 — exact frozen 1970–2050 supported year range ───────────────────────
describe('PATCH#4 A2 — exact 1970–2050 runtime year range', () => {
  const okBase = { availability: 'available', summary: 's', sections: [{ label: '명식', lines: ['년 癸卯'] }] };
  const st = (myungri: unknown) =>
    toSafeGrounding({ status: 'available', evidence: { myungri, ziwei: { availability: 'engine_not_connected' }, qimen: { availability: 'engine_not_connected' } } } as unknown as ConsultationGrounding).status;
  const withRef = (referenceYear: unknown) => st({ ...okBase, timingAnchors: { years: [2026], referenceYear } });
  const withYears = (years: unknown) => st({ ...okBase, timingAnchors: { years } });

  it('referenceYear boundary: 1969 fail, 1970/2026/2050 valid, 2051 fail', () => {
    expect(withRef(1969)).toBe('unavailable');
    expect(withRef(1970)).toBe('available');
    expect(withRef(2026)).toBe('available');
    expect(withRef(2050)).toBe('available');
    expect(withRef(2051)).toBe('unavailable');
    expect(withRef(2026.5)).toBe('unavailable');
    expect(withRef(NaN)).toBe('unavailable');
    expect(withRef(Infinity)).toBe('unavailable');
    expect(withRef(-1)).toBe('unavailable');
    expect(withRef('2026')).toBe('unavailable');
  });
  it('timing years boundary: [1969] fail, [1970]/[2026,2027]/[2050] valid, [2051] fail', () => {
    expect(withYears([1969])).toBe('unavailable');
    expect(withYears([1970])).toBe('available');
    expect(withYears([2026, 2027])).toBe('available');
    expect(withYears([2050])).toBe('available');
    expect(withYears([2051])).toBe('unavailable');
    expect(withYears([2026.5])).toBe('unavailable');
    expect(withYears(['2026'])).toBe('unavailable');
  });
});
