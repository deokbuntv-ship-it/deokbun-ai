// Sprint J5 §5.8/§5.9 — the consultation audit surface exposes decision VERSIONS + polarity/domain metadata
// ONLY. Structural guard: the audit reads from consultation_decisions (which by design stores no prompt/answer/
// chain-of-thought) and never touches message CONTENT, so raw reasoning can never reach the admin screen.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..'); // repo root
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// Real content-leak patterns (NOT the bare word "prompt", which legitimately appears in "no prompt exposed" notes).
const CONTENT_LEAK = /conversation_messages|message_text|answer_text|question_text|reasoning_text|answer_prose|chain_of_thought|\.content\b/i;

describe('consultation audit exposes no chain-of-thought (§5.9)', () => {
  it('the audit RPC reads consultation_decisions only, never message content', () => {
    const mig = read('supabase/migrations/20260842000000_admin_economy_ops.sql');
    expect(mig).toMatch(/admin_get_consultation_audit/);
    expect(mig).toMatch(/from public\.consultation_decisions/);
    expect(mig).not.toMatch(CONTENT_LEAK);
  });
  it('the client audit mapping surfaces only scalar version/polarity/domain fields', () => {
    const svc = read('src/features/admin/services/adminConsultationsService.ts');
    expect(svc).toMatch(/getConsultationAudit/);
    expect(svc).not.toMatch(CONTENT_LEAK);
  });
  it('the inspector screen renders no raw reasoning/answer text + states CoT is not exposed', () => {
    const screen = read('src/app/admin/consultations/[conversationId].tsx');
    expect(screen).not.toMatch(CONTENT_LEAK);
    expect(screen).toMatch(/chain-of-thought|내부 추론/);
  });
});
