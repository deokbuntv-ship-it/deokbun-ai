// 공유 증인(witness) — "처음부터 위조한 리포트" 를 닫는 장치의 **SQL 소스 계약**.
//
// ⚠ 실제 동작은 staging 실측이 했다 (2026-09-12):
//   · 위조 24건: 전 18/24 → 후 21/24. 남은 3건은 의도된 허용(보고서에 근거)
//   · #24 처음부터 위조한 리포트 → 공유에 **지어낸 글이 한 줄도 안 뜬다**
//   · 양성 대조(진짜 상담 1회): 핵심 4/4 · 주의 3/3 · 요약 · 질문 · 제목 **전부 남는다**
//   · 섞기: 진짜 4/4 남고 가짜만 빠진다
//   · 백필: 20 이전의 진짜 답 5건(5명) — 전 0 · 후 전부 남음, 섞은 가짜는 여전히 빠짐
//   · 비용: 답 하나의 증인 계산 252ms → 33ms (중복 제거 + 표기 가드). 해시 집합은 20/20 동일
// 이 파일은 그 구조가 조용히 되돌아가지 않게 잠근다.
import * as fs from 'fs';
import * as path from 'path';

const MIG = path.resolve(__dirname, '../../../../../supabase/migrations');
const RAW = fs.readFileSync(path.join(MIG, '20260920000000_share_witness_and_gaps.sql'), 'utf8');
const SQL = RAW.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');
const COMPOSER = fs.readFileSync(
  path.resolve(__dirname, '../consultationReportComposer.ts'), 'utf8');
const COMMERCIAL = fs.readFileSync(
  path.resolve(__dirname, '../../presentation/commercialText.ts'), 'utf8');

describe('증인은 해시만 남긴다', () => {
  it('⚠ 원문 칸이 없다 — digests 배열뿐이다', () => {
    const tbl = SQL.slice(SQL.indexOf('create table if not exists public.consultation_answer_witness'));
    const cols = tbl.slice(0, tbl.indexOf(');'));
    expect(cols).toMatch(/digests\s+text\[\]/);
    expect(cols).not.toMatch(/\b(text|content|answer|body|response_json)\s+(text|jsonb)\b/);
  });

  it('⚠ 사용자는 증인 표를 읽지도 쓰지도 못한다 (정책 0개)', () => {
    expect(SQL).toMatch(/alter table public\.consultation_answer_witness enable row level security/);
    expect(SQL).not.toMatch(/create policy \w+ on public\.consultation_answer_witness/);
  });

  it('계정 삭제 시 함께 사라진다', () => {
    expect(SQL).toMatch(/user_id\s+uuid not null references auth\.users \(id\) on delete cascade/);
  });
});

describe('증인은 상담 완료 순간에 남는다', () => {
  it('paid_request_idempotency 가 COMPLETED 로 **바뀔 때만**', () => {
    expect(SQL).toMatch(/after update on public\.paid_request_idempotency/);
    expect(SQL).toMatch(/new\.status = 'COMPLETED'\s*\n\s*and old\.status is distinct from 'COMPLETED'/);
  });

  it('⚠ 절대 상담을 막지 않는다 — 예외를 삼킨다', () => {
    const fn = SQL.slice(SQL.indexOf('create or replace function public.record_answer_witness'));
    expect(fn.slice(0, fn.indexOf('$$;'))).toMatch(/exception when others then\s*\n\s*null;/);
  });

  it('짧은 조각(4자 미만)은 증인이 되지 않는다', () => {
    expect(SQL).toMatch(/char_length\(public\.witness_skeleton\(leaf\)\) >= 4/);
  });

  it('응답의 **모든 문자열 조각**을 본다 (특정 칸 이름에 기대지 않는다)', () => {
    expect(SQL).toMatch(/jsonb_path_query\(coalesce\(p, '\{\}'::jsonb\), 'strict \$\.\*\*'\)/);
  });
});

describe('⚠ 정규화가 앱의 합성기와 같다', () => {
  // 합성기가 쓰는 stripEngineLabels 의 세 패턴을 SQL 이 **그대로** 옮겼는지 본다.
  // 하나라도 어긋나면 진짜 문장의 해시가 안 맞아 공유에서 빠진다(= 정상 흐름이 깨진다).
  it('합성기가 stripEngineLabels 를 쓴다', () => {
    expect(COMPOSER).toMatch(/stripEngineLabels/);
  });

  it.each([
    ['엔진 표기', '엔진'],
    ['engine 표기', 'engine'],
    ['제공됨 표기', '제공됨'],
  ])('%s 패턴이 앱과 SQL 양쪽에 있다', (_l, token) => {
    expect(COMMERCIAL).toMatch(new RegExp(`\\[（\\(\\]\\\\s\\*${token}`));
    expect(SQL).toMatch(new RegExp(`\\[（\\(\\]\\\\s\\*${token}`));
  });

  it('비교는 한글·영숫자만 남긴 뼈대로 한다 (공백·문장부호 차이에 흔들리지 않는다)', () => {
    expect(SQL).toMatch(/'\[\^가-힣a-zA-Z0-9\]', '', 'g'/);
  });
});

