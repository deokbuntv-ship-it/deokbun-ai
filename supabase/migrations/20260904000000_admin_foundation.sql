-- ============================================================================
-- DeokbunAI — ADMIN FOUNDATION (승격 묶음 1 / 5)
--
-- Consolidates the out-of-band artifacts that build the admin authorization base and the
-- read-only admin RPCs, as ONE idempotent migration:
--   docs/admin/ADMIN_SETUP.sql              (admin_users + is_admin)
--   docs/admin/ADMIN_02_SETUP.sql           (admin_list_users, admin_get_user)
--   docs/admin/ADMIN_03_SETUP.sql           (admin_list_consultations, admin_get_consultation)
--   docs/admin/ADMIN_04_SETUP.sql           (admin_dashboard_overview)
--   docs/admin/ADMIN_04_UPDATE_usage_filter (admin_list_ai_usage — FINAL 3-arg signature)
--
-- WHY THIS MIGRATION EXISTS (PROJECT_STATE §7.10, 방안 C)
--   These objects were created by pasting SQL into the Supabase dashboard, so no environment
--   knows which of them it has. Measured 2026-09-03 on staging: `admin_users`, `ai_usage_logs`,
--   `is_admin`, `admin_dashboard_overview` and the 2-arg `admin_list_ai_usage` were PRESENT;
--   all four ADMIN_02/03 functions were ABSENT — /admin/users and /admin/consultations were
--   dead on staging while working in production. This file makes the answer the same
--   everywhere by being safe to run any number of times against any state.
--
-- THREE RULES THIS FILE OBEYS (PROJECT_STATE §7.10.1)
--   1. ONE FILE = ONE DOMAIN, ordered inside. No cross-file ordering dependency remains.
--   2. FUNCTIONS: `drop ... if exists` per SIGNATURE, then `create or replace`. Never leave an
--      overload behind — that is what made `public_list_content` ambiguous (묶음 2).
--   3. NO `insert` without `on conflict`. This file seeds nothing at all; the admin allowlist
--      stays a deliberate human action (see the note at the bottom).
--
-- NOT INCLUDED ON PURPOSE
--   `public.ai_usage_logs` — its shape is already recorded by 20260902000000. Declaring it
--   twice would recreate the two-sources-of-truth problem this migration exists to end.
-- ============================================================================

-- ── 1. admin allowlist + is_admin() (ADMIN_SETUP) ───────────────────────────────────────────
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'admin',
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id)
);

-- Defense in depth. The app never reads this table directly (it calls is_admin()); a user may
-- read ONLY their own row and can never write — membership is service_role / SQL editor only.
alter table public.admin_users enable row level security;

drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ── 2. admin_list_users / admin_get_user (ADMIN_02) ─────────────────────────────────────────
-- Identity comes from auth.users only — this project's `profiles` table is not a dependency
-- (the original artifact was fixed in 2026-08 after a 42P01 on a profiles join).
drop function if exists public.admin_list_users(text, int, int);
create or replace function public.admin_list_users(
  p_search text default null,
  p_limit  int  default 25,
  p_offset int  default 0
)
returns table (
  user_id            uuid,
  display_name       text,
  created_at         timestamptz,
  subject_count      bigint,
  conversation_count bigint
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
    u.id,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      nullif(u.raw_user_meta_data ->> 'nickname', '')
    ) as display_name,
    u.created_at,
    (select count(*) from public.consultation_subjects s where s.user_id = u.id),
    (select count(*) from public.conversations c where c.user_id = u.id)
  from auth.users u
  where
    p_search is null
    or coalesce(u.raw_user_meta_data ->> 'full_name', '') ilike '%' || p_search || '%'
    or coalesce(u.raw_user_meta_data ->> 'name', '') ilike '%' || p_search || '%'
    or coalesce(u.raw_user_meta_data ->> 'nickname', '') ilike '%' || p_search || '%'
    or coalesce(u.email, '') ilike '%' || p_search || '%'
  order by u.created_at desc nulls last
  limit greatest(1, least(coalesce(p_limit, 25), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_users(text, int, int) from public;
grant execute on function public.admin_list_users(text, int, int) to authenticated;

-- Returns a CURATED birth projection, never the raw birth_info object: no exact time, no
-- gender, no approximateTimePeriod. Data minimization at the response layer.
drop function if exists public.admin_get_user(uuid);
create or replace function public.admin_get_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'user_id', u.id,
    'email', u.email,
    'display_name', coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      nullif(u.raw_user_meta_data ->> 'nickname', '')
    ),
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'conversation_count',
      (select count(*) from public.conversations c where c.user_id = u.id),
    'subjects', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'display_name', s.display_name,
          'relationship', s.relationship,
          'is_self', s.is_self,
          'birth_info', jsonb_build_object(
            'birthYear',         s.birth_info ->> 'birthYear',
            'birthMonth',        s.birth_info ->> 'birthMonth',
            'birthDay',          s.birth_info ->> 'birthDay',
            'calendarType',      s.birth_info ->> 'calendarType',
            'lunarMonthType',    s.birth_info ->> 'lunarMonthType',
            'birthTimeAccuracy', s.birth_info ->> 'birthTimeAccuracy',
            'birthPlace',        s.birth_info ->> 'birthPlace'
          ),
          'created_at', s.created_at,
          'updated_at', s.updated_at
        )
        order by s.is_self desc, s.created_at asc
      )
      from public.consultation_subjects s
      where s.user_id = u.id
    ), '[]'::jsonb)
  )
  into result
  from auth.users u
  where u.id = p_user_id;

  return result; -- null when the user id does not exist
end;
$$;

revoke all on function public.admin_get_user(uuid) from public;
grant execute on function public.admin_get_user(uuid) to authenticated;

