import fs from 'node:fs';
import path from 'node:path';

import {
  DELETE_CONFIRM_PHRASE,
  deletionOutcomeMessage,
  deletionSummaryLines,
  dukForfeitLine,
  isDeleteConfirmed,
  shouldRevokeApple,
  toDeletionOutcome,
} from '../accountDeletionContract';

const REPO = path.resolve(__dirname, '../../../..');
const MIGRATION = fs.readFileSync(
  path.join(REPO, 'supabase/migrations/20260903000000_account_deletion.sql'),
  'utf8',
);
const EDGE = fs.readFileSync(path.join(REPO, 'supabase/functions/account-delete/index.ts'), 'utf8');
const APPLE = fs.readFileSync(
  path.join(REPO, 'supabase/functions/account-delete/appleRevoke.ts'),
  'utf8',
);
const SCREEN = fs.readFileSync(path.join(REPO, 'src/app/account-delete.tsx'), 'utf8');
const MY = fs.readFileSync(path.join(REPO, 'src/app/(tabs)/my.tsx'), 'utf8');
const SERVICE = fs.readFileSync(path.join(REPO, 'src/features/account/accountDeletionService.ts'), 'utf8');

// These checks are about what the code DOES and what the user SEES. A rule named in a comment
// (e.g. "no '정말 떠나시나요?' loop") must not read as a violation of itself.
const stripSql = (s: string) => s.replace(/--[^\n]*/g, '');
const stripTs = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

describe('confirmation phrase', () => {
  it('accepts the exact phrase', () => {
    expect(isDeleteConfirmed(DELETE_CONFIRM_PHRASE)).toBe(true);
  });

  // A Korean IME routinely leaves a trailing space. Failing a user for that would make the
  // confirmation a wall instead of a guard.
  it('tolerates surrounding whitespace', () => {
    expect(isDeleteConfirmed(' 탈퇴 ')).toBe(true);
    expect(isDeleteConfirmed('탈퇴\n')).toBe(true);
  });

  it('rejects anything else', () => {
    for (const s of ['', ' ', '탈', '탈퇴합니다', '회원탈퇴', 'delete', '탈 퇴']) {
      expect(isDeleteConfirmed(s)).toBe(false);
    }
  });
});

describe('outcome mapping', () => {
  it('maps a 401 to UNAUTHENTICATED', () => {
    expect(toDeletionOutcome({ status: 401 })).toBe('UNAUTHENTICATED');
    expect(toDeletionOutcome({ code: 'UNAUTHENTICATED' })).toBe('UNAUTHENTICATED');
  });

  it('maps a thrown error to NETWORK and says the account still exists', () => {
    expect(toDeletionOutcome({ threw: true })).toBe('NETWORK');
    expect(deletionOutcomeMessage('NETWORK')).toContain('아직 진행되지 않았어요');
  });

  it('maps the success code to DELETED with no message', () => {
    expect(toDeletionOutcome({ status: 200, code: 'DELETED' })).toBe('DELETED');
    expect(deletionOutcomeMessage('DELETED')).toBeNull();
  });

  it('treats a cancelled Apple sheet as silent — never nag someone who backed out', () => {
    expect(toDeletionOutcome({ code: 'CANCELLED' })).toBe('CANCELLED');
    expect(deletionOutcomeMessage('CANCELLED')).toBeNull();
  });

  it('falls back to FAILED for an unknown server code', () => {
    expect(toDeletionOutcome({ status: 500, code: 'PURGE_FAILED' })).toBe('FAILED');
  });
});

describe('summary lines', () => {
  it('omits zero counts rather than showing 0개', () => {
    expect(
      deletionSummaryLines({ dukBalance: 0, subjectCount: 0, consultationCount: 0, reportCount: 0 }),
    ).toEqual([]);
  });

  it('lists only what the account actually has', () => {
    expect(
      deletionSummaryLines({ dukBalance: 3, subjectCount: 2, consultationCount: 0, reportCount: 1 }),
    ).toEqual(['분석 대상자 2명', '저장한 리포트 1건']);
  });

  it('states the 덕 forfeit plainly when there is a balance, and stays silent at zero', () => {
    expect(dukForfeitLine(12)).toContain('12덕');
    expect(dukForfeitLine(12)).toContain('환불되지 않아요');
    expect(dukForfeitLine(0)).toBeNull();
    expect(dukForfeitLine(-3)).toBeNull();
  });
});

describe('apple revocation gating', () => {
  it('revokes only for an apple identity on iOS', () => {
    expect(shouldRevokeApple({ providers: ['apple'], platform: 'ios' })).toBe(true);
  });

  // Only the iOS system sheet can mint a fresh authorization code; elsewhere we cannot get one,
  // so we skip rather than block the deletion.
  it('skips on web/android and for non-apple accounts', () => {
    expect(shouldRevokeApple({ providers: ['apple'], platform: 'web' })).toBe(false);
    expect(shouldRevokeApple({ providers: ['apple'], platform: 'android' })).toBe(false);
    expect(shouldRevokeApple({ providers: ['kakao', 'google'], platform: 'ios' })).toBe(false);
    expect(shouldRevokeApple({ providers: [], platform: 'ios' })).toBe(false);
  });
});

