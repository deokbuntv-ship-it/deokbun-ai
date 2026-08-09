// APP-owned PRESENTATION view model for the Manse (Four Pillars) screen.
//
// IMPORTANT: This is NOT the ENGINE contract and does NOT mirror any ENGINE
// type/enum/version. It contains only what the UI needs to render. The APP never
// computes calendar/pillar/element values. In APP-28C a separate adapter will
// map the authoritative ENGINE result -> ManseView; until then the container
// builds a "shell" ManseView with empty pillar slots (aggregateStatus:'pending').
//
// These components are intentionally decoupled from Saved Subject so the same
// presentation can later be reused by the Famous public page (props-in only).

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
// A single pillar column's display slots. Every value is nullable because the
// values are ENGINE-provided (APP-28C). In the 28B shell they are all null and
// render as placeholders — never fabricated.
export type PillarView = {
  columnLabel: string; // '시' | '일' | '월' | '년'
  heavenlyStem: string | null; // 천간 — ENGINE-provided glyph/label
  earthlyBranch: string | null; // 지지 — ENGINE-provided glyph/label
  ganzhiLabel: string | null; // 간지 (한글 표현)
  yinYang: string | null; // 음양 — derived facts (ENGINE)
  element: string | null; // 오행 — derived facts (ENGINE)
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
