-- ============================================================================
-- DeokbunAI — report_shares (Commercial UX V4 §16–§27). Authenticated report sharing.
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Idempotent + additive + owner-only RLS.
--
-- SECURITY MODEL:
--   * The original consultation_reports stays OWNER-ONLY (unchanged). This migration adds NO public /
--     recipient SELECT policy on consultation_reports (§16). A recipient reads ONLY through the
--     SECURITY DEFINER function get_shared_report(), which returns a BOUNDED, user-facing DTO (§27).
--   * The raw share token is NEVER stored (§17). Only its SHA-256 hash is persisted (token_hash). The
--     owner's client generates the random token, stores the hash (RLS insert), and puts the raw token in
--     the share URL only. The recipient presents the raw token to get_shared_report(), which hashes it
--     server-side and compares — so a dump of token_hash cannot be used to read a report.
--   * get_shared_report() is granted to AUTHENTICATED only (never anon): a logged-out visitor can never
--     read a shared report (§22). It validates active + not-revoked + not-expired before returning.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.report_shares (
  id             uuid primary key default gen_random_uuid(),
  report_id      uuid not null references public.consultation_reports (id) on delete cascade,
  owner_user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  token_hash     text not null,                       -- SHA-256 hex of the raw token. NEVER the raw token.
  channel        text,                                -- link | email | kakao (how it was shared; acquisition seam)
  status         text not null default 'active',      -- active | revoked
  opened_count   int  not null default 0,             -- PII-free open counter (acquisition seam)
  last_opened_at timestamptz,
  expires_at     timestamptz not null default (now() + interval '30 days'),  -- §19 sensible default
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  revoked_at     timestamptz
);

create unique index if not exists report_shares_token_hash_uniq on public.report_shares (token_hash);
create index if not exists report_shares_report_idx on public.report_shares (report_id);
create index if not exists report_shares_owner_idx  on public.report_shares (owner_user_id);

drop trigger if exists report_shares_set_updated_at on public.report_shares;
create trigger report_shares_set_updated_at before update on public.report_shares
  for each row execute function public.set_updated_at();

-- RLS: owner-only management (create / list / revoke). The recipient NEVER selects this table directly —
-- they read only via get_shared_report(). Insert is additionally constrained so an owner can only share a
-- report they own (§21).
alter table public.report_shares enable row level security;
drop policy if exists report_shares_owner_all on public.report_shares;
create policy report_shares_owner_all on public.report_shares
  for all using (owner_user_id = auth.uid())
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.consultation_reports r
      where r.id = report_id and r.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- Secure recipient read (§26/§27). Authenticated-only. Hashes the presented raw token, validates an
-- ACTIVE / non-revoked / non-expired grant, and returns ONLY the bounded, user-facing report content —
-- never owner_user_id, conversation_id, grounding, raw structured result, or any account/birth data.
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.get_shared_report(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash    text;
  v_share   public.report_shares;
  v_report  public.consultation_reports;
  v_payload jsonb;
begin
  -- §22 — a recipient MUST be authenticated. No anonymous read.
  if auth.uid() is null then
    return null;
  end if;
  -- Defensive: a token must be present + long enough to be a real 24-byte hex token.
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
    return null;  -- invalid / revoked / expired / nonexistent → indistinguishable "unavailable" (§41)
  end if;

  select * into v_report from public.consultation_reports where id = v_share.report_id limit 1;
  if not found then
    return null;  -- report deleted after the share was created
  end if;

  -- Best-effort open tracking — PII-free counter only (acquisition seam, §H).
  update public.report_shares
     set opened_count = opened_count + 1, last_opened_at = now()
   where id = v_share.id;

  v_payload := v_report.report_payload;

  -- BOUNDED DTO (§27): user-facing report content ONLY.
  return jsonb_build_object(
    'title',         coalesce(nullif(v_payload->>'title', ''), v_report.title),
    'generatedAt',   v_payload->>'generatedAt',
    'summary',       coalesce(v_payload->>'summary', ''),
    'keyFindings',   coalesce(v_payload->'keyFindings',   '[]'::jsonb),
    'cautions',      coalesce(v_payload->'cautions',      '[]'::jsonb),
    'coveredTopics', coalesce(v_payload->'coveredTopics', '[]'::jsonb)
  );
end;
$$;

-- Authenticated recipients only — NEVER anon (§22).
revoke all on function public.get_shared_report(text) from public;
revoke all on function public.get_shared_report(text) from anon;
grant execute on function public.get_shared_report(text) to authenticated;
-- ============================================================================
