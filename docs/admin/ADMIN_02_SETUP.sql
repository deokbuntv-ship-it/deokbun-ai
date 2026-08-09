-- =============================================================================
-- DeokbunAI — Admin Read-Only User & Subject Operations (ADMIN-02)
-- =============================================================================
-- PROPOSAL ONLY. Do NOT run automatically. Apply manually in the Supabase SQL
-- Editor AFTER ADMIN-01 (admin_users + is_admin) is already applied.
--
-- Provides cross-user READ access for admins WITHOUT broad RLS changes and WITHOUT
-- the service_role key in the client: two SECURITY DEFINER RPCs that self-check
-- public.is_admin() and return only curated fields. Until applied, the app's
-- admin user screens surface an error state (fail-closed).
--
-- FIX (2026-08): the previous version joined public.profiles, which does NOT
-- exist in this project (error 42P01). User identity now comes from auth.users
-- only; display_name is derived from raw_user_meta_data (no profiles table is
-- created — the MVP auth architecture is unchanged).
--
-- Security hardening:
--   * SECURITY DEFINER functions pin search_path = public, pg_temp.
--   * admin_get_user returns a CURATED birth projection (only the fields the
--     ADMIN-02 UI uses) — never the raw birth_info object. No exact time
--     (birthHour/Minute), no gender, no approximateTimePeriod are exposed.
--   * Whole script runs in one transaction.
--
-- Real tables/sources used: auth.users, public.consultation_subjects
-- (user_id, display_name, relationship, is_self, birth_info jsonb, created_at,
-- updated_at), public.conversations (user_id). auth.users is accessed only inside
-- these definer functions, never by the client. birth_info stores the app's
-- BirthInfoDraft shape (top-level string keys).
--
-- display_name policy: derived from raw_user_meta_data with safe, provider-neutral
-- fallbacks (full_name -> name -> nickname), matching the app's mapSupabaseUser
-- (full_name -> name). Final fallback is NULL (the UI shows "(이름 없음)"); email
-- is intentionally NOT used as a name fallback, keeping email out of the list
-- (email remains visible in the detail view and is searchable).
-- =============================================================================

begin;

-- 1) admin_list_users: paginated user overview with per-user counts. -----------
--    Returns exactly 5 columns: user_id, display_name, created_at,
--    subject_count, conversation_count.
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

-- 2) admin_get_user: one user's profile + curated subject summaries. -----------
--    Returns jsonb. Each subject exposes ONLY the curated birth fields the UI
--    renders (data minimization at the response layer) — never raw birth_info.
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
          -- Curated birth projection: only the fields the ADMIN-02 UI uses.
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

commit;

-- =============================================================================
-- After applying: reload the web /admin/users screen (as an admin user).
--   - Non-admins calling these RPCs get "not authorized" (fail-closed).
--   - No table RLS was widened; raw cross-user tables remain owner-only.
--   - Client receives only curated birth fields (no exact time / gender / etc.).
--   - No public.profiles dependency (identity comes from auth.users).
-- =============================================================================
