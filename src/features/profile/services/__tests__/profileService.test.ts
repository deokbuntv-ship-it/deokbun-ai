// profileService — targets the production PGRST205 (missing public.profiles relation). These lock the
// relation NAME + the ensure/load/update contracts, and document that a DB error (incl. PGRST205) is
// mapped + RE-THROWN by logDbError (so ensureProfile rejects — exactly the reported production stack).
import { consoleErrorLogger } from '@/features/analysis';
import { profileService } from '@/features/profile/services/profileService';
import { getSupabaseClient } from '@/services/supabase';

jest.mock('@/services/supabase', () => ({ getSupabaseClient: jest.fn() }));
const mockedGetClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>;

type Result = { data?: unknown; error?: unknown };
type Calls = {
  table: string | null;
  upsert: { vals: unknown; opts: unknown } | null;
  select: unknown;
  update: unknown;
  eq: { col: unknown; val: unknown } | null;
};

// Minimal chainable supabase double covering the exact call shapes profileService uses:
//   from(t).upsert(v, o)                    → { error }
//   from(t).select(c).eq(k, v).maybeSingle()→ { data, error }
//   from(t).update(v).eq(k, v)              → { error }   (awaited directly)
function mockClient(result: Result) {
  const calls: Calls = { table: null, upsert: null, select: null, update: null, eq: null };
  const terminal = {
    maybeSingle: () => Promise.resolve(result),
    then: (res: (v: Result) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(result).then(res, rej),
  };
  const chain = {
    upsert: (vals: unknown, opts: unknown) => { calls.upsert = { vals, opts }; return Promise.resolve(result); },
    select: (cols: unknown) => { calls.select = cols; return chain; },
    update: (vals: unknown) => { calls.update = vals; return chain; },
    eq: (col: unknown, val: unknown) => { calls.eq = { col, val }; return terminal; },
  };
  const client = { from: (t: string) => { calls.table = t; return chain; } } as unknown as ReturnType<typeof getSupabaseClient>;
  mockedGetClient.mockReturnValue(client);
  return calls;
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(consoleErrorLogger, 'log').mockImplementation(() => {}); // silence + assert mapping
});

describe('ensureProfile', () => {
  it('valid user → idempotent upsert into public.profiles with {id, display_name}', async () => {
    const calls = mockClient({ error: null });
    await profileService.ensureProfile('user-1', '홍길동');
    expect(calls.table).toBe('profiles'); // the exact relation (locks against a rename)
    expect(calls.upsert?.vals).toEqual({ id: 'user-1', display_name: '홍길동' });
  });

  it('missing-row create / existing-row no-op → onConflict id + ignoreDuplicates (never overwrites an edited name)', async () => {
    const calls = mockClient({ error: null });
    await profileService.ensureProfile('user-2', null);
    expect(calls.upsert?.opts).toEqual({ onConflict: 'id', ignoreDuplicates: true });
    expect(calls.upsert?.vals).toEqual({ id: 'user-2', display_name: null });
  });

  it('DB error → mapped (logged) AND re-thrown (rejects, per logDbError)', async () => {
    mockClient({ error: { code: '42P01', message: 'relation does not exist' } });
    await expect(profileService.ensureProfile('user-3', null)).rejects.toBeDefined();
    expect(consoleErrorLogger.log).toHaveBeenCalledTimes(1);
  });

  it('PGRST205 regression → rejects with the pg code, having queried public.profiles', async () => {
    const calls = mockClient({ error: { code: 'PGRST205', message: "Could not find the table 'public.profiles' in the schema cache" } });
    await expect(profileService.ensureProfile('user-4', '이름')).rejects.toMatchObject({ code: 'PGRST205' });
    expect(calls.table).toBe('profiles'); // confirms the missing relation is exactly public.profiles
  });
});

describe('loadProfile', () => {
  it('existing row → maps snake_case row to the Profile view model', async () => {
    const calls = mockClient({ data: { id: 'user-5', display_name: '아무개' }, error: null });
    const profile = await profileService.loadProfile('user-5');
    expect(calls.table).toBe('profiles');
    expect(profile).toEqual({ id: 'user-5', displayName: '아무개' });
  });

  it('no row → null (not an error)', async () => {
    mockClient({ data: null, error: null });
    expect(await profileService.loadProfile('user-6')).toBeNull();
  });

  it('DB error → mapped + re-thrown', async () => {
    mockClient({ data: null, error: { code: 'PGRST205' } });
    await expect(profileService.loadProfile('user-7')).rejects.toMatchObject({ code: 'PGRST205' });
  });
});

describe('updateDisplayName', () => {
  it('updates only display_name for the owner row', async () => {
    const calls = mockClient({ error: null });
    await profileService.updateDisplayName('user-8', '새이름');
    expect(calls.table).toBe('profiles');
    expect(calls.update).toEqual({ display_name: '새이름' });
    expect(calls.eq).toEqual({ col: 'id', val: 'user-8' });
  });
});
