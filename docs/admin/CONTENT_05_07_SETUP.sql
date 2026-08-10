-- =============================================================================
-- DeokbunAI — Channel Connections (CONTENT-05) + Scheduling (CONTENT-07)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER PUBLICATION_SETUP.sql.
--
-- CONTENT-05 (Instagram) and CONTENT-07 (scheduling) both build on the existing
-- public.content_publications table (channel/status/scheduled_at/idempotency_key).
-- This file adds ONLY the channel connection STATUS table.
--
-- SECURITY — TOKENS ARE NOT STORED HERE. provider_connections holds connection
-- STATUS + non-sensitive account metadata that the admin UI may read. OAuth access
-- tokens (when Instagram/Meta is later set up) must live SERVER-SIDE ONLY (Supabase
-- Function secrets or a service-role-only table with NO client policies) and must
-- never be selectable by the client. Do not add a token column to this table.
-- =============================================================================

begin;

create table if not exists public.provider_connections (
  id                    uuid primary key default gen_random_uuid(),
  channel               text not null unique,          -- instagram|youtube|...
  status                text not null default 'not_connected', -- not_connected|connected|expired|error
  external_account_id   text,
  external_account_name text,
  connected_at          timestamptz,
  metadata              jsonb not null default '{}'::jsonb,
  updated_at            timestamptz not null default now()
);

create or replace function public.provider_connections_touch()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists provider_connections_touch_trg on public.provider_connections;
create trigger provider_connections_touch_trg
  before update on public.provider_connections
  for each row execute function public.provider_connections_touch();

alter table public.provider_connections enable row level security;
drop policy if exists "provider_connections admin all" on public.provider_connections;
create policy "provider_connections admin all" on public.provider_connections
  for all using (public.is_admin()) with check (public.is_admin());

commit;

-- =============================================================================
-- USER ACTION (later, when enabling real Instagram publishing):
--   - Create a Meta App (Business), connect an Instagram Professional account to a
--     Facebook Page, request instagram_basic + instagram_content_publish, and pass
--     Meta App Review (2-4 weeks). Store the App secret + access token as SERVER
--     secrets (never in provider_connections / never EXPO_PUBLIC_*).
--   - Publishing is a 2-step Graph API call: create media container → media_publish.
-- CONTENT-07 scheduling execution (pg_cron → scheduled Edge invocation) is a
-- separate DEPLOY_REQUIRED action and must not auto-publish externally without
-- explicit owner approval.
-- =============================================================================
