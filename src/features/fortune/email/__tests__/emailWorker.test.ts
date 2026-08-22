// Sprint J6 §6.6/§6.8/§6.12 — email worker: idempotent (skips terminal), NOT_CONFIGURED never marks SENT,
// provider-throw isolated + bounded retry, invalid email skipped.
import { processEmailDeliveries, type PendingEmailDelivery, type EmailRecordInput } from '@/features/fortune/email/emailWorker';
import { createTestEmailProvider, noopEmailProvider } from '@/features/fortune/email/emailProvider';

function delivery(over: Partial<PendingEmailDelivery> = {}): PendingEmailDelivery {
  return {
    deliveryId: 'e1',
    message: { recipient: 'a@b.com', subject: 's', renderedContent: 'c', idempotencyKey: 'k1' },
    attemptCount: 0, status: 'PENDING', ...over,
  };
}
function recorder() {
  const calls: EmailRecordInput[] = [];
  return { calls, fn: async (i: EmailRecordInput) => { calls.push(i); } };
}

describe('processEmailDeliveries', () => {
  it('sends a PENDING delivery and records SENT', async () => {
    const p = createTestEmailProvider({ configured: true, nextStatus: 'sent' });
    const r = recorder();
    const rep = await processEmailDeliveries([delivery()], p, r.fn);
    expect(rep.sent).toBe(1);
    expect(p.sent).toHaveLength(1);
    expect(r.calls[0]).toMatchObject({ deliveryId: 'e1', status: 'SENT' });
  });

  it('NOT_CONFIGURED provider: leaves PENDING, never SENT', async () => {
    const r = recorder();
    const rep = await processEmailDeliveries([delivery()], noopEmailProvider, r.fn);
    expect(rep.notConfigured).toBe(1);
    expect(rep.sent).toBe(0);
    expect(r.calls).toHaveLength(0);
  });

  it('skips already-terminal recipients (idempotent, no double-send)', async () => {
    const p = createTestEmailProvider({ configured: true });
    const r = recorder();
    const rep = await processEmailDeliveries([delivery({ status: 'SENT' })], p, r.fn);
    expect(rep.skipped).toBe(1);
    expect(p.sent).toHaveLength(0);
  });

  it('invalid_email → SKIPPED_INVALID_EMAIL', async () => {
    const p = createTestEmailProvider({ configured: true, nextStatus: 'invalid_email' });
    const r = recorder();
    await processEmailDeliveries([delivery()], p, r.fn);
    expect(r.calls[0].status).toBe('SKIPPED_INVALID_EMAIL');
  });

  it('provider throw isolated → retriable under the bound, FAILED at the bound', async () => {
    const throwing = { ...createTestEmailProvider({ configured: true }), sendEmail: async () => { throw new Error('smtp'); } };
    const r1 = recorder();
    await processEmailDeliveries([delivery({ attemptCount: 0 })], throwing, r1.fn, 3);
    expect(r1.calls[0].status).toBe('PENDING');
    const r2 = recorder();
    await processEmailDeliveries([delivery({ attemptCount: 2 })], throwing, r2.fn, 3);
    expect(r2.calls[0].status).toBe('FAILED');
  });
});
