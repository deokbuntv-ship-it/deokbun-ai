// Consultation Intelligence — QUESTION SCOPE (directive §19–§21). A question
// determines WHICH assessment axes are relevant, so a broad "사주풀이" and a narrow
// "2027년 사업 타이밍" pull different (and differently-sized) assessment sets. PURE
// structural map only — the actual per-message scope classification + the
// isTimingQuestion decision are product-level and resolved elsewhere (Codex, §48).
import type { AssessmentAxis } from './assessment';

export type QuestionScope =
  | 'broad_natal' // "내 사주풀이 좀 해줘"
  | 'business_timing' // "2027년 3월에 사업을 시작해도 될까?"
  | 'wealth'
  | 'career'
  | 'relationship'
  | 'romance'
  | 'health'
  | 'timing'
  | 'general'
  | 'unscoped'; // not yet classified

// Which axes are RELEVANT for a scope (product relevance, NOT astrology). A
// follow-up question re-resolves its scope and expands/contracts this set (§21) —
// it never copies the previous answer.
export const SCOPE_AXES: Readonly<Record<QuestionScope, readonly AssessmentAxis[]>> = {
  broad_natal: [
    'overall', 'personality', 'wealth', 'business', 'career', 'relationship',
    'romance_partner', 'family', 'health_lifestyle', 'movement_change', 'current_cycle',
  ],
  business_timing: ['business', 'wealth', 'risk_caution', 'future_timing', 'movement_change'],
  wealth: ['wealth', 'business', 'risk_caution', 'current_cycle', 'future_timing'],
  career: ['career', 'achievement_reputation', 'learning_growth', 'current_cycle', 'future_timing'],
  relationship: ['relationship', 'romance_partner', 'family', 'personality'],
  romance: ['romance_partner', 'relationship', 'personality', 'future_timing'],
  health: ['health_lifestyle', 'current_cycle', 'risk_caution'],
  timing: ['future_timing', 'current_cycle', 'movement_change'],
  general: ['overall', 'current_cycle'],
  unscoped: [],
};

export function axesForScope(scope: QuestionScope): readonly AssessmentAxis[] {
  return SCOPE_AXES[scope] ?? [];
}
