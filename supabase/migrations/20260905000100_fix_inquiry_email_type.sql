-- ============================================================================
-- DeokbunAI — fix: admin_list_inquiries returned-type mismatch on `user_email`
--
-- `auth.users.email` is `character varying(255)`, not `text`. plpgsql type-checks a
-- `return query` against the declared RETURNS TABLE, so 20260905000000's version raised
--   42804  structure of query does not match function result type
--   Returned type character varying(255) does not match expected type text in column 4.
-- on every call. Caught by the staging E2E, not by review.
--
-- 20260905000000 is already applied to staging, so it is NOT edited — an applied migration is
-- a record of what ran. This file supersedes the function definition instead; both are
-- `create or replace`, so a fresh environment applying them in order lands on this one.
--
-- The ONLY change is `u.email::text`. Everything else is byte-identical to the original.
-- ============================================================================

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
    u.email::text,   -- ← the fix: varchar(255) → text
    i.category, i.message, i.contact_email, i.app_version, i.platform,
    i.status, i.answer, i.answered_at, i.created_at
  from public.support_inquiries i
  left join auth.users u on u.id = i.user_id
  where p_status is null or i.status = p_status
  order by
    case when i.status = 'ANSWERED' then 1 else 0 end,
    i.created_at asc
  limit greatest(1, least(coalesce(p_limit, 25), 200))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_inquiries(text, int, int) from public;
grant execute on function public.admin_list_inquiries(text, int, int) to authenticated;
