-- ════════════════════════════════════════════════════════════════════════════
-- AI 답변 신고 — 구글 "AI 생성 콘텐츠" 정책 요건
-- ════════════════════════════════════════════════════════════════════════════
--
-- 왜 필요한가 (2026-09-10 원문 확인)
--   구글 Play 의 AI 생성 콘텐츠 정책은 AI 로 콘텐츠를 만드는 앱에 **앱을 벗어나지 않고**
--   불쾌한 콘텐츠를 개발자에게 신고·플래그할 수 있는 **앱 내 기능**을 요구한다.
--   지금까지 있던 것은 `consultation_feedback` 의 **도움됨/도움 안 됨 품질 투표**뿐이었다.
--
-- ⚠ 왜 `consultation_feedback` 을 넓히지 않고 새 표를 만드는가 (설계 판단, CTO 검토용)
--   ① 그 표는 `(user_id, message_id)` 유니크로 **재투표 upsert** 를 한다. 신고를 같은 행에
--      얹으면 "👎 를 눌렀다가 신고" 가 앞의 투표를 지운다 — 서로 다른 사실이 서로를 덮는다.
--   ② 신고는 **처리 상태(open/reviewed/dismissed)** 가 있는 운영 대상이고 투표는 아니다.
--   ③ 정책이 요구하는 것은 품질 신호가 아니라 **신고 채널**이다. 관리자 화면에서 둘을
--      섞어 놓으면 신고가 투표 잡음에 묻힌다.
--   대신 **RLS 모양과 칸 이름은 그 표를 그대로 따랐다** — 배우는 비용을 늘리지 않는다.
--
-- ⚠ 사용자가 못 정하는 것: `status` · `reviewed_at` · `reviewed_by`. 트리거가 강제한다.
--   RLS 로 "행을 쓸 수 있으면 모든 칸을 쓸 수 있다" 는 이 스키마의 규칙이라(컬럼 권한 0건)
--   칸 단위 통제는 트리거로만 된다.
--
-- 멱등성 3원칙: create ... if not exists · drop 후 create · 시드 insert 없음.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.ai_content_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  -- 어떤 답변인가. `conversation_messages.client_message_id` 와 같은 형식(텍스트)이다.
  message_id      text not null,
  -- 어느 화면에서 신고했나. 상담 밖(오늘·이달·프리미엄)에도 같은 버튼을 붙일 수 있게 열어 둔다.
  surface         text not null default 'consultation'
                  check (surface in ('consultation','compatibility','today','monthly','premium','famous')),
  -- 사유는 **고정 목록**이다. 자유 입력만 받으면 집계가 불가능하고, 개인정보가 섞여 들어온다.
  reason          text not null check (reason in ('inappropriate','harmful','inaccurate','other')),
  -- 선택 입력. 비워도 된다. 길이를 막는 이유는 로그·화면이 아니라 **개인정보**다.
  detail          text check (detail is null or length(detail) <= 1000),
  -- 운영용. ⚠ 사용자가 못 쓴다 (트리거).
  status          text not null default 'open' check (status in ('open','reviewed','dismissed')),
  admin_note      text,
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists ai_content_reports_user_idx   on public.ai_content_reports (user_id, created_at desc);
create index if not exists ai_content_reports_status_idx on public.ai_content_reports (status, created_at desc);
-- 같은 답변을 여러 번 신고해도 한 번만 남는다. 연타·재신고가 목록을 채우지 않게.
create unique index if not exists ai_content_reports_user_message_uniq
  on public.ai_content_reports (user_id, message_id);

