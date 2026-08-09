-- =============================================================================
-- DeokbunAI — Admin Authorization Setup (ADMIN-01)
-- =============================================================================
-- PROPOSAL ONLY. Do NOT run automatically. Apply manually in the Supabase SQL
-- Editor (project owner / service_role context) AFTER CTO review.
--
-- Until this is applied, the app's admin authorization check (public.is_admin())
-- does not exist, so the client resolves to 'unavailable' and the admin UI stays
-- FAIL-CLOSED (no access). That is the intended pre-apply state.
--
-- Model: a dedicated `admin_users` allowlist + a SECURITY DEFINER `is_admin()`
-- helper the app calls via supabase.rpc('is_admin'). The client never reads the
-- table directly and never uses the service_role key.
-- =============================================================================

-- 1) Admin allowlist ----------------------------------------------------------
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'admin',
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id)
);

-- 2) RLS: defense-in-depth. The app does NOT read this table directly (it calls
--    is_admin()), but enable RLS and allow a user to read ONLY their own row.
--    No client INSERT/UPDATE/DELETE — membership is managed via SQL editor /
--    service_role only.
alter table public.admin_users enable row level security;

drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

-- 3) is_admin(): boolean over the CALLER's auth.uid(). SECURITY DEFINER so it can
--    evaluate membership regardless of the caller's RLS; search_path pinned.
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

-- 4) Execution grants: only authenticated users may call it; revoke the rest.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- =============================================================================
-- Granting admin (run once per admin, in the SQL Editor):
--   1. Find the user's UUID:
--        select id, email from auth.users where email = 'operator@example.com';
--   2. Insert into the allowlist:
--        insert into public.admin_users (user_id, role, created_by)
--        values ('<USER_UUID>', 'admin', '<USER_UUID>');
--
-- Revoking admin:
--        delete from public.admin_users where user_id = '<USER_UUID>';
-- =============================================================================
