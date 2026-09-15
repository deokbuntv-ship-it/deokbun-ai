// M13 — 공유 페이지는 **서버가 뜬 스냅샷만** 읽는다. 그 계약을 마이그레이션 소스로 고정한다.
//
// WHY THIS EXISTS. 2026-09-11 staging 실측(사용자 토큰 A·B)에서, 로그인한 사용자가 자기
// 리포트의 `report_payload` 를 다시 쓰면 `get_shared_report` 가 그것을 **그대로** 공유 링크
// 수신자에게 돌려줬다. DTO 여섯 칸 중 다섯 칸이 전부 위조본이었다.
//
// ⚠ 이 파일은 **SQL 소스 계약**이다. 실제 동작 확인은 staging 실측(19/19)이 했고, 여기서는
//   그 구조가 조용히 되돌아가지 않게 잠근다 — 트리거를 지우거나 `get_shared_report` 가 다시
//   `report_payload` 를 읽게 되면 여기서 깨진다.
import * as fs from 'fs';
import * as path from 'path';

const MIG = path.resolve(__dirname, '../../../../../supabase/migrations');
const read = (f: string) => fs.readFileSync(path.join(MIG, f), 'utf8');
const M13 = read('20260916000000_m13_share_server_snapshot.sql');

// 주석을 뺀 소스. 무엇이 **있었는지** 적어 둔 주석까지 잡으면 기록을 남길수록 테스트가 깨진다.
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
const SQL = strip(M13);

describe('공유 스냅샷은 서버 소유다', () => {
  it('report_shares 에 shared_payload 칸이 생긴다', () => {
    expect(SQL).toMatch(/alter table public\.report_shares\s+add column if not exists shared_payload jsonb/);
  });

  it('⚠ INSERT 트리거가 클라이언트가 보낸 값을 덮어쓴다', () => {
    expect(SQL).toMatch(/new\.shared_payload\s*:=\s*v_payload/);
    // 서버가 정하는 값들도 강제한다 — 클라이언트가 조작해 넣는 것을 막는다.
    for (const col of ['owner_user_id', 'opened_count', 'status', 'revoked_at', 'expires_at']) {
      expect(SQL).toMatch(new RegExp(`new\\.${col}\\s*:=`));
    }
  });

  it('⚠ INSERT 트리거가 리포트 소유를 확인한다', () => {
    expect(SQL).toMatch(/from public\.consultation_reports r/);
    expect(SQL).toMatch(/r\.user_id = auth\.uid\(\)/);
    expect(SQL).toMatch(/raise exception 'report not found or not owned'/);
  });

  it('⚠ UPDATE 트리거가 스냅샷·토큰·만료를 얼린다', () => {
    expect(SQL).toMatch(/new\.shared_payload is distinct from old\.shared_payload/);
    for (const col of ['report_id', 'owner_user_id', 'token_hash', 'expires_at', 'channel']) {
      expect(SQL).toMatch(new RegExp(`new\\.${col}\\s+is distinct from old\\.${col}`));
    }
  });

  it('⚠ 본문이 바뀌면 그 리포트의 활성 공유가 자동 해지된다', () => {
    expect(SQL).toMatch(/new\.report_payload is distinct from old\.report_payload/);
    expect(SQL).toMatch(/update public\.report_shares[\s\S]{0,120}status = 'revoked'/);
    expect(SQL).toMatch(/where report_id = new\.id and status = 'active'/);
  });

  it('트리거 셋이 실제로 붙는다', () => {
    for (const t of ['report_shares_snapshot_ins', 'report_shares_freeze_upd', 'consultation_reports_revoke_shares']) {
      expect(SQL).toMatch(new RegExp(`create trigger ${t}`));
      // 멱등: create 앞에 drop if exists
      expect(SQL).toMatch(new RegExp(`drop trigger if exists ${t}`));
    }
  });
});

describe('get_shared_report 는 스냅샷만 읽는다', () => {
  const fn = SQL.slice(SQL.indexOf('create or replace function public.get_shared_report'));

  it('⚠ v_payload 를 shared_payload 에서 가져온다 — report_payload 가 아니다', () => {
    expect(fn).toMatch(/v_payload\s*:=\s*v_share\.shared_payload/);
    expect(fn).not.toMatch(/v_payload\s*:=\s*v_report\.report_payload/);
  });

  it('⚠ 스냅샷이 없으면 살아 있는 원본으로 대체하지 않는다', () => {
    expect(fn).toMatch(/if v_payload is null then\s*\n?\s*return null;/);
  });

  it('익명은 여전히 못 읽는다', () => {
    expect(fn).toMatch(/if auth\.uid\(\) is null then/);
    expect(SQL).toMatch(/revoke all on function public\.get_shared_report\(text\) from anon/);
    expect(SQL).toMatch(/grant execute on function public\.get_shared_report\(text\) to authenticated/);
  });

  it('⚠ search_path 에 extensions 가 있다 — digest() 를 찾지 못하면 404 로 죽는다', () => {
    // 실측: `function digest(text, unknown) does not exist` (42883) → PostgREST 가 404 로 돌려준다.
    expect(fn).toMatch(/set search_path = public, extensions, pg_temp/);
  });

  it('BOUNDED DTO 여섯 칸이 그대로다 (경계를 넓히지 않았다)', () => {
    for (const k of ['title', 'generatedAt', 'summary', 'keyFindings', 'cautions', 'coveredTopics']) {
      expect(fn).toContain(`'${k}'`);
    }
    // 소유자·대화 id·원본 payload 는 절대 나가지 않는다.
    expect(fn).not.toMatch(/'owner_user_id'|'conversation_id'|'report_payload'/);
  });
});

describe('멱등성 3원칙', () => {
  it('시드 insert 가 없다', () => {
    // backfill 은 `update ... where shared_payload is null` 이라 시드가 아니다.
    expect(SQL).not.toMatch(/insert into public\./);
    expect(SQL).toMatch(/update public\.report_shares s[\s\S]{0,200}shared_payload is null/);
  });

  it('create policy 앞에 drop policy if exists 가 있다', () => {
    const creates = [...SQL.matchAll(/create policy (\w+)/g)].map((m) => m[1]);
    expect(creates.length).toBeGreaterThan(0);
    for (const p of creates) expect(SQL).toMatch(new RegExp(`drop policy if exists ${p}`));
  });

  it('⚠ backfill 이 freeze 트리거보다 앞에 있다', () => {
    // 순서가 뒤바뀌면 backfill 이 자기 트리거에 걸린다 (실측: shared_payload is server-owned).
    expect(SQL.indexOf('shared_payload is null')).toBeLessThan(SQL.indexOf('create trigger report_shares_freeze_upd'));
  });
});

describe('conversations UPDATE 비대칭을 맞췄다', () => {
  it('UPDATE 도 subject 소유를 확인한다', () => {
    const pol = SQL.slice(SQL.indexOf('create policy conversations_update_own'));
    expect(pol).toMatch(/with check[\s\S]{0,300}consultation_subjects s/);
    expect(pol).toMatch(/s\.user_id = auth\.uid\(\)/);
  });
});
