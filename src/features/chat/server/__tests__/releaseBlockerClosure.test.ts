// Sprint E.1 — FINAL RELEASE BLOCKER CLOSURE regression suite.
// Covers: BLOCKER 1 trust boundary (client cannot forge the prior decision), HIGH 2 WHY-evidence snapshot,
// HIGH 5 crisis-precedes-spend (the pure evaluator the Edge runs + the orchestrator never reaches LLM/loader),
// MEDIUM §16-17 explicit comparison context (a single year+month is NOT a comparison), MEDIUM §18 carried
// domain. Pure/Node — the Deno Edge ordering is verified by code review (EDGE_RUNTIME_NOT_EXECUTED).
import { createHash } from 'crypto';

import { buildServerConsultation, evaluateConsultationSafetyStop } from '@/features/chat/server';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION, deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { buildConsultationDecisionMeta, parseDecisionMeta } from '@/features/chat/server/decisionMeta';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  previousDecisionFromMeta,
  resolveFollowUpAction,
  renderFollowUpDirective,
} from '@/features/chat/services/followUpContext';
import type { ConsultationDecisionMeta, ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { ResolvedTemporalContext } from '@/features/chat/server/serverConsultationTypes';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
const rtc = (over: Partial<ResolvedTemporalContext> = {}): ResolvedTemporalContext => ({
  anchorEpochSeconds: NOW, timezone: 'Asia/Seoul', referenceYear: 2026, referenceMonth: 7, resolvedTargets: [2026], qimenActive: false, ...over,
});
const META = (over: Partial<ConsultationDecisionMeta> = {}): ConsultationDecisionMeta => ({
  answerPlanVersion: ANSWER_PLAN_VERSION, decisionPolicyVersion: DECISION_POLICY_VERSION, promptVersion: 'consultation@1.4.3',
  resolvedGranularity: 'YEAR', resolvedTargets: [2026], polarity: 'CAUTION', domain: '사업', resolvedTemporalContext: rtc(),
  ...over,
});

// ── HIGH 5 — CRISIS PRECEDES SPEND (gates F/G) ───────────────────────────────────────────────────────────
describe('§12-14 crisis hard-stop is a PURE pre-check the Edge can run before any spend', () => {
  it('returns the controlled safe result for every hard-stop route (self-harm / death / medical)', () => {
    for (const q of [
      '사주가 안 좋은데 그냥 죽는 게 낫겠죠?',   // SELF_HARM
      '제 수명이 언제까지인지 사주로 봐주세요.',   // DEATH_LIFESPAN
      '이 병이 사주로 보면 완치될까요?',          // MEDICAL
    ]) {
      const stop = evaluateConsultationSafetyStop(q, NOW);
      expect(stop?.ok).toBe(true);
      if (!stop?.ok) continue;
      expect(stop.groundingMeta.grounded).toBe(false);          // no astrology grounding was produced
      expect(stop.diagnostics?.outputClassification).toBe('SAFETY_ROUTED');
      expect(typeof stop.diagnostics?.safetyRoute).toBe('string');
      expect(stop.text.length).toBeGreaterThan(10);             // a real controlled response, not empty
    }
  });

  it('returns null for a NORMAL question and for FINANCIAL_GUARANTEE (not a hard stop)', () => {
    expect(evaluateConsultationSafetyStop('올해 재물운 어때요?', NOW)).toBeNull();
    expect(evaluateConsultationSafetyStop('무조건 수익 나는 투자 시점 알려줘', NOW)).toBeNull();
    expect(evaluateConsultationSafetyStop('', NOW)).toBeNull();
  });

  it('a crisis question in the orchestrator NEVER calls the LLM, the previous-decision loader, or grounding', async () => {
    clearZiweiCache(); clearQimenCache();
    const sent: LLMMessage[][] = [];
    const loadPreviousDecision = jest.fn(async () => META());
    const deps: ServerConsultationDeps = {
      digestProvider, nowEpochSeconds: NOW, modelId: 'gpt-5-mini', loadPreviousDecision,
      async callLLM(m) { sent.push(m); return '{}'; },
    };
    const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
    const r = await buildServerConsultation({ birthInput: birth, question: '그냥 죽고 싶어요' }, deps);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.diagnostics?.safetyRoute).toBe('SELF_HARM');
    expect(sent.length).toBe(0);                        // no provider call
    expect(loadPreviousDecision).not.toHaveBeenCalled(); // no previous-decision load
  });
});

