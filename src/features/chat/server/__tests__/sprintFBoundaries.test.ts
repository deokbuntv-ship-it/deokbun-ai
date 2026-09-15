// Sprint F §D/§E/§F — complements e2RuntimeClosure.test.ts by asserting the SQL security guards behind the
// atomic decision RPC (cross-owner + replay safety) and the deterministic latest-decision tie-break rule.
// EDGE/DB are not executed locally (no Deno/Postgres); the atomic + ownership guarantees live in the migration
// SQL and are verified here by contract assertions plus a pure model of the ORDER BY tie-break.
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../../../..');
const migration = readFileSync(resolve(root, 'supabase/migrations/20260829000000_consultation_decisions.sql'), 'utf8');

describe('§D/§E consultation_decisions RPC — cross-owner + atomic replay safety (SQL contract)', () => {
  it('the atomic RPC requires the service role (a client role can never call it)', () => {
    expect(migration).toMatch(/if auth\.role\(\)\s*<>\s*'service_role' then/);
    expect(migration).toMatch(/raise exception 'service role required'/);
    // Execute is granted to service_role only; revoked from public/anon/authenticated.
    expect(migration).toMatch(/revoke all on function[\s\S]*from public, anon, authenticated/);
    expect(migration).toMatch(/grant execute on function[\s\S]*to service_role/);
  });

  it('the RPC verifies conversation ownership before writing a decision (§D)', () => {
    expect(migration).toMatch(/from public\.conversations c\s+where c\.id = p_conversation_id and c\.user_id = p_user_id/);
    expect(migration).toMatch(/raise exception 'conversation owner mismatch'/);
    // The composite FK makes ownership a DB constraint, not merely an Edge filter.
    expect(migration).toContain('foreign key (conversation_id, user_id)');
    expect(migration).toContain('references public.conversations (id, user_id)');
  });

  it('completion and decision INSERT are one transaction that fails closed (§E CASE 1)', () => {
    // complete_paid_request runs first; if it did not complete, the RPC returns null and inserts NOTHING —
    // so a failed completion can never leave a ghost decision, and PostgreSQL rolls back the whole call.
    const body = migration.slice(migration.indexOf('v_completed := public.complete_paid_request'));
    expect(body).toMatch(/if not v_completed then\s+return null;/);
    const completeAt = migration.indexOf('v_completed := public.complete_paid_request');
    const insertAt = migration.indexOf('insert into public.consultation_decisions', completeAt);
    expect(completeAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(completeAt); // insert only AFTER completion succeeds
  });

  it('per-request idempotency prevents a duplicate decision on replay (§E CASE 2)', () => {
    // A unique (user_id, workload, request_id) index means the same retried request cannot double-insert.
    expect(migration).toMatch(/create unique index[\s\S]*consultation_decisions_request_uniq[\s\S]*\(user_id, workload, request_id\)/);
  });

  it('RLS enables read-own and defines NO client write policy (trust boundary)', () => {
    expect(migration).toContain('alter table public.consultation_decisions enable row level security');
    expect(migration).toMatch(/for select using \(user_id = auth\.uid\(\)\)/);
    // No client-writable policy: there must be no insert/update/delete/all policy on the table.
    expect(migration).not.toMatch(/create policy[\s\S]*consultation_decisions[\s\S]*for (insert|update|delete|all)/i);
  });
});

// ── §F — deterministic latest-decision selection (pure model of the DB ORDER BY) ─────────────────────────────
// The Edge loader is `.order('created_at', desc).order('id', desc).limit(1)` (index.ts). This mirrors that rule
// so the tie-break is locked as a contract: for equal created_at, the lexicographically greater id wins. We do
// NOT claim UUIDs carry causal order — this only asserts the selection is DETERMINISTIC, never ambiguous.
type Row = { id: string; created_at: number };
function selectLatest(rows: Row[]): Row | null {
  return [...rows].sort((a, b) =>
    b.created_at - a.created_at || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0),
  )[0] ?? null;
}

describe('§F latest decision is chosen deterministically (created_at DESC, id DESC)', () => {
  it('newer created_at always wins', () => {
    expect(selectLatest([
      { id: 'aaaa', created_at: 100 },
      { id: 'zzzz', created_at: 200 },
    ])?.id).toBe('zzzz');
  });

  it('an identical created_at is broken by id DESC — always the same row, never ambiguous', () => {
    const tie = [
      { id: '00000000-0000-0000-0000-000000000001', created_at: 500 },
      { id: '00000000-0000-0000-0000-000000000002', created_at: 500 },
    ];
    expect(selectLatest(tie)?.id).toBe('00000000-0000-0000-0000-000000000002');
    // Order-independent: shuffling the input yields the identical winner.
    expect(selectLatest([...tie].reverse())?.id).toBe('00000000-0000-0000-0000-000000000002');
  });

  it('empty input → null (fail closed: no decision to reason about)', () => {
    expect(selectLatest([])).toBeNull();
  });
});
