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

/** Extract a valid `?ad=` code from a raw query string / URLSearchParams-like input. */
export function parseTrackingCodeFromQuery(search: string | null | undefined): string | null {
  if (typeof search !== 'string' || search.length === 0) return null;
  const q = search.startsWith('?') ? search.slice(1) : search;
  for (const pair of q.split('&')) {
    const [k, v] = pair.split('=');
    if (k === TRACKING_QUERY_PARAM && v) {
      let decoded: string;
      try {
        decoded = decodeURIComponent(v);
      } catch {
        return null;
      }
      return isValidTrackingCode(decoded) ? decoded : null;
    }
  }
  return null;
}
