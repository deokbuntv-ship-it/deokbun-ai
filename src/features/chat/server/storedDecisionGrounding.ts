import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsultationDecisionMeta } from './serverConsultationTypes';

const relationLines = (
  label: string,
  relations: { position: string; kind: string }[],
): string[] => relations.map(({ position, kind }) => `${label} ${position}: ${kind}`);

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
      ziwei: { availability: 'not_applicable' },
      qimen: { availability: 'not_applicable' },
    },
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
