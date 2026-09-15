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

/**
 * V5.2 CLOSURE — QA CONSISTENCY CHECK, not a score rewrite.
 *
 * The rubric explicitly forbids giving crossSystemSynthesis 0/15 merely because only ONE system materially
 * contributed while the others are legitimately NOT_COVERED. REUNION-09 received exactly that in the V5.2
 * run. This makes the invalid pattern VISIBLE in future measurement: it never changes a score, never retries
 * the judge, and never touches an old result — a flagged case is one a human must read.
 *
 * Deliberately narrow. It fires only on the shape the rubric names: a single material contributor, a zero
 * cross score, and no stated reason referencing the four criteria the judge was told to evaluate.
 */
export type CrossZeroFlag = {
  caseId: string;
  materialContributors: string[];
  notCoveredSystems: string[];
  /** The judge's own stated rationale, so a reviewer can see whether one was given at all. */
  statedReason: string;
};

const RUBRIC_CRITERION = /적용 범위|미적용|커버|결합|지어|입장|스탠스|하나뿐|한 체계/;

export function invalidSingleContributorZero(record: {
  caseId: string;
  materialContributors: string[];
  notCoveredSystems: string[];
  judge: { scoreBreakdown: { crossSystemSynthesis: number }; issues: string[]; notes: string } | null;
}): CrossZeroFlag | null {
  const j = record.judge;
  if (!j) return null;
  if (j.scoreBreakdown.crossSystemSynthesis !== 0) return null;
  if (record.materialContributors.length !== 1) return null;
  if (record.notCoveredSystems.length === 0) return null;
  const stated = [...j.issues, j.notes].filter((x) => x.length > 0).join(' ');
  // A judge that DID reason through (a)-(d) and still landed on 0 is not flagged — only an unexplained zero.
  if (RUBRIC_CRITERION.test(stated)) return null;
  return {
    caseId: record.caseId,
    materialContributors: [...record.materialContributors],
    notCoveredSystems: [...record.notCoveredSystems],
    statedReason: stated || '(근거 없음)',
  };
}