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
-- Depends on existing tables: public.profiles(id, display_name),
-- public.consultation_subjects(user_id, ...), public.conversations(user_id, ...),
-- and auth.users (accessed only inside these definer functions, never the client).
-- =============================================================================

-- 1) admin_list_users: paginated user overview with per-user counts. -----------
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
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    u.id,
    p.display_name,
    u.created_at,
    (select count(*) from public.consultation_subjects s where s.user_id = u.id),
    (select count(*) from public.conversations c where c.user_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  where
    p_search is null
    or p.display_name ilike '%' || p_search || '%'
    or u.email ilike '%' || p_search || '%'
  order by u.created_at desc nulls last
  limit greatest(1, least(coalesce(p_limit, 25), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_users(text, int, int) from public;
grant execute on function public.admin_list_users(text, int, int) to authenticated;

-- 2) admin_get_user: one user's profile + curated subject summaries. -----------
--    Returns jsonb. Subjects include the raw birth_info object; the APP renders
--    only curated fields (never a raw JSON dump).
create or replace function public.admin_get_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
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
    'display_name', p.display_name,
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
          'birth_info', s.birth_info,
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
  left join public.profiles p on p.id = u.id
  where u.id = p_user_id;

  return result; -- null when the user id does not exist
end;
$$;

revoke all on function public.admin_get_user(uuid) from public;
grant execute on function public.admin_get_user(uuid) to authenticated;

-- =============================================================================
-- After applying: reload the web /admin/users screen (as an admin user).
--   - Non-admins calling these RPCs get "not authorized" (fail-closed).
--   - No table RLS was widened; raw cross-user tables remain owner-only.
-- =============================================================================
