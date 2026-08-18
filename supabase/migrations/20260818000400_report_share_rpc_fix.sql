-- ============================================================================
-- DeokbunAI — get_shared_report RPC fix (P0: PostgreSQL 42883 undefined_function).
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive; does NOT edit the already-applied
-- 20260818000300_report_shares.sql (which created the table + the first version of this function).
--
-- ROOT CAUSE: the function was defined with `set search_path = public, pg_temp`, but it calls
-- digest(...) — a pgcrypto function that on Supabase lives in the `extensions` schema, NOT public.
-- With `extensions` absent from the function's search_path, `digest(...)` is undefined at runtime →
-- every get_shared_report call raised SQLSTATE 42883 (undefined_function), which surfaced to the client
-- as report_share DB_ERROR {pgCode:"42883"} and rendered the generic "cannot view" screen for EVERY
-- share (even a valid, freshly created one). `encode(...)` is a pg_catalog built-in and was never the
-- problem.
--
-- FIX: recreate the function with `set search_path = public, extensions, pg_temp` so digest() resolves
-- (whether pgcrypto is installed in `extensions` — the Supabase default — or `public`). Ensure pgcrypto
-- is present. Nothing else changes: same signature, same SECURITY DEFINER, same authenticated-only grant,
-- same bounded DTO, same active/revoked/expired checks. No security is weakened.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

create or replace function public.get_shared_report(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions, pg_temp   -- <-- adds `extensions` so pgcrypto's digest() resolves
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

-- Re-assert the grants (CREATE OR REPLACE preserves them, but be explicit): authenticated only, never anon.
revoke all on function public.get_shared_report(text) from public;
revoke all on function public.get_shared_report(text) from anon;
grant execute on function public.get_shared_report(text) to authenticated;
-- ============================================================================
