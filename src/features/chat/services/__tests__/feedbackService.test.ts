// Consultation feedback persistence contract (§27-§31). Locks: upsert conflict target (idempotent
// re-vote), the NON-PII payload (only message id + verdict + versions — never question/answer/name/
// birth), and the reload map. Supabase mocked.
type UpsertOpts = { onConflict?: string } | undefined;
const cfg: {
  upsertBody: Record<string, unknown> | null;
  upsertOpts: UpsertOpts;
  upsertError: unknown;
  rows: { message_id: string; verdict: string }[];
} = { upsertBody: null, upsertOpts: undefined, upsertError: null, rows: [] };

jest.mock('@/services/supabase', () => {
  const client = {
    from: () => ({
      upsert: (body: Record<string, unknown>, opts: UpsertOpts) => {
        cfg.upsertBody = body;
        cfg.upsertOpts = opts;
        return Promise.resolve({ data: null, error: cfg.upsertError });
      },
      select: () => ({ eq: () => Promise.resolve({ data: cfg.rows, error: null }) }),
    }),
  };
  return { getSupabaseClient: () => client };
});

import { feedbackService } from '../feedbackService';

beforeEach(() => {
  cfg.upsertBody = null;
  cfg.upsertOpts = undefined;
  cfg.upsertError = null;
  cfg.rows = [];
});

describe('feedbackService.saveFeedback', () => {
  it('upserts on (user_id, message_id) with a NON-PII payload', async () => {
    const ok = await feedbackService.saveFeedback({
      conversationId: 'conv-1',
      messageId: 'msg-1',
      verdict: 'helpful',
      consultationMode: 'compatibility',
      policyVersion: 'consultation@1.4.1',
    });
    expect(ok).toBe(true);
    expect(cfg.upsertOpts?.onConflict).toBe('user_id,message_id'); // idempotent re-vote (§30)
    expect(cfg.upsertBody).toMatchObject({
      conversation_id: 'conv-1',
      message_id: 'msg-1',
      verdict: 'helpful',
      consultation_mode: 'compatibility',
      policy_version: 'consultation@1.4.1',
    });
    // user_id is DB-default auth.uid() (never client-sent); NO raw content / PII (§28).
    for (const k of ['user_id', 'question', 'answer', 'content', 'name', 'birth', 'email']) {
      expect(cfg.upsertBody).not.toHaveProperty(k);
    }
  });

  it('returns false (non-blocking) on a DB error', async () => {
    cfg.upsertError = { message: 'nope' };
    expect(
      await feedbackService.saveFeedback({ conversationId: null, messageId: 'm', verdict: 'not_helpful' }),
    ).toBe(false);
  });
});

describe('feedbackService.loadFeedbackForConversation', () => {
  it('returns a per-message verdict map (reload restore §31)', async () => {
    cfg.rows = [
      { message_id: 'a1', verdict: 'helpful' },
      { message_id: 'a2', verdict: 'not_helpful' },
      { message_id: 'a3', verdict: 'garbage' }, // ignored (fail-closed)
    ];
    const map = await feedbackService.loadFeedbackForConversation('conv-1');
    expect(map).toEqual({ a1: 'helpful', a2: 'not_helpful' });
  });
});
