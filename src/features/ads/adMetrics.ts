// Advertisement metrics (§32/§33/§34/§35). Pure. Every metric returns number | null,
// where null MUST render as '—' — a zero denominator or missing cost is NEVER shown as a
// fabricated 0% / 0원 (§32/§35). CAC ≠ CPA (§34) — kept as distinct functions.
import type { AdFunnelCounts, AdListItem, AdPerformanceRow } from './types';

/** A rate in [0,1], or null when the denominator is 0 (caller shows '—', §32). */
export function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

/** Cost per acquisition. null when cost is missing (§35) OR count is 0 (no division). */
export function costPer(costKrw: number | null, count: number): number | null {
  if (costKrw === null) return null; // 광고비 미입력 → '—', never 0원 (§35)
  if (count <= 0) return null;
  return costKrw / count;
}

/** Format a rate as a percent string, or '—' when null. */
export function formatRate(r: number | null): string {
  return r === null ? '—' : `${(r * 100).toFixed(1)}%`;
}

/** Format KRW currency, or a truthful placeholder when null. */
export function formatKrw(amount: number | null, nullLabel = '—'): string {
  return amount === null ? nullLabel : `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

/**
 * Derive the full per-ad performance row from counts + the ad (for its cost). Conversions
 * use 유입(clicks) / 가입(signups) as denominators; retention uses signups. CAC = 광고비 /
 * 가입자, CPA = 광고비 / 첫상담자 — distinct (§33/§34).
 */
export function computeAdPerformance(ad: AdListItem, counts: AdFunnelCounts): AdPerformanceRow {
  return {
    ad,
    counts,
    birthConversion: rate(counts.birthInfoCompleted, counts.clicks),
    signupConversion: rate(counts.signups, counts.clicks),
    firstConsultConversion: rate(counts.firstConsultations, counts.signups),
    clickToFirstConsult: rate(counts.firstConsultations, counts.clicks),
    d1Retention: rate(counts.d1, counts.signups),
    d7Retention: rate(counts.d7, counts.signups),
    d30Retention: rate(counts.d30, counts.signups),
    signupCac: costPer(ad.costKrw, counts.signups),
    firstConsultCpa: costPer(ad.costKrw, counts.firstConsultations),
  };
}
