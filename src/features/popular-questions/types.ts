// Popular consultation questions (Home IA / consultation-conversion sprint). The admin-managed
// "지금 많이 물어보는 질문" list that used to be a hard-coded array on Home is now a small config model:
// a curated set of high-intent consultation entry points the OWNER can edit, activate, and REORDER without
// a code change — and whose impression → click → consultation → answer funnel is measurable.
//
// Design guardrails baked into the type:
//  - display order is AUTHORITATIVE (owner-set); there is NO astrology/personalization/auto-ranking (§ sprint).
//  - the category is a SMALL internal vocabulary, never exposed as a raw enum to consumers (it maps to copy/icon).
//  - a STABLE analyticsKey (slug) — not the mutable question text — is the funnel correlation key, so editing
//    the wording of a question never breaks its historical metrics.
// This file is pure (no React Native / Supabase imports) so it stays importable in the node test runner.

// Small, closed category vocabulary. Adapt-don't-expand: these mirror the app's existing consultation domains
// (money / career / business / relationship / love / life-change / wellbeing) plus a GENERAL catch-all. HEALTH
// is intentionally framed as WELLBEING (constructive management), never fear/warning framing.
export const POPULAR_QUESTION_CATEGORIES = [
  'MONEY',
  'CAREER',
  'BUSINESS',
  'RELATIONSHIP',
  'LOVE',
  'CHANGE',
  'WELLBEING',
  'GENERAL',
] as const;

export type PopularQuestionCategory = (typeof POPULAR_QUESTION_CATEGORIES)[number];

export function isPopularQuestionCategory(value: unknown): value is PopularQuestionCategory {
  return typeof value === 'string' && (POPULAR_QUESTION_CATEGORIES as readonly string[]).includes(value);
}

// Admin-facing Korean labels for the category chips (consumers never see the enum — the question text carries
// its own meaning; the category only drives the leading icon + admin grouping).
export const POPULAR_QUESTION_CATEGORY_LABEL: Record<PopularQuestionCategory, string> = {
  MONEY: '재물',
  CAREER: '직장·진로',
  BUSINESS: '사업',
  RELATIONSHIP: '관계',
  LOVE: '연애',
  CHANGE: '변화',
  WELLBEING: '건강·컨디션',
  GENERAL: '전반',
};

// Consumer shape (what Home renders). The icon is DERIVED from the category on the client (see
// popularQuestionIcon) — the DB stays lean and never couples to client icon names.
export type PopularQuestion = {
  id: string; // uuid — internal reference only (never an analytics dimension)
  questionText: string;
  analyticsKey: string; // stable slug — the funnel correlation key
  category: PopularQuestionCategory;
  displayOrder: number;
};

// Admin shape (adds the operational fields the console needs).
export type AdminPopularQuestion = PopularQuestion & {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Create/edit payload. analyticsKey is set once at creation and normally never changed (changing it starts a
// fresh metrics series); the admin form treats it as create-time-only.
export type PopularQuestionInput = {
  questionText: string;
  analyticsKey: string;
  category: PopularQuestionCategory;
  displayOrder: number;
  isActive: boolean;
};

// Raw per-question funnel counts as returned by the server-side aggregate (the client computes the ratios so
// zero denominators render "—" instead of NaN — see metrics.ts).
export type PopularQuestionCounts = {
  analyticsKey: string;
  impressions: number;
  clicks: number;
  starts: number;
  successes: number;
};
