// Provider-independent PUSH delivery worker (Sprint J6 §6.7). PURE orchestration over a batch of PENDING push
// deliveries: send each via the injected provider and record the outcome. Guarantees:
//   * business truth is never corrupted by a provider — the notification already exists; this only sends + marks.
//   * a NOT_CONFIGURED provider leaves deliveries PENDING and NEVER marks SENT (no fabricated delivery success).
//   * already-terminal deliveries (not PENDING) are skipped → repeated worker runs are idempotent.
//   * a provider throw/error is isolated per delivery and classified via the bounded-retry rules.
// The Edge worker wires real fetch/send/record to this; here it is DI + fully unit-tested.
import type { PushProvider, PushMessage } from './pushProvider';
import { classifyPushOutcome, decideDelivery, type DeliveryStatus } from './pushDelivery';

export type PendingPushDelivery = {
  deliveryId: string;
  token: string | null;   // the target device token (null → SKIPPED_NO_TOKEN)
  deviceId: string | null;
  message: PushMessage;
  attemptCount: number;
  status: DeliveryStatus;  // expected PENDING; anything else is skipped (idempotency)
};

export type PushRecordInput = {
  deliveryId: string;
  status: DeliveryStatus;
  errorCategory: string | null;
  disableDeviceId: string | null; // set when an invalid token should disable the device
};
export type PushRecorder = (input: PushRecordInput) => Promise<void>;

export type PushWorkerReport = {
  processed: number; sent: number; failed: number; retriable: number; skipped: number; notConfigured: number;
};

export async function processPushDeliveries(
  deliveries: PendingPushDelivery[],
  provider: PushProvider,
  record: PushRecorder,
  maxAttempts?: number,
): Promise<PushWorkerReport> {
  const report: PushWorkerReport = { processed: 0, sent: 0, failed: 0, retriable: 0, skipped: 0, notConfigured: 0 };
  for (const d of deliveries) {
    report.processed++;
    if (d.status !== 'PENDING') { report.skipped++; continue; }           // idempotent: never touch a terminal row
    if (!provider.isConfigured()) { report.notConfigured++; continue; }    // leave PENDING; never mark SENT
    if (!d.token) {
      await record({ deliveryId: d.deliveryId, status: 'SKIPPED_NO_TOKEN', errorCategory: null, disableDeviceId: null });
      report.skipped++; continue;
    }
    let ok: boolean; let outcome: ReturnType<typeof classifyPushOutcome>;
    try {
      const result = await provider.sendPush(d.token, d.message);
      outcome = classifyPushOutcome(result);
      ok = result.ok;
    } catch {
      outcome = 'retryable'; ok = false;                                   // provider throw isolated
    }
    void ok;
    if (outcome === 'not_configured') { report.notConfigured++; continue; } // defensive: still leave PENDING
    const decision = decideDelivery(outcome, d.attemptCount, maxAttempts);
    await record({
      deliveryId: d.deliveryId,
      status: decision.status,
      errorCategory: outcome === 'ok' ? null : outcome,
      disableDeviceId: decision.disableToken ? d.deviceId : null,
    });
    if (decision.status === 'SENT') report.sent++;
    else if (decision.status === 'PENDING') report.retriable++;
    else report.failed++;
  }
  return report;
}
