// Consultation Intelligence — PRESENTATION LABELS (Sprint 3A). The Korean label maps
// that turn the CATEGORICAL contract values into user/operator text. This is the ONE
// place UI copy for intelligence lives (design handoff §6 — "한국어 라벨 맵은 Claude Code").
//
// HARD boundary (§9/§21): this file maps VALUES to WORDS. It never DERIVES a value —
// no "two engines agree → high confidence", no numeric score, no level computation.
// The value (level/direction/confidence/agreement/timing/availability) is produced by
// Codex; here we only look it up in a table.
import type { EngineEvidenceAvailability } from '@/features/analysis';
import type {
  AssessmentAgreement,
  AssessmentAxis,
  AssessmentConfidence,
  AssessmentDirection,
  AssessmentLevel,
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
