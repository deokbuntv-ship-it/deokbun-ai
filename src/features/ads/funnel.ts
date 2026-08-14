// Funnel aggregation (§16/§22/§30). Pure: turns normalized attribution + click rows into
// per-ad counts. The DB RPC / service does the SQL joins (click.tracking_code→ad,
// user→attribution→ad); this module just COUNTS truthfully — no fabricated numbers.
import { RETENTION_DAYS, isRetainedAtDay } from './retention';
import type { AdFunnelCounts, AdOverviewTotals } from './types';

// One acquired user, already attributed to an ad (first-touch). activityTimestamps =
// meaningful-activity (successful consultation) times used for retention.
export type AttributedUser = {
  adId: string;
  userId: string;
  signupAt: string | null;
  birthInfoAt: string | null;
  firstConsultationAt: string | null;
  activityTimestamps: string[];
};

// One raw ad_click event, already resolved to an ad.
export type AdClick = {
  adId: string;
  visitorId: string | null; // anonymous session id; null when none reliable (§18)
};

/**
 * Count one ad's funnel. uniqueVisitors is null when NO click carried a reliable visitor
 * id (§18 — never fabricate a "unique visitor" metric). signups counts users with a
 * signup timestamp; birth/firstConsult count their respective completion timestamps;
 * D1/D7/D30 use the documented retention window.
 */
export function computeAdFunnelCounts(
  adId: string,
  clicks: readonly AdClick[],
  users: readonly AttributedUser[],
): AdFunnelCounts {
  const adClicks = clicks.filter((c) => c.adId === adId);
  const adUsers = users.filter((u) => u.adId === adId);

  const visitorIds = new Set<string>();
  let anyVisitorId = false;
  for (const c of adClicks) {
    if (c.visitorId) {
      anyVisitorId = true;
      visitorIds.add(c.visitorId);
    }
  }

  const retained = (dayN: number) =>
    adUsers.filter((u) => isRetainedAtDay(u.signupAt, u.activityTimestamps, dayN)).length;

  return {
    adId,
    clicks: adClicks.length,
    uniqueVisitors: anyVisitorId ? visitorIds.size : null,
    birthInfoCompleted: adUsers.filter((u) => u.birthInfoAt !== null).length,
    signups: adUsers.filter((u) => u.signupAt !== null).length,
    firstConsultations: adUsers.filter((u) => u.firstConsultationAt !== null).length,
    d1: retained(RETENTION_DAYS.d1),
    d7: retained(RETENTION_DAYS.d7),
    d30: retained(RETENTION_DAYS.d30),
  };
}

/** Empty counts for an ad with no data yet (honest zeros, uniqueVisitors unknown). */
export function emptyFunnelCounts(adId: string): AdFunnelCounts {
  return {
    adId,
    clicks: 0,
    uniqueVisitors: null,
    birthInfoCompleted: 0,
    signups: 0,
    firstConsultations: 0,
    d1: 0,
    d7: 0,
    d30: 0,
  };
}

/**
 * Sum per-ad counts + costs into dashboard totals (§36). totalCostKrw is null when NO ad
 * has a known cost (so avg CAC/CPA also stay null → '—', never fabricated 0원, §35).
 */
export function computeOverviewTotals(
  rows: readonly { counts: AdFunnelCounts; costKrw: number | null }[],
): AdOverviewTotals {
  let totalClicks = 0,
    totalBirthInfo = 0,
    totalSignups = 0,
    totalFirstConsultations = 0,
    totalD1 = 0,
    totalD7 = 0,
    totalD30 = 0;
  let costSum = 0;
  let anyCost = false;

  for (const r of rows) {
    totalClicks += r.counts.clicks;
    totalBirthInfo += r.counts.birthInfoCompleted;
    totalSignups += r.counts.signups;
    totalFirstConsultations += r.counts.firstConsultations;
    totalD1 += r.counts.d1;
    totalD7 += r.counts.d7;
    totalD30 += r.counts.d30;
    if (r.costKrw !== null) {
      anyCost = true;
      costSum += r.costKrw;
    }
  }

  const totalCostKrw = anyCost ? costSum : null;
  return {
    totalClicks,
    totalBirthInfo,
    totalSignups,
    totalFirstConsultations,
    totalD1,
    totalD7,
    totalD30,
    totalCostKrw,
    avgSignupCac: totalCostKrw !== null && totalSignups > 0 ? totalCostKrw / totalSignups : null,
    avgFirstConsultCpa:
      totalCostKrw !== null && totalFirstConsultations > 0
        ? totalCostKrw / totalFirstConsultations
        : null,
  };
}
