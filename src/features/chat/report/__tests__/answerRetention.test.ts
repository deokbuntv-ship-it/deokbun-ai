// C9 답 원문 정리 · 익명 미리보기(#25) · 궁합 공유 복구 — 마이그레이션 20260921 의 **SQL 소스 계약**.
//
// ⚠ 실제 동작은 staging 실측이 했다 (2026-09-12 #2, 보고서 PART 1):
//   · 24시간 정리 · 대화 삭제 · 계정 삭제 · 백필 전 거부 · 정리 뒤 공유 유지 — 합성 반례
//   · #25 익명 미리보기: 지어낸 결론이 로그인 없이 보이던 것 → 스냅샷을 읽게 해 막았다
//   · 궁합 공유: 20 의 증인 필터가 엔진 고정 문구를 지우던 것(5/8) → 허용 목록
// 이 파일은 그 구조가 조용히 되돌아가지 않게 잠근다.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const stripSqlComments = (s: string) => s.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');

const RAW = read('supabase/migrations/20260921000000_answer_retention_and_preview.sql');
const SQL = stripSqlComments(RAW);
const fn = (name: string) => {
  const at = SQL.indexOf(`create or replace function public.${name}`);
  expect(at).toBeGreaterThan(-1);
  return SQL.slice(at, SQL.indexOf('$$;', SQL.indexOf('$$', at) + 2));
};

describe('① 재전송 캐시 — 창이 지나면 원문을 지우고 키만 남긴다', () => {
  it("status 에 'EXPIRED' 가 생긴다 (옛 CHECK 를 찾아 바꾼다)", () => {
    expect(SQL).toMatch(/check \(status in \('PROCESSING', 'COMPLETED', 'EXPIRED'\)\)/);
    expect(SQL).toMatch(/pg_get_constraintdef\(c\.oid\) not ilike '%response_json%'/);
  });

  it('⚠ "완료 ⇔ 원문 있음" 규칙은 건드리지 않는다 — EXPIRED 는 원문이 없어야 한다', () => {
    expect(SQL).not.toMatch(/drop constraint[^;]*response_json/i);
    const base = stripSqlComments(read('supabase/migrations/20260827000000_fortune_generation_claims.sql'));
    expect(base).toMatch(/check \(\(status = 'COMPLETED'\) = \(response_json is not null\)\)/);
  });

  it('EXPIRED 는 재전송 동작을 바꾸지 않는다 — acquire 는 만료 행을 새 요청으로 받는다', () => {
    const base = stripSqlComments(read('supabase/migrations/20260827000000_fortune_generation_claims.sql'));
    const acquire = base.slice(base.indexOf('create or replace function public.acquire_paid_request'));
    const body = acquire.slice(0, acquire.indexOf('$$;'));
    expect(body).toMatch(/v_row\.status = 'COMPLETED' and v_row\.expires_at > v_now/);
    expect(body).toMatch(/on conflict \(user_id, workload, request_id\) do update set\s+status = 'PROCESSING'/);
  });

  it('Edge 의 재생 읽기는 COMPLETED 만 본다 — EXPIRED 는 절대 재생되지 않는다', () => {
    const edge = read('supabase/functions/chat/index.ts');
    const at = edge.indexOf('async function readCompletedPaidRequest');
    expect(edge.slice(at, at + 600)).toMatch(/\.eq\('status', 'COMPLETED'\)/);
  });

  it('정리 대상은 재생 창이 지난 완료 행뿐이다', () => {
    const f = fn('run_answer_retention');
    expect(f).toMatch(/where status = 'COMPLETED' and expires_at <= now\(\)/);
    expect(f).toMatch(/set status = 'EXPIRED', response_json = null/);
  });

  it('해지·만료된 공유의 스냅샷도 비운다 (살아 있는 공유는 건드리지 않는다)', () => {
    const f = fn('run_answer_retention');
    expect(f).toMatch(/where shared_payload is not null\s+and \(status <> 'active' or revoked_at is not null or expires_at <= now\(\)\)/);
    expect(f).toMatch(/set shared_payload = null/);
  });
});