-- ── 3. admin_list_consultations / admin_get_consultation (ADMIN_03) ─────────────────────────
-- PII-MINIMAL BY DESIGN: message CONTENT and summary TEXT never leave the database — only
-- role, char length, order and counts.
drop function if exists public.admin_list_consultations(text, int, int);
create or replace function public.admin_list_consultations(
  p_search text default null,
  p_limit  int  default 25,
  p_offset int  default 0
)
returns table (
  conversation_id   uuid,
  user_display_name text,
  subject_label     text,
  created_at        timestamptz,
  updated_at        timestamptz,
  message_count     bigint
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
    c.id,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      nullif(u.raw_user_meta_data ->> 'nickname', '')
    ) as user_display_name,
    (c.subject_snapshot -> 'subject' ->> 'displayName') as subject_label,
    c.created_at,
    c.updated_at,
    (select count(*) from public.conversation_messages m where m.conversation_id = c.id)
  from public.conversations c
  left join auth.users u on u.id = c.user_id
  where
    p_search is null
    or coalesce(u.raw_user_meta_data ->> 'full_name', '') ilike '%' || p_search || '%'
    or coalesce(u.raw_user_meta_data ->> 'name', '') ilike '%' || p_search || '%'
    or coalesce(u.email, '') ilike '%' || p_search || '%'
    or coalesce(c.subject_snapshot -> 'subject' ->> 'displayName', '') ilike '%' || p_search || '%'
  order by c.updated_at desc nulls last
  limit greatest(1, least(coalesce(p_limit, 25), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_consultations(text, int, int) from public;
grant execute on function public.admin_list_consultations(text, int, int) to authenticated;

drop function if exists public.admin_get_consultation(uuid);
create or replace function public.admin_get_consultation(p_conversation_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'conversation_id', c.id,
    'user_id', c.user_id,
    'user_display_name', coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      nullif(u.raw_user_meta_data ->> 'nickname', '')
    ),
    'subject_label', (c.subject_snapshot -> 'subject' ->> 'displayName'),
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'has_summary', (c.summary is not null),
    'message_count',
      (select count(*) from public.conversation_messages m where m.conversation_id = c.id),
    'messages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'seq', m.seq,
          'role', m.role,
          'length', char_length(coalesce(m.content, ''))
        )
        order by m.seq asc
      )
      from public.conversation_messages m
      where m.conversation_id = c.id
    ), '[]'::jsonb)
  )
  into result
  from public.conversations c
  left join auth.users u on u.id = c.user_id
  where c.id = p_conversation_id;

  return result; -- null when the conversation id does not exist
end;
$$;

revoke all on function public.admin_get_consultation(uuid) from public;
grant execute on function public.admin_get_consultation(uuid) to authenticated;

-- ── 4. admin_dashboard_overview (ADMIN_04) ──────────────────────────────────────────────────
drop function if exists public.admin_dashboard_overview();
create or replace function public.admin_dashboard_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'user_count', (select count(*) from auth.users),
    'subject_count', (select count(*) from public.consultation_subjects),
    'conversation_count', (select count(*) from public.conversations),
    'conversation_today',
      (select count(*) from public.conversations
        where created_at >= date_trunc('day', now())),
    'ai_request_count', (select count(*) from public.ai_usage_logs),
    'ai_success_count',
      (select count(*) from public.ai_usage_logs where status = 'success'),
    'ai_error_count',
      (select count(*) from public.ai_usage_logs where status = 'error'),
    'ai_input_tokens',
      (select coalesce(sum(input_tokens), 0) from public.ai_usage_logs),
    'ai_output_tokens',
      (select coalesce(sum(output_tokens), 0) from public.ai_usage_logs),
    'ai_today_request_count',
      (select count(*) from public.ai_usage_logs
        where created_at >= date_trunc('day', now()))
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_overview() from public;
grant execute on function public.admin_dashboard_overview() to authenticated;

-- ── 5. admin_list_ai_usage — FINAL signature only (ADMIN_04 + ADMIN_04_UPDATE) ──────────────
-- RULE 2 in action. The 2-arg form shipped first and the 3-arg form superseded it; dropping
-- BOTH signatures before creating the final one guarantees exactly one overload no matter
-- which of the two an environment already had. Leaving the 2-arg behind would make
-- `rpc('admin_list_ai_usage', {p_limit, p_offset})` ambiguous.
drop function if exists public.admin_list_ai_usage(int, int);
drop function if exists public.admin_list_ai_usage(int, int, text);
create or replace function public.admin_list_ai_usage(
  p_limit        int  default 50,
  p_offset       int  default 0,
  p_request_type text default null
)
returns table (
  id            bigint,
  created_at    timestamptz,
  user_id       uuid,
  model         text,
  request_type  text,
  status        text,
  error_code    text,
  input_tokens  int,
  output_tokens int,
  total_tokens  int,
  latency_ms    int
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
    l.id, l.created_at, l.user_id, l.model, l.request_type, l.status,
    l.error_code, l.input_tokens, l.output_tokens, l.total_tokens, l.latency_ms
  from public.ai_usage_logs l
  where p_request_type is null or l.request_type = p_request_type
  order by l.created_at desc, l.id desc
  limit greatest(1, least(coalesce(p_limit, 50), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_ai_usage(int, int, text) from public;
grant execute on function public.admin_list_ai_usage(int, int, text) to authenticated;

-- ============================================================================
-- NO SEED. Granting admin stays a deliberate human action, per environment:
--   insert into public.admin_users (user_id, role, created_by)
--   values ('<USER_UUID>', 'admin', '<USER_UUID>');
-- Until someone is in the allowlist every RPC above raises 'not authorized' — the intended
-- fail-closed pre-grant state.
-- ============================================================================
