// Non-UI regression coverage for the fortune-mail domain (directive §8/§13):
// the status transition machine, the deterministic idempotency key, the pipeline
// gate (which must STOP at ENGINE_NOT_CONNECTED — never fabricate a fortune), and
// structural content validation. Pure — no I/O, no engine, no mock fortunes.
import {
  canTransition,
  evaluateFortunePipeline,
  fortuneIdempotencyKey,
  validateFortuneContent,
  type FortuneMailStatus,
} from '@/features/fortune/domain/fortuneDomain';

describe('canTransition (status machine)', () => {
  it('allows the documented forward transitions', () => {
    expect(canTransition('pending', 'generating')).toBe(true);
    expect(canTransition('generating', 'generated')).toBe(true);
    expect(canTransition('generated', 'scheduled')).toBe(true);
    expect(canTransition('scheduled', 'sent')).toBe(true);
  });

  it('allows retry paths from failure states', () => {
    expect(canTransition('generation_failed', 'generating')).toBe(true);
    expect(canTransition('delivery_failed', 'scheduled')).toBe(true);
  });

  it('treats sent and cancelled as terminal (no outgoing transitions)', () => {
    const anyStatus: FortuneMailStatus[] = [
      'pending', 'generating', 'generated', 'scheduled', 'sent',
      'generation_failed', 'delivery_failed', 'cancelled',
    ];
    for (const to of anyStatus) {
      expect(canTransition('sent', to)).toBe(false);
      expect(canTransition('cancelled', to)).toBe(false);
    }
  });

  it('rejects illegal jumps', () => {
    expect(canTransition('pending', 'sent')).toBe(false);
    expect(canTransition('pending', 'generated')).toBe(false);
    expect(canTransition('generated', 'generating')).toBe(false);
  });
});

describe('fortuneIdempotencyKey', () => {
  it('is deterministic for identical inputs', () => {
    const p = { type: 'monthly', year: 2026, month: 8 } as const;
    expect(fortuneIdempotencyKey('u1', 's1', p)).toBe(fortuneIdempotencyKey('u1', 's1', p));
  });

  it('encodes user, subject, type and period token', () => {
    expect(fortuneIdempotencyKey('u1', 's1', { type: 'monthly', year: 2026, month: 8 })).toBe('ftn:u1:s1:monthly:2026-08');
    expect(fortuneIdempotencyKey('u1', 's1', { type: 'weekly', year: 2026, week: 33 })).toBe('ftn:u1:s1:weekly:2026-W33');
    expect(fortuneIdempotencyKey('u1', 's1', { type: 'yearly', year: 2026 })).toBe('ftn:u1:s1:yearly:2026');
    expect(fortuneIdempotencyKey('u1', 's1', { type: 'special', tag: 'newyear' })).toBe('ftn:u1:s1:special:special:newyear');
  });

  it('zero-pads month and week tokens', () => {
    expect(fortuneIdempotencyKey('u', 's', { type: 'monthly', year: 2026, month: 3 })).toContain(':2026-03');
    expect(fortuneIdempotencyKey('u', 's', { type: 'weekly', year: 2026, week: 5 })).toContain(':2026-W05');
  });

  it('differs when any of user / subject / period changes', () => {
    const base = fortuneIdempotencyKey('u1', 's1', { type: 'monthly', year: 2026, month: 8 });
    expect(fortuneIdempotencyKey('u2', 's1', { type: 'monthly', year: 2026, month: 8 })).not.toBe(base);
    expect(fortuneIdempotencyKey('u1', 's2', { type: 'monthly', year: 2026, month: 8 })).not.toBe(base);
    expect(fortuneIdempotencyKey('u1', 's1', { type: 'monthly', year: 2026, month: 9 })).not.toBe(base);
  });
});

describe('evaluateFortunePipeline (gate — never fabricates)', () => {
  const req = { userId: 'u1', subjectId: 's1', period: { type: 'monthly', year: 2026, month: 8 }, hasBirthDate: true } as const;

  it('stops at eligibility when birth date is missing', () => {
    const o = evaluateFortunePipeline({ ...req, hasBirthDate: false }, { engineConnected: true, alreadyExists: false });
    expect(o.stoppedAt).toBe('eligibility');
    expect(o.reason).toBe('BIRTH_INFO_REQUIRED');
    expect(o.status).toBe('generation_failed');
  });

  it('short-circuits duplicates via idempotency', () => {
    const o = evaluateFortunePipeline(req, { engineConnected: true, alreadyExists: true });
    expect(o.stoppedAt).toBe('idempotency');
    expect(o.reason).toBe('DUPLICATE_SKIPPED');
  });

  it('STOPS at the engine step when no engine is connected (no fabricated fortune)', () => {
    const o = evaluateFortunePipeline(req, { engineConnected: false, alreadyExists: false });
    expect(o.stoppedAt).toBe('engine');
    expect(o.reason).toBe('ENGINE_NOT_CONNECTED');
    expect(o.status).toBe('pending');
  });

  it('advances to AI generation only when eligible, unique, and engine-connected', () => {
    const o = evaluateFortunePipeline(req, { engineConnected: true, alreadyExists: false });
    expect(o.stoppedAt).toBe('ai_generation');
    expect(o.reason).toBe('READY_FOR_GENERATION');
    expect(o.status).toBe('generating');
  });

  it('always attaches the idempotency key to the outcome', () => {
    const o = evaluateFortunePipeline(req, { engineConnected: false, alreadyExists: false });
    expect(o.idempotencyKey).toBe('ftn:u1:s1:monthly:2026-08');
  });
});

describe('validateFortuneContent (structure only)', () => {
  it('rejects empty / missing fields', () => {
    expect(validateFortuneContent({}).valid).toBe(false);
    expect(validateFortuneContent({ title: 't', summary: 's', content: 'c' }).valid).toBe(false); // no schemaVersion
    expect(validateFortuneContent({ title: '   ', summary: 's', content: 'c', schemaVersion: 'v1' }).valid).toBe(false);
  });

  it('accepts a fully-populated candidate', () => {
    const r = validateFortuneContent({ title: 't', summary: 's', content: 'c', schemaVersion: 'v1' });
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('reports each missing field by name', () => {
    const r = validateFortuneContent({ title: 't' });
    expect(r.errors).toEqual(expect.arrayContaining(['summary_missing', 'content_missing', 'schema_version_missing']));
  });
});