describe('공유 스냅샷은 증인이 있는 것만 담는다', () => {
  it('⚠ 스냅샷 트리거가 report_payload 를 **그대로 복사하지 않는다**', () => {
    const fn = SQL.slice(SQL.indexOf('create or replace function public.report_shares_snapshot'));
    const body = fn.slice(0, fn.indexOf('$$;'));
    expect(body).toMatch(/new\.shared_payload := public\.witnessed_share_payload\(auth\.uid\(\), v_payload\)/);
    expect(body).not.toMatch(/new\.shared_payload := v_payload/);
  });

  it('keyFindings · cautions · coveredTopics 를 항목마다 해시 대조한다', () => {
    for (const key of ['keyFindings', 'cautions', 'coveredTopics']) {
      expect(SQL).toMatch(new RegExp(`p_payload->'${key}'`));
    }
    expect(SQL).toMatch(/public\.witness_digest\(v_item\) = any\(v_set\)/);
  });

  it('요약은 통째로 증인이 있거나, 합성기의 대체 규칙(앞 결론 k개 이음)과 같을 때만', () => {
    expect(SQL).toMatch(/array_to_string\(v_findings\[1:k\], ' '\)/);
    expect(SQL).toMatch(/least\(3,/);
    // 합성기의 대체 규칙이 실제로 그 모양인지도 본다
    expect(COMPOSER).toMatch(/dedupeClean\(headlines, 3\)\.join\(' '\)/);
  });

  it('⚠ 제목은 증인이 있는 첫 질문에서 파생될 때만 — 아니면 합성기 기본값 "상담 보고서"', () => {
    expect(SQL).toMatch(/v_title := '상담 보고서'/);
    expect(COMPOSER).toMatch(/'상담 보고서'/);
  });

  it('⚠ generatedAt 은 클라이언트 값이 아니라 서버가 마지막으로 답을 만든 시각', () => {
    expect(SQL).toMatch(/'generatedAt',\s+case when v_last is null/);
  });

  it('걸러진 **수만** 남긴다 — 내용은 남기지 않는다', () => {
    const w = SQL.slice(SQL.indexOf("'_witness'"));
    expect(w.slice(0, 600)).toMatch(/findingsDropped/);
    expect(w.slice(0, 600)).not.toMatch(/v_item|p_payload->>'summary'\s*\)/);
  });

  it('bounded DTO 는 _witness 를 내보내지 않는다 (get_shared_report 가 여섯 칸만 고른다)', () => {
    const m16 = fs.readFileSync(path.join(MIG, '20260916000000_m13_share_server_snapshot.sql'), 'utf8');
    const fn = m16.slice(m16.indexOf('create or replace function public.get_shared_report'));
    expect(fn).not.toMatch(/_witness/);
  });
});

describe('함께 닫은 둘', () => {
  it('#8 — 클라이언트는 system 메시지를 넣지 못한다', () => {
    expect(SQL).toMatch(/current_user in \('authenticated', 'anon'\) and new\.role = 'system'/);
    expect(SQL).toMatch(/before insert or update on public\.conversation_messages/);
  });

  it('⚠ #8 — 앱이 쓰는 역할은 user · assistant 뿐이다 (막아도 잃는 것이 없다는 근거)', () => {
    const svc = fs.readFileSync(path.resolve(__dirname, '../../services/conversationService.ts'), 'utf8');
    expect(svc).toMatch(/export type PersistableMessageRole = 'user' \| 'assistant';/);
  });

  it('#12 — 조회수는 조회 RPC 만 올린다', () => {
    expect(SQL).toMatch(/new\.opened_count is distinct from old\.opened_count/);
    expect(SQL).toMatch(/raise exception 'opened_count is server-owned'/);
  });

  it('⚠ #12 — freeze 트리거가 security invoker 다 (definer 면 누가 고치는지 구분이 안 된다)', () => {
    const fn = SQL.slice(SQL.indexOf('create or replace function public.report_shares_freeze'));
    expect(fn.slice(0, 200)).toMatch(/security invoker/);
  });
});

