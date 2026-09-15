// Push delivery classification + bounded retry (Sprint J3 §11/§12). PURE + deterministic — the push worker uses
// this to turn a provider PushSendResult into the next notification_deliveries status and to decide retry vs
// disable-token. No infinite retry: transient failures retry up to a bound; an invalid token is never retried
// (the device is disabled instead); a permanent error stops. Fully unit-testable.
import type { PushSendResult } from './pushProvider';

// Mirrors the notification_deliveries.status CHECK in migration 20260840.
export type DeliveryStatus =
  | 'PENDING' | 'SENT' | 'FAILED'
  | 'SKIPPED_NO_TOKEN' | 'SKIPPED_DISABLED' | 'SKIPPED_NO_CONSENT';

export type PushOutcome = 'ok' | 'retryable' | 'invalid_token' | 'not_configured' | 'permanent';

/** Classify a provider result into a domain outcome. */
export function classifyPushOutcome(result: PushSendResult): PushOutcome {
  if (result.ok && result.status === 'sent') return 'ok';
  switch (result.status) {
    case 'sent': return 'ok';
    case 'invalid_token': return 'invalid_token';
    case 'not_configured': return 'not_configured';
    case 'error': return 'retryable';
    default: return 'permanent';
  }
}

export type DeliveryDecision = {
  status: DeliveryStatus;
  retry: boolean;        // should the worker attempt again later?
  disableToken: boolean; // should the device token be disabled (invalid)?
};

export const DEFAULT_MAX_PUSH_ATTEMPTS = 3;

/**
 * Decide the next delivery state from an outcome + how many attempts have already happened.
 * `attemptCount` is the number of attempts BEFORE this result (0 on the first send).
 */
export function decideDelivery(
  outcome: PushOutcome,
  attemptCount: number,
  maxAttempts: number = DEFAULT_MAX_PUSH_ATTEMPTS,
): DeliveryDecision {
  switch (outcome) {
    case 'ok':
      return { status: 'SENT', retry: false, disableToken: false };
    case 'invalid_token':
      // Never retry an invalid token; disable the device so we stop targeting it (rotation-safe).
      return { status: 'FAILED', retry: false, disableToken: true };
    case 'not_configured':
      // Provider not configured (EXTERNAL) — leave PENDING for when it is, but do not burn attempts.
      return { status: 'PENDING', retry: false, disableToken: false };
    case 'retryable': {
      const attemptsNow = attemptCount + 1;
      const canRetry = attemptsNow < maxAttempts;
      return { status: canRetry ? 'PENDING' : 'FAILED', retry: canRetry, disableToken: false };
    }
    case 'permanent':
    default:
      return { status: 'FAILED', retry: false, disableToken: false };
  }
}
