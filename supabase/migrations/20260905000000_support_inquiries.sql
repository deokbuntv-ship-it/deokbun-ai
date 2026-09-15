-- ============================================================================
-- DeokbunAI — SUPPORT INQUIRIES (고객문의)
--
-- WHY THIS EXISTS
--   CS is the one axis of nine that is completely empty (FEATURE_MASTER_CHECKLIST 축 2-6), and
--   — exactly like account deletion — the SHIPPED privacy policy already promises it:
--   "개인정보 처리에 관한 문의는 서비스 내 문의 채널을 통해 접수하실 수 있습니다"
--   (src/features/legal/legalContent.ts:86). There is no such channel anywhere in the code.
--   Both stores also require a working support contact before review.
--
-- SCOPE — deliberately small. What is NOT here and why:
--   · No threading. V1 is one question and one answer; a conversation needs a message table,
--     unread state on both sides, and ordering rules. When a second round is actually needed
--     the user opens a new inquiry, which is honest and costs nothing.
--   · No attachments. Storage + moderation + a new privacy surface for a V1 with no staff.
--   · No in-app notification on reply. It would need `in_app_notifications.category` and
--     `deep_link_target` CHECK constraints widened — altering a LIVE retention table for a CS
--     convenience. The inquiry list shows 답변완료 instead. Revisit with email (PART 2).
--   · No assignment / tags / SLA. There is one operator.
--
-- WRITE MODEL — why the admin does not UPDATE directly
--   RLS cannot express "you may write these columns but not those". If the admin held a
--   blanket `for all` policy they could silently rewrite the user's original message, which
--   destroys the only record of what was actually asked. So: admins get SELECT through RLS and
--   write ONLY through `admin_answer_inquiry`, which touches the answer/status columns and
--   nothing else. The user's message is immutable after submit for the same reason.
--
-- 3 RULES (PROJECT_STATE §7.10.1): one file = one domain · per-signature drop then create or
-- replace · no insert without on conflict (this file seeds nothing).
--
-- Depends on: public.is_admin() (20260904000000), auth.users.
-- ============================================================================

create table if not exists public.support_inquiries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category      text not null default 'other'
                  check (category in ('payment', 'consultation', 'account', 'bug', 'other')),
  message       text not null check (char_length(message) between 1 and 4000),
  -- Optional. A user whose account is later deleted cannot be reached through auth.users, and
  -- some people prefer a different address. Never required — asking for it would make an
  -- inquiry feel like a signup.
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  -- Diagnostic context the operator would otherwise have to ask for. PII-minimal by design:
  -- app version and platform only. No device id, no IP, no user agent, no locale.
  app_version   text,
  platform      text check (platform is null or platform in ('ios', 'android', 'web')),
  status        text not null default 'RECEIVED'
                  check (status in ('RECEIVED', 'IN_PROGRESS', 'ANSWERED')),
  answer        text,
  answered_at   timestamptz,
  answered_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists support_inquiries_user_idx    on public.support_inquiries (user_id, created_at desc);
create index if not exists support_inquiries_status_idx  on public.support_inquiries (status, created_at desc);

create or replace function public.support_inquiries_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists support_inquiries_touch_trg on public.support_inquiries;
create trigger support_inquiries_touch_trg
  before update on public.support_inquiries
  for each row execute function public.support_inquiries_touch();

alter table public.support_inquiries enable row level security;

-- The user reads and creates their own, and can do nothing else. No UPDATE policy: an inquiry
-- is a record of what was asked, and letting it be edited after an answer exists would make
-- the answer read as a reply to something that was never said. No DELETE policy either —
-- account deletion cascades this table, which is the real erasure path (20260903000000).
drop policy if exists support_inquiries_select_own on public.support_inquiries;
create policy support_inquiries_select_own on public.support_inquiries
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists support_inquiries_insert_own on public.support_inquiries;
create policy support_inquiries_insert_own on public.support_inquiries
  for insert with check (user_id = auth.uid());

comment on table public.support_inquiries is
  '고객문의. 사용자는 자기 것만 읽기/생성, 수정·삭제 불가. 관리자는 읽기(RLS) + admin_answer_inquiry 로만 쓰기.';

-- ── admin list — mirrors admin_list_consultations (auth.users is definer-only) ───────────────
drop function if exists public.admin_list_inquiries(text, int, int);
create or replace function public.admin_list_inquiries(
  p_status text default null,
  p_limit  int  default 25,
  p_offset int  default 0
)
returns table (
  id                uuid,
  user_id           uuid,
  user_display_name text,
  user_email        text,
  category          text,
  message           text,
  contact_email     text,
  app_version       text,
  platform          text,
  status            text,
  answer            text,
  answered_at       timestamptz,
  created_at        timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    i.id, i.user_id,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      nullif(u.raw_user_meta_data ->> 'nickname', '')
    ) as user_display_name,
    u.email,
    i.category, i.message, i.contact_email, i.app_version, i.platform,
    i.status, i.answer, i.answered_at, i.created_at
  from public.support_inquiries i
  left join auth.users u on u.id = i.user_id
  where p_status is null or i.status = p_status
  -- Unanswered first, then oldest first: the queue reads top-down as "what to do next".
  order by
    case when i.status = 'ANSWERED' then 1 else 0 end,
    i.created_at asc
  limit greatest(1, least(coalesce(p_limit, 25), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_inquiries(text, int, int) from public;
grant execute on function public.admin_list_inquiries(text, int, int) to authenticated;

-- ── admin write — the ONLY way an admin changes an inquiry ───────────────────────────────────
drop function if exists public.admin_answer_inquiry(uuid, text, text);
create or replace function public.admin_answer_inquiry(
  p_id     uuid,
  p_answer text default null,
  p_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_row public.support_inquiries;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_id is null then
    raise exception 'inquiry id required' using errcode = '22023';
  end if;

  -- An answer implies ANSWERED unless the caller says otherwise; a status-only call (e.g.
  -- marking IN_PROGRESS) leaves the answer alone.
  v_status := coalesce(p_status, case when p_answer is not null then 'ANSWERED' else null end);
  if v_status is not null and v_status not in ('RECEIVED', 'IN_PROGRESS', 'ANSWERED') then
    raise exception 'bad status' using errcode = '22023';
  end if;

  update public.support_inquiries i
     set answer      = coalesce(p_answer, i.answer),
         status      = coalesce(v_status, i.status),
         -- Stamped on the FIRST answer and never moved, so "how long did the user wait" stays true.
         answered_at = case
                         when p_answer is not null and i.answered_at is null then now()
                         else i.answered_at
                       end,
         answered_by = case when p_answer is not null then auth.uid() else i.answered_by end
   where i.id = p_id
   returning i.* into v_row;

  if not found then
    raise exception 'inquiry not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'id', v_row.id, 'status', v_row.status,
    'answered_at', v_row.answered_at, 'answer', v_row.answer
  );
end;
$$;

revoke all on function public.admin_answer_inquiry(uuid, text, text) from public;
grant execute on function public.admin_answer_inquiry(uuid, text, text) to authenticated;
