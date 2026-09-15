// Consultation draft persistence contract (loadDraft PGRST303 closure, §5/§9).
//
// Proves the product contract for the CURRENT-draft table (public.consultation_drafts):
//   - no-draft is a NORMAL empty state (null), NEVER a DB_ERROR
//   - exactly one row is returned; a cleared row (null content) is still a row
//   - duplicate rows fail CLOSED (maybeSingle -> PGRST116)
//   - another user's row is invisible via RLS (client sees 0 rows -> null)
//   - the reported production failure `pgCode PGRST303` is a PostgREST JWT-group
//     AUTH failure and is classified AUTH_REQUIRED (not DB_ERROR), while a genuine
//     schema/table fault (PGRST205) stays DB_ERROR — i.e. we did NOT over-map.
//
// The Supabase client is mocked so the REAL logDbError + pgErrorToAppCode run,
// exercising the classification end-to-end (that is the actual fix under test).

import { pgErrorToAppCode } from '@/features/analysis';

// Mutable test double for the Supabase query builder. Method bodies only deref
// `mockDb` when INVOKED (test time), so the jest.mock factory hoist is TDZ-safe.
const mockDb: {
  nextResult: { data: unknown; error: unknown };
  calls: {
    from: string[];
    select: string[];
    eq: { col: string; val: unknown }[];
    upsert: { values: unknown; options: unknown }[];
    terminal: ('maybeSingle' | 'single')[];
  };
  reset: () => void;
} = {
  nextResult: { data: null, error: null },
  calls: { from: [], select: [], eq: [], upsert: [], terminal: [] },
  reset() {
    this.nextResult = { data: null, error: null };
    this.calls = { from: [], select: [], eq: [], upsert: [], terminal: [] };
  },
};

jest.mock('@/services/supabase', () => {
  const b: Record<string, unknown> = {
    from: (t: string) => {
      mockDb.calls.from.push(t);
      return b;
    },
    select: (c: string) => {
      mockDb.calls.select.push(c);
      return b;
    },
    eq: (col: string, val: unknown) => {
      mockDb.calls.eq.push({ col, val });
      return b;
    },
    upsert: (values: unknown, options: unknown) => {
      mockDb.calls.upsert.push({ values, options });
      return b;
    },
    maybeSingle: () => {
      mockDb.calls.terminal.push('maybeSingle');
      return Promise.resolve(mockDb.nextResult);
    },
    single: () => {
      mockDb.calls.terminal.push('single');
      return Promise.resolve(mockDb.nextResult);
    },
  };
  return { getSupabaseClient: () => b };
});

// Imported AFTER jest.mock so the service picks up the mocked client.
import { consultationDraftService } from '../consultationDraftService';

const USER = 'user-1';