describe('⚠ 20 이전의 답도 증인이 있다 (백필) — 없으면 정상 리포트가 빈 공유가 된다', () => {
  const at = SQL.indexOf('insert into public.consultation_answer_witness (user_id, workload, request_id, digests, created_at)');
  const stmt = SQL.slice(at, SQL.indexOf(';', at));

  it('백필 문장이 있다', () => {
    expect(at).toBeGreaterThan(-1);
  });

  it('⚠ 서버가 쓴 COMPLETED 답으로만 채운다 — 클라이언트가 쓴 표는 원본이 아니다', () => {
    expect(stmt).toMatch(/from public\.paid_request_idempotency i\s+where i\.status = 'COMPLETED' and i\.response_json is not null/);
    expect(stmt).not.toMatch(/conversation_messages|consultation_reports|report_shares/);
  });

  it('트리거와 같은 규칙으로 해시한다 (모든 조각 · 4자 이상 · 같은 정규화)', () => {
    expect(stmt).toMatch(/public\.jsonb_string_leaves\(i\.response_json\)/);
    expect(stmt).toMatch(/char_length\(public\.witness_skeleton\(leaf\)\) >= 4/);
    expect(stmt).toMatch(/public\.witness_digest\(leaf\)/);
  });

  it('멱등 — 이미 있는 증인은 건드리지 않는다 · 시각은 답이 완료된 시각', () => {
    expect(stmt).toMatch(/on conflict \(user_id, workload, request_id\) do nothing$/);
    expect(stmt).toMatch(/i\.updated_at/);
  });

  it('함수와 표가 만들어진 뒤에 돈다', () => {
    expect(at).toBeGreaterThan(SQL.indexOf('create or replace function public.witness_digest'));
    expect(at).toBeGreaterThan(SQL.indexOf('create unique index if not exists consultation_answer_witness_req_uniq'));
  });

  it('⚠ 마이그레이션 트랜잭션 안에서 한꺼번에 돌지 않는다 — 짧게 끊어 부르는 함수다', () => {
    // 한 문장 백필은 staging 698건에서 statement timeout(2분). 그리고 같은 트랜잭션의 create trigger 가
    // paid_request_idempotency 를 잠근 채로 남아 그동안 상담 완료가 멈춘다.
    const fn = SQL.slice(SQL.indexOf('create or replace function public.backfill_answer_witness'));
    expect(fn.indexOf(stmt)).toBeGreaterThan(-1);
    expect(fn.indexOf(stmt)).toBeLessThan(fn.indexOf('$$;'));
    const outside = SQL.replace(/\$\$[\s\S]*?\$\$/g, '');
    expect(outside).not.toMatch(/insert into public\.consultation_answer_witness/);
  });

  it('한 번에 최대 2,000건 · 증인이 없는 답만 고른다 (0 이 나올 때까지 불러 끝낸다)', () => {
    expect(stmt).toMatch(/limit greatest\(1, least\(coalesce\(p_limit, 300\), 2000\)\)/);
    expect(stmt).toMatch(/not exists \(select 1 from public\.consultation_answer_witness w/);
    expect(SQL).toMatch(/revoke all on function public\.backfill_answer_witness\(integer\) from public, anon, authenticated/);
  });
});

describe('증인 기록은 상담 완료를 느리게 하지 않는다 (staging 실측 252ms → 33ms)', () => {
  it('트리거는 같은 조각을 먼저 한 번으로 줄인다', () => {
    const fn = SQL.slice(SQL.indexOf('create or replace function public.record_answer_witness'));
    expect(fn.slice(0, fn.indexOf('$$;'))).toMatch(/from \(select distinct l as leaf from public\.jsonb_string_leaves\(new\.response_json\) as l\) as d/);
  });

  it('⚠ 표기 패턴마다 strpos 가드가 있다 — 가드 없는 패턴은 영영 안 돌아 앱과 어긋난다', () => {
    const fn = SQL.slice(SQL.indexOf('create or replace function public.witness_skeleton'));
    const body = fn.slice(0, fn.indexOf('$$;'));
    const patterns = [...body.matchAll(/'\\s\*\[（\(\]\\s\*([^\\]+)\\s\*/g)].map((m) => m[1]);
    expect(patterns).toEqual(['엔진', 'engine', '제공됨']);
    for (const token of patterns) {
      expect(body).toMatch(new RegExp(`strpos\\((lower\\()?coalesce\\(p, ''\\)\\)?, '${token}'\\) > 0`));
    }
  });
});

describe('멱등성 3원칙', () => {
  it('create if not exists · drop 후 create · 시드 없음', () => {
    expect(SQL).toMatch(/create table if not exists public\.consultation_answer_witness/);
    expect(SQL).not.toMatch(/insert into public\.\w+ \([^)]*\) values/);
    for (const t of [...SQL.matchAll(/create trigger (\w+)/g)].map((m) => m[1])) {
      expect(SQL).toMatch(new RegExp(`drop trigger if exists ${t}`));
    }
  });
});
