// Consultation Intelligence — ASSESSMENT presentation adapter (Sprint 3A, §58/§70).
// Maps the AssessmentItem CONTRACT → fail-closed ViewModels for the Consumer and Admin
// UIs. This is the seam that lets Codex wire real data later WITHOUT a UI rewrite: the
// UI renders these ViewModels; only this adapter and the label maps change shape.
//
// It NEVER computes 역학 meaning (§9/§21). It only: looks values up in label maps, and
// DECIDES VISIBILITY from the data's own fields (fail-closed) —
//   • a tile is shown only for a committal evaluative level (§8/§44);
//   • `insufficient` confidence is HIDDEN, never shown as "낮음" (§25);
//   • supporting/counter are kept SEPARATE, never summed (§23);
//   • no numeric score is ever produced (§21).
// Import from the SOURCE modules, not the '@/features/intelligence' barrel: the barrel
// re-exports this file, so importing back from it forms a require cycle (index → this →
// index) that Metro flags as "uninitialized values". Presentation adapters must depend
// DOWNWARD on the contracts, never UPWARD on the aggregating barrel.
import { type AssessmentAxis, type AssessmentItem } from '../assessment';
import { ASSESSMENT_RULESET_NOT_CONNECTED } from '../versions';
import {
  AGREEMENT_LABELS,
  AXIS_LABELS,
  CONFIDENCE_LABELS,
  DIRECTION_ARROWS,
  DIRECTION_LABELS,
  EVALUATIVE_LEVELS,
  LEVEL_LABELS,
  LEVEL_TONES,
  type LabelTone,
} from './labels';

function isEvaluative(item: AssessmentItem): boolean {
  return EVALUATIVE_LEVELS.includes(item.level);
}

// ── Consumer ────────────────────────────────────────────────────────────────────────
export type ConsumerAssessmentTile = {
  axisKey: AssessmentAxis;
  axisLabel: string;
  levelLabel: string;
  tone: LabelTone;
  directionLabel: string; // '' when unknown → caller hides
  directionArrow: string;
  confidenceLabel: string; // '' when insufficient/absent → caller hides (§25)
  agreementLabel: string; // '' when absent → caller hides
  timingLabel: string; // '' when timing null → caller hides row
};

export type ConsumerAssessmentView =
  | { status: 'unavailable'; reason: 'not_connected' | 'insufficient' }
  | {
      status: 'available';
      tiles: ConsumerAssessmentTile[];
      // Axes that can't be assessed because birth time is missing — shown as ONE guidance
      // card, not as empty tiles (§216).
      missingBirthTimeAxes: { axisKey: AssessmentAxis; axisLabel: string }[];
    };

function toTile(item: AssessmentItem): ConsumerAssessmentTile {
  return {
    axisKey: item.axisKey,
    axisLabel: AXIS_LABELS[item.axisKey],
    levelLabel: LEVEL_LABELS[item.level],
    tone: LEVEL_TONES[item.level],
    directionLabel: DIRECTION_LABELS[item.direction],
    directionArrow: DIRECTION_ARROWS[item.direction],
    confidenceLabel: item.confidence === 'insufficient' ? '' : CONFIDENCE_LABELS[item.confidence],
    agreementLabel: AGREEMENT_LABELS[item.agreement],
    timingLabel: item.timing?.label ?? '',
  };
}

/**
 * Fail-closed: renders tiles ONLY for committal evaluative levels. If nothing is
 * evaluative, the consumer sees an honest "not shown yet" state — never a fabricated
 * 강함/보통. `not_connected` (ruleset not wired) is distinguished from `insufficient`
 * (wired but not enough evidence) so copy can differ.
 */
export function toConsumerAssessmentView(items: AssessmentItem[]): ConsumerAssessmentView {
  const evaluative = items.filter(isEvaluative);
  if (evaluative.length === 0) {
    const allNotConnected =
      items.length === 0 ||
      items.every(
        (i) => i.level === 'rules_not_connected' || i.rulesetVersion === ASSESSMENT_RULESET_NOT_CONNECTED,
      );
    return { status: 'unavailable', reason: allNotConnected ? 'not_connected' : 'insufficient' };
  }
  const missingBirthTimeAxes = items
    .filter((i) => i.applicability === 'missing_birth_time')
    .map((i) => ({ axisKey: i.axisKey, axisLabel: AXIS_LABELS[i.axisKey] }));
  return { status: 'available', tiles: evaluative.map(toTile), missingBirthTimeAxes };
}

// ── Admin matrix (full row — all 7 columns, truthful for EVERY level incl. non-evaluative)
export type AdminAssessmentRow = {
  axisKey: AssessmentAxis;
  axisLabel: string;
  levelLabel: string;
  tone: LabelTone;
  directionLabel: string;
  confidenceLabel: string; // admin shows the REAL state incl. '근거 부족' — see below
  agreementLabel: string;
  timingLabel: string;
  supportingCount: number; // ▲ — never summed with counter (§23)
  counterCount: number; // ▼
  warningsCount: number;
  rulesetConnected: boolean;
};

// Admin sees insufficient truthfully (not hidden like consumer) — distinct from empty.
const ADMIN_CONFIDENCE_LABELS: Record<AssessmentItem['confidence'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
  insufficient: '근거 부족',
};

export function toAdminAssessmentRow(item: AssessmentItem): AdminAssessmentRow {
  return {
    axisKey: item.axisKey,
    axisLabel: AXIS_LABELS[item.axisKey],
    levelLabel: LEVEL_LABELS[item.level],
    tone: LEVEL_TONES[item.level],
    directionLabel: DIRECTION_LABELS[item.direction] || '—',
    confidenceLabel: ADMIN_CONFIDENCE_LABELS[item.confidence],
    agreementLabel: AGREEMENT_LABELS[item.agreement] || '—',
    timingLabel: item.timing?.label ?? '—',
    supportingCount: item.supportingEvidenceRefs.length,
    counterCount: item.counterEvidenceRefs.length,
    warningsCount: item.warnings.length,
    rulesetConnected: item.rulesetVersion !== ASSESSMENT_RULESET_NOT_CONNECTED,
  };
}
