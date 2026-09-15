// Pending shared-report token (Commercial UX V4 §24). The EPHEMERAL bridge that carries a recipient's
// share token across the login interruption WITHOUT ever putting it in `returnTo` — so the exact-match
// isSafeReturnTo allowlist stays intact and there is no open-redirect surface. The recipient opens
// /shared-report/[token]; if logged out, the token is stashed here and login proceeds; after login the
// continuation reads + clears it and navigates back to the validated internal route.
//
// Storage mirrors pendingConsultationIntent: sessionStorage on web (survives the OAuth popup because
// set+consume happen in the opener window), in-memory on native/jest. NEVER localStorage, NEVER the DB.
// Only a SHAPE-VALID token (48 hex) is ever stored, and it is re-validated on consume.

import { isValidShareToken } from '@/features/chat/report/shareToken';

type Pending = { token: string; savedAt: number };

const STORAGE_KEY = 'deokbun.pendingShareToken';
const TTL_MS = 30 * 60 * 1000; // an abandoned continuation expires (§ mirrors the consultation intent TTL)

let memory: Pending | null = null;

function webStore(): Storage | null {
  try {
    const g = globalThis as unknown as { sessionStorage?: Storage };
    if (g && g.sessionStorage) return g.sessionStorage;
  } catch {
    // private mode / disabled → in-memory fallback
  }
  return null;
}

export function setPendingShareToken(token: string, now: number = Date.now()): void {
  if (!isValidShareToken(token)) return; // never store a malformed token
  const record: Pending = { token, savedAt: now };
  const store = webStore();
  if (store) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore write failures
    }
    return;
  }
  memory = record;
}

// One-shot read+clear. Returns the token only if present, shape-valid, and within the TTL.
export function consumePendingShareToken(now: number = Date.now()): string | null {
  let record: Pending | null = null;
  const store = webStore();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      record = raw ? (JSON.parse(raw) as Pending) : null;
      store.removeItem(STORAGE_KEY);
    } catch {
      record = null;
    }
  } else {
    record = memory;
    memory = null;
  }
  if (!record || !isValidShareToken(record.token)) return null;
  if (typeof record.savedAt !== 'number' || now - record.savedAt > TTL_MS) return null;
  return record.token;
}

export function clearPendingShareToken(): void {
  const store = webStore();
  if (store) {
    try {
      store.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  memory = null;
}
