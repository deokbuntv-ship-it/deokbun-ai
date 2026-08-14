import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth';

import { captureAcquisition, parseTrackingCodeFromQuery } from '@/features/ads';
import {
  mintVisitorId,
  recordAcquisitionAttribution,
  recordAdClick,
} from './acquisitionService';

// Acquisition bridge (Sprint 3B, §17/§19/§21/§54). A render-null component mounted ONCE in
// the root layout. It is ADDITIVE and FAIL-CLOSED — it touches no auth/chat/birth code and
// an organic visitor (no ?ad=) is completely unaffected (§54).
//
// (1) On web landing: read ?ad=CODE from the URL, capture it (first-touch), fire the
//     anonymous click, and STRIP ?ad from the URL so the code is never propagated through
//     internal router params (§20). Guarded for the static-export prerender (no window).
// (2) When a user becomes authenticated: link them to the captured ad (once per user).
export function AcquisitionBridge() {
  const { authState } = useAuth();
  const userId = authState.user?.id ?? null;
  const capturedRef = useRef(false);
  const attributedRef = useRef<string | null>(null);

  // (1) Capture ?ad= at landing — post-mount, web only (hydration/prerender safe).
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    if (typeof window === 'undefined' || !window.location) return;
    const code = parseTrackingCodeFromQuery(window.location.search);
    if (!code) return;
    const visitorId = mintVisitorId();
    captureAcquisition(code, visitorId);
    recordAdClick(code, visitorId);
    // Drop ?ad from the visible URL without a navigation (never propagate it, §20).
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('ad');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch {
      // best-effort — a failed URL cleanup must never break the page (§54)
    }
  }, []);

  // (2) Flush first-touch attribution once the user is authenticated.
  useEffect(() => {
    if (!userId || attributedRef.current === userId) return;
    attributedRef.current = userId;
    recordAcquisitionAttribution(userId);
  }, [userId]);

  return null;
}
