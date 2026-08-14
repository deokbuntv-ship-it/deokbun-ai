// Acquisition recording (Sprint 3B, §17/§50/§54). Fire-and-forget, FAIL-CLOSED writes to
// the server-trusted `ad-track` Edge Function (docs source: supabase/functions/ad-track).
// The edge validates the code, resolves it to an ad, dedups, and inserts via service_role —
// the client never asserts "signup=true" (§50); it only reports the raw click + the
// authenticated user's first-touch link. Every call swallows all errors and NEVER blocks
// the page/journey (§17/§54): if the function isn't deployed yet, these are silent no-ops.
import { getSupabaseClient } from '@/services/supabase';

import { consumeAcquisition, peekAcquisition } from './acquisitionContext';

const FUNCTION = 'ad-track';

function newVisitorId(): string | null {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  try {
    return g.crypto?.randomUUID ? g.crypto.randomUUID() : null;
  } catch {
    return null;
  }
}

// Exposed so the capture site can mint one anonymous id per landing (unique-visitor §18).
export function mintVisitorId(): string | null {
  return newVisitorId();
}

/** Record an anonymous ad click (at landing). Never awaited by the UI, never throws. */
export function recordAdClick(code: string, visitorId: string | null): void {
  void invokeSafe({ kind: 'click', code, visitorId });
}

/**
 * Link the just-authenticated user to their first-touch ad (§21). Consumes the ephemeral
 * acquisition context and reports it; the edge upserts one attribution row per user (§21/§26
 * dedup). No-op when there is no captured ad (organic user → journey unchanged, §54).
 */
export function recordAcquisitionAttribution(userId: string): void {
  const ctx = peekAcquisition();
  if (!ctx) return; // organic — nothing to attribute
  // one-shot consume so we don't re-report on every auth refresh
  consumeAcquisition();
  void invokeSafe({ kind: 'attribution', code: ctx.code, visitorId: ctx.visitorId, userId });
}

type TrackPayload =
  | { kind: 'click'; code: string; visitorId: string | null }
  | { kind: 'attribution'; code: string; visitorId: string | null; userId: string };

async function invokeSafe(payload: TrackPayload): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.functions.invoke(FUNCTION, { body: payload });
  } catch {
    // FAIL-CLOSED: tracking is best-effort; a failed/undeployed function must never
    // surface to the user or block the journey (§17/§54).
  }
}
