import { explainHeadline, refineOnAxis, renderChain } from '@/features/divination';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsultationDecisionMeta } from './serverConsultationTypes';

const relationLines = (
  label: string,
  relations: { position: string; kind: string }[],
): string[] => relations.map(({ position, kind }) => `${label} ${position}: ${kind}`);

/**
 * Restore ONE discipline's stored evidence for a WHY turn. Returns `not_applicable` when that discipline did
 * not speak in the stored turn — never a fabricated availability.
 */
function verdictEvidenceFor(
  meta: ConsultationDecisionMeta,
  discipline: 'ZIWEI' | 'QIMEN',
): { availability: 'available'; summary: string; sections: { label: string; lines: string[] }[]; hasTimingEvidence: boolean } | { availability: 'not_applicable' } {
  const verdict = meta.divinationVerdict;
  const judgment = verdict?.disciplineJudgments.find((j) => j.discipline === discipline);
  if (!verdict || !judgment || !judgment.applicable) return { availability: 'not_applicable' };
  const lines = [
    judgment.dominantConclusion,
    ...judgment.directEvidence.map((e) => `${e.fact} — ${e.meaning}`),
    ...judgment.counterEvidence.map((e) => `${e.fact} — ${e.meaning}`),
  ];
  return {
    availability: 'available',
    summary: `저장된 ${discipline === 'ZIWEI' ? '자미두수' : '기문둔갑'} 판정: ${judgment.dominantConclusion}`,
    sections: [{ label: '저장된 판정 근거', lines }],
    hasTimingEvidence: false,
  };
}

/**
 * Rebuild the minimum trusted grounding for WHY from decision A's persisted machine evidence only.
 * It intentionally accepts no current chart/grounding input, so a newer engine result B cannot leak into
 * the explanation prompt or silently replace the decision being explained.
 */
export function groundingFromStoredDecision(meta: ConsultationDecisionMeta | null | undefined): ConsultationGrounding | null {
  const snapshot = meta?.evidenceSnapshot;
  if (!meta || !snapshot) return null;
  if (meta.polarity !== snapshot.polarity) return null;
  if (meta.engineVersion !== snapshot.engineVersion) return null;
  if (meta.resolvedGranularity !== snapshot.target.granularity) return null;
  if (!meta.resolvedTargets.includes(snapshot.target.key)) return null;

  const targetYear = snapshot.target.granularity === 'MONTH'
    ? Math.floor(snapshot.target.key / 100)
    : snapshot.target.key;
  const relationFacts = [
    ...relationLines('천간', snapshot.derivation.stemRelations),
    ...relationLines('지지', snapshot.derivation.branchRelations),
  ];
  const summary = `저장된 판단 근거: ${snapshot.target.key} ${snapshot.polarity}, 조화 ${snapshot.derivation.harmony}, 마찰 ${snapshot.derivation.friction}`;
  const headlineChain = meta.divinationVerdict ? explainHeadline(meta.divinationVerdict) : null;
  const derivationChain = headlineChain ? renderChain(headlineChain) : [];
  return {
    status: 'available',
    evidence: {
      myungri: {
        availability: 'available',
        summary,
        sections: [
          { label: '저장된 판단 대상', lines: [`${snapshot.target.granularity}:${snapshot.target.key}`, `polarity:${snapshot.polarity}`] },
          { label: '저장된 polarity 도출 사실', lines: [`harmony:${snapshot.derivation.harmony}`, `friction:${snapshot.derivation.friction}`, ...relationFacts] },
        ],
        hasTimingEvidence: true,
        timingAnchors: {
          years: [targetYear],
          referenceYear: meta.resolvedTemporalContext.referenceYear,
          hasMonthlyEvidence: snapshot.target.granularity === 'MONTH',
          ...(snapshot.target.granularity === 'MONTH' ? { months: [snapshot.target.key] } : {}),
        },
      },
      // DEPTH REBUILD §17 — when the stored turn carried a cross-discipline verdict, its OWN evidence is
      // restored here so a "왜요?" explains the judgment the user actually received. Without this, Ziwei and
      // Qimen silently vanished on the follow-up turn and the explanation could describe a different
      // conclusion than the answer being questioned (audit: HIGH severity continuity blocker).
      ziwei: verdictEvidenceFor(meta, 'ZIWEI'),
      qimen: verdictEvidenceFor(meta, 'QIMEN'),
    },
    // V4B §24 — a WHY turn must TRAVERSE the stored graph, not re-list its leaves. These lines are the actual
    // derivation chain behind the headline the user is questioning: conclusion ← the rule that derived it ←
    // the premises it stands on ← the upstream conclusions it was built from. Every line is a stored node.
    ...(derivationChain.length > 0 ? { derivationChain } : {}),
    ...(meta.divinationVerdict ? { divinationVerdict: meta.divinationVerdict } : {}),
    engineVersion: snapshot.engineVersion,
    referenceYear: meta.resolvedTemporalContext.referenceYear,
    referenceMonth: meta.resolvedTemporalContext.referenceMonth,
    targetPolarities: [{
      granularity: snapshot.target.granularity,
      targetKey: snapshot.target.key,
      polarity: snapshot.polarity,
      derivation: snapshot.derivation,
    }],
  };
}

/**
 * V4B §25 — what the PREVIOUS turn's stored graph already established about the axis being asked NOW.
 *
 * The audit's confirmed failure: "사업을 확장할까?" followed by "돈은?" started a completely fresh reading, so
 * the second answer could contradict the first and the user got two unrelated readings instead of one that
 * developed. The new turn still reasons for itself — the money axis genuinely needs its own evaluation — but it
 * carries the stored graph's account of that axis, so it can say WHY the original judgment landed where it did.
 *
 * Returns [] when there is no prior graph, when the axis has not changed, or when the stored graph genuinely
 * said nothing about the new axis. In that last case the follow-up is honestly a new question, and pretending
 * otherwise would be its own fabrication.
 */
export function priorAxisContextFor(
  meta: ConsultationDecisionMeta | null | undefined,
  current: ConsultationGrounding,
): string[] {
  const prior = meta?.divinationVerdict;
  if (!prior || current.status !== 'available') return [];
  const nowAxis = current.divinationVerdict?.questionDomain;
  if (!nowAxis || nowAxis === prior.questionDomain) return [];

  const refinement = refineOnAxis(prior, nowAxis);
  if (refinement.existing.length === 0 && refinement.premises.length === 0) return [];

  return [
    `앞선 질문: "${refinement.originalQuestion}" (축 ${refinement.originalAxis}) → 판정 ${prior.direction}`,
    `앞선 판정 결론: ${prior.primaryConclusion}`,
    ...refinement.existing.flatMap((c) => renderChain(c)),
    ...(refinement.existing.length === 0
      ? refinement.premises.slice(0, 4).map((p) => `근거만 있음: ${p.sourceFactIds[0] ?? p.target.label} — ${p.assertion}`)
      : []),
    ...refinement.related.slice(0, 2).flatMap((c) => renderChain(c)),
  ];
}
