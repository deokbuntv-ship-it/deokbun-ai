// App error logging seam (directive §2-D/§6) — infra-free interface + a safe
// console adapter, ready to back with Sentry/etc. later via a new adapter.
//
// PRIVACY: an AppErrorEvent NEVER carries full prompts, consultation text, raw
// birth info, API keys, or tokens. `safeMetadata` is caller-guaranteed to hold
// only small, non-sensitive values; the console adapter logs only the structural
// fields + requestId for correlation.
import type { AppErrorCode } from './errors';
import { pgCodeOf, pgErrorToAppCode } from './errors';
import { newRequestId } from './requestId';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AppErrorEvent = {
  requestId?: string;
  errorCode: AppErrorCode;
  source: string; // 'chat' | 'consultation' | 'subject' | 'admin' | 'edge' | 'fortune' | ...
  severity: ErrorSeverity;
  occurredAt: string; // ISO timestamp
  safeMetadata?: Record<string, string | number | boolean>;
};

export interface AppErrorLogger {
  log(event: AppErrorEvent): void;
}

export function appErrorEvent(
  errorCode: AppErrorCode,
  source: string,
  opts?: { requestId?: string; severity?: ErrorSeverity; occurredAt?: string; safeMetadata?: AppErrorEvent['safeMetadata'] },
): AppErrorEvent {
  return {
    errorCode,
    source,
    requestId: opts?.requestId,
    severity: opts?.severity ?? 'error',
    occurredAt: opts?.occurredAt ?? new Date().toISOString(),
    safeMetadata: opts?.safeMetadata,
  };
}

// Boundary helper for DB (Supabase) services: map a raw error to the standard
// Error Contract, LOG it (technical pg code + a fresh requestId, PII-safe), then
// RE-THROW THE ORIGINAL error so existing callers that inspect the raw error
// (e.g. `error.code === '23505'`) keep working. Return type `never` — callers
// can write `if (error) logDbError(error, 'subject', 'createSubject')` and tsc
// treats the following code as unreachable, exactly like a bare `throw`.
export function logDbError(
  raw: unknown,
  source: string,
  operation: string,
): never {
  const requestId = newRequestId();
  consoleErrorLogger.log(
    appErrorEvent(pgErrorToAppCode(raw), source, {
      requestId,
      severity: 'error',
      safeMetadata: { operation, pgCode: pgCodeOf(raw) ?? 'none' },
    }),
  );
  throw raw;
}

// Default adapter. Logs a single compact line via console — structural fields
// only, no free-form message that could leak content. Failure-path only in
// practice (mirrors the chat edge's logging policy).
export const consoleErrorLogger: AppErrorLogger = {
  log(event) {
    const parts = [
      `[${event.severity}]`,
      event.source,
      event.errorCode,
      event.requestId ? `req=${event.requestId}` : '',
    ].filter(Boolean);
    // eslint-disable-next-line no-console
    console.error(parts.join(' '), event.safeMetadata ?? {});
  },
};
