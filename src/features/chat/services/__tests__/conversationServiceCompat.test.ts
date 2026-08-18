// 궁합 conversation persistence contract (Compatibility Completion §5-§9). Locks: createConversation
// stamps consultation_mode + compatibility_meta ONLY when asked (solo inserts unchanged), and
// loadLatestCompatibilityConversation filters by consultation_mode='compatibility' + returns the tier
// meta — the load-first path that prevents a duplicate LLM call on refresh. Supabase is mocked.
type Res = { data: unknown; error: unknown };
const cfg: {
  insertBody: Record<string, unknown> | null;
  eqCalls: [string, unknown][];
  orCalls: string[];
  convRow: Record<string, unknown> | null;
  messageRows: unknown[];
  insertReturn: Res;
} = {
  insertBody: null,
  eqCalls: [],
  orCalls: [],
  convRow: null,
  messageRows: [],
  insertReturn: { data: { id: 'conv-1' }, error: null },
};

jest.mock('@/services/supabase', () => {
  const makeQuery = (table: string) => {
    const q: Record<string, unknown> = {
      insert: (body: Record<string, unknown>) => {
        cfg.insertBody = body;
        return q;
      },
      select: () => q,
      eq: (col: string, val: unknown) => {
        cfg.eqCalls.push([col, val]);
        return q;
      },
      or: (expr: string) => {
        cfg.orCalls.push(expr);
        return q;
      },
      order: () =>
        table === 'conversation_messages'
          ? Promise.resolve({ data: cfg.messageRows, error: null })
          : q,
      limit: () => q,
      maybeSingle: () => Promise.resolve({ data: cfg.convRow, error: null }),
      single: () => Promise.resolve(cfg.insertReturn),
    };
    return q;
  };
  return { getSupabaseClient: () => ({ from: (t: string) => makeQuery(t) }) };
});

import { conversationService } from '../conversationService';

beforeEach(() => {
  cfg.insertBody = null;
  cfg.eqCalls = [];
  cfg.orCalls = [];
  cfg.convRow = null;
  cfg.messageRows = [];
  cfg.insertReturn = { data: { id: 'conv-1' }, error: null };
});

describe('createConversation — compatibility opts', () => {
  it('stamps consultation_mode + compatibility_meta when creating a 궁합 conversation', async () => {
    await conversationService.createConversation(
      'target-1',
      { pair: true },
      { consultationMode: 'compatibility', compatibilityMeta: { overall: 'GOOD', overallLabel: '잘 맞는 편' } },
    );
    expect(cfg.insertBody).toMatchObject({
      subject_id: 'target-1',
      consultation_mode: 'compatibility',
      compatibility_meta: { overall: 'GOOD', overallLabel: '잘 맞는 편' },
    });
  });

  it('SOLO create (no opts) inserts NO consultation_mode / compatibility_meta (unchanged)', async () => {
    await conversationService.createConversation('s1', { s: 1 });
    expect(cfg.insertBody).not.toHaveProperty('consultation_mode');
    expect(cfg.insertBody).not.toHaveProperty('compatibility_meta');
  });
});

describe('loadLatestCompatibilityConversation', () => {
  it('filters by subject + consultation_mode=compatibility and returns the tier meta', async () => {
    cfg.convRow = {
      id: 'conv-9',
      summary: null,
      last_summarized_message_id: null,
      subject_snapshot: { target: { displayName: '김민준' } },
      compatibility_meta: { overall: 'VERY_GOOD', overallLabel: '매우 잘 맞는 편' },
    };
    cfg.messageRows = [
      { role: 'user', content: '우리 궁합 좋아?', client_message_id: 'u1', structured_result: null },
      { role: 'assistant', content: '잘 맞아요.', client_message_id: 'a1', structured_result: null },
    ];
    const loaded = await conversationService.loadLatestCompatibilityConversation('target-1');
    expect(cfg.eqCalls).toEqual(
      expect.arrayContaining([
        ['subject_id', 'target-1'],
        ['consultation_mode', 'compatibility'],
      ]),
    );
    expect(loaded).not.toBeNull();
    expect(loaded!.conversationId).toBe('conv-9');
    expect(loaded!.messages).toHaveLength(2);
    expect((loaded!.compatibilityMeta as { overall: string }).overall).toBe('VERY_GOOD');
  });

  it('returns null when the pair has no 궁합 conversation yet (→ caller auto-sends the overview once)', async () => {
    cfg.convRow = null;
    expect(await conversationService.loadLatestCompatibilityConversation('target-x')).toBeNull();
  });
});

describe('solo loaders exclude 궁합 conversations', () => {
  it('loadLatestConversationForSubject filters out compatibility (or null/solo)', async () => {
    await conversationService.loadLatestConversationForSubject('s1');
    expect(cfg.orCalls).toContain('consultation_mode.is.null,consultation_mode.eq.solo');
  });
});
