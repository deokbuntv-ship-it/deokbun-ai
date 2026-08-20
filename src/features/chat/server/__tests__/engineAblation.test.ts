// Sprint D §D9 — OFFLINE engine ablation diagnostic. Compares STRUCTURED decision outputs (never prose)
// across: A) all engine evidence, B) Ziwei omitted, C) Qimen omitted. It changes NO decision semantics; it
// only measures whether omitting an engine changes the server's decision plan for the tested cases.
//
// INTERPRETATION (recorded for the Product Truth Guard): the V1 Answer Plan reads only the deterministic
// TIMING anchors + target polarities (both from the 명리/Saju spine); Ziwei/Qimen are prose-only (no timing
// anchors, no polarity). So omitting them is EXPECTED to leave the decision plan unchanged. That means
// "the current Decision Plan is not substantively USING Ziwei/Qimen in these cases" — NOT that the engines
// are useless (they add separately-presented interpretive perspective, which is not measured here).
import { createHash } from 'crypto';

import { deriveAnswerPlan, type AnswerPlan } from '@/features/chat/server/answerPlan';
import { buildResolvedTemporalContext } from '@/features/chat/server/resolvedTemporalContext';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const SERVER_NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000); // 2026-07 KST — 세운/월운 grounded, Qimen can activate
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const draft = { subject: { id: 'self', displayName: '본인', relationship: null }, birthInfo: birth };

// Ablate one engine by marking it not-connected (leaves the 명리 spine + top-level polarity/reference intact).
function ablate(g: ConsultationGrounding, omit: 'ziwei' | 'qimen'): ConsultationGrounding {
  if (g.status !== 'available') return g;
  return { ...g, evidence: { ...g.evidence, [omit]: { availability: 'engine_not_connected' } } };
}
// The STRUCTURED decision signature the ablation compares (no prose).
function decisionSignature(plan: AnswerPlan, g: ConsultationGrounding, question: string) {
  const ctx = buildResolvedTemporalContext(question, SERVER_NOW, g);
  return {
    supportLevel: plan.supportLevel,
    resolvedGranularity: plan.resolvedGranularity,
    comparisonSupported: plan.comparisonSupported,
    rankingSupported: plan.rankingSupported,
    requireMitigation: plan.requireMitigation,
    polarity: plan.polarity ?? null,
    resolvedTargets: ctx.resolvedTargets,
    targetPolarities: g.status === 'available' ? g.targetPolarities ?? [] : [],
  };
}

const QUESTIONS = ['올해 재물운 어때?', '내년 사업운 어때?', '이번 달 직업운 어때?', '지금 이 계약을 진행해도 될까요?', '내 사주 특징은?'];

describe('§D9 engine ablation — Ziwei/Qimen do not change the decision plan (structured only)', () => {
  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it.each(QUESTIONS)('%s → decision signature identical with all / no-Ziwei / no-Qimen', async (q) => {
    const all = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: SERVER_NOW }, q);
    const noZiwei = ablate(all, 'ziwei');
    const noQimen = ablate(all, 'qimen');

    const sigAll = decisionSignature(deriveAnswerPlan(q, all), all, q);
    const sigNoZiwei = decisionSignature(deriveAnswerPlan(q, noZiwei), noZiwei, q);
    const sigNoQimen = decisionSignature(deriveAnswerPlan(q, noQimen), noQimen, q);

    // The engine AVAILABILITY changed (that is the ablation input) …
    if (all.status === 'available') {
      expect(noZiwei.status === 'available' && noZiwei.evidence.ziwei.availability).not.toBe('available');
    }
    // … but the DECISION signature must be identical → the plan is not substantively using the omitted engine.
    expect(sigNoZiwei).toEqual(sigAll);
    expect(sigNoQimen).toEqual(sigAll);
  });
});
