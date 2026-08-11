// Fortune generation + delivery orchestration tests (directive §3/§4/§13). Pure;
// verifies the contracts NEVER fake a fortune or a delivery.
import {
  canSendDelivery,
  canTransitionDelivery,
  planFortuneDelivery,
  planFortuneGeneration,
  resolveDeliveryReadiness,
  type DeliveryProviderConfig,
  type FortuneGenerationJob,
} from '../domain/fortuneJobs';

const req = {
  userId: 'u1',
  subjectId: 's1',
  period: { type: 'monthly', year: 2026, month: 8 },
  hasBirthDate: true,
} as const;

describe('planFortuneGeneration (idempotent, engine-gated)', () => {
  it('stops at ENGINE_NOT_CONNECTED with no engine (no fabricated content)', () => {
    const job = planFortuneGeneration(req, { engineConnected: false, alreadyExists: false }, 'req_1');
    expect(job.status).toBe('pending');
    expect(job.reason).toBe('ENGINE_NOT_CONNECTED');
    expect(job.idempotencyKey).toBe('ftn:u1:s1:monthly:2026-08');
    expect(job.tokenUsage).toBeNull();
    expect(job.model).toBeNull();
    expect(job.requestId).toBe('req_1');
  });
  it('skips duplicates via idempotency', () => {
    const job = planFortuneGeneration(req, { engineConnected: true, alreadyExists: true }, 'req_2');
    expect(job.reason).toBe('DUPLICATE_SKIPPED');
  });
  it('is ready for generation only when eligible + unique + engine-connected', () => {
    const job = planFortuneGeneration(req, { engineConnected: true, alreadyExists: false }, 'req_3');
    expect(job.status).toBe('generating');
    expect(job.reason).toBe('READY_FOR_GENERATION');
  });
});

describe('resolveDeliveryReadiness (provider-neutral, truthful)', () => {
  it('is not_configured with no provider', () => {
    expect(resolveDeliveryReadiness(null)).toBe('not_configured');
    expect(resolveDeliveryReadiness({ channel: 'push', providerId: null, connected: false })).toBe('not_configured');
  });
  it('is provider_not_connected when a provider id exists but is not connected', () => {
    expect(resolveDeliveryReadiness({ channel: 'push', providerId: 'fcm', connected: false })).toBe('provider_not_connected');
  });
  it('is ready only when connected', () => {
    expect(resolveDeliveryReadiness({ channel: 'push', providerId: 'fcm', connected: true })).toBe('ready');
  });
});

describe('planFortuneDelivery (never fakes a send)', () => {
  const genReady: FortuneGenerationJob = {
    idempotencyKey: 'ftn:u1:s1:monthly:2026-08', userId: 'u1', subjectId: 's1',
    period: { type: 'monthly', year: 2026, month: 8 }, status: 'generated', requestId: 'r',
    stoppedAt: 'ai_generation', reason: 'READY_FOR_GENERATION',
    model: null, promptVersion: null, schemaVersion: null, tokenUsage: null,
  };
  const connected: DeliveryProviderConfig = { channel: 'push', providerId: 'fcm', connected: true };

  it('blocks delivery when no provider is configured (no fake sent)', () => {
    const d = planFortuneDelivery(genReady, null, 'req_d');
    expect(d.status).toBe('blocked_not_configured');
    expect(d.reason).toBe('NOT_CONFIGURED');
    expect(d.sentAt).toBeNull();
    expect(d.providerMessageId).toBeNull();
  });
  it('stays pending when generation is not ready', () => {
    const d = planFortuneDelivery({ ...genReady, status: 'pending' }, connected, 'req_d');
    expect(d.status).toBe('pending');
    expect(d.reason).toBe('GENERATION_NOT_READY');
  });
  it('schedules only when provider ready AND generation ready', () => {
    const d = planFortuneDelivery(genReady, connected, 'req_d');
    expect(d.status).toBe('scheduled');
    expect(d.reason).toBe('READY_TO_SEND');
  });
});

describe('delivery transitions + duplicate-send guard', () => {
  it('allows retry from delivery_failed; sent/cancelled are terminal', () => {
    expect(canTransitionDelivery('scheduled', 'sent')).toBe(true);
    expect(canTransitionDelivery('delivery_failed', 'scheduled')).toBe(true);
    expect(canTransitionDelivery('sent', 'scheduled')).toBe(false);
    expect(canTransitionDelivery('cancelled', 'scheduled')).toBe(false);
    expect(canTransitionDelivery('scheduled', 'pending')).toBe(false);
  });
  it('canSendDelivery guards against duplicate sends', () => {
    const scheduled = planFortuneDelivery(
      { idempotencyKey: 'k', userId: 'u', subjectId: 's', period: { type: 'yearly', year: 2026 }, status: 'generated', requestId: 'r', stoppedAt: 'ai_generation', reason: '', model: null, promptVersion: null, schemaVersion: null, tokenUsage: null },
      { channel: 'push', providerId: 'fcm', connected: true },
      'r',
    );
    expect(canSendDelivery(scheduled, false)).toBe(true);
    expect(canSendDelivery(scheduled, true)).toBe(false); // already sent → no resend
  });
});
