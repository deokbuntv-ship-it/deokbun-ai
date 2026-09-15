import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/features/auth';

import { captureAcquisition, parseTrackingCodeFromQuery, trackingCodeSource } from '@/features/ads';
import {
  mintVisitorId,
  recordAcquisitionAttribution,
  recordAdClick,
} from './acquisitionService';

// Acquisition bridge (Sprint 3B, §17/§19/§21/§54). A render-null component mounted ONCE in
// the root layout. It is ADDITIVE and FAIL-CLOSED — it touches no auth/chat/birth code and
// an organic visitor (no tracking param) is completely unaffected (§54).
//
// (1) On web landing: read the tracking code from the URL, capture it (first-touch), fire the
//     anonymous click, and STRIP the parameter that carried it so the code is never propagated
//     through internal router params (§20). Guarded for the static-export prerender (no window).
// (1b) On NATIVE: the same capture, driven by an inbound deep link instead of window.location
//     (2026-09-04). See the note below.
// (2) When a user becomes authenticated: link them to the captured ad (once per user).
export function AcquisitionBridge() {
  const { authState } = useAuth();
  const userId = authState.user?.id ?? null;
  const capturedRef = useRef(false);
  const attributedRef = useRef<string | null>(null);

  // Shared by both entry points so web and native cannot drift apart. First-touch is enforced
  // inside captureAcquisition, so a second call with a different code is a no-op.
  const capture = (search: string) => {
    const code = parseTrackingCodeFromQuery(search);
    if (!code) return null;
    const visitorId = mintVisitorId();
    captureAcquisition(code, visitorId);
    recordAdClick(code, visitorId);
    return code;
  };

  // (1) Capture at landing — post-mount, WEB only (hydration/prerender safe). Unchanged.
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    if (typeof window === 'undefined' || !window.location) return;
    const search = window.location.search;
    if (!capture(search)) return;
    // Drop ONLY the parameter that actually carried the code (never propagate it, §20).
    // The other utm_* keys are left alone: we do not consume them, they belong to whatever
    // reporting the operator has, and stripping somebody else's parameters is overreach.
    // Removing it does NOT lose the attribution — it lives in sessionStorage for 6h, and not
    // re-reading it on refresh is what prevents a reload from being counted as a second click.
    const consumed = trackingCodeSource(search);
    if (!consumed) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(consumed);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch {
      // best-effort — a failed URL cleanup must never break the page (§54)
    }
  }, []);

  // (1b) NATIVE inbound deep link (2026-09-04).
  //
  // WHY THIS EXISTS: effect (1) returns immediately on native because there is no
  // `window.location` carrying a query string, so app traffic was attributed at exactly 0%.
  // On native the URL arrives through Linking instead — either as the URL the app was COLD
  // STARTED with (getInitialURL) or as an event while it is already running (addEventListener).
  // Both are handled; `capturedRef` keeps them from double-counting each other.
  //
  // ⚠ This only covers a device that ALREADY HAS THE APP and follows a link that resolves to
  // it. That requires Universal Links / App Links to be configured (app.json +
  // .well-known/*) — without them the OS opens the browser and effect (1) handles it as web.
  // INSTALL attribution (ad → store → install → first open) carries no URL at all and is a
  // different problem entirely (PROJECT_STATE §7.12-A3).
  //
  // expo-linking is required LAZILY: it is already a dependency (ShareReportSheet uses it),
  // but a static import would pull it into the web bundle and the jest environment for a
  // code path neither one runs.
  useEffect(() => {
    if (Platform.OS === 'web') return; // web is effect (1); never run both
    let active = true;
    let subscription: { remove: () => void } | null = null;

    const handle = (url: string | null | undefined) => {
      if (!active || capturedRef.current || typeof url !== 'string') return;
      const q = url.indexOf('?');
      if (q < 0) return;
      const search = url.slice(q + 1).split('#')[0];
      if (capture(search)) capturedRef.current = true;
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      const Linking = require('expo-linking');
      void Promise.resolve(Linking.getInitialURL?.()).then(handle).catch(() => {});
      subscription = Linking.addEventListener?.('url', (e: { url?: string }) => handle(e?.url)) ?? null;
    } catch {
      // Module unavailable (bare jest env) — native attribution simply stays off, exactly as
      // it behaved before this effect existed. Never a crash (§54).
    }

    return () => {
      active = false;
      try {
        subscription?.remove();
      } catch {
        /* nothing to clean up */
      }
    };
  }, []);

  // (2) Flush first-touch attribution once the user is authenticated.
  useEffect(() => {
    if (!userId || attributedRef.current === userId) return;
    attributedRef.current = userId;
    recordAcquisitionAttribution(userId);
  }, [userId]);

  return null;
}
