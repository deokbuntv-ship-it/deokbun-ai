// Onboarding consent persistence (§20/§21). Locks the RESILIENT read (a missing migration must degrade to
// "no consent" rather than crash) and the save shape. Supabase mocked.
let selectResult: { data: unknown; error: unknown } = { data: null, error: null };
let upsertBody: Record<string, unknown> | null = null;
let upsertError: unknown = null;

jest.mock('@/services/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve(selectResult) }) }),
      upsert: (body: Record<string, unknown>) => {
        upsertBody = body;
        return Promise.resolve({ error: upsertError });
      },
    }),
  }),
}));

import { profileService } from '@/features/profile';
import { isTermsAccepted, TERMS_VERSION } from '@/features/onboarding/terms';

beforeEach(() => {
  selectResult = { data: null, error: null };
  upsertBody = null;
  upsertError = null;
});

describe('loadConsent — resilient', () => {
  it('reads the accepted terms version + marketing flag', async () => {
    selectResult = { data: { terms_version: TERMS_VERSION, marketing_opt_in: true }, error: null };
    const facts = await profileService.loadConsent('u1');
    expect(facts).toEqual({ termsVersion: TERMS_VERSION, marketingOptIn: true });
    expect(isTermsAccepted(facts)).toBe(true);
  });

  it('a missing-column error (migration not applied yet) degrades to no-consent, never throws', async () => {
    selectResult = { data: null, error: { code: '42703', message: 'column does not exist' } };
    await expect(profileService.loadConsent('u1')).resolves.toEqual({ termsVersion: null, marketingOptIn: false });
  });

  it('no row → no consent', async () => {
    selectResult = { data: null, error: null };
    const facts = await profileService.loadConsent('u1');
    expect(facts.termsVersion).toBeNull();
    expect(isTermsAccepted(facts)).toBe(false);
  });

  it('an OLD accepted version is NOT accepted at the current version (§21 re-consent)', async () => {
    selectResult = { data: { terms_version: '2000-01-old', marketing_opt_in: false }, error: null };
    expect(isTermsAccepted(await profileService.loadConsent('u1'))).toBe(false);
  });
});

describe('saveConsent', () => {
  it('upserts the version + accepted timestamp; marketing timestamp only when opted in', async () => {
    await profileService.saveConsent('u1', { termsVersion: TERMS_VERSION, marketingOptIn: true });
    expect(upsertBody).toMatchObject({ id: 'u1', terms_version: TERMS_VERSION, marketing_opt_in: true });
    expect(typeof (upsertBody as Record<string, unknown>).terms_accepted_at).toBe('string');
    expect((upsertBody as Record<string, unknown>).marketing_opt_in_at).not.toBeNull();
  });

  it('marketing opt-out stores a null marketing timestamp', async () => {
    await profileService.saveConsent('u1', { termsVersion: TERMS_VERSION, marketingOptIn: false });
    expect(upsertBody).toMatchObject({ marketing_opt_in: false, marketing_opt_in_at: null });
  });

  it('THROWS on a DB error so the terms screen can retry (consent must persist before advancing)', async () => {
    upsertError = { code: '42703' };
    await expect(profileService.saveConsent('u1', { termsVersion: TERMS_VERSION, marketingOptIn: false })).rejects.toBeDefined();
  });
});
