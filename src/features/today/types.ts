// Shared contracts for 오늘의 운세 — the compact daily RESULT (LLM output, validated) and the persisted
// RECORD. Kept small (§17/§18): a daily digest, not a consultation report. Type-only, so importing these
// pulls no engine/runtime code into the client bundle.
import type { DailyOverallTone } from '@/features/today/engine/todayPlan';
import type { TodayDomain } from '@/features/today/engine/todayEvidence';

export type { DailyOverallTone } from '@/features/today/engine/todayPlan';
export type { TodayDomain } from '@/features/today/engine/todayEvidence';

// Consumer-facing labels for the five domains (§10/§19 — no internal codes reach the UI).
export const TODAY_DOMAIN_LABEL: Record<TodayDomain, string> = {
  overall: '오늘의 전체 흐름',
  work: '일·사업',
  wealth: '재물',
  relationship: '인간관계·연애',
  action: '행동·주의점',
};

export type DailyHighlight = { domain: string; title: string; body: string };
export type DailyCaution = { title: string; body: string };

// The validated, compact daily result (§17). Short by contract (§18): 1-line headline, 2-4 sentence overall,
// ≤3 highlights, ≤2 cautions, one action, a few consultation prompts.
export type DailyFortuneResult = {
  headline: string;
  overallSummary: string;
  overallTone: DailyOverallTone;
  highlights: DailyHighlight[];
  cautions: DailyCaution[];
  actionTip: string;
  consultationPrompts: string[];
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

export const TODAY_POLICY_VERSION = 'today@1.0.0';
