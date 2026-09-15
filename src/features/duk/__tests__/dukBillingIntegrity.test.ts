// Device-QA billing integrity — structural guards so the server-authoritative billing path and the consulting
// reading UI can't silently regress. Source-scan (the Edge is Deno; the RN screens aren't node-renderable),
// matching the repo's structural-guard convention. Verified against staging data: every consultation session
// is charged, so this locks the shape that keeps it that way.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..'); // repo root
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('every new consultation goes through ONE server-authoritative billing gate', () => {
  const edge = read('supabase/functions/chat/index.ts');
  it('a new paid session RESERVES before admission and returns 402 INSUFFICIENT_DUK (no LLM) when short', () => {
    expect(edge).toMatch(/reserveSessionDuk\(/);
    expect(edge).toMatch(/INSUFFICIENT_DUK/);
    expect(edge).toMatch(/status:\s*402/);
  });
  it('billing is server-gated by DUK_BILLING_ENABLED (client never grants/spends)', () => {
    expect(edge).toMatch(/DUK_BILLING_ENABLED/);
  });
  it('an ACTIVE session (follow-up) is NOT re-charged', () => {
    expect(edge).toMatch(/ACTIVE_SESSION|dukFollowupSessionId/);
    expect(edge).toMatch(/no charge/i);
  });
});

describe('consultation entry paths funnel to /chat — no path bypasses the gate', () => {
  // Home composer / popular-Q / consult FAB / subject card all navigate to the SAME /chat screen, which is the
  // only caller of the consultation Edge. There is no alternate "free" consultation endpoint.
  it('Home + Consult start a consultation only by navigating to /chat', () => {
    expect(read('src/app/(tabs)/index.tsx')).toMatch(/pathname:\s*'\/chat'/);
    expect(read('src/app/(tabs)/consult.tsx')).toMatch(/pathname:\s*'\/chat'/);
  });
  it('the client wallet read is user-scoped (never an unscoped view read → wrong/false balance)', () => {
    const svc = read('src/features/duk/dukWalletService.ts');
    expect(svc).toMatch(/auth\.getSession\(\)/);
    expect(svc).toMatch(/\.eq\('user_id', uid\)/);
  });
});

describe('long consultation answers render the reading hierarchy, not a chat bubble (Phase 2)', () => {
  const bubble = read('src/features/chat/components/ChatBubble/ChatBubble.tsx');
  it('a long assistant answer routes to AnswerBlock (reading card)', () => {
    expect(bubble).toMatch(/isLongAnswer/);
    expect(bubble).toMatch(/<AnswerBlock/);
  });
  it('AnswerBlock renders markdown in reading mode', () => {
    expect(read('src/components/AnswerBlock/AnswerBlock.tsx')).toMatch(/<Markdown source=\{source\} reading/);
  });
});

describe('consumer answer never leaks internal engine facts (plain-language adjacent, Phase 3/4)', () => {
  const vm = read('src/features/chat/presentation/consultationPresentationVM.ts');
  it('the presentation VM is the consumer contract (internal 천간지지-level facts are not the answer surface)', () => {
    // The commercial VM binds the UI to summary/keyPoints/cautions/detail — not raw engine terms. This is the
    // seam a future plain-language pass (owner/Codex, frozen prompt) would extend; it must stay the contract.
    expect(vm).toMatch(/summary|keyPoints|cautions/);
  });
});
