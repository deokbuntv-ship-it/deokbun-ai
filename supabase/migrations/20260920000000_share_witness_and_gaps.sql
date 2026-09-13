-- ════════════════════════════════════════════════════════════════════════════
-- 공유 증인(witness) — "처음부터 위조한 리포트" 를 닫는다 + 남은 위조 경로 둘
-- ════════════════════════════════════════════════════════════════════════════
--
-- 무엇이 아직 열려 있었나 (2026-09-12 staging 실측, 사용자 토큰 A·B)
--   20260916 은 "진짜 리포트를 받아 결론만 바꿔 공유" 를 닫았다(본문이 바뀌면 공유가 죽는다).
--   그러나 **처음부터 지어낸 리포트를 INSERT 한 뒤 공유**하면 그 글이 그대로 나갔다:
--
--     title    "덕분이 공식 진단서 …"
--     summary  "처음부터 지어낸 요약 — 이 사람은 3개월 안에 반드시 성공합니다 …"
--     keyFindings · cautions  지어낸 문장 전부
--
--   스냅샷은 **그 시점의** report_payload 를 떴을 뿐이고, 그 payload 는 클라이언트가 쓴 것이다.
--
-- 왜 RLS 로 못 막나
--   리포트는 **클라이언트가 합성**한다(reportService.ts). 서버에는 대조할 원본이 없었다.
--   답변 원문이 서버에 남는 곳은 `paid_request_idempotency.response_json` 뿐이다. 그건 24시간
--   재생용 캐시로 선언돼 있어 공유가 기댈 원본이 아니다(지금은 COMPLETED 행이 남지만, 정리 작업이
--   생기면 사라진다 — expires_at 인덱스가 이미 있다). 그래서 해시만 따로 남긴다.
--
-- 어떻게 닫나 — **서버가 답을 만들 때 증거를 남기고, 공유할 때 그 증거와 맞는 문장만 내보낸다**
--   ① 증인 표 `consultation_answer_witness`: 서버가 만든 모든 답(상담·궁합·요약·프리미엄)의
--      문자열 조각마다 **해시**를 남긴다. ⚠ 원문을 남기지 않는다 — 해시만. 새 개인정보 보관이
--      아니다(원문을 복원할 수 없다).
--   ② 남기는 자리: `paid_request_idempotency` 가 COMPLETED 로 바뀌는 순간(트리거). 상담·궁합·
--      요약·프리미엄 **네 경로가 전부 여기를 지난다**(`complete_paid_request`). Edge 코드도 RPC
--      시그니처도 바꾸지 않는다.
--   ③ 공유 스냅샷: report_payload 를 그대로 복사하지 않고, 항목마다 해시를 대조해 **증인이 있는
--      것만** 남긴다. 지어낸 문장은 **사라진다**(오류가 아니라 탈락).
--
-- ⚠ 왜 해시가 맞는가 (합성기가 추출형이라서)
--   리포트 합성기(`consultationReportComposer.ts`)와 표현 계층(`consultationPresentationVM.ts`)은
--   답의 문장을 **고르고 다듬을 뿐 바꿔 쓰지 않는다**:
--     keyFindings = stripEngineLabels(trim(coreSummary / strengths[i]))
--     cautions    = stripEngineLabels(trim(cautions[i]))
--   그래서 증인 쪽도 같은 정규화(엔진 표기 제거 → 한글·영숫자만)를 거쳐 해시하면 정확히 맞는다.
--
-- ⚠ 이 트리거는 **절대 상담을 막으면 안 된다.** 증인을 못 남겨도 상담 완료는 그대로 간다
--   (예외를 삼킨다). 그 대가는 "그 답에서 나온 문장이 공유 화면에서 빠진다" 뿐이다 —
--   망가지는 방향이 아니라 **덜 보이는 방향**으로 실패한다.
--
-- 함께 닫는 것 (같은 실측에서 남은 둘)
--   #8  클라이언트가 role='system' 메시지를 넣을 수 있었다. 앱은 system 을 **한 번도 쓰지 않는다**
--       (`PersistableMessageRole = 'user' | 'assistant'`). 막아도 잃는 것이 없다.
--   #12 공유 조회수(opened_count)를 소유자가 직접 바꿀 수 있었다. 조회 RPC 만 올리게 한다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ── 0. 정규화 — 증인과 공유 양쪽이 **같은 함수**를 쓴다 ─────────────────────
-- stripEngineLabels 의 세 패턴을 그대로 옮기고, 그 뒤 한글·영숫자만 남긴다.
-- 공백·문장부호 차이에 흔들리지 않게 하려는 것이다.
-- ⚠ 세 패턴은 **표기 낱말이 있을 때만** 돌린다(strpos 가드). 낱말이 없으면 패턴이 맞을 수 없으니
--   결과는 같다. 조각의 ~1.6% 만 표기를 담는데 세 정규식이 비용의 ~60% 였다(staging 실측).
--   ⚠ 패턴을 더하면 가드 낱말도 더할 것 — 계약 테스트가 둘을 맞춰 본다.
create or replace function public.witness_skeleton(p text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select lower(regexp_replace(
           case when strpos(coalesce(p, ''), '엔진') > 0
                  or strpos(lower(coalesce(p, '')), 'engine') > 0
                  or strpos(coalesce(p, ''), '제공됨') > 0
                then regexp_replace(
                       regexp_replace(
                         regexp_replace(coalesce(p, ''),
                           '\s*[（(]\s*엔진\s*[:：][^）)]*[）)]', '', 'g'),
                         '\s*[（(]\s*engine\s*[:：][^）)]*[）)]', '', 'gi'),
                       '\s*[（(]\s*제공됨\s*[）)]', '', 'g')
                else coalesce(p, '') end,
           '[^가-힣a-zA-Z0-9]', '', 'g'));
$$;

create or replace function public.witness_digest(p text)
returns text
language sql
immutable
set search_path = public, extensions, pg_temp
as $$
  select encode(extensions.digest(public.witness_skeleton(p), 'sha256'), 'hex');
$$;

-- jsonb 안의 모든 문자열 조각
create or replace function public.jsonb_string_leaves(p jsonb)
returns setof text
language sql
immutable
set search_path = public, pg_temp
as $$
  select v #>> '{}'
    from jsonb_path_query(coalesce(p, '{}'::jsonb), 'strict $.**') as v
   where jsonb_typeof(v) = 'string';
$$;

-- ── 1. 증인 표 ───────────────────────────────────────────────────────────────
create table if not exists public.consultation_answer_witness (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  workload   text not null,
  request_id text not null,
  -- ⚠ 해시만. 원문은 남기지 않는다.
  digests    text[] not null default '{}',
  created_at timestamptz not null default now()
);

create unique index if not exists consultation_answer_witness_req_uniq
  on public.consultation_answer_witness (user_id, workload, request_id);
create index if not exists consultation_answer_witness_user_idx
  on public.consultation_answer_witness (user_id, created_at desc);

-- ⚠ 정책을 하나도 두지 않는다. 사용자는 읽지도 쓰지도 못한다 — security definer 함수만 만진다.
alter table public.consultation_answer_witness enable row level security;

comment on table public.consultation_answer_witness is
  '서버가 만든 답의 문자열 조각 해시(원문 없음). 공유 스냅샷이 "서버가 만든 문장인가" 를 대조한다.';

-- ── 2. 증인을 남긴다 — paid_request_idempotency 가 COMPLETED 가 되는 순간 ─────
create or replace function public.record_answer_witness()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if new.status = 'COMPLETED'
     and old.status is distinct from 'COMPLETED'
     and new.response_json is not null then
    begin
      insert into public.consultation_answer_witness (user_id, workload, request_id, digests)
      select new.user_id, new.workload, new.request_id,
             coalesce(array_agg(distinct public.witness_digest(leaf)), '{}')
        -- 같은 조각을 먼저 한 번으로 줄인다(답 하나에 조각 ~3,500 · 서로 다른 것 ~450).
        -- 이 둘(중복 제거 + 가드)로 답 하나의 비용이 252ms → 33ms (staging 실측, 해시 집합 동일).
        from (select distinct l as leaf from public.jsonb_string_leaves(new.response_json) as l) as d
       -- 4자 미만(한글·영숫자 기준)은 버린다. id·코드 같은 짧은 조각이 증인이 되지 않게.
       where char_length(public.witness_skeleton(leaf)) >= 4
      on conflict (user_id, workload, request_id) do update
        set digests = excluded.digests;
    exception when others then
      -- ⚠ 여기서 절대 실패하지 않는다. 상담 완료가 증인 기록 때문에 막히면 안 된다.
      null;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists paid_request_idempotency_witness on public.paid_request_idempotency;
create trigger paid_request_idempotency_witness
  after update on public.paid_request_idempotency
  for each row execute function public.record_answer_witness();

-- ── 2-1. 이 마이그레이션 **이전**에 만들어진 답의 증인 (백필 함수) ───────────
-- ⚠ 이게 없으면 이 마이그레이션 이전의 상담으로 만든 **정상 리포트가 빈 공유**가 된다.
--   staging 실측(2026-09-12): 증인 없는 COMPLETED 698건 · 사용자 52명. 표본 5건(5명) 전부
--   핵심·주의·요약이 0 으로 나갔다.
-- 원본은 **서버가 쓴** `paid_request_idempotency.response_json` 이다. COMPLETED 행은 재생 창이 지나도
-- 지워지지 않는다(release 는 PROCESSING 만 지운다).
-- ⚠ 클라이언트가 쓴 `conversation_messages` 로는 채우지 않는다 — 그건 위조할 수 있다(#7).
-- 트리거와 같은 규칙(모든 조각 · 4자 이상 · 같은 정규화). 시각은 답이 완료된 시각.
--
-- ⚠ 왜 마이그레이션 안에서 한 번에 돌리지 않나 — staging 에서 한 문장으로 돌렸더니 698건에서
--   **statement timeout(2분)** 에 걸렸다. 그리고 `db push` 는 파일 하나를 한 트랜잭션으로 돌려서,
--   위의 create trigger 가 잡은 paid_request_idempotency 잠금이 백필이 끝날 때까지 남는다
--   (그동안 상담 완료가 멈춘다). 그래서 **짧게 끊어 부르는 함수**로 둔다. 적용 뒤 0 이 나올 때까지:
--     select public.backfill_answer_witness(300);
-- 멱등: 증인이 없는 답만 고르고, 이미 있으면 건드리지 않는다. 몇 번을 불러도 같다.
create or replace function public.backfill_answer_witness(p_limit integer default 300)
returns integer
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare v_n integer;
begin
  insert into public.consultation_answer_witness (user_id, workload, request_id, digests, created_at)
  select i.user_id, i.workload, i.request_id,
         coalesce((select array_agg(distinct public.witness_digest(leaf))
                     from (select distinct l as leaf from public.jsonb_string_leaves(i.response_json) as l) as d
                    where char_length(public.witness_skeleton(leaf)) >= 4), '{}'),
         i.updated_at
    from public.paid_request_idempotency i
   where i.status = 'COMPLETED' and i.response_json is not null
     and not exists (select 1 from public.consultation_answer_witness w
                      where w.user_id = i.user_id and w.workload = i.workload and w.request_id = i.request_id)
   limit greatest(1, least(coalesce(p_limit, 300), 2000))
  on conflict (user_id, workload, request_id) do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke all on function public.backfill_answer_witness(integer) from public, anon, authenticated;

-- ── 3. 증인이 있는 것만 남긴 공유 payload ───────────────────────────────────
create or replace function public.witnessed_share_payload(p_user uuid, p_payload jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_set       text[];
  v_last      timestamptz;
  v_findings  text[] := '{}';
  v_cautions  text[] := '{}';
  v_topics    text[] := '{}';
  v_item      text;
  v_summary   text := coalesce(p_payload->>'summary', '');
  v_title     text := coalesce(p_payload->>'title', '');
  v_title_sk  text;
  v_join      text;
  k           int;
begin
  select coalesce(array_agg(d), '{}'), max(w.created_at)
    into v_set, v_last
    from public.consultation_answer_witness w, unnest(w.digests) d
   where w.user_id = p_user;

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'keyFindings') = 'array' then p_payload->'keyFindings' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set) then v_findings := v_findings || v_item; end if;
  end loop;

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'cautions') = 'array' then p_payload->'cautions' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set) then v_cautions := v_cautions || v_item; end if;
  end loop;

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'coveredTopics') = 'array' then p_payload->'coveredTopics' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set) then v_topics := v_topics || v_item; end if;
  end loop;

  -- 요약: 통째로 증인이 있거나(저장된 대화 요약), 합성기의 대체 규칙 —
  -- "앞의 결론 문장 k개(≤3)를 공백으로 이은 것" — 과 정확히 같을 때만 남긴다.
  if v_summary <> '' and not (public.witness_digest(v_summary) = any(v_set)) then
    v_join := null;
    for k in 1..least(3, coalesce(array_length(v_findings, 1), 0)) loop
      v_join := array_to_string(v_findings[1:k], ' ');
      exit when v_join = v_summary;
    end loop;
    if v_join is distinct from v_summary then v_summary := ''; end if;
  end if;

  -- 제목: 증인이 있는 첫 질문에서 **파생된** 제목일 때만. 아니면 합성기의 기본값과 같은 '상담 보고서'.
  -- (제목은 사용자가 쓴 첫 질문에서 만들어진다 — 그 질문이 서버 쪽에서 확인될 때만 쓴다.)
  v_title_sk := public.witness_skeleton(regexp_replace(regexp_replace(v_title, '\s*상담\s*보고서\s*$', ''), '…$', ''));
  if coalesce(array_length(v_topics, 1), 0) = 0
     or v_title_sk = ''
     or position(v_title_sk in public.witness_skeleton(v_topics[1])) <> 1 then
    v_title := '상담 보고서';
  end if;

  return jsonb_build_object(
    'title',         v_title,
    -- ⚠ 클라이언트가 보낸 generatedAt 대신 **서버가 마지막으로 답을 만든 시각**을 쓴다.
    'generatedAt',   case when v_last is null then null else to_char(v_last at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') end,
    'summary',       v_summary,
    'keyFindings',   to_jsonb(v_findings),
    'cautions',      to_jsonb(v_cautions),
    'coveredTopics', to_jsonb(v_topics),
    -- 무엇이 걸러졌는지 **수만** 남긴다(내용은 남기지 않는다). 관리자·테스트가 본다.
    '_witness',      jsonb_build_object(
                       'findingsDropped', greatest(0, jsonb_array_length(coalesce(case when jsonb_typeof(p_payload->'keyFindings')='array' then p_payload->'keyFindings' end,'[]'::jsonb)) - coalesce(array_length(v_findings,1),0)),
                       'cautionsDropped', greatest(0, jsonb_array_length(coalesce(case when jsonb_typeof(p_payload->'cautions')='array' then p_payload->'cautions' end,'[]'::jsonb)) - coalesce(array_length(v_cautions,1),0)),
                       'summaryDropped', (coalesce(p_payload->>'summary','') <> '' and v_summary = ''))
  );
end;
$$;

revoke all on function public.witnessed_share_payload(uuid, jsonb) from public, anon, authenticated;

-- ── 4. 공유 스냅샷을 증인 필터로 바꾼다 (20260916 의 함수를 교체) ────────────
create or replace function public.report_shares_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare v_payload jsonb;
begin
  select r.report_payload into v_payload
    from public.consultation_reports r
   where r.id = new.report_id and r.user_id = auth.uid();
  if not found then
    raise exception 'report not found or not owned' using errcode = '42501';
  end if;

  -- ⚠ 여기가 바뀐 곳. 예전에는 v_payload 를 그대로 복사했다.
  new.shared_payload := public.witnessed_share_payload(auth.uid(), v_payload);
  new.owner_user_id  := auth.uid();
  new.opened_count   := 0;
  new.last_opened_at := null;
  new.status         := 'active';
  new.revoked_at     := null;
  new.expires_at     := now() + interval '30 days';
  return new;
end;
$$;

-- ── 5. #12 — 조회수는 조회 RPC 만 올린다 ──────────────────────────────────
-- ⚠ security INVOKER 로 바꾼다. 트리거가 definer 면 current_user 가 늘 함수 소유자라서
--   "누가 고치는가" 를 구분할 수 없다. invoker 면 PostgREST 직접 호출은 `authenticated`,
--   get_shared_report(definer) 안에서의 증가는 그 함수 소유자로 보인다.
create or replace function public.report_shares_freeze()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.shared_payload is distinct from old.shared_payload then
    raise exception 'shared_payload is server-owned' using errcode = '42501';
  end if;
  if new.report_id     is distinct from old.report_id
     or new.owner_user_id is distinct from old.owner_user_id
     or new.token_hash    is distinct from old.token_hash
     or new.expires_at    is distinct from old.expires_at
     or new.channel       is distinct from old.channel then
    raise exception 'immutable column on report_shares' using errcode = '42501';
  end if;
  if current_user in ('authenticated', 'anon')
     and (new.opened_count is distinct from old.opened_count
          or new.last_opened_at is distinct from old.last_opened_at) then
    raise exception 'opened_count is server-owned' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- ── 6. #8 — 클라이언트는 system 메시지를 넣지 못한다 ────────────────────────
create or replace function public.conversation_messages_role_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  -- 앱이 쓰는 역할은 user · assistant 뿐이다(PersistableMessageRole). system 은 서버 영역.
  if current_user in ('authenticated', 'anon') and new.role = 'system' then
    raise exception 'role system is server-only' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists conversation_messages_role_guard on public.conversation_messages;
create trigger conversation_messages_role_guard
  before insert or update on public.conversation_messages
  for each row execute function public.conversation_messages_role_guard();

notify pgrst, 'reload schema';
