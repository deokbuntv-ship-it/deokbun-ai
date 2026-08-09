import type { FiveElementColorKey } from '@/theme';

// APP-owned PRESENTATION view model for the Manse (Four Pillars) screen.
//
// IMPORTANT: This is NOT the ENGINE contract and does NOT mirror any ENGINE
// type/enum/version. It contains only what the UI needs to render (pre-resolved
// labels + a theme color key). The APP never computes calendar/pillar/element/
// yinYang/tenGod/hiddenStem values — manseAdapter maps the authoritative ENGINE
// result (incl. canonical labels) onto this shape.
//
// These types are decoupled from both the Saved Subject and the ENGINE enums so
// the same presentation can be reused by the Famous public page (props-in only).

// ---- Raw birth display (exactly as the user entered it) ----
// Presentation enums mirror the raw input *values*, but are declared here so the
// manse feature does not depend on the consultation feature.
export type ManseGender = 'male' | 'female';
export type ManseCalendarType = 'solar' | 'lunar';
export type ManseLunarMonthType = 'regular' | 'leap';
export type ManseTimeAccuracy = 'exact' | 'approximate' | 'unknown';
export type ManseApproximatePeriod =
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night';

// Raw, un-normalized birth information for the summary header. Lunar dates are
// shown as entered — the APP never converts lunar -> solar (that is ENGINE work).
export type ManseBirthDisplay = {
  displayName: string;
  isSelf: boolean;
  relationship: string | null;
  gender: ManseGender | null;
  calendarType: ManseCalendarType | null;
  lunarMonthType: ManseLunarMonthType | null;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTimeAccuracy: ManseTimeAccuracy | null;
  birthHour: string; // only meaningful when birthTimeAccuracy === 'exact'
  birthMinute: string;
  approximateTimePeriod: ManseApproximatePeriod | null;
  birthPlace: string;
};

// ---- Pillar presentation ----
// All label strings are ENGINE canonical labels (hanja/hangul, 음양, 십신, 오행,
// 지장간 역할). `elementColorKey` is a theme token key (APP theming), NOT an ENGINE
// value. Nothing here is computed by the APP.
export type ManseHiddenStemView = {
  hanja: string; // 지장간 한자 (e.g. 甲)
  hangul: string; // 지장간 한글 (e.g. 갑)
  roleLabel: string; // 정기 / 중기 / 여기
  elementColorKey: FiveElementColorKey;
  elementLabel: string; // 목 / 화 / 토 / 금 / 수
  yinYangLabel: string; // 양 / 음
  tenGodLabel: string; // 십신
};

export type ManseStemView = {
  hanja: string; // 천간 한자
  hangul: string; // 천간 한글
  elementColorKey: FiveElementColorKey;
  elementLabel: string;
  yinYangLabel: string;
  tenGodLabel: string; // 십신, or '일간' for the Day Master stem
  isDayMaster: boolean; // true only for the day pillar stem (presentation emphasis)
};

export type ManseBranchView = {
  hanja: string; // 지지 한자
  hangul: string; // 지지 한글
  elementColorKey: FiveElementColorKey;
  elementLabel: string;
  yinYangLabel: string;
  hiddenStems: ManseHiddenStemView[]; // 지장간 (상세/펼침)
};

// A single pillar column. `stem`/`branch` are null when this pillar is not
// available (e.g. the hour pillar under PARTIAL) — never fabricated.
export type PillarView = {
  columnLabel: string; // '시' | '일' | '월' | '년'
  stem: ManseStemView | null;
  branch: ManseBranchView | null;
};

export type ManseFourPillars = {
  hour: PillarView;
  day: PillarView;
  month: PillarView;
  year: PillarView;
};

// ---- Presentation status (APP-owned, NOT ENGINE enums) ----
// How the whole chart should present.
// - 'pending'     : ENGINE not yet integrated (APP-28B default)
// - 'complete'    : all four pillars available
// - 'partial'     : year/month/day available, hour unresolved
// - 'unavailable' : pillars cannot be shown at all
export type ManseAggregateStatus =
  | 'pending'
  | 'complete'
  | 'partial'
  | 'unavailable';

// How the hour pillar should present.
// - 'available'   : ENGINE resolved the hour pillar
// - 'approximate' : raw input gave only a rough period (no exact time)
// - 'unknown'     : raw input has no birth time
// - 'ambiguous'   : ENGINE cannot settle on a single time basis
// - 'unavailable' : ENGINE cannot produce the hour pillar
// - 'pending'     : ENGINE not yet integrated (APP-28B default for exact input)
export type ManseHourStatus =
  | 'available'
  | 'approximate'
  | 'unknown'
  | 'ambiguous'
  | 'unavailable'
  | 'pending';

export type ManseView = {
  birth: ManseBirthDisplay;
  aggregateStatus: ManseAggregateStatus;
  hourStatus: ManseHourStatus;
  pillars: ManseFourPillars;
  // Availability flags for the deferred sections (false in the 28B shell).
  derivedFactsAvailable: boolean;
  fortuneCycleAvailable: boolean;
  // Optional product-facing reason shown when aggregateStatus === 'unavailable'.
  unavailableReason?: string | null;
};
