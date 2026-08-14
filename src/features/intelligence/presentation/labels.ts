// Consultation Intelligence — PRESENTATION LABELS (Sprint 3A). The Korean label maps
// that turn the CATEGORICAL contract values into user/operator text. This is the ONE
// place UI copy for intelligence lives (design handoff §6 — "한국어 라벨 맵은 Claude Code").
//
// HARD boundary (§9/§21): this file maps VALUES to WORDS. It never DERIVES a value —
// no "two engines agree → high confidence", no numeric score, no level computation.
// The value (level/direction/confidence/agreement/timing/availability) is produced by
// Codex; here we only look it up in a table.
import type { EngineEvidenceAvailability } from '@/features/analysis';
import type { Agreement, Polarity } from '@/features/analysis/crossAnalysis';
import type { GroundingUnavailableReason } from '@/features/chat/prompts/grounding';
import type {
  AssessmentAgreement,
  AssessmentApplicability,
  AssessmentAxis,
  AssessmentConfidence,
  AssessmentDirection,
  AssessmentLevel,
  FeedbackReason,
  FeedbackVerdict,
  OutcomeConfidence,
  OutcomeSource,
  OutcomeType,
  OutcomeVerificationStatus,
  QualityDimension,
  QualityReviewStatus,
  QualityStatus,
} from '@/features/intelligence';

export type LabelTone = 'strong' | 'neutral' | 'caution' | 'muted';

// ── Axes (15) — consumer-facing Korean labels ───────────────────────────────────────
export const AXIS_LABELS: Readonly<Record<AssessmentAxis, string>> = {
  overall: '전반',
  personality: '기본 성향',
  wealth: '재물',
  business: '사업',
  career: '일·직업',
  relationship: '관계',
  romance_partner: '인연·배우자',
  family: '가족',
  health_lifestyle: '건강·생활',
  learning_growth: '학습·성장',
  movement_change: '이동·변화',
  achievement_reputation: '성취·평판',
  risk_caution: '주의',
  current_cycle: '현재 흐름',
  future_timing: '시기',
};

// ── Level (categorical — NEVER a number/percent/stars) ──────────────────────────────
// Committal evaluative levels (a real reading) vs. non-committal states (no reading).
export const EVALUATIVE_LEVELS: readonly AssessmentLevel[] = [
  'very_strong', 'strong', 'moderate', 'weak', 'very_weak', 'mixed',
];

export const LEVEL_LABELS: Readonly<Record<AssessmentLevel, string>> = {
  very_strong: '매우 강함',
  strong: '강함',
  moderate: '보통',
  weak: '약함',
  very_weak: '매우 약함',
  mixed: '혼재',
  not_applicable: '해당 없음',
  insufficient: '근거 부족',
  rules_not_connected: '평가 미연결',
};

export const LEVEL_TONES: Readonly<Record<AssessmentLevel, LabelTone>> = {
  very_strong: 'strong',
  strong: 'strong',
  moderate: 'neutral',
  weak: 'caution',
  very_weak: 'caution',
  mixed: 'neutral',
  not_applicable: 'muted',
  insufficient: 'muted',
  rules_not_connected: 'muted',
};

// ── Direction (kept SEPARATE from level, §17) ───────────────────────────────────────
export const DIRECTION_LABELS: Readonly<Record<AssessmentDirection, string>> = {
  rising: '상승',
  stable: '유지',
  declining: '하락',
  volatile: '변동',
  mixed: '혼재',
  unknown: '',
};

export const DIRECTION_ARROWS: Readonly<Record<AssessmentDirection, string>> = {
  rising: '↑',
  stable: '→',
  declining: '↓',
  volatile: '↕',
  mixed: '↕',
  unknown: '',
};

// ── Confidence — consumer label. `insufficient` is NOT "Low"; the caller HIDES it. ──
export const CONFIDENCE_LABELS: Readonly<Record<AssessmentConfidence, string>> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
  insufficient: '', // never shown to the consumer (§25/§217)
};

// ── Agreement (근거 일치도) ──────────────────────────────────────────────────────────
export const AGREEMENT_LABELS: Readonly<Record<AssessmentAgreement, string>> = {
  aligned: '일치',
  complementary: '보완',
  conflicting: '상충',
  insufficient_evidence: '', // hidden (no agreement to show)
  single_engine: '단일 관점',
  not_applicable: '',
};

// ── Assessment applicability (per-axis / per-engine contribution) — distinct enum from
// engine availability: applicable/missing_birth_time/not_applicable/insufficient (§26).
export const APPLICABILITY_LABELS: Readonly<Record<AssessmentApplicability, string>> = {
  applicable: '적용',
  missing_birth_time: '출생시간 필요',
  not_applicable: '해당 없음',
  insufficient: '근거 부족',
};

// ── Engine availability — Admin MUST distinguish these (not_activated ≠ failed, §29/§30)
export const AVAILABILITY_LABELS: Readonly<Record<EngineEvidenceAvailability, string>> = {
  available: '활용됨',
  not_applicable: '미사용', // deliberately not used for this question — a NORMAL state
  missing_birth_time: '출생시간 필요',
  engine_not_connected: '미연결',
  calculation_failed: '계산 실패', // an ERROR — never conflate with not_applicable
};

