// ⚠ **DB 쪽 자물쇠.** 클라이언트가 서버 소유 표에 직접 쓸 수 있는 RLS 정책이 생기지 않게 막는다.
//
// WHY THIS EXISTS. `clientGrantGuard.test.ts` 는 **클라이언트 소스**를 훑는다 — "앱 코드가 특권
// RPC 를 부르지 않는가". 그것은 앱을 고쳐 쓴 공격자에게는 아무 의미가 없다. 로그인한 사용자는
// 공개 키와 자기 JWT 로 PostgREST 를 **직접** 부를 수 있고, 그때 남는 방어는 RLS 뿐이다.
// 그 질문("DB 가 사용자 쓰기를 허락하는 표가 어디인가")을 지금까지 아무도 검사하지 않았다.
//
// ⚠ 2026-09-10 실측 [production · 오너 제공 스냅샷]: 쓰기 정책 32개를 전수로 읽었고, 아래
//   서버 소유 표에는 **사용자 쓰기 정책이 하나도 없었다.** 이 파일은 그 상태를 고정한다.
//
// ⚠ 컬럼 단위 권한(`grant update(col)`)은 레포 전체에 **한 줄도 없다.** 그래서 "행을 쓸 수 있으면
//   그 행의 모든 칸을 쓸 수 있다" 가 이 스키마의 규칙이다 — 표 단위 판단이 곧 칸 단위 판단이다.
import * as fs from 'fs';
import * as path from 'path';

const MIG = path.resolve(__dirname, '../../../../supabase/migrations');
const SQL = fs.readdirSync(MIG).filter((f) => f.endsWith('.sql'))
  .map((f) => ({ file: f, sql: fs.readFileSync(path.join(MIG, f), 'utf8') }));

/** 돈·판정·권한이 사는 표. 서버(Edge · security definer RPC)만 쓴다. */
const SERVER_OWNED = [
  'duk_ledger', 'duk_reserve', 'duk_debt', 'duk_balances',
  'paid_requests', 'consultation_decisions',
  'verified_purchases', 'purchase_revocations', 'plus_entitlements',
  'admin_users', 'economy_policy',
  'global_paid_generation_reservations', 'global_reservation_requests',
];

/** `create policy <name> on public.<table> for <cmd> ...` 를 전부 뽑는다. */
function policiesOn(table: string): { file: string; name: string; cmd: string; body: string }[] {
  const out: { file: string; name: string; cmd: string; body: string }[] = [];
  for (const { file, sql } of SQL) {
    const re = new RegExp(
      `create\\s+policy\\s+("?[\\w ]+"?)\\s+on\\s+public\\.${table}\\b([\\s\\S]*?);`,
      'gi',
    );
    for (const m of sql.matchAll(re)) {
      const body = m[2];
      const cmd = (body.match(/for\s+(all|insert|update|delete|select)/i)?.[1] ?? 'all').toLowerCase();
      out.push({ file, name: m[1].replace(/"/g, '').trim(), cmd, body });
    }
  }
  return out;
}

// ⚠ **양성 대조.** 위 검사는 "정책을 못 찾았다" 로도 통과한다 — 정규식이 조용히 깨지면
//   13개 표가 전부 초록으로 남는다(실제로 이 파일을 쓰다가 한 번 그렇게 만들었다).
//   그래서 **있다고 알고 있는 것**을 먼저 찾게 한다. 이것이 깨지면 위 결과는 전부 무효다.
describe('양성 대조 — 파서가 실제로 정책을 찾는다', () => {
  it.each([
    ['consultation_reports', 'reports_all_own', 'all'],
    ['conversations', 'conversations_insert_own', 'insert'],
    ['profiles', 'profiles_update_own', 'update'],
    ['report_shares', 'report_shares_owner_all', 'all'],
  ])('%s 에서 %s(%s) 를 찾는다', (table, name, cmd) => {
    const found = policiesOn(table).find((p) => p.name === name);
    expect(found).toBeDefined();
    expect(found?.cmd).toBe(cmd);
  });
});

describe('⚠ 서버 소유 표에 사용자 쓰기 정책이 없다', () => {
  it.each(SERVER_OWNED)('%s', (table) => {
    const writes = policiesOn(table).filter((p) => ['all', 'insert', 'update', 'delete'].includes(p.cmd));
    // 관리자 전용(`is_admin()`)은 사용자 쓰기가 아니다 — 관리자는 서버가 인정한 신원이다.
    const userWrites = writes.filter((p) => !/is_admin\s*\(\s*\)/i.test(p.body));
    if (userWrites.length > 0) {
      throw new Error(
        `${table} 에 사용자 쓰기 정책이 생겼습니다: `
        + userWrites.map((p) => `"${p.name}" (${p.cmd}, ${p.file})`).join(' · ')
        + ' — 이 표는 Edge/RPC 만 써야 합니다.',
      );
    }
    expect(userWrites).toHaveLength(0);
  });
});

describe('⚠ 상담 기록은 덧붙이기 전용 (append-only)', () => {
  it('conversation_messages 에 update·delete 정책이 없다', () => {
    const bad = policiesOn('conversation_messages').filter((p) => ['update', 'delete', 'all'].includes(p.cmd));
    expect(bad.map((p) => `${p.name}(${p.cmd})`)).toEqual([]);
  });

  it('conversation_messages 의 insert 는 부모 대화 소유로 판정한다', () => {
    const ins = policiesOn('conversation_messages').filter((p) => p.cmd === 'insert');
    expect(ins.length).toBeGreaterThan(0);
    for (const p of ins) {
      // `user_id` 컬럼이 없는 표다 — 소유는 부모 대화로만 확인된다.
      expect(p.body).toMatch(/conversations\s+c/);
      expect(p.body).toMatch(/c\.user_id\s*=\s*auth\.uid\(\)/);
    }
  });
});

describe('컬럼 단위 권한을 쓰지 않는다는 사실을 기록한다', () => {
  it('⚠ `grant update(col)` 이 레포에 없다 — 표 단위 판단이 곧 칸 단위 판단이다', () => {
    const found = SQL.filter(({ sql }) => /grant\s+(update|insert)\s*\(/i.test(sql)).map((s) => s.file);
    // 생기는 것 자체는 좋은 일이다. 다만 생기면 위 표 단위 판정의 전제가 바뀌므로 여기서 알린다.
    expect(found).toEqual([]);
  });
});
