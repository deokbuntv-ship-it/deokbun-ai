// Tracking URL construction (§8/§59). The tracking URL is DERIVED from the public code +
// the resolved app origin — the record stores only the CODE (§10/§47), so the URL is
// always correct for the environment and localhost is never persisted (§59).
//
// Query-param form (`/?ad=CODE`) is used because web.output = 'static' (SSG) makes a
// dedicated dynamic public route unreliable (§8). Origin is resolved by the caller and
// passed in (pure); a null origin (base URL unset in dev) yields null → the UI shows
// "URL 발급을 위해 배포 도메인 설정 필요", never a fake domain.
import { isValidTrackingCode } from './trackingCode';

export const TRACKING_QUERY_PARAM = 'ad';

// B1 (2026-09-04): standard-UTM fallback. Google Ads and Meta append their own `utm_*` to the
// landing URL and give no way to add an arbitrary `?ad=`, so a visitor arriving from those
// platforms carried no tracking code at all and was not counted. Rather than teach the whole
// pipeline a second vocabulary (that is B2), we let ONE utm key carry the existing internal
// code: `utm_content=ad_xxxxxxxx`. Zero schema change, zero Edge change — the parser gains one
// fallback and everything downstream sees the same `ad_` code it always saw.
export const TRACKING_UTM_PARAM = 'utm_content';

// WHAT B1 DELIBERATELY DISCARDS — recorded here so B2 is an addition, never a rewrite.
// `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` are READ BY NOTHING today. They are
// the ad platform's own reporting axes; our per-ad numbers come from `advertisements` joined on
// the internal code, so keeping them would duplicate a dimension we already have.
// They start to matter only when the platform's report and ours must be reconciled line by
// line (two or more paid channels). At that point B2 adds five columns to
// `ad_tracking_events` + `user_acquisition_attribution` and widens the Edge payload; the
// `utm_content` fallback below stays valid and keeps working unchanged.

/** Reject localhost/loopback origins so a dev URL is never shown as a real tracking URL. */
export function isUsableOrigin(origin: string | null | undefined): origin is string {
  if (typeof origin !== 'string' || origin.length === 0) return false;
  if (!/^https?:\/\//.test(origin)) return false;
  const host = origin.replace(/^https?:\/\//, '').split('/')[0].split(':')[0].toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
    return false;
  }
  return true;
}

/**
 * Build the tracking URL for a code. Returns null when the code is missing/invalid or the
 * origin is unusable — the caller renders a truthful "not available yet" state.
 */
export function buildTrackingUrl(
  code: string | null | undefined,
  origin: string | null | undefined,
): string | null {
  if (!isValidTrackingCode(code)) return null;
  if (!isUsableOrigin(origin)) return null;
  const base = origin.replace(/\/+$/, '');
  return `${base}/?${TRACKING_QUERY_PARAM}=${encodeURIComponent(code)}`;
}

/**
 * Validate an operator-entered 광고 확인 링크 (§40) — the external posted-content URL. Must
 * be http(s) with a host; rejects javascript:/data:/relative/other schemes so the admin
 * "광고 확인" open is a safe external navigation (§40/§51). Empty is allowed (unpublished).
 */
export function isValidAdCheckUrl(value: string | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return true; // optional
  if (typeof value !== 'string') return false;
  if (!/^https?:\/\//i.test(value)) return false;
  const rest = value.replace(/^https?:\/\//i, '');
  const host = rest.split('/')[0].split('?')[0];
  return host.length > 0 && !host.includes(' ');
}

function readParam(search: string, key: string): string | null {
  const q = search.startsWith('?') ? search.slice(1) : search;
  for (const pair of q.split('&')) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    if (pair.slice(0, eq) !== key) continue;
    const v = pair.slice(eq + 1);
    if (!v) continue;
    try {
      // `+` is a space in a query string; decodeURIComponent does not know that.
      return decodeURIComponent(v.replace(/\+/g, ' '));
    } catch {
      return null; // malformed percent-encoding — treat as absent (§51)
    }
  }
  return null;
}

/**
 * Extract a valid tracking code from a raw query string.
 *
 * `?ad=` wins. `utm_content` is the fallback (B1) so a Google/Meta landing carries attribution
 * without a second parameter vocabulary. Either source must still pass `isValidTrackingCode`
 * — `utm_content` is a free-text field marketers use for creative names ("banner_a", "v3_blue"),
 * so anything that is not an `ad_` code is IGNORED rather than guessed at. That check is the
 * whole false-positive defence: without it every UTM-tagged visit would resolve to garbage.
 */
export function parseTrackingCodeFromQuery(search: string | null | undefined): string | null {
  if (typeof search !== 'string' || search.length === 0) return null;
  const direct = readParam(search, TRACKING_QUERY_PARAM);
  if (direct !== null) return isValidTrackingCode(direct) ? direct : null;
  const utm = readParam(search, TRACKING_UTM_PARAM);
  return utm !== null && isValidTrackingCode(utm) ? utm : null;
}

/** Which parameter supplied the code — the URL cleanup needs to remove exactly that one. */
export function trackingCodeSource(search: string | null | undefined): 'ad' | 'utm_content' | null {
  if (typeof search !== 'string' || search.length === 0) return null;
  const direct = readParam(search, TRACKING_QUERY_PARAM);
  if (direct !== null) return isValidTrackingCode(direct) ? TRACKING_QUERY_PARAM : null;
  const utm = readParam(search, TRACKING_UTM_PARAM);
  return utm !== null && isValidTrackingCode(utm) ? TRACKING_UTM_PARAM : null;
}

/**
 * Ready-to-paste UTM landing URL for an external ad platform (B1).
 *
 * The ONLY part that drives attribution is `utm_content=<code>`; `source`/`medium` exist so the
 * platform's own report is readable and are never parsed by us. `utm_campaign` is deliberately
 * left out — a campaign name is the operator's copy, and inventing one here would put a
 * made-up string into their reporting. They can append it freely without affecting tracking.
 */
export function buildUtmTrackingUrl(
  code: string | null | undefined,
  origin: string | null | undefined,
  utm: { source: string; medium: string },
): string | null {
  if (!isValidTrackingCode(code)) return null;
  if (!isUsableOrigin(origin)) return null;
  const base = origin.replace(/\/+$/, '');
  const q = new URLSearchParams({
    utm_source: utm.source,
    utm_medium: utm.medium,
    [TRACKING_UTM_PARAM]: code,
  });
  return `${base}/?${q.toString()}`;
}

/** The platforms the owner actually buys on. Presets exist so nobody hand-types the code. */
export const UTM_PRESETS: readonly { key: string; label: string; source: string; medium: string }[] = [
  { key: 'google', label: 'Google Ads', source: 'google', medium: 'cpc' },
  { key: 'meta', label: 'Meta (Instagram·Facebook)', source: 'meta', medium: 'paid_social' },
];
