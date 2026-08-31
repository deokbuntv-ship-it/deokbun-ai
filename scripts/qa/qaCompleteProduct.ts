// V5 COMPLETE-PRODUCT MEASUREMENT CONTRACT — one definition of "what was delivered" and "what was internal",
// shared by every QA runner so a scorer can never again read a different artifact than the reader receives.
//
// USER_VISIBLE_ANSWER comes from the PRODUCT's own `buildUserVisibleAnswer` (src/features/chat/presentation),
// so the delivery order and the section set are the ones the app renders — 전문근거, 행동, 한마디 and
// 왜 이렇게 보나요 included, because the user sees all of them.
//
// AUTHORITATIVE_REFERENCE stays separate and reference-only: the engine's internal grounded facts exist so the
// judge can check fidelity, never so internal richness can earn visible-content points.
import { buildUserVisibleAnswer, type UserVisibleAnswer } from '@/features/chat/presentation/userVisibleAnswer';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';
import { contributedNothing, type CrossDivinationVerdict, type DivinationJudgment } from '@/features/divination';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

export type CompleteProductView = {
  /** The complete product, in delivery order. */
  userVisibleAnswer: UserVisibleAnswer;
  /** The flattened visible text — persisted so a record can be re-read without re-deriving it. */
  userVisibleText: string;
  /** The server-materialized citation blocks, persisted title+body (they ARE user-visible). */
  verifiedEvidence: { title: string; body: string }[];
  /** Systems that materially contributed a finding. */
  materialContributors: string[];
  /** Systems legitimately not covering this question. */
  notCoveredSystems: string[];
  crossJudgeSummary: string;
  /** Internal only. Never part of the visible answer. */
  authoritativeReference: string[];
};

const EMPTY: CompleteProductView = {
  userVisibleAnswer: { sections: [], text: '' },
  userVisibleText: '',
  verifiedEvidence: [],
  materialContributors: [],
  notCoveredSystems: [],
  crossJudgeSummary: '없음 (Cross Judge 미산출)',
  authoritativeReference: [],
};

/** MATERIAL contribution, not applicability — the V5 root-cause-1 classification, reused for measurement. */
export function materialContributorsOf(v: CrossDivinationVerdict): { material: string[]; notCovered: string[] } {
  const judgments = v.disciplineJudgments as DivinationJudgment[];
  const material = judgments.filter((j) => j.applicable && !contributedNothing(j)).map((j) => j.discipline);
  return { material, notCovered: judgments.map((j) => j.discipline).filter((d) => !material.includes(d)) };
}

export function completeProductView(
  structuredResult: StructuredConsultationViewModel | undefined,
  fallbackText: string,
): CompleteProductView {
  if (!structuredResult) {
    return { ...EMPTY, userVisibleAnswer: { sections: [], text: fallbackText }, userVisibleText: fallbackText };
  }
  const answer = buildUserVisibleAnswer(structuredResult);
  const meta = structuredResult.decisionMeta as ConsultationDecisionMeta | undefined;
  const v = meta?.divinationVerdict;
  if (!v) {
    return {
      ...EMPTY,
      userVisibleAnswer: answer,
      userVisibleText: answer.text,
      verifiedEvidence: [...(structuredResult.verifiedEvidence ?? [])],
    };
  }
  const { material, notCovered } = materialContributorsOf(v);
  const summary = [
    `주 결론: ${v.primaryConclusion}`,
    v.agreementPoints[0] ? `일치: ${v.agreementPoints[0]}` : null,
    v.contradictionPoints[0] ? `모순: ${v.contradictionPoints[0]}` : null,
  ].filter(Boolean).join(' / ');
  return {
    userVisibleAnswer: answer,
    userVisibleText: answer.text,
    verifiedEvidence: [...(structuredResult.verifiedEvidence ?? [])],
    materialContributors: material,
    notCoveredSystems: notCovered,
    crossJudgeSummary: summary || v.primaryConclusion,
    authoritativeReference: v.evidenceReferences.flatMap((e) => e.lines.slice(0, 2).map((l) => `[${e.discipline}] ${l}`)),
  };
}
