// Shared contracts for 이번 달 운세 — the compact monthly RESULT (LLM output, validated) and the persisted
// RECORD. A monthly digest (longer than Today, still consumer-readable — §33), not a consultation report.
// Type-only imports, so pulling these into the client bundle carries no engine/runtime code.
import type { MonthlyDomainSignal, MonthlyOverallTier, MonthlyPrimaryMode } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyDomain } from '@/features/monthly/engine/monthlyEvidence';

export type { MonthlyOverallTier, MonthlyPrimaryMode, MonthlyDomainSignal } from '@/features/monthly/engine/monthlyPlan';
export type { MonthlyDomain } from '@/features/monthly/engine/monthlyEvidence';

export const MONTHLY_DOMAIN_LABEL: Record<MonthlyDomain, string> = {
  overall: '전체 흐름',
  work: '일·사업',
  wealth: '재물',
  relationship: '인간관계·연애',
  action: '행동·변화',
};

export const MONTHLY_DOMAIN_SHORT_LABEL: Record<MonthlyDomain, string> = {
  overall: '전체',
  work: '일·사업',
  wealth: '재물',
  relationship: '관계',
  action: '행동',
};

export type MonthlyOpportunity = { domain: string; title: string; body: string };
export type MonthlyCaution = { title: string; body: string };
// A deterministic within-month transition (§5) — the 節 date the flow shifts + each side's tier/mode labels.
// Server-owned (from the plan), present only when the civil month's two segments materially differ.
export type MonthlyResultTransition = {
  transitionDate: string; // 'YYYY-MM-DD' (KST) — the deterministic 節 date, never fabricated
  early: { tierLabel: string; modeLabel: string };
  later: { tierLabel: string; modeLabel: string };
};
// A follow-up carried into 상담: a SHORT chip label + the RICH question actually sent (the consultation
// re-grounds independently — the monthly text is never sent as evidence, §68).
export type MonthlyFollowUp = { displayLabel: string; question: string };

// The validated, compact monthly result (§18). Short-by-contract: 1-line headline, a 1-3 sentence verdict
// that answers the month, ≤3 opportunities, ≤2 cautions, ≤3 concrete actions, 3 follow-ups. Forward-compatible
// (§43): every field the UI reads defensively; a future V1.1 may add optional fields without breaking V1 rows.
export type MonthlyFortuneResult = {
  headline: string;
  verdict: string;
  overallSummary: string;
  overallTier: MonthlyOverallTier;
  primaryMode?: MonthlyPrimaryMode;
  primaryModeLabel?: string;
  domainSignals?: MonthlyDomainSignal[];
  opportunities: MonthlyOpportunity[];
  cautions: MonthlyCaution[];
  /** The month's action plan — concrete, grounded "이렇게 보내세요" steps (§23). */
  actions: string[];
  followUps?: MonthlyFollowUp[];
  /** V1.1 — a within-month 節 transition (초반/중반 이후), when the two segments materially differ. */
  transition?: MonthlyResultTransition | null;
};

// The persisted canonical record (one per user per fortune_year+fortune_month). `result` holds only the
// composed user-facing monthly digest — never raw birth data, evidence, or a prompt.
export type MonthlyFortuneRecord = {
  id: string;
  year: number;
  month: number;
  timezone: string;
  overallTier: MonthlyOverallTier;
  result: MonthlyFortuneResult;
  evidenceVersion: string | null;
  planVersion: string | null;
  policyVersion: string | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
};

export const MONTHLY_POLICY_VERSION = 'monthly@1.2.0';
