// Pure presentation adapters for 이번 달 운세 — the SAME stored record renders identically on the Home preview,
// the /monthly detail, and the 운세우편함 card (presentation may differ, facts must not). No engine or network
// here. Forward-compatible: reads every optional field defensively so a future V1.1 record still renders.
import { formatMonthLabel } from '@/features/monthly/engine/monthDate';
import { isInScopeFollowUp } from '@/features/chat/presentation/followUpSafety';
import { MONTHLY_DOMAIN_SHORT_LABEL, type MonthlyFollowUp, type MonthlyFortuneRecord, type MonthlyOverallTier, type MonthlyDomain } from '@/features/monthly/types';

export type MonthlyToneVariant = 'positive' | 'neutral' | 'change' | 'caution';

export function monthlyToneVariant(tier: MonthlyOverallTier): MonthlyToneVariant {
  switch (tier) {
    case '기회를 살리기 좋은 달':
      return 'positive';
    case '안정적으로 운영할 달':
      return 'neutral';
    case '변화가 많은 달':
      return 'change';
    case '속도를 조절할 달':
      return 'caution';
  }
}

export type MonthlyStatusVariant = 'positive' | 'neutral' | 'caution';
export function monthlyStatusVariant(status: string): MonthlyStatusVariant {
  return status === '좋음' ? 'positive' : status === '주의' ? 'caution' : 'neutral';
}

export type MonthlyDomainSignalView = { label: string; status: string; variant: MonthlyStatusVariant };

function firstSentence(s: string): string {
  const m = /^[^.!?。\n]*[.!?。]?/.exec(s.trim());
  return (m ? m[0] : s).trim();
}

function normalizeFollowUps(record: MonthlyFortuneRecord): MonthlyFollowUp[] {
  const r = record.result;
  if (r.followUps && r.followUps.length > 0) {
    return r.followUps
      .filter((f) => f.question.trim().length > 0 && isInScopeFollowUp(f.question)) // §16 keep 역학 scope only
      .map((f) => ({ displayLabel: (f.displayLabel || f.question).trim(), question: f.question.trim() }));
  }
  return [];
}

function toDomainSignalViews(record: MonthlyFortuneRecord): MonthlyDomainSignalView[] {
  return (record.result.domainSignals ?? []).map((s) => ({
    label: MONTHLY_DOMAIN_SHORT_LABEL[s.domain as MonthlyDomain] ?? String(s.domain),
    status: s.status,
    variant: monthlyStatusVariant(s.status),
  }));
}

// The within-month 節 transition (§5), with the date formatted for display ("8월 7일"). Null when the month
// is one clean regime (or a V1.0 record without the field).
export type MonthlyTransitionView = {
  dateLabel: string;
  early: { tierLabel: string; modeLabel: string };
  later: { tierLabel: string; modeLabel: string };
};

function toTransitionView(record: MonthlyFortuneRecord): MonthlyTransitionView | null {
  const t = record.result.transition;
  if (!t) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.transitionDate);
  const dateLabel = m ? `${Number(m[2])}월 ${Number(m[3])}일` : t.transitionDate;
  return { dateLabel, early: t.early, later: t.later };
}

export type MonthlyPreview = {
  year: number;
  month: number;
  monthLabel: string;
  overallTier: MonthlyOverallTier;
  toneVariant: MonthlyToneVariant;
  primaryModeLabel?: string;
  headline: string;
};

export function toMonthlyPreview(record: MonthlyFortuneRecord): MonthlyPreview {
  return {
    year: record.year,
    month: record.month,
    monthLabel: formatMonthLabel({ year: record.year, month: record.month }),
    overallTier: record.overallTier,
    toneVariant: monthlyToneVariant(record.overallTier),
    primaryModeLabel: record.result.primaryModeLabel,
    headline: record.result.headline,
  };
}

export type MonthlyDetailView = MonthlyPreview & {
  verdict: string;
  overallSummary: string;
  domainSignals: MonthlyDomainSignalView[];
  transition: MonthlyTransitionView | null;
  opportunities: { domain: string; title: string; body: string }[];
  cautions: { title: string; body: string }[];
  actions: string[];
  followUps: MonthlyFollowUp[];
  /** "왜 이렇게 보나요?" deterministic evidence lines ([] on older records → section hidden). */
  evidence: string[];
};

export function toMonthlyDetailView(record: MonthlyFortuneRecord): MonthlyDetailView {
  const r = record.result;
  return {
    ...toMonthlyPreview(record),
    verdict: (r.verdict && r.verdict.trim()) || firstSentence(r.overallSummary),
    overallSummary: r.overallSummary,
    domainSignals: toDomainSignalViews(record),
    transition: toTransitionView(record),
    opportunities: r.opportunities ?? [],
    cautions: r.cautions ?? [],
    actions: r.actions ?? [],
    followUps: normalizeFollowUps(record),
    evidence: Array.isArray(r.evidence) ? r.evidence.filter((e) => typeof e === 'string' && e.trim().length > 0) : [],
  };
}

export function isForMonth(record: MonthlyFortuneRecord | null, year: number, month: number): boolean {
  return !!record && record.year === year && record.month === month;
}
