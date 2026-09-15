-- ════════════════════════════════════════════════════════════════════════════
-- C9 답 원문 정리 · 익명 미리보기의 위조 경로 · 궁합 리포트 공유 복구
-- ════════════════════════════════════════════════════════════════════════════
--
-- 원칙 (CTO 판정 C9, 2026-09-12 #2)
--   답 원문은 선언한 목적(24시간 재전송 방지)에 필요한 동안만 둔다. 공유는 증인(해시, 20)으로
--   동작하므로 원문이 없어도 깨지지 않아야 한다.
--
-- 이 파일이 정리하는 답 원문 (전수 조사 표는 보고서 1-1)
--   ① paid_request_idempotency.response_json — 서버가 쓴 답 전체(staging 평균 178KB). 재생 창
--      24시간이 지나도 행이 남아 원문이 영구 보관됐다. 창이 지나면 acquire_paid_request 는 그 행을
--      이미 "없는 것" 으로 다룬다(같은 request_id 는 새 요청으로 다시 받는다) → 원문은 쓸 데가 없다.
--      지우고 **키와 시각만** 남긴다(status 'EXPIRED').
--   ② report_shares.shared_payload — 공유 시점 스냅샷(답에서 뽑은 문장). 해지·만료 뒤에는 어떤
--      읽기 함수도 보지 않는다 → 비운다.
--   ③ 대화를 지우면: 그 대화의 ① · 그 답의 증인 · 그 대화 리포트의 공유(해지 + 스냅샷 비움)를 즉시.
--      대화와 답의 연결은 서버 소유 consultation_decisions 에만 있다(request_id 는 무작위).
--   계정 삭제는 원래 auth CASCADE 로 전부 사라진다 — 실측은 보고서 1-4.
--
-- 순서 보장 — 백필(20 의 backfill_answer_witness)은 원문이 있어야 한다
--   run_answer_retention 은 증인이 없는 완료 답이 하나라도 있으면(answer_witness_backlog() > 0)
--   **아무것도 지우지 않고 거부**한다. production 에서 백필이 끝나기 전에 정리를 켜도 원문은 남는다.
--   주기 실행은 "백필 한 번 → 정리" 순서로 부른다(패키지 ④ 의 cron 명령).
--
-- 함께 닫는 것 (같은 조사에서 나온 둘)
--   #25 익명 미리보기 get_shared_report_preview 가 **클라이언트가 쓴 report_payload** 를 읽었다.
--       staging 실측: 처음부터 지어낸 리포트를 공유하면 로그인하지 않은 방문자에게
--       "이 사람은 3개월 안에 반드시 성공합니다." 가 결론으로 나갔다(전체 읽기는 20 이 이미 막았다).
--       → 스냅샷(증인 필터를 지난 것)을 읽는다.
--   궁합 공유 — 20 의 증인 필터가 궁합 합성기의 **엔진 고정 문구**(등급 문장 · 분야별 판정 ·
--       두 이름 제목)를 몰라, 정상 궁합 리포트에서 제목·요약·판정 3줄을 지웠다(staging 실측 5/8).
--       → 고정 문구를 허용 목록으로 둔다. 목록 밖의 글은 여전히 빠진다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. 재전송 캐시의 "만료" 상태 — 원문 없이 키와 시각만 ─────────────────────
-- 기존 status CHECK('PROCESSING','COMPLETED')를 찾아 바꾼다. (status='COMPLETED') = (원문 있음)
-- 규칙은 그대로 둔다 — EXPIRED 는 원문이 없어야 한다.
do $$
declare r record;
begin
  for r in
    select c.conname
      from pg_constraint c
     where c.conrelid = 'public.paid_request_idempotency'::regclass
       and c.contype = 'c'
       and pg_get_constraintdef(c.oid) ilike '%PROCESSING%'
       and pg_get_constraintdef(c.oid) not ilike '%EXPIRED%'
       and pg_get_constraintdef(c.oid) not ilike '%response_json%'
  loop
    execute format('alter table public.paid_request_idempotency drop constraint %I', r.conname);
  end loop;
  if not exists (
    select 1 from pg_constraint c
     where c.conrelid = 'public.paid_request_idempotency'::regclass
       and c.contype = 'c'
       and pg_get_constraintdef(c.oid) ilike '%EXPIRED%'
  ) then
    alter table public.paid_request_idempotency
      add constraint paid_request_idempotency_status_check
      check (status in ('PROCESSING', 'COMPLETED', 'EXPIRED'));
  end if;
end
$$;

-- ── 2. 백필이 남았는가 — 정리의 순서 보장에 쓴다 ─────────────────────────────
-- 패키지 ①-7 의 "남은것" 조회와 같은 정의다.
create or replace function public.answer_witness_backlog()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::integer
    from public.paid_request_idempotency i
   where i.status = 'COMPLETED'
     and i.response_json is not null
     and not exists (select 1 from public.consultation_answer_witness w
                      where w.user_id = i.user_id and w.workload = i.workload and w.request_id = i.request_id);
$$;

revoke all on function public.answer_witness_backlog() from public, anon, authenticated;

-- ── 3. 주기 정리 ─────────────────────────────────────────────────────────────
create or replace function public.run_answer_retention(p_limit integer default 1000)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_limit     integer := greatest(1, least(coalesce(p_limit, 1000), 5000));
  v_backlog   integer;
  v_answers   integer := 0;
  v_snapshots integer := 0;
begin
  -- ⚠ 순서 보장: 증인이 없는 완료 답이 남아 있으면 **아무것도 지우지 않는다**.
  v_backlog := public.answer_witness_backlog();
  if v_backlog > 0 then
    return jsonb_build_object('status', 'refused', 'reason', 'BACKFILL_INCOMPLETE', 'backlog', v_backlog);
  end if;

  -- ① 재생 창(24시간)이 지난 답 원문 → 키와 시각만 남긴다
  with doomed as (
    select ctid from public.paid_request_idempotency
     where status = 'COMPLETED' and expires_at <= now()
     limit v_limit
     for update skip locked
  )
  update public.paid_request_idempotency i
     set status = 'EXPIRED', response_json = null, updated_at = clock_timestamp()
    from doomed
   where i.ctid = doomed.ctid;
  get diagnostics v_answers = row_count;

  -- ② 해지·만료된 공유의 스냅샷 → 비운다 (읽는 함수가 없다)
  with dead as (
    select ctid from public.report_shares
     where shared_payload is not null
       and (status <> 'active' or revoked_at is not null or expires_at <= now())
     limit v_limit
     for update skip locked
  )
  update public.report_shares s
     set shared_payload = null
    from dead
   where s.ctid = dead.ctid;
  get diagnostics v_snapshots = row_count;

  return jsonb_build_object('status', 'ok', 'answersExpired', v_answers, 'snapshotsCleared', v_snapshots,
                            'backlog', 0);
end;
$$;

revoke all on function public.run_answer_retention(integer) from public, anon, authenticated;

-- ── 4. 대화를 지우면 — 그 대화의 원문 · 증인 · 공유를 즉시 ──────────────────
-- BEFORE DELETE 여야 한다: consultation_decisions 는 대화와 함께 CASCADE 로 지워지는데, 대화→답
-- 연결은 거기에만 있다. AFTER 트리거에서는 이미 사라진 뒤다.
-- 리포트 자체는 남는다(consultation_reports.conversation_id 는 set null — 우편함 보관물, 20260818).
-- 그 리포트의 공유만 해지하고 스냅샷을 비운다: 삭제 의사를 존중해 링크를 받은 사람도 더는 못 본다.
create or replace function public.purge_conversation_answers()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- ① 그 대화의 답 원문
  update public.paid_request_idempotency i
     set status = 'EXPIRED', response_json = null, updated_at = clock_timestamp()
    from public.consultation_decisions d
   where d.conversation_id = old.id
     and i.user_id = d.user_id and i.workload = d.workload and i.request_id = d.request_id
     and i.status = 'COMPLETED';

  -- ② 그 답의 증인 (지운 대화에서 나온 해시)
  delete from public.consultation_answer_witness w
   using public.consultation_decisions d
   where d.conversation_id = old.id
     and w.user_id = d.user_id and w.workload = d.workload and w.request_id = d.request_id;

  -- ③ 그 대화 리포트의 공유 — 해지 + 스냅샷 비움
  update public.report_shares s
     set status = 'revoked', revoked_at = coalesce(s.revoked_at, now()), shared_payload = null
    from public.consultation_reports r
   where r.conversation_id = old.id
     and s.report_id = r.id
     and (s.status = 'active' or s.revoked_at is null or s.shared_payload is not null);

  return old;
end;
$$;

drop trigger if exists conversations_purge_answers on public.conversations;
create trigger conversations_purge_answers
  before delete on public.conversations
  for each row execute function public.purge_conversation_answers();

-- ── 5. 공유 스냅샷 동결 — 서버가 "죽은 공유" 의 스냅샷을 비우는 것만 예외 ──────
-- 20 의 정의에 첫 번째 규칙의 예외 하나만 더했다. 클라이언트(authenticated · anon)는 여전히
-- shared_payload 를 한 글자도 못 바꾼다.
create or replace function public.report_shares_freeze()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.shared_payload is distinct from old.shared_payload then
    if new.shared_payload is null
       and current_user not in ('authenticated', 'anon')
       and (new.status <> 'active' or new.revoked_at is not null or old.expires_at <= now()) then
      null;  -- C9: 해지·만료된 공유의 스냅샷 비우기
    else
      raise exception 'shared_payload is server-owned' using errcode = '42501';
    end if;
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

-- ── 6. #25 익명 미리보기 — 스냅샷을 읽는다 ───────────────────────────────────
-- 바뀐 곳은 두 줄이다: 결론·개수는 **스냅샷**(증인 필터를 지난 것)에서, 이름 가리기에 쓸 두 이름만
-- 원래 리포트 제목에서(가리기는 글을 **지우기만** 하므로 사용자가 쓴 제목을 써도 안전하다).
-- 나머지 규칙(토큰 · 조회수 미증가 · 첫 문장만 · 제목 비반환)은 20260906 그대로다.
create or replace function public.get_shared_report_preview(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_hash       text;
  v_share      public.report_shares;
  v_report     public.consultation_reports;
  v_payload    jsonb;
  v_title      text;
  v_conclusion text;
  v_names      text[];
  v_first      text;
begin
  -- No auth check: this function EXISTS to serve logged-out visitors. Everything it can return
  -- is chosen below; there is nothing to gate on identity.
  if p_token is null or length(p_token) < 32 then
    return null;
  end if;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_share
    from public.report_shares
   where token_hash = v_hash
     and status = 'active'
     and revoked_at is null
     and (expires_at is null or expires_at > now())
   limit 1;
  if not found then
    return null;  -- same indistinguishable "unavailable" as the full read (§41)
  end if;

  select * into v_report from public.consultation_reports where id = v_share.report_id limit 1;
  if not found then
    return null;
  end if;

  -- ⚠ 여기가 바뀐 곳. 예전에는 v_report.report_payload(클라이언트가 쓴 본문)를 읽었다.
  v_payload    := v_share.shared_payload;
  if v_payload is null then
    return null;
  end if;
  v_title      := coalesce(nullif(v_report.report_payload->>'title', ''), v_report.title, '');
  v_conclusion := coalesce(nullif(v_payload->>'summary', ''), '');

  if v_conclusion = '' then
    return null;  -- nothing worth previewing; do not invent a teaser
  end if;

  -- The compatibility title is composed as `A님과 B님의 궁합 보고서` (compatibilityReportComposer).
  v_names := regexp_match(v_title, '^(.+?)님과 (.+?)님의');

  if v_names is not null then
    v_conclusion := replace(v_conclusion, v_names[1], '상대');
    v_conclusion := replace(v_conclusion, v_names[2], '상대');
  else
    -- Fail closed: keep only the first sentence, which the server composed itself.
    v_first := (regexp_match(v_conclusion, '^[^.!?\n]*[.!?]'))[1];
    v_conclusion := coalesce(v_first, v_conclusion);
  end if;

  return jsonb_build_object(
    'conclusion', v_conclusion,
    'reportKind', case when v_report.report_type = 'compatibility' then 'compatibility' else 'consultation' end,
    -- Counts, never content: enough to show there is more, not enough to be the product.
    'lockedCounts', jsonb_build_object(
      'findings', coalesce(jsonb_array_length(v_payload->'keyFindings'), 0),
      'cautions', coalesce(jsonb_array_length(v_payload->'cautions'), 0),
      'topics',   coalesce(jsonb_array_length(v_payload->'coveredTopics'), 0)
    )
  );
end;
$$;

revoke all on function public.get_shared_report_preview(text) from public;
grant execute on function public.get_shared_report_preview(text) to anon, authenticated;

-- ── 7. 궁합 리포트의 엔진 고정 문구 — 증인 필터의 허용 목록 ─────────────────
-- 20 의 witnessed_share_payload 에 세 가지만 더했다. 모두 **닫힌 목록**이라 위조 글을 싣지 못한다.
--   · 분야별 판정 줄 "{분야}: {판정}" — 엔진(compatibilityTiers.ts)이 만드는 10줄 중 하나일 때
--   · 요약 "두 분은 전체적으로 {등급}이에요." — 등급 4개 중 하나. 뒤에 붙는 결론은 증인이 있거나
--     증인이 있는 두 문장을 이은 것일 때만
--   · 제목 "{이름}님과 {이름}님의 궁합 보고서" — 이름은 합성기처럼 12자(+ "…") 이하
-- ⚠ 이 목록은 앱 상수와 같아야 한다 — 계약 테스트가 compatibilityTiers.ts 와 대조한다.
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
  v_keep      boolean;
  v_label     text;
  v_head      text;
  v_tail      text;
  k           int;
  -- 궁합 엔진 고정 문구 (compatibilityTiers.ts)
  v_dim_lines constant text[] := array[
    '정서·유대: 정서적으로 잘 통하는 편이에요.',
    '정서·유대: 기본적인 교감은 무난한 편이에요.',
    '정서·유대: 서로의 속마음을 확인하는 시간이 필요한 편이에요.',
    '갈등·마찰: 부딪히는 지점이 적은 편이에요.',
    '갈등·마찰: 가끔 부딪힐 수 있지만 조율할 수 있는 수준이에요.',
    '갈등·마찰: 갈등이 반복되기 쉬워 서로의 방식을 미리 맞추는 게 중요해요.',
    '오행 보완: 서로 부족한 기운을 자연스럽게 채워주는 편이에요.',
    '오행 보완: 한쪽이 상대의 부족한 부분을 채워주는 편이에요.',
    '오행 보완: 두 사람 모두 약한 기운이 있어 그 부분은 함께 신경 쓰면 좋아요.',
    '오행 보완: 기운의 구성이 비슷해 편안한 편이에요.'
  ];
  v_labels    constant text[] := array['매우 잘 맞는 편', '잘 맞는 편', '보완이 필요한 편', '갈등 관리가 중요한 편'];
  v_dim_sk    text[];
begin
  select coalesce(array_agg(d), '{}'), max(w.created_at)
    into v_set, v_last
    from public.consultation_answer_witness w, unnest(w.digests) d
   where w.user_id = p_user;

  v_dim_sk := array(select public.witness_skeleton(x) from unnest(v_dim_lines) x);

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'keyFindings') = 'array' then p_payload->'keyFindings' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set)
       or public.witness_skeleton(v_item) = any(v_dim_sk) then
      v_findings := v_findings || v_item;
    end if;
  end loop;

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'cautions') = 'array' then p_payload->'cautions' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set) then v_cautions := v_cautions || v_item; end if;
  end loop;

  for v_item in select jsonb_array_elements_text(
        case when jsonb_typeof(p_payload->'coveredTopics') = 'array' then p_payload->'coveredTopics' else '[]'::jsonb end) loop
    if public.witness_digest(v_item) = any(v_set) then v_topics := v_topics || v_item; end if;
  end loop;

  -- 요약: 통째로 증인이 있거나, 합성기의 대체 규칙 — "앞의 결론 문장 k개(≤3)를 공백으로 이은 것" —
  -- 과 정확히 같거나, 궁합 틀("두 분은 전체적으로 {등급}이에요." + 증인 있는 결론)일 때만 남긴다.
  v_keep := v_summary = '' or public.witness_digest(v_summary) = any(v_set);
  if not v_keep then
    for k in 1..least(3, coalesce(array_length(v_findings, 1), 0)) loop
      v_join := array_to_string(v_findings[1:k], ' ');
      if v_join = v_summary then v_keep := true; exit; end if;
    end loop;
  end if;
  if not v_keep then
    foreach v_label in array v_labels loop
      v_head := '두 분은 전체적으로 ' || v_label || '이에요.';
      if v_summary = v_head then
        v_keep := true;
      elsif left(v_summary, char_length(v_head) + 1) = v_head || ' ' then
        v_tail := substr(v_summary, char_length(v_head) + 2);
        if public.witness_digest(v_tail) = any(v_set) then
          v_keep := true;
        else
          -- 결론 두 개를 공백으로 이은 것 (합성기: dedupeClean(headlines, 2).join(' '))
          for k in 1..char_length(v_tail) loop
            if substr(v_tail, k, 1) = ' '
               and public.witness_digest(left(v_tail, k - 1)) = any(v_set)
               and public.witness_digest(substr(v_tail, k + 1)) = any(v_set) then
              v_keep := true;
              exit;
            end if;
          end loop;
        end if;
      end if;
      exit when v_keep;
    end loop;
  end if;
  if not v_keep then v_summary := ''; end if;

  -- 제목: 증인이 있는 첫 질문에서 **파생된** 제목이거나, 궁합 두 이름 틀일 때만.
  -- 아니면 합성기의 기본값과 같은 '상담 보고서'.
  v_title_sk := public.witness_skeleton(regexp_replace(regexp_replace(v_title, '\s*상담\s*보고서\s*$', ''), '…$', ''));
  if not (v_title ~ '^[^\n]{1,13}님과 [^\n]{1,13}님의 궁합 보고서$')
     and (coalesce(array_length(v_topics, 1), 0) = 0
          or v_title_sk = ''
          or position(v_title_sk in public.witness_skeleton(v_topics[1])) <> 1) then
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

notify pgrst, 'reload schema';