describe('⚠ 순서 보장 — 백필이 끝나기 전에는 정리가 실행을 거부한다', () => {
  it('증인이 없는 완료 답이 남으면 아무것도 지우기 전에 돌아간다', () => {
    const f = fn('run_answer_retention');
    const refuse = f.indexOf("'refused', 'reason', 'BACKFILL_INCOMPLETE'");
    expect(refuse).toBeGreaterThan(-1);
    expect(refuse).toBeLessThan(f.indexOf('update public.paid_request_idempotency'));
    expect(refuse).toBeLessThan(f.indexOf('update public.report_shares'));
    expect(f).toMatch(/v_backlog := public\.answer_witness_backlog\(\);\s+if v_backlog > 0 then/);
  });

  it('남은 백필의 정의가 백필 함수가 고르는 행과 같다', () => {
    const backlog = fn('answer_witness_backlog');
    const bf = stripSqlComments(read('supabase/migrations/20260920000000_share_witness_and_gaps.sql'));
    const backfill = bf.slice(bf.indexOf('create or replace function public.backfill_answer_witness'));
    for (const body of [backlog, backfill.slice(0, backfill.indexOf('$$;'))]) {
      expect(body).toMatch(/i\.status = 'COMPLETED'\s+and i\.response_json is not null/);
      expect(body).toMatch(/not exists \(select 1 from public\.consultation_answer_witness w\s+where w\.user_id = i\.user_id and w\.workload = i\.workload and w\.request_id = i\.request_id\)/);
    }
  });

  it('두 함수 모두 클라이언트는 부르지 못한다', () => {
    expect(SQL).toMatch(/revoke all on function public\.answer_witness_backlog\(\) from public, anon, authenticated/);
    expect(SQL).toMatch(/revoke all on function public\.run_answer_retention\(integer\) from public, anon, authenticated/);
  });
});

describe('③ 대화를 지우면 — 그 대화의 원문 · 증인 · 공유를 즉시', () => {
  it('⚠ BEFORE DELETE 다 (대화→답 연결인 consultation_decisions 가 CASCADE 로 사라지기 전)', () => {
    expect(SQL).toMatch(/create trigger conversations_purge_answers\s+before delete on public\.conversations/);
    expect(SQL).toMatch(/drop trigger if exists conversations_purge_answers on public\.conversations/);
  });

  it('원문은 EXPIRED 로, 증인은 삭제, 공유는 해지 + 스냅샷 비움', () => {
    const f = fn('purge_conversation_answers');
    expect(f).toMatch(/update public\.paid_request_idempotency i\s+set status = 'EXPIRED', response_json = null/);
    expect(f).toMatch(/delete from public\.consultation_answer_witness w\s+using public\.consultation_decisions d/);
    expect(f).toMatch(/set status = 'revoked', revoked_at = coalesce\(s\.revoked_at, now\(\)\), shared_payload = null/);
    expect(f.match(/d\.conversation_id = old\.id/g)?.length).toBe(2);
    expect(f).toMatch(/r\.conversation_id = old\.id/);
    expect(f).toMatch(/return old;/);
  });

  it('대화와 답의 연결은 서버 소유 표에서만 찾는다 (클라이언트가 쓴 메시지를 믿지 않는다)', () => {
    const f = fn('purge_conversation_answers');
    expect(f).not.toMatch(/conversation_messages/);
    expect(f).toMatch(/security definer/);
  });
});

describe('공유 스냅샷 동결 — 예외는 "서버가 죽은 공유의 스냅샷을 비우는 것" 하나', () => {
  it('클라이언트는 여전히 shared_payload 를 못 바꾼다', () => {
    const f = fn('report_shares_freeze');
    expect(f).toMatch(/security invoker/);
    expect(f).toMatch(/new\.shared_payload is null\s+and current_user not in \('authenticated', 'anon'\)\s+and \(new\.status <> 'active' or new\.revoked_at is not null or old\.expires_at <= now\(\)\)/);
    expect(f).toMatch(/raise exception 'shared_payload is server-owned'/);
  });

  it('20 의 나머지 규칙(불변 칸 · 조회수)은 그대로다', () => {
    const f = fn('report_shares_freeze');
    expect(f).toMatch(/raise exception 'immutable column on report_shares'/);
    expect(f).toMatch(/raise exception 'opened_count is server-owned'/);
  });
});

describe('#25 익명 미리보기 — 스냅샷을 읽는다', () => {
  it('⚠ 결론과 개수는 스냅샷에서 — 클라이언트가 쓴 본문을 읽지 않는다', () => {
    const f = fn('get_shared_report_preview');
    expect(f).toMatch(/v_payload\s+:= v_share\.shared_payload;/);
    expect(f).not.toMatch(/v_payload\s+:= v_report\.report_payload/);
    expect(f).toMatch(/v_conclusion := coalesce\(nullif\(v_payload->>'summary', ''\), ''\)/);
    expect(f).toMatch(/jsonb_array_length\(v_payload->'keyFindings'\)/);
  });

  it('원래 본문에서는 이름 가리기에 쓸 제목만 읽는다 (가리기는 지우기만 한다)', () => {
    const f = fn('get_shared_report_preview');
    const uses = f.match(/v_report\.report_payload[^;]*/g) ?? [];
    expect(uses).toHaveLength(1);
    expect(uses[0]).toMatch(/->>'title'/);
  });

  it('20260906 의 규칙은 그대로다 — 토큰 · 첫 문장만 · 제목 비반환 · 익명 권한', () => {
    const f = fn('get_shared_report_preview');
    expect(f).toMatch(/and status = 'active'\s+and revoked_at is null\s+and \(expires_at is null or expires_at > now\(\)\)/);
    expect(f).toMatch(/regexp_match\(v_conclusion, '\^\[\^\.!\?\\n\]\*\[\.!\?\]'\)/);
    const returned = f.slice(f.indexOf('return jsonb_build_object('));
    expect(returned).toMatch(/'conclusion', v_conclusion/);
    expect(returned).not.toMatch(/'title'/);
    expect(f).not.toMatch(/opened_count/);
    expect(SQL).toMatch(/grant execute on function public\.get_shared_report_preview\(text\) to anon, authenticated/);
  });
});