-- ── 사용자가 못 정하는 칸을 서버가 강제한다 ─────────────────────────────────
create or replace function public.ai_content_reports_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    -- 운영 칸은 무엇을 보내든 서버 값으로.
    new.status      := 'open';
    new.admin_note  := null;
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.user_id     := auth.uid();

    -- ⚠ 남의 대화로 신고를 위장하는 것을 막는다. conversation_id 를 줬다면 본인 것이어야 한다.
    if new.conversation_id is not null
       and not exists (select 1 from public.conversations c
                        where c.id = new.conversation_id and c.user_id = auth.uid()) then
      raise exception 'conversation not owned' using errcode = '42501';
    end if;

    -- ⚠ 빈 사유 방어. `detail` 이 공백만이면 null 로 눕힌다 — 공백 문자열을
    --   "설명을 적었다" 로 세면 운영자가 없는 정보를 있는 것으로 읽는다.
    new.detail := nullif(btrim(coalesce(new.detail, '')), '');
    if btrim(coalesce(new.message_id, '')) = '' then
      raise exception 'message_id required' using errcode = '22023';
    end if;
  else
    -- UPDATE 는 관리자만. (사용자에게는 UPDATE 정책 자체가 없지만, 정책이 늘어날 때를 대비한다.)
    if not public.is_admin() then
      raise exception 'admin only' using errcode = '42501';
    end if;
    new.user_id         := old.user_id;
    new.conversation_id := old.conversation_id;
    new.message_id      := old.message_id;
    new.reason          := old.reason;
    new.detail          := old.detail;
    new.created_at      := old.created_at;
    new.updated_at      := now();
    if new.status is distinct from old.status and new.status <> 'open' then
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ai_content_reports_guard_ins on public.ai_content_reports;
create trigger ai_content_reports_guard_ins
  before insert on public.ai_content_reports
  for each row execute function public.ai_content_reports_guard();

drop trigger if exists ai_content_reports_guard_upd on public.ai_content_reports;
create trigger ai_content_reports_guard_upd
  before update on public.ai_content_reports
  for each row execute function public.ai_content_reports_guard();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.ai_content_reports enable row level security;

-- 사용자는 **자기 신고만** 본다. 넣을 수 있고, 고치거나 지울 수는 없다
-- (신고를 지울 수 있으면 운영 기록이 사라진다).
drop policy if exists ai_content_reports_insert_own on public.ai_content_reports;
create policy ai_content_reports_insert_own on public.ai_content_reports
  for insert with check (user_id = auth.uid());

drop policy if exists ai_content_reports_select_own on public.ai_content_reports;
create policy ai_content_reports_select_own on public.ai_content_reports
  for select using (user_id = auth.uid());

-- 관리자는 전부 본다 — 이 표의 존재 이유다(신고를 읽고 조치한다).
drop policy if exists ai_content_reports_admin_all on public.ai_content_reports;
create policy ai_content_reports_admin_all on public.ai_content_reports
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 관리자 목록 조회 (신고자 식별자를 그대로 내보내지 않는다) ─────────────────
-- ⚠ 관리자 화면이 표를 직접 select 해도 되지만, **신고자 user_id 를 화면까지 끌고 가지
--   않으려고** 뷰 대신 함수로 감싼다. 운영에 필요한 것은 "무엇이 신고됐나" 이지
--   "누가 신고했나" 가 아니다. 같은 사람의 연속 신고는 익명 해시로 묶어 볼 수 있다.
create or replace function public.admin_ai_content_reports(p_status text default null, p_limit int default 100)
returns table (
  id uuid, message_id text, surface text, reason text, detail text,
  status text, admin_note text, reporter_key text, created_at timestamptz, reviewed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = 'P0001'; end if;
  return query
    select r.id, r.message_id, r.surface, r.reason, r.detail,
           r.status, r.admin_note,
           -- 신고자를 세되 알아보지는 못하게. 같은 사람이면 같은 값이 나온다.
           substr(encode(digest(r.user_id::text, 'sha256'), 'hex'), 1, 12) as reporter_key,
           r.created_at, r.reviewed_at
      from public.ai_content_reports r
     where p_status is null or r.status = p_status
     order by r.created_at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500));
end;
$$;

revoke all on function public.admin_ai_content_reports(text, int) from public;
revoke all on function public.admin_ai_content_reports(text, int) from anon;
grant execute on function public.admin_ai_content_reports(text, int) to authenticated;

notify pgrst, 'reload schema';
