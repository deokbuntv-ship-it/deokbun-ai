// Resolve the canonical app origin for building tracking URLs (§8/§59). Priority:
// (1) EXPO_PUBLIC_PUBLIC_BASE_URL via the existing getPublicBaseUrl() (production/preview,
//     build-time, already http(s)-validated); (2) window.location.origin at runtime on web
//     (admin is web-only). Localhost is filtered by isUsableOrigin at the build-URL step,
//     so a dev origin never becomes a real tracking URL. Returns null when neither is
//     usable → the UI shows a truthful "도메인 설정 필요" state (never a fake domain).
import { getPublicBaseUrl } from '@/features/publicSite';

import { isUsableOrigin } from '../trackingUrl';

export function resolveAppOrigin(): string | null {
  const configured = getPublicBaseUrl();
  if (isUsableOrigin(configured)) return configured;
  if (typeof window !== 'undefined' && window.location?.origin) {
    const runtime = window.location.origin;
    if (isUsableOrigin(runtime)) return runtime;
  }
  return null;
}