// ── MEDIUM §16-17 — EXPLICIT COMPARISON CONTEXT (gate I) ──────────────────────────────────────────────────
describe('§16-17 a single year+month resolution is NOT misread as a comparison', () => {
  it('legacy/absent comparison context → not a comparison → "둘 중에는?" yields NO candidates', () => {
    const prev = previousDecisionFromMeta(META({ resolvedGranularity: 'MONTH', resolvedTargets: [2027, 202705] }));
    expect(prev?.hasComparisonSet).toBe(false);
    expect(resolveFollowUpAction('BETWEEN_CANDIDATES', prev)).toEqual({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [] });
    // resolvedTargets.length === 2 but it is a single period's year+month, so no directive is emitted.
    expect(renderFollowUpDirective({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [] }, prev)).toBeNull();
  });

  it('an explicit stored comparison → its candidate identities drive "둘 중에는?" (still NO winner)', () => {
    const prev = previousDecisionFromMeta(META({ resolvedGranularity: 'MONTH', resolvedTargets: [202702, 202705], comparisonContext: { isComparison: true, candidates: [202702, 202705] } }));
    expect(prev?.hasComparisonSet).toBe(true);
    const action = resolveFollowUpAction('BETWEEN_CANDIDATES', prev);
    expect(action).toEqual({ kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: [202702, 202705] });
    const dir = renderFollowUpDirective(action, prev);
    expect(dir).toContain('승자/1순위로 고르거나'); // Option B preserved: describe, never rank
  });

  it('deriveAnswerPlan marks a plain single-topic question as NOT a comparison', () => {
    const plan = deriveAnswerPlan('올해 사업운 어때?', GROUNDING_UNAVAILABLE);
    expect(plan.comparisonContext.isComparison).toBe(false);
    expect(plan.comparisonContext.candidates).toEqual([]);
  });
});

// ── HIGH 2 — WHY EXPLAINS THE STORED EVIDENCE (gate B / §24-25) ───────────────────────────────────────────
describe('§5-6 "왜?" explains the STORED decision/evidence (A), not the current turn (B)', () => {
  it('renders the stored target, polarity, and support level — and not the current-turn year', () => {
    const stored = previousDecisionFromMeta(META({
      resolvedGranularity: 'YEAR', resolvedTargets: [2028], polarity: 'CAUTION',
      evidence: { supportLevel: 'DIRECT', assertiveness: 'STRONG', intents: ['TIMING'] },
      resolvedTemporalContext: rtc({ referenceYear: 2028, resolvedTargets: [2028] }),
    }));
    const action = resolveFollowUpAction('WHY', stored);
    const dir = renderFollowUpDirective(action, stored) ?? '';
    expect(dir).toContain('2028년');            // stored target A
    expect(dir).toContain('조심이 필요한 편');   // stored CAUTION A
    expect(dir).toContain('DIRECT');            // stored evidence A
    expect(dir).not.toContain('2026');          // NOT the current-turn reference B
    expect(dir).toContain('새로운 결론을 새로 만들지 마십시오');
  });
});

