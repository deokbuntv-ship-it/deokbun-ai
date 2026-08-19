// Product analytics foundation (§37/§38/§40). Locks the PROPERTY ALLOWLIST (the PII guard) and the
// non-blocking insert. Supabase mocked.
let inserted: Record<string, unknown> | null = null;
let throwOnInsert = false;

jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: (body: Record<string, unknown>) => {
        if (throwOnInsert) throw new Error('db down');
        inserted = body;
        return Promise.resolve({ data: null, error: null });
      },
    }),
  }),
}));

import { sanitizeEventProperties, trackProductEvent } from '../productEvents';

beforeEach(() => {
  inserted = null;
  throwOnInsert = false;
});

describe('sanitizeEventProperties — allowlist (PII can never pass §38)', () => {
  it('keeps only allowlisted keys and drops everything else', () => {
    const out = sanitizeEventProperties({
      relationship_type: '연인',
      compatibility_tier: 'GOOD',
      policy_version: 'consultation@1.4.1',
      // all of these MUST be dropped:
      name: '조세영',
      birth_date: '1992-05-20',
      question: '우리 궁합 좋아?',
      answer: '잘 맞아요',
      email: 'x@y.com',
      phone: '010',
    });
    expect(out).toEqual({
      relationship_type: '연인',
      compatibility_tier: 'GOOD',
      policy_version: 'consultation@1.4.1',
    });
    for (const k of ['name', 'birth_date', 'question', 'answer', 'email', 'phone']) {
      expect(out).not.toHaveProperty(k);
    }
  });

  it('keeps the onboarding funnel props (provider/step/existing/continuation) but never PII', () => {
    const out = sanitizeEventProperties({
      provider: 'kakao',
      completion_step: 'birth',
      is_existing_user: true,
      continuation_type: 'shared_report',
      // must be dropped:
      birth_date: '1994-05-20',
      email: 'x@y.com',
    });
    expect(out).toEqual({ provider: 'kakao', completion_step: 'birth', is_existing_user: true, continuation_type: 'shared_report' });
    expect(out).not.toHaveProperty('birth_date');
    expect(out).not.toHaveProperty('email');
  });

  it('drops over-long strings and non-primitive values', () => {
    const out = sanitizeEventProperties({
      source: 'x'.repeat(200), // too long
      channel: { nested: 1 } as never, // not a primitive
      compatibility_tier: 'VERY_GOOD',
    });
    expect(out).toEqual({ compatibility_tier: 'VERY_GOOD' });
  });
});

describe('trackProductEvent', () => {
  it('inserts the event with sanitized properties only', async () => {
    await trackProductEvent('compatibility_result_viewed', {
      surface: 'compatibility_chat',
      consultationMode: 'compatibility',
      properties: { compatibility_tier: 'GOOD', name: 'LEAK' },
    });
    expect(inserted).toMatchObject({
      event_name: 'compatibility_result_viewed',
      surface: 'compatibility_chat',
      consultation_mode: 'compatibility',
      properties: { compatibility_tier: 'GOOD' },
    });
    expect((inserted!.properties as Record<string, unknown>)).not.toHaveProperty('name');
  });

  it('is non-blocking — a DB throw is swallowed (never rejects §40)', async () => {
    throwOnInsert = true;
    await expect(trackProductEvent('compatibility_started', {})).resolves.toBeUndefined();
  });
});