describe('궁합 공유 — 엔진 고정 문구 허용 목록이 앱 상수와 같다', () => {
  const TIERS = read('src/features/compatibility/engine/compatibilityTiers.ts');
  const COMPOSER = read('src/features/chat/report/compatibilityReportComposer.ts');
  const wsp = fn('witnessed_share_payload');
  const sqlArray = (name: string) => {
    const m = wsp.match(new RegExp(`${name}\\s+constant text\\[\\] := array\\[([\\s\\S]*?)\\];`));
    expect(m).not.toBeNull();
    return [...(m as RegExpMatchArray)[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  };

  it('등급 4개가 OVERALL_LABEL 과 같다', () => {
    const block = TIERS.slice(TIERS.indexOf('const OVERALL_LABEL'), TIERS.indexOf('};', TIERS.indexOf('const OVERALL_LABEL')));
    const app = [...block.matchAll(/:\s*'([^']+)'/g)].map((x) => x[1]);
    expect(app).toHaveLength(4);
    expect(sqlArray('v_labels').sort()).toEqual(app.sort());
  });

  it('분야별 판정 10줄이 엔진의 {분야}: {판정} 과 같다', () => {
    const app: string[] = [];
    for (const part of TIERS.split(/\nfunction /).slice(1)) {
      const title = part.match(/title: '([^']+)'/)?.[1];
      if (!title) continue;
      for (const v of part.matchAll(/verdict = '([^']+)';/g)) app.push(`${title}: ${v[1]}`);
    }
    expect(app).toHaveLength(10);
    expect(sqlArray('v_dim_lines').sort()).toEqual(app.sort());
    expect(COMPOSER).toMatch(/const dimensionLines = dimensions\.map\(\(d\) => `\$\{d\.title\}: \$\{d\.verdict\}`\)/);
  });

  it('요약 틀이 합성기와 같다', () => {
    expect(COMPOSER).toMatch(/const summary = `두 분은 전체적으로 \$\{overallLabel\}이에요\.\$\{tail \? ` \$\{tail\}` : ''\}`;/);
    expect(wsp).toMatch(/v_head := '두 분은 전체적으로 ' \|\| v_label \|\| '이에요\.';/);
  });

  it('⚠ 요약 뒤에 붙는 결론은 증인이 있거나, 증인 있는 두 문장을 이은 것뿐이다', () => {
    expect(wsp).toMatch(/if public\.witness_digest\(v_tail\) = any\(v_set\) then/);
    expect(wsp).toMatch(/public\.witness_digest\(left\(v_tail, k - 1\)\) = any\(v_set\)\s+and public\.witness_digest\(substr\(v_tail, k \+ 1\)\) = any\(v_set\)/);
  });

  it('⚠ 두 이름 제목은 합성기의 이름 길이(12자 + "…")를 넘지 못한다', () => {
    const max = Number(COMPOSER.match(/const NAME_MAX = (\d+);/)?.[1]);
    expect(max).toBe(12);
    expect(wsp).toContain(`'^[^\\n]{1,${max + 1}}님과 [^\\n]{1,${max + 1}}님의 궁합 보고서$'`);
    expect(COMPOSER).toMatch(/`\$\{shortName\(selfLabel\)\}님과 \$\{shortName\(targetLabel\)\}님의 궁합 보고서`/);
  });

  it('20 의 규칙은 그대로다 — 항목마다 해시 대조 · 요약 대체 규칙 · 기본 제목', () => {
    expect(wsp).toMatch(/if public\.witness_digest\(v_item\) = any\(v_set\)\s+or public\.witness_skeleton\(v_item\) = any\(v_dim_sk\) then/);
    expect(wsp).toMatch(/v_join := array_to_string\(v_findings\[1:k\], ' '\);/);
    expect(wsp).toMatch(/v_title := '상담 보고서';/);
    expect(SQL).toMatch(/revoke all on function public\.witnessed_share_payload\(uuid, jsonb\) from public, anon, authenticated/);
  });
});

describe('멱등성 3원칙', () => {
  it('drop 후 create · 시드 없음 · 제약 변경은 조건부', () => {
    expect(SQL).not.toMatch(/insert into public\.\w+ \([^)]*\) values/);
    for (const t of [...SQL.matchAll(/create trigger (\w+)/g)].map((m) => m[1])) {
      expect(SQL).toMatch(new RegExp(`drop trigger if exists ${t}`));
    }
    expect(SQL).toMatch(/if not exists \(\s+select 1 from pg_constraint c/);
  });
});