export const AVAILABILITY_TONES: Readonly<Record<EngineEvidenceAvailability, LabelTone>> = {
  available: 'strong',
  not_applicable: 'muted',
  missing_birth_time: 'caution',
  engine_not_connected: 'muted',
  calculation_failed: 'caution',
};

// Engine display names (only shown when actually used, §27).
export const ENGINE_LABELS: Readonly<Record<'saju' | 'ziwei' | 'qimen', string>> = {
  saju: '명리',
  ziwei: '자미두수',
  qimen: '기문둔갑',
};

// ── Grounding unavailable reason (why no evidence is grounding this consultation) ─────
// Admin-facing; consumer copy lives in ConsultationStateNotice. birth_time_unknown is a
// user-fixable state, distinct from engine_not_connected (pipeline) and calculation_failed.
export const GROUNDING_REASON_LABELS: Readonly<Record<GroundingUnavailableReason, string>> = {
  engine_not_connected: '엔진 미연결',
  birth_time_unknown: '출생시간 미상',
  calculation_failed: '계산 실패',
  not_applicable: '해당 없음',
};

// ── Cross Analysis (Codex classifies; we only label). agreement is NOT a merged score. ─
export const CROSS_AGREEMENT_LABELS: Readonly<Record<Agreement, string>> = {
  aligned: '일치',
  complementary: '보완',
  conflicting: '상충',
  insufficient_evidence: '근거 부족',
};

export const CROSS_AGREEMENT_TONES: Readonly<Record<Agreement, LabelTone>> = {
  aligned: 'strong',
  complementary: 'neutral',
  conflicting: 'caution',
  insufficient_evidence: 'muted',
};

export const POLARITY_LABELS: Readonly<Record<Polarity, string>> = {
  positive: '긍정',
  neutral: '중립',
  caution: '주의',
};

export const POLARITY_TONES: Readonly<Record<Polarity, LabelTone>> = {
  positive: 'strong',
  neutral: 'neutral',
  caution: 'caution',
};

// ── Evaluation / response quality (§30 — the quality of the ANSWER, not the reading) ──
export const QUALITY_STATUS_LABELS: Readonly<Record<QualityStatus, string>> = {
  excellent: '우수',
  good: '양호',
  acceptable: '보통',
  needs_review: '검토 필요',
  poor: '미흡',
  not_evaluated: '미평가',
};

export const QUALITY_STATUS_TONES: Readonly<Record<QualityStatus, LabelTone>> = {
  excellent: 'strong',
  good: 'strong',
  acceptable: 'neutral',
  needs_review: 'caution',
  poor: 'caution',
  not_evaluated: 'muted',
};

export const QUALITY_DIMENSION_LABELS: Readonly<Record<QualityDimension, string>> = {
  evidence_fidelity: '근거 충실도',
  question_relevance: '질문 적합성',
  internal_consistency: '내부 일관성',
  cross_engine_handling: '교차 해석 처리',
  unsupported_claims: '근거 없는 주장',
  exaggeration: '과장 여부',
  timing_structure: '시점 구조',
  followup_continuity: '후속 연속성',
  clarity: '명료성',
  overall_quality: '종합 품질',
};

export const REVIEW_STATUS_LABELS: Readonly<Record<QualityReviewStatus, string>> = {
  pending: '대기',
  in_review: '검토 중',
  reviewed: '검토 완료',
};

// ── Outcome (§34 — user_report stays unverified; never AI-inferred, never auto-verified)
export const OUTCOME_TYPE_LABELS: Readonly<Record<OutcomeType, string>> = {
  confirmed_positive: '긍정 확인',
  confirmed_negative: '부정 확인',
  partial: '부분',
  no_change: '변화 없음',
  other: '기타',
};

export const OUTCOME_SOURCE_LABELS: Readonly<Record<OutcomeSource, string>> = {
  user_report: '사용자 보고',
  admin_observed: '운영자 관찰',
  system_observed: '시스템 관찰',
  external_verified: '외부 검증',
};

export const OUTCOME_VERIFICATION_LABELS: Readonly<Record<OutcomeVerificationStatus, string>> = {
  unverified: '미검증',
  partially_verified: '부분 검증',
  verified: '검증됨',
  disputed: '이의 있음',
};

export const OUTCOME_VERIFICATION_TONES: Readonly<Record<OutcomeVerificationStatus, LabelTone>> = {
  unverified: 'muted',
  partially_verified: 'caution',
  verified: 'strong',
  disputed: 'caution',
};

export const OUTCOME_CONFIDENCE_LABELS: Readonly<Record<OutcomeConfidence, string>> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
  insufficient: '근거 부족',
};

// ── User feedback (§20/§32) ───────────────────────────────────────────────────────────
export const FEEDBACK_VERDICT_LABELS: Readonly<Record<FeedbackVerdict, string>> = {
  helpful: '도움이 됨',
  not_helpful: '도움이 안 됨',
};

export const FEEDBACK_REASON_LABELS: Readonly<Record<FeedbackReason, string>> = {
  too_vague: '너무 모호함',
  too_long: '너무 김',
  too_short: '너무 짧음',
  felt_inaccurate: '부정확하게 느껴짐',
  hard_to_understand: '이해하기 어려움',
  not_relevant: '질문과 무관함',
  other: '기타',
};
