// Chat rate / abuse protection (directive §2-A, §2-I) — PURE & DETERMINISTIC.
//
// Not a UX quota: DeokbunAI free beta does not throttle normal users. This guards
// only against burst / duplicate / concurrent / runaway-cost abuse. Time and state
// are INJECTED (no clock, no I/O), so it is fully unit-testable without infra and
// runnable from the chat Edge Function (state can live in a Postgres row or the
// function's memory). No Redis / external infra. Denials map to the standard
// Error Contract (LLM_RATE_LIMIT / DUPLICATE_REQUEST).
import type { AppErrorCode } from './errors';

export type RateLimitConfig = {
  windowMs: number; // sliding window
  maxRequests: number; // per-user requests per window (burst)
  maxConcurrent: number; // simultaneous in-flight per user
  seenIdCap: number; // how many recent requestIds to retain for dedup
};

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 20,
  maxConcurrent: 3,
  seenIdCap: 50,
};

// Caller persists this per user (row / memory). Pure functions transform it.
export type UserRateState = {
  timestamps: number[]; // request times within the window
  inFlight: number; // currently-processing requests
  seenRequestIds: string[]; // recent ids for duplicate detection (bounded)
};

export function emptyRateState(): UserRateState {
  return { timestamps: [], inFlight: 0, seenRequestIds: [] };
}

export type RateDecision =
  | { allowed: true; state: UserRateState }
  | {
      allowed: false;
      code: Extract<AppErrorCode, 'LLM_RATE_LIMIT' | 'DUPLICATE_REQUEST'>;
      retryAfterMs?: number;
      state: UserRateState;
    };

// Decide whether to admit a request. On allow, returns the NEXT state with this
// request counted + in-flight incremented (call `releaseInFlight` when done).
export function checkRateLimit(
  prev: UserRateState,
  requestId: string,
  now: number,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): RateDecision {
  const cutoff = now - config.windowMs;
  const timestamps = prev.timestamps.filter((t) => t > cutoff);
  const base: UserRateState = { ...prev, timestamps };

  // 1) duplicate client request id
  if (prev.seenRequestIds.includes(requestId)) {
    return { allowed: false, code: 'DUPLICATE_REQUEST', state: base };
  }
  // 2) concurrent in-flight cap
  if (prev.inFlight >= config.maxConcurrent) {
    return { allowed: false, code: 'LLM_RATE_LIMIT', state: base };
  }
  // 3) burst cap within window
  if (timestamps.length >= config.maxRequests) {
    const oldest = timestamps[0];
    const retryAfterMs = Math.max(0, oldest + config.windowMs - now);
    return { allowed: false, code: 'LLM_RATE_LIMIT', retryAfterMs, state: base };
  }

  const seen = [...prev.seenRequestIds, requestId].slice(-config.seenIdCap);
  return {
    allowed: true,
    state: {
      timestamps: [...timestamps, now],
      inFlight: prev.inFlight + 1,
      seenRequestIds: seen,
    },
  };
}

// Call after a request finishes (success or failure) to free a concurrency slot.
export function releaseInFlight(state: UserRateState): UserRateState {
  return { ...state, inFlight: Math.max(0, state.inFlight - 1) };
}

// ---- payload / output guards (directive §2-A #5,#6, §2-I) --------------------
export const OUTPUT_GUARD = {
  maxOutputTokens: 800, // mirrors server LLM_MAX_OUTPUT_TOKENS default
  maxContextChars: 24_000, // bounded prompt-context size (char-based; no tokenizer dep)
  maxMessages: 40, // hard cap on messages forwarded
} as const;

// Bound a list of messages to a character budget, keeping the MOST RECENT (LLM
// context relevance). `getText` reads the text field (message shapes differ:
// ChatMessage uses `.text`, LLM messages use `.content`). Pure; no tokenizer
// dependency (directive §2-I / §19).
export function boundRecentByChars<T>(
  messages: T[],
  getText: (m: T) => string,
  maxChars: number = OUTPUT_GUARD.maxContextChars,
  maxCount: number = OUTPUT_GUARD.maxMessages,
): T[] {
  const capped = messages.slice(-maxCount);
  const kept: T[] = [];
  let total = 0;
  for (let i = capped.length - 1; i >= 0; i -= 1) {
    const len = getText(capped[i]).length;
    if (total + len > maxChars && kept.length > 0) break;
    kept.push(capped[i]);
    total += len;
  }
  return kept.reverse();
}
