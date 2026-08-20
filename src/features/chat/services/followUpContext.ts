// Structured follow-up foundation (Sprint D §D2/§D3/§D4). PURE helpers that reason about the PREVIOUS
// persisted assistant decision (structured, not prose) and classify a follow-up question into a
// deterministic action that honors the V1 contracts:
//   - "왜?"        → explain the STORED previous decision (under its persisted version); never silently
//                     recompute a different deterministic decision (§D4).
//   - "그럼 내년은?" → resolve a NEW next-year target under current server temporal authority; polarity
//                     follows the Sprint C.1 target-scoped rules (never reuse the prior current-year value).
//   - "둘 중에는?"  → describe the previous candidates WITHOUT ranking them (Option B; no winner).
//   - "그럼 언제?"  → deferred V1.1 (must not sneak in a best-period ranking).
// This is NOT a conversation-state engine; it is the minimum structured substrate. Live orchestrator wiring
// (passing the previous decision to the next turn) is a separate, documented step.
import { isDecisionVersionMismatch } from '@/features/chat/server/decisionMeta';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';
import type { PolarityTier } from '@/features/polarity/polarityKernel';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

export type PreviousDecision = {
  polarity?: PolarityTier;
  resolvedGranularity?: 'NONE' | 'YEAR' | 'MONTH';
  resolvedTargets: number[];
  decisionMeta?: ConsultationDecisionMeta;
  hasComparisonSet: boolean;
};

/**
 * Extract the previous decision from the most recent VALID assistant view-model. Prefers the structured
 * `decisionMeta` over prose. Returns null when there is no structured decision to reason about.
 */
export function previousDecisionFrom(vm: StructuredConsultationViewModel | undefined): PreviousDecision | null {
  if (!vm) return null;
  const meta = vm.decisionMeta;
  const polarity = vm.conclusionPolarity ?? meta?.polarity;
  const resolvedTargets = meta?.resolvedTargets ?? [];
  if (!meta && !polarity) return null;
  return {
    polarity,
    resolvedGranularity: meta?.resolvedGranularity,
    resolvedTargets,
    decisionMeta: meta,
    hasComparisonSet: resolvedTargets.length >= 2,
  };
}

export type FollowUpIntent = 'WHY' | 'NEXT_YEAR' | 'BETWEEN_CANDIDATES' | 'WHEN' | 'NONE';

/** Deterministically classify a follow-up question into one of the minimum V1 intents. */
export function classifyFollowUpIntent(question: string): FollowUpIntent {
  const q = (question ?? '').trim();
  if (q.length === 0) return 'NONE';
  if (/^왜\s*\??$|왜\s*(그래|그런|그렇|인가|일까|죠|요)/.test(q)) return 'WHY';
  if (/그럼\s*내년|그러면\s*내년|내년은\s*\??$|내년엔\s*\??$/.test(q)) return 'NEXT_YEAR';
  if (/둘\s*중|두\s*개\s*중|어느\s*(쪽|것|게)\s*(이|가)?/.test(q)) return 'BETWEEN_CANDIDATES';
  if (/그럼\s*언제|그러면\s*언제|언제(가|는|쯤)?\s*\??$/.test(q)) return 'WHEN';
  return 'NONE';
}

export type FollowUpAction =
  | { kind: 'EXPLAIN_PREVIOUS'; versionMismatch: boolean } // 왜? — explain the stored decision; flag a version drift
  | { kind: 'RECALC_NEXT_YEAR' } // 그럼 내년은? — new next-year target under current version
  | { kind: 'DESCRIBE_CANDIDATES_NO_WINNER'; candidates: number[] } // 둘 중에는? — Option B, no winner
  | { kind: 'DEFER_V1_1' } // 그럼 언제? — deferred, no ranking
  | { kind: 'NONE' };

/**
 * Map a follow-up intent + the previous decision to a deterministic action. Encodes the version-mismatch
 * contract (§D4) and Option B (§D3.C). Does NOT recompute anything itself.
 */
export function resolveFollowUpAction(intent: FollowUpIntent, previous: PreviousDecision | null): FollowUpAction {
  switch (intent) {
    case 'WHY':
      return { kind: 'EXPLAIN_PREVIOUS', versionMismatch: isDecisionVersionMismatch(previous?.decisionMeta) };
    case 'NEXT_YEAR':
      return { kind: 'RECALC_NEXT_YEAR' };
    case 'BETWEEN_CANDIDATES':
      return { kind: 'DESCRIBE_CANDIDATES_NO_WINNER', candidates: previous?.resolvedTargets ?? [] };
    case 'WHEN':
      return { kind: 'DEFER_V1_1' };
    default:
      return { kind: 'NONE' };
  }
}
