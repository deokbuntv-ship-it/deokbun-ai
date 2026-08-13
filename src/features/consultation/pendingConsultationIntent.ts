// Pending consultation intent (Sprint 2A). The small, EPHEMERAL bridge that keeps a
// user's typed question — and where to return to — alive across an auth interruption,
// so login is an interruption, not a reset (§9). It is NOT the draft: subject/birth are
// persisted by ConsultationDraftContext; this only carries the transient question +
// return route.
//
// Storage: sessionStorage on web (tab-scoped, cleared on tab close, survives the OAuth
// popup because set+consume both happen in the opener window), in-memory on native (the
// app stays alive across expo-web-browser's auth session). NEVER localStorage, NEVER the
// DB, NEVER the URL — the consultation question is sensitive (§17/§20). Consumed on use.
//
// Web detection is done via `globalThis.sessionStorage` (not react-native Platform) so
// this module stays importable in the pure jest (node) runner — there it falls back to
// the in-memory branch, which the tests exercise deterministically.

export type PendingConsultationIntent = {
  question?: string;
  returnTo?: string;
  savedAt?: number; // epoch ms when the question was stored (for TTL, §19)
};

// Only these internal routes may be resumed to (§12/§52 — no open redirect).
const ALLOWED_RETURN_TO: readonly string[] = ['/chat', '/consult', '/inbox', '/today', '/'];

const STORAGE_KEY = 'deokbun.pendingConsultationIntent';

// A stored question that was never consumed (abandoned flow) expires, so it can never
// resurface as a stale prefill in a much-later, unrelated consultation (§19).
const QUESTION_TTL_MS = 30 * 60 * 1000;

/**
 * A safe return-to must be an INTERNAL absolute route on the allowlist — never an
 * external, protocol-relative, or scheme (javascript:/data:) URL.
 */
export function isSafeReturnTo(value: string | null | undefined): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (!value.startsWith('/')) return false; // must be an internal absolute path
  if (value.startsWith('//')) return false; // protocol-relative → external
  if (value.includes(':') || value.includes('\\')) return false; // scheme / backslash tricks
  const path = value.split('?')[0].split('#')[0];
  return ALLOWED_RETURN_TO.includes(path);
}

let memoryIntent: PendingConsultationIntent | null = null;

function webStore(): Storage | null {
  try {
    const g = globalThis as unknown as { sessionStorage?: Storage };
    if (g && g.sessionStorage) return g.sessionStorage;
  } catch {
    // sessionStorage access can throw (private mode / disabled) → fall through.
  }
  return null;
}

function read(): PendingConsultationIntent | null {
  const store = webStore();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PendingConsultationIntent) : null;
    } catch {
      return null;
    }
  }
  return memoryIntent;
}

function write(intent: PendingConsultationIntent | null): void {
  const store = webStore();
  if (store) {
    try {
      if (intent && Object.keys(intent).length > 0) {
        store.setItem(STORAGE_KEY, JSON.stringify(intent));
      } else {
        store.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures — worst case is a non-preserved question, never a crash.
    }
    return;
  }
  memoryIntent = intent && Object.keys(intent).length > 0 ? intent : null;
}

/** Merge a patch into the stored intent. Only a non-empty question and a SAFE returnTo
 * are accepted (an unsafe returnTo is silently dropped, never stored). */
export function setPendingConsultationIntent(patch: PendingConsultationIntent): void {
  const next: PendingConsultationIntent = { ...(read() ?? {}) };
  if (typeof patch.question === 'string' && patch.question.trim().length > 0) {
    next.question = patch.question.trim();
    next.savedAt = Date.now();
  }
  if (isSafeReturnTo(patch.returnTo)) {
    next.returnTo = patch.returnTo;
  }
  write(next);
}

export function peekPendingConsultationIntent(): PendingConsultationIntent | null {
  return read();
}

/** Read + clear the pending question (one-shot). Returns null if absent OR expired past
 * the TTL (an abandoned question never resurfaces as a stale prefill, §19). */
export function consumePendingQuestion(): string | null {
  const current = read();
  if (!current || typeof current.question !== 'string' || current.question.length === 0) {
    return null;
  }
  const rest: PendingConsultationIntent = { ...current };
  delete rest.question;
  delete rest.savedAt;
  write(rest);
  const expired =
    typeof current.savedAt === 'number' && Date.now() - current.savedAt > QUESTION_TTL_MS;
  return expired ? null : current.question;
}

/** Read + clear the pending returnTo (one-shot), validated. Returns null if absent/unsafe. */
export function consumePendingReturnTo(): string | null {
  const current = read();
  const returnTo = current?.returnTo;
  if (current) {
    const rest: PendingConsultationIntent = { ...current };
    delete rest.returnTo;
    write(rest);
  }
  return isSafeReturnTo(returnTo) ? returnTo : null;
}

export function clearPendingConsultationIntent(): void {
  write(null);
}
