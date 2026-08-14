// Advertisement performance read (Sprint 3B). Aggregation is done SERVER-SIDE by the
// is_admin()-gated SECURITY DEFINER RPC `admin_ad_performance` (docs/ADVERTISEMENTS_SETUP.sql);
// the client maps its per-ad COUNTS through the pure metric logic (computeAdPerformance) so
// CAC/CPA/conversion truthfulness is locked by tests. Fail-closed: if the RPC / tables are
// not deployed yet, returns { connected:false } → the UI shows a truthful "집계 준비 중"
// state, NOT a fabricated table and NOT a scary crash.
import { logDbError } from '@/features/analysis';
import { getSupabaseClient } from '@/services/supabase';

import { computeAdPerformance } from '../adMetrics';
import { computeOverviewTotals } from '../funnel';
import type { AdFunnelCounts, AdListItem, AdOverviewTotals, AdPerformanceRow } from '../types';
import { adAdvertisementService } from './adAdvertisementService';

export type AdPerformanceResult =
  | { connected: false }
  | { connected: true; rows: AdPerformanceRow[]; totals: AdOverviewTotals };

// Postgres/PostgREST codes meaning "the tracking backend isn't deployed yet".
const NOT_DEPLOYED = new Set(['42883', '42P01', 'PGRST202', 'PGRST116']);

type CountRow = Record<string, unknown>;
function n(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
function toCounts(row: CountRow): AdFunnelCounts {
  const uv = row.unique_visitors;
  return {
    adId: String(row.ad_id ?? ''),
    clicks: n(row.clicks),
    uniqueVisitors: typeof uv === 'number' ? uv : null,
    birthInfoCompleted: n(row.birth_info),
    signups: n(row.signups),
    firstConsultations: n(row.first_consultations),
    d1: n(row.d1),
    d7: n(row.d7),
    d30: n(row.d30),
  };
}

/**
 * period: optional ISO date bounds forwarded to the RPC (§37). The RPC applies the same
 * cohort/window semantics the pure layer documents.
 */
async function getPerformance(period?: { from?: string; to?: string }): Promise<AdPerformanceResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_ad_performance', {
    p_from: period?.from ?? null,
    p_to: period?.to ?? null,
  });
  if (error) {
    if (NOT_DEPLOYED.has((error as { code?: string }).code ?? '')) return { connected: false };
    logDbError(error, 'ads', 'db');
  }

  // Zip the server counts with the ad records (for cost + labels).
  const ads = await adAdvertisementService.listAds({ limit: 500, offset: 0 });
  const adById = new Map<string, AdListItem>(ads.map((a) => [a.id, a]));
  const countsById = new Map<string, AdFunnelCounts>(
    ((data as CountRow[]) ?? []).map((r) => {
      const c = toCounts(r);
      return [c.adId, c];
    }),
  );

  const rows: AdPerformanceRow[] = ads.map((ad) => {
    const counts = countsById.get(ad.id) ?? {
      adId: ad.id, clicks: 0, uniqueVisitors: null, birthInfoCompleted: 0,
      signups: 0, firstConsultations: 0, d1: 0, d7: 0, d30: 0,
    };
    return computeAdPerformance(ad, counts);
  });
  const totals = computeOverviewTotals(rows.map((r) => ({ counts: r.counts, costKrw: r.ad.costKrw })));
  return { connected: true, rows, totals };
}

export const adPerformanceService = { getPerformance };
