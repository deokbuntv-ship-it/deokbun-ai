// Provider-independent EMAIL delivery worker (Sprint J6 §6.8). PURE orchestration over a batch of PENDING email
// deliveries: render (already done upstream), send via the injected provider, record the outcome. Same guarantees
// as the push worker: truth never corrupted by a provider; NOT_CONFIGURED leaves PENDING and NEVER marks SENT;
// already-terminal recipients are skipped (idempotent, no double-send); provider errors are isolated + bounded.
import type { EmailProvider, EmailMessage } from './emailProvider';
import { classifyEmailOutcome, decideEmailDelivery, type EmailDeliveryStatus } from './emailDelivery';

export type PendingEmailDelivery = {
  deliveryId: string;
  message: EmailMessage;      // recipient + subject + rendered content + idempotencyKey
  attemptCount: number;
  status: EmailDeliveryStatus; // expected PENDING; anything else is skipped
};

export type EmailRecordInput = { deliveryId: string; status: EmailDeliveryStatus; errorCategory: string | null };
export type EmailRecorder = (input: EmailRecordInput) => Promise<void>;

export type EmailWorkerReport = {
  processed: number; sent: number; failed: number; retriable: number; skipped: number; notConfigured: number;
};

export async function processEmailDeliveries(
  deliveries: PendingEmailDelivery[],
  provider: EmailProvider,
  record: EmailRecorder,
  maxAttempts?: number,
): Promise<EmailWorkerReport> {
  const report: EmailWorkerReport = { processed: 0, sent: 0, failed: 0, retriable: 0, skipped: 0, notConfigured: 0 };
  for (const d of deliveries) {
    report.processed++;
    if (d.status !== 'PENDING') { report.skipped++; continue; }         // idempotent: never re-send a terminal row
    if (!provider.isConfigured()) { report.notConfigured++; continue; } // leave PENDING; never mark SENT
    let outcome: ReturnType<typeof classifyEmailOutcome>;
    try {
      outcome = classifyEmailOutcome(await provider.sendEmail(d.message));
    } catch {
      outcome = 'retryable';                                            // provider throw isolated
    }
    if (outcome === 'not_configured') { report.notConfigured++; continue; }
    const decision = decideEmailDelivery(outcome, d.attemptCount, maxAttempts);
    await record({ deliveryId: d.deliveryId, status: decision.status, errorCategory: outcome === 'ok' ? null : outcome });
    if (decision.status === 'SENT') report.sent++;
    else if (decision.status === 'PENDING') report.retriable++;
    else report.failed++;
  }
  return report;
}
