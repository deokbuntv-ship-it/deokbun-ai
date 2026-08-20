// Server-owned temporal context (Sprint A §12-§13). The SERVER is the authority for the question instant:
// the anchor is the server receipt time (deps.nowEpochSeconds), NEVER the client clock. This is the
// reproducibility substrate — a later follow-up resolver reuses/refreshes it; this sprint only produces it.
import { resolveQuestionMonths } from '@/features/chat/services/questionMonths';
import { resolveQuestionYears } from '@/features/chat/services/questionYears';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ResolvedTemporalContext } from './serverConsultationTypes';

// Civil (Asia/Seoul) year+month from a UTC epoch. Deterministic in the passed epoch — no wall clock.
function kstCivil(epochSeconds: number): { year: number; month: number } {
  const d = new Date((epochSeconds + 9 * 3600) * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

// The saju 세운 reference year (rolls at 立春) when grounded — the same anchor deriveAnswerPlan reads.
function groundingReferenceYear(grounding: ConsultationGrounding): number | null {
  if (grounding.status !== 'available') return null;
  for (const ev of [grounding.evidence.myungri, grounding.evidence.ziwei, grounding.evidence.qimen]) {
    const r = ev.timingAnchors?.referenceYear;
    if (typeof r === 'number') return r;
  }
  return null;
}

/**
 * Build the deterministic temporal context. `referenceYear` prefers the grounded 세운 reference (立春-based);
 * absent grounding it falls back to the KST civil year. `resolvedTargets` are the periods the question
 * references (years, and year*100+month month-keys). `qimenActive` reflects the server's activation.
 */
export function buildResolvedTemporalContext(
  question: string,
  nowEpochSeconds: number,
  grounding: ConsultationGrounding,
): ResolvedTemporalContext {
  const civil = kstCivil(nowEpochSeconds);
  const referenceYear = groundingReferenceYear(grounding) ?? civil.year;
  const q = (question ?? '').trim();
  const years = resolveQuestionYears(q, referenceYear);
  const months = resolveQuestionMonths(q, referenceYear, null);
  const targets = [...years, ...months.targets.map((t) => t.year * 100 + t.month)];
  const qimenActive =
    grounding.status === 'available' && grounding.evidence.qimen.availability === 'available';
  return {
    anchorEpochSeconds: nowEpochSeconds,
    timezone: 'Asia/Seoul',
    referenceYear,
    referenceMonth: civil.month,
    resolvedTargets: Array.from(new Set(targets)),
    qimenActive,
  };
}
