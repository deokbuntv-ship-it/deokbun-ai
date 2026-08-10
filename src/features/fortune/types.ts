// Fortune presentation contract — UI-ONLY TYPES.
//
// The APP does not compute fortunes. These types describe the shape of a
// canonical fortune payload as it will arrive from the (not-yet-connected)
// fortune engine. The UI renders real values ONLY when a FortunePresentation
// exists; until then it shows truthful "준비 중 / 엔진 연결 준비 중" states. No
// fabricated scores, no invented interpretation, no forced multi-engine output
// ever originates in the APP. This is presentation-layer only — it does NOT
// duplicate ENGINE domain logic.

// Time period of a reading (§11, §18).
export type FortunePeriod = 'today' | 'week' | 'month' | 'year';

export const FORTUNE_PERIOD_ORDER: FortunePeriod[] = [
  'today',
  'week',
  'month',
  'year',
];
export const FORTUNE_PERIOD_LABELS: Record<FortunePeriod, string> = {
  today: '오늘',
  week: '이번 주',
  month: '이번 달',
  year: '올해',
};

// Canonical fortune categories (§14) — user-facing Korean, must stay compatible
// with the future ENGINE contract. These are the analysis breakdown, distinct
// from the home "quick entry" navigation shortcuts.
export type FortuneCategoryKey =
  | 'wealth' // 재물
  | 'career' // 사업·직장
  | 'love' // 연애·인연
  | 'health' // 건강
  | 'relationships' // 대인관계
  | 'change'; // 이동·변화

export const FORTUNE_CATEGORY_ORDER: FortuneCategoryKey[] = [
  'wealth',
  'career',
  'love',
  'health',
  'relationships',
  'change',
];
export const FORTUNE_CATEGORY_LABELS: Record<FortuneCategoryKey, string> = {
  wealth: '재물',
  career: '사업·직장',
  love: '연애·인연',
  health: '건강',
  relationships: '대인관계',
  change: '이동·변화',
};

// One category result (§15). Only fields the ENGINE actually provides are set;
// optional timing fields appear ONLY with real canonical analysis.
export interface FortuneCategory {
  key: FortuneCategoryKey;
  summary: string; // one-line
  detail: string;
  goodFlow?: string;
  cautionFlow?: string;
  favorableTime?: string;
  cautionTime?: string;
}

// Trend-visualization point (§12/§19). `value` is engine-provided, never faked.
export interface FortuneTrendPoint {
  label: string;
  value: number;
}

// Which analysis engines informed a reading (§16, §22, §56).
export type AnalysisBasisKey = 'myeongri' | 'ziwei' | 'qimen' | 'synthesis';
export const ANALYSIS_BASIS_LABELS: Record<AnalysisBasisKey, string> = {
  myeongri: '명리',
  ziwei: '자미두수',
  qimen: '기문둔갑',
  synthesis: '종합 판단',
};

// Truthful availability of each engine source (§56). 'not_applicable' covers
// e.g. Qi Men on a non-time-sensitive daily reading (§16, §23) — it is NOT the
// same as 'unavailable'. The UI must never imply an engine ran when it did not.
export type EngineAvailability = 'available' | 'unavailable' | 'not_applicable';
export interface EngineSourceAvailability {
  myeongri: EngineAvailability;
  ziwei: EngineAvailability;
  qimen: EngineAvailability;
}

// Full presentation payload for one subject + period — produced ONLY by the
// canonical engine. `score` is null unless a canonical scoring contract exists
// (§13); the APP never invents a number to fill the UI.
export interface FortunePresentation {
  subjectId: string;
  subjectName: string | null;
  period: FortunePeriod;
  date: string; // ISO date the reading is anchored to (engine-provided)
  engineVersion: string;
  generatedAt: string; // ISO timestamp
  summary: string;
  score: number | null;
  categories: FortuneCategory[];
  trends: FortuneTrendPoint[];
  analysisBasis: AnalysisBasisKey[];
  sourceAvailability: EngineSourceAvailability;
}

// Discriminated UI state. Starts at 'engine_unavailable' because the canonical
// engine is not connected; the APP NEVER synthesizes 'ready' with invented data.
export type FortuneViewState =
  | { status: 'engine_unavailable' }
  | { status: 'needs_subject' }
  | { status: 'loading' }
  | { status: 'ready'; presentation: FortunePresentation }
  | { status: 'error'; message: string };
