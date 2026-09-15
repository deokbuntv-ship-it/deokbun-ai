// ensureProfile fail-closed assertion (PGRST303 closure §4). The bootstrap must not fire an
// unauthenticated write when the auth state is not ready.
const mockDb: {
  fromCalls: string[];
  upsertCalls: { values: unknown; options: unknown }[];
  nextResult: { error: unknown };
  reset: () => void;
} = {
  fromCalls: [],
  upsertCalls: [],
  nextResult: { error: null },
  reset() {
    this.fromCalls = [];
    this.upsertCalls = [];
    this.nextResult = { error: null };
  },
};

jest.mock('@/services/supabase', () => {
  const b: Record<string, unknown> = {
    from: (t: string) => {
      mockDb.fromCalls.push(t);
      return b;
    },
    upsert: (values: unknown, options: unknown) => {
      mockDb.upsertCalls.push({ values, options });
      return Promise.resolve(mockDb.nextResult);
    },
  };
  return { getSupabaseClient: () => b };
});

import { profileService } from '../profileService';

let warn: jest.SpyInstance;
beforeEach(() => {
  mockDb.reset();
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe('ensureProfile — fail-closed on a not-ready auth state', () => {
  it('does NOTHING (no DB write) when the user id is blank/missing', async () => {
    await profileService.ensureProfile('', 'name');
    await profileService.ensureProfile('   ', null);
    expect(mockDb.fromCalls).toEqual([]);
    expect(mockDb.upsertCalls).toEqual([]);
  });

  it('upserts { id, display_name } (ignoreDuplicates) for a valid user id', async () => {
    await profileService.ensureProfile('user-1', '홍길동');
    expect(mockDb.fromCalls).toEqual(['profiles']);
    expect(mockDb.upsertCalls).toEqual([
      { values: { id: 'user-1', display_name: '홍길동' }, options: { onConflict: 'id', ignoreDuplicates: true } },
    ]);
  });
});
