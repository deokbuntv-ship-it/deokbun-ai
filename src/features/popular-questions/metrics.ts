import type { PopularQuestionCounts } from './types';

// Pure conversion-rate computation. The SERVER aggregates the raw per-question counts (impressions / clicks /
// starts / successes); the client turns them into the four funnel ratios. Every ratio is zero-denominator
// safe — a rate over an empty denominator is `null`, which the admin UI renders as "—" (never NaN / Infinity /
// a misleading 0%). This file is pure and node-testable (no React Native / Supabase).
export type PopularQuestionRates = {
  ctr: number | null; // click / impression
  startRate: number | null; // start / click
  successRate: number | null; // success / start
  endToEnd: number | null; // success / impression
};

function ratio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  const r = numerator / denominator;
  return Number.isFinite(r) ? r : null;
}

export function computeConversionRates(counts: PopularQuestionCounts): PopularQuestionRates {
  return {
    ctr: ratio(counts.clicks, counts.impressions),
    startRate: ratio(counts.starts, counts.clicks),
    successRate: ratio(counts.successes, counts.starts),
    endToEnd: ratio(counts.successes, counts.impressions),
  };
}

// Format a ratio as a percentage string for the admin table. `null` → "—" (the honest empty).
export function formatRate(rate: number | null): string {
  if (rate === null) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}
