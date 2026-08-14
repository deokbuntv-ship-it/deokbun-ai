// Acquisition context (Sprint 3B, §19/§20/§21). The lightweight, EPHEMERAL bridge that
// keeps a visitor's inbound ad attribution alive across the ENTIRE anonymous→authenticated
// journey (landing?ad=CODE → home → consult → login → OAuth popup → callback → birth → chat
// → first consultation) WITHOUT touching auth semantics. Structurally mirrors
// pendingConsultationIntent (§19 recon): web = sessionStorage (survives the OAuth popup
// because set+consume happen in the opener window), native/jest = in-memory. Never
// localStorage, never the DB, never propagated through router params (§20).
//
// FIRST-TOUCH (§20): capture only sets the ad code once and NEVER overwrites an existing
// unconsumed one — a later ad click before signup does not replace the first touch.
import { isValidTrackingCode } from '../trackingCode';

export type AcquisitionContext = {
  code: string; // validated ad_ tracking code
  visitorId: string | null; // anonymous session id for unique-visitor counting (§18)
  savedAt: number; // epoch ms (TTL anchor)
};

const STORAGE_KEY = 'deokbun.acquisition';

// A captured-but-never-attributed ad code expires so it can't misattribute a much-later,
// unrelated signup. Generous enough for the full journey (login/OAuth/birth/chat).
export const ACQUISITION_TTL_MS = 6 * 60 * 60 * 1000; // 6h

let memory: AcquisitionContext | null = null;

function webStore(): Storage | null {
  try {
    const g = globalThis as unknown as { sessionStorage?: Storage };
    if (g && g.sessionStorage) return g.sessionStorage;
  } catch {
    // private mode / disabled → in-memory fallback
  }
  return null;
}

function readRaw(): AcquisitionContext | null {
  const store = webStore();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AcquisitionContext) : null;
    } catch {
      return null;
    }
  }
  return memory;
}

function write(ctx: AcquisitionContext | null): void {
  const store = webStore();
  if (store) {
    try {
      if (ctx) store.setItem(STORAGE_KEY, JSON.stringify(ctx));
      else store.removeItem(STORAGE_KEY);
    } catch {
      // ignore — worst case attribution is not preserved, never a crash (§54)
    }
    return;
  }
  memory = ctx;
}

function fresh(ctx: AcquisitionContext | null, now: number): AcquisitionContext | null {
  if (!ctx) return null;
  if (typeof ctx.savedAt !== 'number' || now - ctx.savedAt > ACQUISITION_TTL_MS) return null;
  return ctx;
}

/**
 * Capture an inbound ad code (FIRST-TOUCH). No-op if the code is invalid, or if a
 * non-expired code is already stored (never overwrites first touch, §20). `now` is
 * injectable for tests.
 */
export function captureAcquisition(
  code: string,
  visitorId: string | null,
  now: number = Date.now(),
): void {
  if (!isValidTrackingCode(code)) return;
  const existing = fresh(readRaw(), now);
  if (existing) return; // first touch already recorded — do not overwrite (§20)
  write({ code, visitorId, savedAt: now });
}

/** Peek at the current (non-expired) acquisition context. */
export function peekAcquisition(now: number = Date.now()): AcquisitionContext | null {
  return fresh(readRaw(), now);
}

/** Read + clear (one-shot), used at the first-touch signup attribution seam (§21). Returns
 * null if absent or expired. */
export function consumeAcquisition(now: number = Date.now()): AcquisitionContext | null {
  const current = fresh(readRaw(), now);
  write(null);
  return current;
}

export function clearAcquisition(): void {
  write(null);
}
