// Email delivery classification + bounded retry (Sprint J4 §4.12). PURE — the send worker uses this to turn an
// EmailSendResult into the next email_deliveries status. Invalid email is never retried; transient errors retry
// to a bound; not_configured stays PENDING (provider EXTERNAL) without burning attempts. No infinite retry.
import type { EmailSendResult } from './emailProvider';

// Mirrors email_deliveries.status in migration 20260841.
export type EmailDeliveryStatus =
  | 'PENDING' | 'SENT' | 'FAILED'
  | 'SKIPPED_NO_CONSENT' | 'SKIPPED_INVALID_EMAIL' | 'SKIPPED_NO_FORTUNE' | 'CANCELLED';

export type EmailOutcome = 'ok' | 'retryable' | 'invalid_email' | 'not_configured' | 'permanent';

export function classifyEmailOutcome(result: EmailSendResult): EmailOutcome {
  if (result.ok && result.status === 'sent') return 'ok';
  switch (result.status) {
    case 'sent': return 'ok';
    case 'invalid_email': return 'invalid_email';
    case 'not_configured': return 'not_configured';
    case 'error': return 'retryable';
    default: return 'permanent';
  }
}

export type EmailDeliveryDecision = { status: EmailDeliveryStatus; retry: boolean };

export const DEFAULT_MAX_EMAIL_ATTEMPTS = 3;

export function decideEmailDelivery(
  outcome: EmailOutcome,
  attemptCount: number,
  maxAttempts: number = DEFAULT_MAX_EMAIL_ATTEMPTS,
): EmailDeliveryDecision {
  switch (outcome) {
    case 'ok': return { status: 'SENT', retry: false };
    case 'invalid_email': return { status: 'SKIPPED_INVALID_EMAIL', retry: false };
    case 'not_configured': return { status: 'PENDING', retry: false };
    case 'retryable': {
      const attemptsNow = attemptCount + 1;
      const canRetry = attemptsNow < maxAttempts;
      return { status: canRetry ? 'PENDING' : 'FAILED', retry: canRetry };
    }
    case 'permanent':
    default: return { status: 'FAILED', retry: false };
  }
}