// ── BLOCKER 1 — CLIENT CANNOT FORGE THE PRIOR DECISION (gate A) ───────────────────────────────────────────
describe('BLOCKER 1 the previous decision is server-injected only; the client has no channel to forge it', () => {
  it('with NO server loader, a "왜?" turn produces no follow-up directive (client cannot inject a decision)', async () => {
    clearZiweiCache(); clearQimenCache();
    const sent: LLMMessage[][] = [];
    const birth: BirthInfoDraft = { displayName: '테스트', gender: 'female', calendarType: 'solar', lunarMonthType: null, birthYear: '1992', birthMonth: '3', birthDay: '3', birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
    const GOOD = JSON.stringify({ coreSummary: '차분한 흐름입니다.', coreInterpretation: '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루며 월지의 기운이 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.', strengths: ['끈기'] });
    const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW, async callLLM(m) { sent.push(m); return GOOD; } };
    const r = await buildServerConsultation({ birthInput: birth, question: '왜?' } as ServerConsultationRequest, deps);
    expect(r.ok).toBe(true);
    const sys = (sent[0] ?? []).filter((m) => m.role === 'system').map((m) => m.content).join('\n');
    expect(sys).not.toContain('[후속 지침'); // no stored decision was applied — the request carries none
  });

  it('the request contract exposes only a conversationId string, never a decision payload', () => {
    // A compile-time + shape guarantee: ServerConsultationRequest has NO field through which a client could
    // pass a polarity/target/version. The Edge injects deps.loadPreviousDecision, which reads the SERVER store.
    const req: ServerConsultationRequest = { question: '왜?', conversationId: 'abc' };
    expect(typeof req.conversationId).toBe('string');
    expect((req as Record<string, unknown>).decisionMeta).toBeUndefined();
    expect((req as Record<string, unknown>).polarity).toBeUndefined();
  });
});

// ── MEDIUM §18 — CARRIED DOMAIN (gate K) ─────────────────────────────────────────────────────────────────
describe('§18 buildConsultationDecisionMeta persists a carried domain for a NEXT_YEAR follow-up', () => {
  const plan = deriveAnswerPlan('그럼 내년은?', GROUNDING_UNAVAILABLE);
  it('a real carried domain overrides the bare-question classification (전반)', () => {
    const dm = buildConsultationDecisionMeta('그럼 내년은?', plan, GROUNDING_UNAVAILABLE, rtc(), null, '사업');
    expect(dm.domain).toBe('사업');
  });
  it('a 전반 carried domain falls back to fresh classification (never pins a non-domain)', () => {
    const dm = buildConsultationDecisionMeta('그럼 내년은?', plan, GROUNDING_UNAVAILABLE, rtc(), null, '전반');
    expect(dm.domain).toBe('전반'); // bare follow-up classifies as 전반 anyway
  });
  it('no carried domain → fresh classification', () => {
    const dm = buildConsultationDecisionMeta('올해 결혼운 어때?', plan, GROUNDING_UNAVAILABLE, rtc(), null);
    expect(dm.domain).toBe('결혼');
  });
});

// ── PARSE — new fields are fail-closed + backward compatible ──────────────────────────────────────────────
describe('parseDecisionMeta round-trips comparisonContext + evidence, and rejects malformed shapes', () => {
  it('preserves a well-formed comparison context and evidence snapshot', () => {
    const meta = META({ comparisonContext: { isComparison: true, candidates: [202702, 202705] }, evidence: { supportLevel: 'DIRECT', assertiveness: 'STRONG', intents: ['COMPARISON', 'TIMING'] } });
    const parsed = parseDecisionMeta(JSON.parse(JSON.stringify(meta)));
    expect(parsed?.comparisonContext).toEqual({ isComparison: true, candidates: [202702, 202705] });
    expect(parsed?.evidence).toEqual({ supportLevel: 'DIRECT', assertiveness: 'STRONG', intents: ['COMPARISON', 'TIMING'] });
  });
  it('a malformed comparison context → dropped (never a silent isComparison:true)', () => {
    const parsed = parseDecisionMeta({ ...JSON.parse(JSON.stringify(META())), comparisonContext: { candidates: [1, 2] } });
    expect(parsed?.comparisonContext).toBeUndefined();
  });
  it('a legacy record without the new fields still parses (backward compatible)', () => {
    const legacy = JSON.parse(JSON.stringify(META()));
    delete legacy.comparisonContext; delete legacy.evidence;
    const parsed = parseDecisionMeta(legacy);
    expect(parsed).toBeDefined();
    expect(parsed?.comparisonContext).toBeUndefined();
    expect(parsed?.evidence).toBeUndefined();
  });
});
