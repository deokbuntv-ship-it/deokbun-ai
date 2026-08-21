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

/** Extract the previous decision directly from a server-loaded decisionMeta (Sprint E live path). */
export function previousDecisionFromMeta(meta: ConsultationDecisionMeta | null | undefined): PreviousDecision | null {
  if (!meta) return null;
  return {
    polarity: meta.polarity,
    resolvedGranularity: meta.resolvedGranularity,
    resolvedTargets: meta.resolvedTargets,
    decisionMeta: meta,
    hasComparisonSet: meta.resolvedTargets.length >= 2,
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
export function resolveFollowUpAction(
  intent: FollowUpIntent,
  previous: PreviousDecision | null,
  current?: { engineVersion?: string | null },
): FollowUpAction {
  switch (intent) {
    case 'WHY':
      return { kind: 'EXPLAIN_PREVIOUS', versionMismatch: isDecisionVersionMismatch(previous?.decisionMeta, current) };
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

const POLARITY_LABEL: Record<PolarityTier, string> = {
  FAVORABLE: '좋은 편', STEADY: '무난한 편', DYNAMIC: '변화가 많은 편', CAUTION: '조심이 필요한 편',
};

/**
 * Build a system directive that applies a follow-up action to the CURRENT consultation turn (Sprint E).
 * Only appended when there is a recoverable previous decision — it never fabricates candidates from prose.
 * Returns null for NONE / DEFER_V1_1 (the normal path handles those).
 */
export function renderFollowUpDirective(action: FollowUpAction, previous: PreviousDecision | null): string | null {
  switch (action.kind) {
    case 'EXPLAIN_PREVIOUS': {
      const parts = [
        '[후속 지침 — "왜?"] 새로운 결론을 새로 만들지 마십시오. 앞선 상담의 결론을 그대로 두고, 그렇게 본 이유만 설명하십시오.',
      ];
      if (previous?.polarity) parts.push(`앞선 결론의 전반 흐름은 "${POLARITY_LABEL[previous.polarity]}"였습니다 — 이 방향을 바꾸지 마십시오.`);
      if (action.versionMismatch) {
        parts.push('저장된 이전 판단을 그대로 설명하고, 지금 규칙으로 다시 계산해 다른 결론을 내지 마십시오.');
      }
      return parts.join(' ');
    }
    case 'RECALC_NEXT_YEAR': {
      const dom = previous?.decisionMeta?.domain && previous.decisionMeta.domain !== '전반' ? previous.decisionMeta.domain : null;
      return `[후속 지침 — "그럼 내년은?"] ${dom ? `앞선 주제(${dom})를 이어서 ` : ''}내년(다음 해)의 흐름을 새로 설명하십시오. 앞선 해의 결론을 그대로 옮기지 말고, 내년 근거에 따라 판단하십시오.`;
    }
    case 'DESCRIBE_CANDIDATES_NO_WINNER':
      if (action.candidates.length < 2) return null; // no recoverable candidate set → normal path
      return '[후속 지침 — "둘 중에는?"] 앞서 살펴본 후보들을 각각 설명하되, 한쪽을 승자/1순위로 고르거나 더 낫다고 단정하지 마십시오. 지금 규칙으로는 한쪽을 우열로 정하지 않습니다.';
    default:
      return null;
  }
}
