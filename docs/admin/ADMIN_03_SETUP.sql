-- =============================================================================
-- DeokbunAI — Admin Consultation Monitoring (ADMIN-03)
-- =============================================================================
-- PROPOSAL ONLY. Apply manually in the Supabase SQL Editor AFTER ADMIN-01
-- (admin_users + is_admin) is applied. Independent of ADMIN-02.
--
-- Two SECURITY DEFINER RPCs, gated by public.is_admin(), for read-only
-- consultation monitoring. PII-MINIMAL BY DESIGN: message CONTENT and summary
-- TEXT are NEVER returned — only metadata (role, char length, order, counts,
-- timestamps, subject label). No service_role in the client; no RLS widened.
--
-- Real sources/columns (verified against app code, no assumptions):
--   public.conversations(id, user_id, created_at, updated_at, summary jsonb/text,
--                        subject_snapshot jsonb)
--   public.conversation_messages(conversation_id, role, content, seq)
--   auth.users (display_name derived from raw_user_meta_data; server-side only)
-- =============================================================================

begin;

-- 1) admin_list_consultations: paginated conversation metadata. ----------------
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

-- 2) admin_get_consultation: one conversation's metadata + message metadata. ---
--    Messages expose ONLY { seq, role, length } — never content. Summary is
--    reported as a boolean (has_summary), never its text.
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

commit;

-- =============================================================================
-- After applying: reload the web /admin/consultations screen (as an admin user).
--   - Non-admins get "not authorized" (fail-closed).
--   - No message content / summary text leaves the database.
-- =============================================================================
