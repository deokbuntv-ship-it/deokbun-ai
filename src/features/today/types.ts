// Shared contracts for 오늘의 운세 — the compact daily RESULT (LLM output, validated) and the persisted
// RECORD. Kept small (§15/§17/§18): a daily digest, not a consultation report. Type-only imports, so pulling
// these into the client bundle carries no engine/runtime code (the P0 require-cycle discipline holds).
import type { DailyDomainSignal, DailyOverallTone, PrimaryMode } from '@/features/today/engine/todayPlan';
import type { TodayDomain } from '@/features/today/engine/todayEvidence';

export type { DailyOverallTone, PrimaryMode, DailyDomainSignal } from '@/features/today/engine/todayPlan';
export type { TodayDomain } from '@/features/today/engine/todayEvidence';

// Consumer-facing labels for the five domains (§10/§19 — no internal codes reach the UI).
export const TODAY_DOMAIN_LABEL: Record<TodayDomain, string> = {
  overall: '오늘의 전체 흐름',
  work: '일·사업',
  wealth: '재물',
  relationship: '인간관계·연애',
  action: '행동·주의점',
};

// A short, glanceable domain label for the "오늘의 핵심" status row (the full labels are too long there).
export const TODAY_DOMAIN_SHORT_LABEL: Record<TodayDomain, string> = {
  overall: '전체',
  work: '일·사업',
  wealth: '재물',
  relationship: '관계',
  action: '행동',
};

export type DailyHighlight = { domain: string; title: string; body: string };
export type DailyCaution = { title: string; body: string };
// A follow-up the user can carry into 상담: a SHORT chip label (§37/§38) + the RICH question actually sent to
// the consultation (which re-grounds independently — the daily text is never sent as evidence, §47/§48).
export type DailyFollowUp = { displayLabel: string; question: string };

// The validated, compact daily result (§15). Short by contract (§16-§19): 1-line headline, a 1-2 sentence
// verdict that answers the day, 2-4 sentence overall, ≤3 highlights, ≤2 cautions, one action, 3 follow-ups.
//
// BACKWARD COMPATIBILITY (§77-§79): V1.0 records were persisted WITHOUT `verdict`/`primaryMode`/
// `primaryModeLabel`/`domainSignals`/`followUps` and WITH a legacy `consultationPrompts: string[]`. Every
// V1.1 field is therefore optional, and the legacy field is retained (optional) so old `result_json` still
// parses. The presentation layer normalizes both shapes; new generations always write the V1.1 fields.
export type DailyFortuneResult = {
  headline: string;
  /** V1.1 — the one-line day judgment ("오늘은 ~하는 편이 좋습니다"). Absent on V1.0 records. */
  verdict?: string;
  overallSummary: string;
  overallTone: DailyOverallTone;
  /** V1.1 — server-owned action mode + its Korean label (the LLM never chooses these). */
  primaryMode?: PrimaryMode;
  primaryModeLabel?: string;
  /** V1.1 — ≤2 deterministic domain statuses (emphasis + caution). */
  domainSignals?: DailyDomainSignal[];
  highlights: DailyHighlight[];
  cautions: DailyCaution[];
  actionTip: string;
  /** V1.1 — short-label + rich-question follow-ups. */
  followUps?: DailyFollowUp[];
  /** V1.2 — deterministic "왜 이렇게 보나요?" evidence lines (server-owned; plain language). Absent on older records. */
  evidence?: string[];
  /** V1.2 — plain-language background (larger 대운/세운 flow) note; absent when NEUTRAL/older records. */
  backgroundSummary?: string | null;
  /** LEGACY V1.0 — plain follow-up strings; retained so old records remain readable. */
  consultationPrompts?: string[];
};

// The persisted canonical record (one per user per fortune_date). `result` holds only the composed
// user-facing daily digest — never raw birth data, evidence, or a prompt.
export type DailyFortuneRecord = {
  id: string;
  fortuneDate: string;
  timezone: string;
  overallTone: DailyOverallTone;
  result: DailyFortuneResult;
  evidenceVersion: string | null;
  policyVersion: string | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TODAY_POLICY_VERSION = 'today@1.1.0';
// Server canonical cache/lease identity. Bump only when a semantic change must produce a new canonical row.
export const TODAY_CANONICAL_VERSION = 'today-canonical@1.2.0';
