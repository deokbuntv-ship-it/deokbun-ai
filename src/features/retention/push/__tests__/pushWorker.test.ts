// Sprint J6 §6.6/§6.7/§6.12 — push worker: idempotent (skips terminal), NOT_CONFIGURED never marks SENT,
// no-token skip, provider-throw isolated + bounded retry, invalid-token disables the device.
import { processPushDeliveries, type PendingPushDelivery, type PushRecordInput } from '@/features/retention/push/pushWorker';
import { createTestPushProvider } from '@/features/retention/push/testPushProvider';
import { noopPushProvider } from '@/features/retention/push/pushProvider';

const MSG = { title: 't', body: 'b', deepLinkTarget: 'MONTHLY' as const };
function delivery(over: Partial<PendingPushDelivery> = {}): PendingPushDelivery {
  return { deliveryId: 'd1', token: 'ExponentPushToken[x]', deviceId: 'dev1', message: MSG, attemptCount: 0, status: 'PENDING', ...over };
}
function recorder() {
  const calls: PushRecordInput[] = [];
  return { calls, fn: async (i: PushRecordInput) => { calls.push(i); } };
}

describe('processPushDeliveries', () => {
  it('sends a PENDING delivery via a configured provider and records SENT', async () => {
    const p = createTestPushProvider({ configured: true, nextStatus: 'sent' });
    const r = recorder();
    const rep = await processPushDeliveries([delivery()], p, r.fn);
    expect(rep.sent).toBe(1);
    expect(p.sent).toHaveLength(1);
    expect(r.calls[0]).toMatchObject({ deliveryId: 'd1', status: 'SENT', disableDeviceId: null });
  });

  it('NOT_CONFIGURED provider: leaves PENDING, records nothing, never SENT', async () => {
    const r = recorder();
    const rep = await processPushDeliveries([delivery()], noopPushProvider, r.fn);
    expect(rep.notConfigured).toBe(1);
    expect(rep.sent).toBe(0);
    expect(r.calls).toHaveLength(0); // nothing marked
  });

  it('skips already-terminal deliveries (idempotent re-run)', async () => {
    const p = createTestPushProvider({ configured: true });
    const r = recorder();
    const rep = await processPushDeliveries([delivery({ status: 'SENT' })], p, r.fn);
    expect(rep.skipped).toBe(1);
    expect(p.sent).toHaveLength(0);
    expect(r.calls).toHaveLength(0);
  });

  it('no token → SKIPPED_NO_TOKEN, no provider call', async () => {
    const p = createTestPushProvider({ configured: true });
    const r = recorder();
    await processPushDeliveries([delivery({ token: null })], p, r.fn);
    expect(p.sent).toHaveLength(0);
    expect(r.calls[0].status).toBe('SKIPPED_NO_TOKEN');
  });

  it('invalid token → FAILED + disables the device', async () => {
    const p = createTestPushProvider({ configured: true, nextStatus: 'invalid_token' });
    const r = recorder();
    await processPushDeliveries([delivery()], p, r.fn);
    expect(r.calls[0]).toMatchObject({ status: 'FAILED', disableDeviceId: 'dev1' });
  });

  it('provider throw is isolated → retriable (stays PENDING under the attempt bound)', async () => {
    const throwing = { ...createTestPushProvider({ configured: true }), sendPush: async () => { throw new Error('net'); } };
    const r = recorder();
    const rep = await processPushDeliveries([delivery({ attemptCount: 0 })], throwing, r.fn, 3);
    expect(r.calls[0].status).toBe('PENDING');
    expect(rep.retriable).toBe(1);
  });

  it('transient failure at the attempt bound → FAILED (no infinite retry)', async () => {
    const p = createTestPushProvider({ configured: true, nextStatus: 'error' });
    const r = recorder();
    await processPushDeliveries([delivery({ attemptCount: 2 })], p, r.fn, 3);
    expect(r.calls[0].status).toBe('FAILED');
  });
});
