// P0 — Compatibility "double charge" incident (102 → 78 for one intended purchase).
//
// Ledger evidence (staging) DISPROVED a duplicate debit: two DISTINCT sessions 4m37s apart, each with its own
// request_id / reservation / charge_id and exactly ONE 12-DUK debit. The first session's 5 successful turns were
// 5 genuinely different typed questions; the 6th question exceeded the 5-turn limit, so the server opened a NEW
// paid session (correct per the frozen contract). The real defect was CONSENT: the 궁합 screen promised
// "이어서 물어봐도 덕은 더 들지 않아요" UNCONDITIONALLY (SessionMeter session={null}) and had NO exhausted gate, so
// the 6th question silently became a second 12-DUK purchase.
//
// This suite locks BOTH halves: (1) the server's exactly-once billing invariants stay in place, and (2) the
// client can no longer start a second paid 궁합 session without explicit consent.
import * as fs from 'fs';
import * as path from 'path';

import { isSessionExhausted, type SessionStatus } from '@/features/duk/dukClientContract';
import { DUK_PRICES } from '@/features/duk/pricing';
import { SPEND_PRIORITY } from '@/features/duk/walletCore';

const ROOT = path.resolve(__dirname, '../../../..'); // repo root
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('frozen economy constants are unchanged by this P0', () => {
  it('compatibility = 12 DUK, general consultation = 5 DUK, bucket order PLUS→REWARD→PAID', () => {
    expect(DUK_PRICES.compatibility).toBe(12);
    expect(DUK_PRICES.general).toBe(5);
    expect([...SPEND_PRIORITY]).toEqual(['PLUS', 'REWARD', 'PAID']);
  });
});

describe('SERVER exactly-once billing invariants (one purchase intent → at most one debit)', () => {
  const sql = read('supabase/migrations/20260833000000_duk_session_runtime.sql');
  const foundation = read('supabase/migrations/20260831000000_duk_economy_foundation.sql');

  it('J — check-then-debit race is impossible: the reserve serializes per user', () => {
    expect(sql).toMatch(/pg_advisory_xact_lock\(hashtext\(p_user_id::text\)\)/);
  });
  it('E/F/I — a retry/replay of the SAME request_id resolves to the existing reservation (any status)', () => {
    expect(sql).toMatch(/where user_id = p_user_id and request_id = p_request_id/);
  });
  it('L — the DB itself allows only ONE session-price debit per (session_id, reason)', () => {
    expect(foundation).toMatch(/create unique index if not exists duk_ledger_session_reason_uniq[\s\S]*?on public\.duk_ledger \(session_id, reason\)/);
  });
  it('M — commit is version-fenced, so a stale worker cannot commit a second time', () => {
    expect(sql).toMatch(/status = 'RESERVED' and version = p_version/);
  });
  it('A/B/C — a second reserve while a usable session is ACTIVE resumes it at price 0 (no second charge)', () => {
    expect(sql).toMatch(/'kind','ACTIVE_SESSION'[\s\S]*?'price',0/);
  });
  it('spend is gated by the SPENDABLE view (ledger minus live reserves), never a raw balance read', () => {
    expect(sql).toMatch(/from public\.duk_spendable where user_id = p_user_id/);
    expect(sql).toMatch(/'kind','INSUFFICIENT'/);
  });
});

describe('CLIENT consent gate — a new paid 궁합 session needs an explicit tap', () => {
  const compat = read('src/app/compatibility-chat.tsx');

  it('the unconditional "덕은 더 들지 않아요" promise is gone (it was false past the turn limit)', () => {
    expect(compat).not.toMatch(/session=\{null\}\s+label="이어서 물어봐도 덕은 더 들지 않아요"/);
  });
  it('the remaining-question meter is driven by the SERVER session, not a hardcoded label', () => {
    expect(compat).toMatch(/<SessionMeter session=\{session\}/);
    expect(compat).toMatch(/getSessionStatus\('compatibility'\)/);
  });
  it('when exhausted the composer is replaced by an explicit consent card naming the 12덕 cost', () => {
    expect(compat).toMatch(/const compatExhausted = isSessionExhausted\(session, Date\.now\(\)\)/);
    expect(compat).toMatch(/\{compatExhausted \? \(/);
    expect(compat).toMatch(/새 궁합 상담 시작하기/);
    expect(compat).toMatch(/dukLabel\(DUK_PRICES\.compatibility\)/);
  });
  it('the session count is re-read from the server after a successful turn (never decremented locally)', () => {
    expect(compat).toMatch(/refreshCompatSession\(\)/);
    expect(compat).not.toMatch(/setSession\((?:\(s\)|prev)\s*=>/);
  });
  it('a same-frame double tap cannot start two sends (client guard; NOT the billing guarantee)', () => {
    expect(compat).toMatch(/sending \|\| sendingRef\.current/);
    expect(compat).toMatch(/disabled=\{sending \|\| !self \|\| !target\}/);
  });
});

describe('exhaustion semantics used by the 궁합 gate (shared helper, 12덕 session of 5 questions)', () => {
  const mk = (over: Partial<SessionStatus> = {}): SessionStatus => ({
    active: true, sessionId: 'c1', productType: 'compatibility', successfulTurnCount: 0, turnLimit: 5,
    expiresAt: new Date(Date.UTC(2026, 7, 26, 0, 0, 0)).toISOString(), ...over,
  });
  const NOW = Date.UTC(2026, 7, 25, 12, 0, 0);

  it('questions 1–5 of a paid session stay in the composer (no extra charge, no gate)', () => {
    for (const used of [0, 1, 2, 3, 4]) {
      expect(isSessionExhausted(mk({ successfulTurnCount: used }), NOW)).toBe(false);
    }
  });
  it('after the 5th successful answer the gate appears — the 6th question cannot silently cost 12덕', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 5 }), NOW)).toBe(true);
  });
  it('an expired session is not "exhausted" (a new session would start anyway; no stale paywall)', () => {
    expect(isSessionExhausted(mk({ successfulTurnCount: 5, expiresAt: new Date(NOW - 1).toISOString() }), NOW)).toBe(false);
  });
});