// ── Source contracts. These lock decisions that are invisible at runtime in a node suite but
// whose loss would be a real defect. ────────────────────────────────────────────────────────
describe('server contract', () => {
  it('the purge RPC is service-role only', () => {
    expect(MIGRATION).toContain("auth.role() <> 'service_role'");
    expect(MIGRATION).toMatch(/revoke all on function public\.purge_account_data\(uuid\) from public, anon, authenticated/);
  });

  it('is idempotent — a repeat call records nothing and reports ALREADY_RECORDED', () => {
    expect(MIGRATION).toContain('ALREADY_RECORDED');
    expect(MIGRATION).toMatch(/if exists \(select 1 from public\.account_deletions where user_ref = v_ref\)/);
  });

  it('serializes per user, like reserve_session_duk', () => {
    expect(MIGRATION).toContain('pg_advisory_xact_lock(hashtext(p_user_id::text))');
  });

  it('snapshots the transaction record BEFORE anything deletes it', () => {
    const snapshot = MIGRATION.indexOf('from public.verified_purchases');
    const insert = MIGRATION.indexOf('insert into public.account_deletions');
    const release = MIGRATION.indexOf('update public.duk_reserve');
    expect(snapshot).toBeGreaterThan(-1);
    expect(snapshot).toBeLessThan(insert);
    expect(insert).toBeLessThan(release);
  });

  it('stores a hash, never the raw user id, on the surviving row', () => {
    expect(MIGRATION).toContain("encode(sha256(p_user_id::text::bytea), 'hex')");
    // The retention table must not carry a user_id column at all.
    const table = stripSql(MIGRATION).slice(
      stripSql(MIGRATION).indexOf('create table if not exists public.account_deletions'),
      stripSql(MIGRATION).indexOf('create index if not exists account_deletions_deleted_at_idx'),
    );
    expect(table).not.toMatch(/\buser_id\b/);
    expect(table).toContain('user_ref');
  });

  it('leaves the retention table unreadable by any client', () => {
    expect(MIGRATION).toContain('alter table public.account_deletions enable row level security');
    expect(MIGRATION).not.toMatch(/create policy[^;]*account_deletions/);
  });

  it('cleans the three tables the auth cascade cannot reach', () => {
    expect(MIGRATION).toContain('delete from public.global_paid_generation_reservations');
    expect(MIGRATION).toContain('delete from public.global_reservation_requests');
    expect(MIGRATION).toContain('update public.ai_usage_logs set user_id = null');
  });

  it("uses a session status the table's CHECK actually allows", () => {
    // ('OPEN','ACTIVE','COMPLETE','EXPIRED','ABANDONED') — 'CLOSED' would fail at runtime.
    expect(MIGRATION).toContain("set status = 'ABANDONED'");
    expect(MIGRATION).not.toContain("set status = 'CLOSED'");
  });

  it('previews as the caller so it can only ever see the caller’s own account', () => {
    expect(MIGRATION).toContain('security invoker');
    expect(MIGRATION).toMatch(/create or replace function public\.account_deletion_preview\(\)/);
    // No user-id parameter: the function cannot be pointed at somebody else.
    expect(MIGRATION).not.toMatch(/account_deletion_preview\(p_/);
  });
});

describe('edge contract', () => {
  it('takes the user id from the verified token, never from the body', () => {
    expect(EDGE).toContain('admin.auth.getUser(bearer)');
    expect(EDGE).not.toMatch(/body\.userId|body\.user_id/);
  });

  it('purges before deleting — the cascade would destroy what the snapshot reads', () => {
    const purge = EDGE.indexOf("admin.rpc('purge_account_data'");
    const del = EDGE.indexOf('admin.auth.admin.deleteUser');
    expect(purge).toBeGreaterThan(-1);
    expect(purge).toBeLessThan(del);
  });

  it('never lets a failed revoke block the deletion', () => {
    const revoke = EDGE.indexOf('revokeAppleGrant');
    const del = EDGE.indexOf('admin.auth.admin.deleteUser');
    expect(revoke).toBeLessThan(del);
    // The revoke result is warned about, not returned as an error.
    expect(EDGE).toContain('apple revoke not completed');
    expect(EDGE).not.toMatch(/return json\([0-9]+, \{ ok: false, code: 'REVOKE/);
  });

  it('marks the auth-delete failure retryable, because the purge is idempotent', () => {
    expect(EDGE).toContain("code: 'DELETE_FAILED', retryable: true");
  });

  it('logs only the hash, never the user id or email', () => {
    const logs = EDGE.match(/console\.(info|warn|error)\([\s\S]*?\);/g) ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const line of logs) {
      expect(line).not.toMatch(/user\.email|user\.id/);
    }
  });

  it('skips Apple revocation cleanly when the .p8 config is absent', () => {
    expect(APPLE).toContain('SKIPPED_NOT_CONFIGURED');
    expect(APPLE).toContain("'ES256'");
    expect(APPLE).toContain('https://appleid.apple.com/auth/revoke');
  });
});

describe('client contract', () => {
  it('has an entry point in MY that is visible, not hidden', () => {
    expect(MY).toContain("router.push('/account-delete')");
    expect(MY).toContain('계정 탈퇴');
  });

  it('requires the typed phrase before the destructive button is enabled', () => {
    expect(SCREEN).toContain('isDeleteConfirmed(typed)');
    expect(SCREEN).toContain('disabled={!armed}');
  });

  it('has no retention dark pattern — no offer, no survey, no second-guess loop', () => {
    for (const bait of ['잠깐', '정말', '혜택', '할인', '무료로', '설문']) {
      expect(stripTs(SCREEN)).not.toContain(bait);
    }
  });

  it('disables this device’s push registration while still authenticated', () => {
    // After the account is gone the row is unreachable — same ordering logout uses.
    const unregister = SCREEN.indexOf('unregisterOnLogout');
    const del = SCREEN.indexOf('await deleteAccount()');
    expect(unregister).toBeGreaterThan(-1);
    expect(unregister).toBeLessThan(del);
  });

  it('signs out inside the service so no token for a dead account survives', () => {
    expect(SERVICE).toContain('supabase.auth.signOut()');
  });

  it('never blocks deletion on a failed preview', () => {
    expect(SERVICE).toContain('return EMPTY_PREVIEW');
  });
});
