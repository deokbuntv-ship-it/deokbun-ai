// Consultation Intelligence — ASSESSMENT DETAIL presentation adapter (Sprint 3A-B,
// §9/§26). Expands a single AssessmentItem into the detail Sheet (consumer) / drawer
// (admin) ViewModel. Same fail-closed rules as assessmentView: insufficient confidence is
// hidden from the consumer (never "낮음"), supporting/counter are kept SEPARATE, unknown
// stays unknown. Raw evidence ids are ADMIN-only (§9 — not consumer-facing).
// Source modules, not the barrel (avoids the index → this → index require cycle). See
// assessmentView.ts for the rationale.
import { type AssessmentItem } from '../assessment';
import { ASSESSMENT_RULESET_NOT_CONNECTED } from '../versions';

import {
  AGREEMENT_LABELS,
  APPLICABILITY_LABELS,
  AXIS_LABELS,
  CONFIDENCE_LABELS,
  DIRECTION_ARROWS,
  DIRECTION_LABELS,
  ENGINE_LABELS,
  LEVEL_LABELS,
  LEVEL_TONES,
  type LabelTone,
} from './labels';

// One engine's contribution to this axis (admin — shows which engine + how many refs).
export type EngineContributionView = {
  engineLabel: string;
  applicabilityLabel: string;
  evidenceCount: number;
};

export type ConsumerAssessmentDetail = {
  axisLabel: string;
  levelLabel: string;
  tone: LabelTone;
  directionLabel: string; // '' → hide
  directionArrow: string;
  confidenceLabel: string; // '' when insufficient/absent → hide (§12/§25)
  agreementLabel: string; // '' → hide
  timingLabel: string; // '' → hide
  // Consumer sees COUNTS of supporting/counter (kept separate), never the raw ids (§9).
  supportingCount: number;
  counterCount: number;
  cautions: string[]; // warnings, surfaced as gentle 주의 notes
};

export function toConsumerAssessmentDetail(item: AssessmentItem): ConsumerAssessmentDetail {
  return {
    axisLabel: AXIS_LABELS[item.axisKey],
    levelLabel: LEVEL_LABELS[item.level],
    tone: LEVEL_TONES[item.level],
    directionLabel: DIRECTION_LABELS[item.direction],
    directionArrow: DIRECTION_ARROWS[item.direction],
    confidenceLabel: item.confidence === 'insufficient' ? '' : CONFIDENCE_LABELS[item.confidence],
    agreementLabel: AGREEMENT_LABELS[item.agreement],
    timingLabel: item.timing?.label ?? '',
    supportingCount: item.supportingEvidenceRefs.length,
    counterCount: item.counterEvidenceRefs.length,
    cautions: item.warnings,
  };
}

export type AdminAssessmentDetail = {
  axisLabel: string;
  levelLabel: string;
  tone: LabelTone;
  directionLabel: string;
  confidenceLabel: string; // admin shows insufficient truthfully as '근거 부족'
  agreementLabel: string;
  timingLabel: string;
  timingPeriodRef: string; // '' when null
  supportingRefs: string[]; // ▲ raw ids — admin only, NEVER merged with counter (§25/§26)
  counterRefs: string[]; // ▼
  warnings: string[];
  engineContributions: EngineContributionView[];
  rulesetConnected: boolean;
};

const ADMIN_CONFIDENCE_LABELS: Record<AssessmentItem['confidence'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
  insufficient: '근거 부족',
};

export function toAdminAssessmentDetail(item: AssessmentItem): AdminAssessmentDetail {
  return {
    axisLabel: AXIS_LABELS[item.axisKey],
    levelLabel: LEVEL_LABELS[item.level],
    tone: LEVEL_TONES[item.level],
    directionLabel: DIRECTION_LABELS[item.direction] || '—',
    confidenceLabel: ADMIN_CONFIDENCE_LABELS[item.confidence],
    agreementLabel: AGREEMENT_LABELS[item.agreement] || '—',
    timingLabel: item.timing?.label ?? '—',
    timingPeriodRef: item.timing?.periodRef ?? '',
    supportingRefs: item.supportingEvidenceRefs,
    counterRefs: item.counterEvidenceRefs,
    warnings: item.warnings,
    engineContributions: item.engineContributions.map((c) => ({
      engineLabel: ENGINE_LABELS[c.engine],
      applicabilityLabel: APPLICABILITY_LABELS[c.applicability],
      evidenceCount: c.evidenceRefs.length,
    })),
    rulesetConnected: item.rulesetVersion !== ASSESSMENT_RULESET_NOT_CONNECTED,
  };
}
