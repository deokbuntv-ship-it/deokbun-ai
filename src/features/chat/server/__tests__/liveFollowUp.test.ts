// Sprint E §3-§7, §12-§15 — LIVE follow-up wiring in buildServerConsultation. The previous decision is
// SERVER-injected (deps.loadPreviousDecision), never client-trusted. Safety precedes follow-up; Option B +
// version-mismatch contracts hold.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION } from '@/features/chat/server/answerPlan';
import type { ConsultationDecisionMeta, ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const GOOD = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation: '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'], cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
});

const META = (over: Partial<ConsultationDecisionMeta> = {}): ConsultationDecisionMeta => ({
  answerPlanVersion: ANSWER_PLAN_VERSION, decisionPolicyVersion: DECISION_POLICY_VERSION, promptVersion: 'consultation@1.4.3',
  engineVersion: 'deokbunai.saju-rules.v1', resolvedGranularity: 'YEAR', resolvedTargets: [2026], polarity: 'CAUTION', domain: '사업',
  evidenceSnapshot: { schemaVersion: 'decision-evidence@1.0.0', target: { granularity: 'YEAR', key: 2026 }, polarity: 'CAUTION', derivation: { harmony: 0, friction: 1, stemRelations: [], branchRelations: [{ position: 'DAY', kind: 'BRANCH_CLASH' }] }, supportLevel: 'DIRECT', assertiveness: 'STRONG', intents: ['TIMING'], engineVersion: 'deokbunai.saju-rules.v1' },
  resolvedTemporalContext: { anchorEpochSeconds: NOW, timezone: 'Asia/Seoul', referenceYear: 2026, referenceMonth: 7, resolvedTargets: [2026], qimenActive: false },
  ...over,
});

function harness(answer = GOOD, prev: ConsultationDecisionMeta | null = META()) {
  const sent: LLMMessage[][] = [];
  const loadPreviousDecision = jest.fn(
    async () => (prev === null ? { status: 'NONE' as const } : { status: 'VALID' as const, meta: prev }),
  );
  const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW, modelId: 'gpt-5-mini', loadPreviousDecision, async callLLM(m) { sent.push(m); return answer; } };
  return { deps, sent, loadPreviousDecision };
}
const req = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });
const systemText = (sent: LLMMessage[][]) => (sent[0] ?? []).filter((m) => m.role === 'system').map((m) => m.content).join('\n');

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('§3/§4 "왜?" — explain the STORED previous decision (no new computation)', () => {
  it('appends the WHY directive with the previous polarity and does not recompute', async () => {
    const h = harness(GOOD, META({ polarity: 'CAUTION' }));
    const r = await buildServerConsultation(req('왜?'), h.deps);
    expect(r.ok).toBe(true);
    expect(h.loadPreviousDecision).toHaveBeenCalledTimes(1);
    const sys = systemText(h.sent);
    expect(sys).toContain('"왜?"');
    expect(sys).toContain('새로운 결론을 새로 만들지 마십시오');
    expect(sys).toContain('조심이 필요한 편'); // CAUTION label from the stored decision
    if (r.ok) expect(r.diagnostics?.followUp).toBe('WHY');
  });

  it('§4 version mismatch → explains the stored decision, diagnostics.versionMismatch=true', async () => {
    const h = harness(GOOD, META({ answerPlanVersion: 'answer-plan@1.0.0' }));
    const r = await buildServerConsultation(req('왜 그래?'), h.deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.diagnostics?.versionMismatch).toBe(true);
    expect(systemText(h.sent)).toContain('저장된 이전 판단을 그대로 설명');
  });
});

describe('§5 "그럼 내년은?" — carry prior domain onto a NEW next-year target', () => {
  it('appends the prior domain + next-year directive; resolves a YEAR decision', async () => {
    const h = harness(GOOD, META({ domain: '사업' }));
    const r = await buildServerConsultation(req('그럼 내년은?'), h.deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const sys = systemText(h.sent);
    expect(sys).toContain('앞선 주제(사업)');
    expect(sys).toContain('내년');
    expect(r.structuredResult?.decisionMeta?.resolvedGranularity).toBe('YEAR'); // new next-year target resolved
    // §18 (gate K) — the bare "그럼 내년은?" classifies as 전반 on its own, but the NEW decision PERSISTS the
    // carried prior domain so a further follow-up keeps the thread's topic.
    expect(r.structuredResult?.decisionMeta?.domain).toBe('사업');
    expect(r.diagnostics?.followUp).toBe('NEXT_YEAR');
  });
});

describe('§6/§14 "둘 중에는?" — describe candidates, never a winner', () => {
  it('appends the no-winner directive; an invented winner is rejected to a safe fallback', async () => {
    const winner = JSON.stringify({ coreSummary: '5월이 더 좋습니다.', coreInterpretation: '5월이 2월보다 더 좋습니다. 사주로 보면 일간을 중심으로 흐름이 이어지고 월지의 기운이 이를 뒷받침하여 꾸준히 준비하면 도움이 됩니다.', strengths: ['추진력'] });
    // A REAL stored comparison carries the explicit comparisonContext (isComparison + the candidate set).
    const h = harness(winner, META({ resolvedGranularity: 'MONTH', resolvedTargets: [202702, 202705], polarity: undefined, comparisonContext: { isComparison: true, candidates: [202702, 202705] } }));
    const r = await buildServerConsultation(req('그래서 둘 중 뭐가 더 좋아?'), h.deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(systemText(h.sent)).toContain('승자/1순위로 고르거나');
    // V3 §11 — the invented winner is still fully rejected: none of the model's prose survives. The user is
    // handed the server's own grounded composition instead of the canned message, and that composition —
    // being server text — never names a winner either.
    expect(r.diagnostics?.groundedFallback).toBe(true);
    expect(r.text).not.toContain('5월이 2월보다');
    expect(r.text).not.toMatch(/5월이 더 좋습니다/);
  });
});

describe('§13 safety PRECEDES follow-up', () => {
  it('a self-harm follow-up hard-stops before any LLM/grounding/previous-decision load', async () => {
    const h = harness();
    const r = await buildServerConsultation(req('사주가 이렇게 안 좋은데 그냥 죽는 게 낫나?'), h.deps);
    expect(r.ok).toBe(true);
    expect(h.sent.length).toBe(0);
    expect(h.loadPreviousDecision).not.toHaveBeenCalled(); // no prior astrology context reused
    if (r.ok) expect(r.diagnostics?.safetyRoute).toBe('SELF_HARM');
  });
});

describe('§10 model id is stamped from the server (never client)', () => {
  it('persists the actual runtime model id in decisionMeta', async () => {
    const h = harness();
    const r = await buildServerConsultation(req('올해 재물운 어때?'), h.deps);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.structuredResult?.decisionMeta?.modelId).toBe('gpt-5-mini');
  });
});

describe('follow-up is inert without a server loader (client cannot force it)', () => {
  it('no loadPreviousDecision dep → no follow-up directive even for "왜?"', async () => {
    const sent: LLMMessage[][] = [];
    const deps: ServerConsultationDeps = { digestProvider, nowEpochSeconds: NOW, async callLLM(m) { sent.push(m); return GOOD; } };
    const r = await buildServerConsultation(req('왜?'), deps);
    expect(r.ok).toBe(true);
    expect(systemText([sent[0]])).not.toContain('[후속 지침');
  });
});