let errorSpy: jest.SpyInstance;
beforeEach(() => {
  mockDb.reset();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

// The single AppErrorCode the boundary logger stamped for the most recent failure
// (consoleErrorLogger.log -> console.error('[error] <source> <AppErrorCode> ...', meta)).
function loggedAppErrorCode(): string {
  const line = String(errorSpy.mock.calls.at(-1)?.[0] ?? '');
  return line.split(/\s+/)[2] ?? '';
}

describe('consultationDraftService.loadDraft — draft-persistence contract matrix (§5/§9)', () => {
  // ---- Group A: DB-state cardinality / ownership --------------------------------
  it('1) no draft (0 rows) → null, NOT a DB_ERROR; exact query contract', async () => {
    mockDb.nextResult = { data: null, error: null }; // maybeSingle: zero rows
    await expect(consultationDraftService.loadDraft(USER)).resolves.toBeNull();
    expect(errorSpy).not.toHaveBeenCalled(); // empty is normal, nothing logged
    expect(mockDb.calls.from).toEqual(['consultation_drafts']);
    expect(mockDb.calls.select).toEqual(['subject, birth_info, updated_at']);
    expect(mockDb.calls.eq).toEqual([{ col: 'user_id', val: USER }]);
    expect(mockDb.calls.terminal).toEqual(['maybeSingle']); // never .single()
  });

  it('2) exactly one draft → maps row to { draft, updatedAt }', async () => {
    mockDb.nextResult = {
      data: {
        subject: { displayName: '홍길동', relationship: 'self', isSelf: true },
        birth_info: { calendar: 'solar', birthDate: '1990-01-01' },
        updated_at: '2026-08-17T00:00:00.000Z',
      },
      error: null,
    };
    await expect(consultationDraftService.loadDraft(USER)).resolves.toEqual({
      draft: {
        subject: { displayName: '홍길동', relationship: 'self', isSelf: true },
        birthInfo: { calendar: 'solar', birthDate: '1990-01-01' },
      },
      updatedAt: '2026-08-17T00:00:00.000Z',
    });
  });

  it('3) cleared draft (row present, null content) → returned as a row, not null', async () => {
    mockDb.nextResult = {
      data: { subject: null, birth_info: null, updated_at: '2026-08-17T01:00:00.000Z' },
      error: null,
    };
    await expect(consultationDraftService.loadDraft(USER)).resolves.toEqual({
      draft: { subject: null, birthInfo: null },
      updatedAt: '2026-08-17T01:00:00.000Z',
    });
  });

  it('4) duplicate rows → maybeSingle yields PGRST116; fail CLOSED (throws) → DB_ERROR', async () => {
    const err = { code: 'PGRST116', message: 'Results contain 2 rows' };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: 'PGRST116' });
    expect(pgErrorToAppCode(err)).toBe('DB_ERROR');
    expect(loggedAppErrorCode()).toBe('DB_ERROR');
  });

  it('5) another user’s row is hidden by RLS → client sees 0 rows → null', async () => {
    mockDb.nextResult = { data: null, error: null }; // RLS filters the foreign row out
    await expect(consultationDraftService.loadDraft('someone-else')).resolves.toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  // ---- Group B: transport / auth classification (the reported bug + guards) ------
  it('6) PGRST303 (reported) → throws; classified AUTH_REQUIRED (not DB_ERROR)', async () => {
    const err = { code: 'PGRST303', message: 'JWT claims validation or parsing failed' };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: 'PGRST303' });
    expect(pgErrorToAppCode(err)).toBe('AUTH_REQUIRED');
    // The boundary log line no longer mislabels a session-token failure as DB_ERROR.
    expect(loggedAppErrorCode()).toBe('AUTH_REQUIRED');
    expect(errorSpy.mock.calls.at(-1)?.[1]).toEqual({ operation: 'loadDraft', pgCode: 'PGRST303' });
  });

  it('7) PGRST302 (no Bearer / anon disabled) → AUTH_REQUIRED', async () => {
    const err = { code: 'PGRST302', message: 'anonymous access disabled' };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: 'PGRST302' });
    expect(pgErrorToAppCode(err)).toBe('AUTH_REQUIRED');
    expect(loggedAppErrorCode()).toBe('AUTH_REQUIRED');
  });

  it('8) PGRST301 (undecodable JWT) → AUTH_REQUIRED (regression guard)', async () => {
    const err = { code: 'PGRST301', message: 'JWT invalid' };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: 'PGRST301' });
    expect(pgErrorToAppCode(err)).toBe('AUTH_REQUIRED');
  });

  it('9) PGRST205 (table missing / genuine schema fault) → stays DB_ERROR (no over-mapping)', async () => {
    const err = { code: 'PGRST205', message: "Could not find the table 'public.consultation_drafts'" };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: 'PGRST205' });
    expect(pgErrorToAppCode(err)).toBe('DB_ERROR');
    expect(loggedAppErrorCode()).toBe('DB_ERROR');
  });

  it('10) 42501 (RLS insufficient_privilege) → FORBIDDEN', async () => {
    const err = { code: '42501', message: 'permission denied' };
    mockDb.nextResult = { data: null, error: err };
    await expect(consultationDraftService.loadDraft(USER)).rejects.toMatchObject({ code: '42501' });
    expect(pgErrorToAppCode(err)).toBe('FORBIDDEN');
    expect(loggedAppErrorCode()).toBe('FORBIDDEN');
  });
});

describe('consultationDraftService write paths — same table/contract (supplementary)', () => {
  it('saveDraft upserts on user_id (client omits updated_at) and returns updatedAt', async () => {
    mockDb.nextResult = { data: { updated_at: '2026-08-17T02:00:00.000Z' }, error: null };
    const res = await consultationDraftService.saveDraft(USER, {
      subject: { displayName: 'A', relationship: 'self', isSelf: true },
      birthInfo: { calendar: 'solar', birthDate: '1990-01-01' },
    });
    expect(res).toEqual({ updatedAt: '2026-08-17T02:00:00.000Z' });
    expect(mockDb.calls.upsert[0].options).toEqual({ onConflict: 'user_id' });
    expect(mockDb.calls.upsert[0].values).toEqual({
      user_id: USER,
      subject: { displayName: 'A', relationship: 'self', isSelf: true },
      birth_info: { calendar: 'solar', birthDate: '1990-01-01' },
    });
    expect((mockDb.calls.upsert[0].values as Record<string, unknown>).updated_at).toBeUndefined();
  });

  it('clearDraft keeps the row (upsert null content), never a hard delete', async () => {
    mockDb.nextResult = { data: { updated_at: '2026-08-17T03:00:00.000Z' }, error: null };
    const res = await consultationDraftService.clearDraft(USER);
    expect(res).toEqual({ updatedAt: '2026-08-17T03:00:00.000Z' });
    expect(mockDb.calls.upsert[0].values).toEqual({ user_id: USER, subject: null, birth_info: null });
    expect(mockDb.calls.terminal).toEqual(['single']); // upsert returns exactly one row
  });
});
