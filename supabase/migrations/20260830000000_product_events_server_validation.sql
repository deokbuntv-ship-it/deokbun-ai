-- ============================================================================
-- DeokbunAI — Product-events SERVER-SIDE validation (Sprint F.1 §T)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Additive + safe to apply alone (it only ADDS an RPC + grant; the
-- existing direct-insert policy is left in place until STEP 2 below, so the currently-deployed client keeps
-- working). Validate in staging before production.
--
-- WHY — product_events.properties is jsonb and the write path is a CLIENT direct INSERT under an
-- insert-own RLS policy. The property allowlist is enforced only in the CLIENT (src/services/productEvents.ts),
-- so a MODIFIED authenticated client can INSERT arbitrary properties (including PII). Before monetization
-- analytics expands, enforcement must move SERVER-SIDE.
--
-- FIX — a SECURITY DEFINER RPC record_product_event() that validates the event name (snake_case, bounded),
-- surface, consultation_mode, and properties (allowlist of KEYS + scalar TYPES + length caps), then inserts as
-- auth.uid(). The client calls this RPC instead of a raw INSERT. STEP 2 (a later migration, after the
-- RPC-using client is deployed) revokes the direct-insert policy so the RPC becomes the ONLY write path.
-- Stores NO free text, NO birth data, NO names, NO email, NO raw question/answer.
-- ============================================================================

create or replace function public.record_product_event(
  p_event_name text,
  p_surface text default null,
  p_consultation_mode text default null,
  p_properties jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_surface text;
  v_mode text;
  v_props jsonb;
  -- The ONLY property keys that may be persisted (mirrors the client allowlist). No name/birth/question/
  -- answer/email/phone/token/URL key appears here.
  v_allowed text[] := array[
    'relationship_type','question_domain','compatibility_tier','policy_version','engine_version',
    'followup_category','source','channel','provider','completion_step','is_existing_user','continuation_type',
    'fortune_date','cache_status','overall_tier','fortune_month','category','deep_link_target',
    'question_key','question_category','placement','position',
    -- Duk economy / acquisition funnel (Sprint F §T/§U) — all categorical/numeric, non-PII.
    'amount','reason','bucket','duk_balance','duk_balance_at_entry','duk_shortfall','reward_duk_balance',
    'paid_duk_balance','plus_duk_balance','prior_consultation_count','days_since_signup','day_index',
    'accelerated','pack_type','duk_granted','price_krw','monthly_duk','trigger','turn_count','outcome',
    'product','session_id','action','entry','turns_used','origin'
  ];
begin
  if v_user is null then
    return; -- unauthenticated: no-op (fail-open, never an error surface for analytics)
  end if;
  -- event_name: snake_case, bounded — prevents free text / PII smuggling in the name.
  if p_event_name is null or p_event_name !~ '^[a-z][a-z0-9_]{2,79}$' then
    return;
  end if;
  -- surface: bounded categorical string (or null).
  v_surface := case when p_surface is not null and length(p_surface) between 1 and 64 then p_surface else null end;
  -- consultation_mode: strict enum (or null).
  v_mode := case when p_consultation_mode in ('solo','compatibility') then p_consultation_mode else null end;
  -- properties: keep ONLY allowed keys with a scalar value (string ≤ 64, number, or boolean).
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
    into v_props
  from jsonb_each(coalesce(p_properties, '{}'::jsonb))
  where key = any(v_allowed)
    and (
      (jsonb_typeof(value) = 'string' and length(value #>> '{}') between 1 and 64)
      or jsonb_typeof(value) = 'number'
      or jsonb_typeof(value) = 'boolean'
    );

  insert into public.product_events (user_id, event_name, surface, consultation_mode, properties)
  values (v_user, p_event_name, v_surface, v_mode, v_props);
end;
$$;

revoke all on function public.record_product_event(text, text, text, jsonb) from public, anon;
grant execute on function public.record_product_event(text, text, text, jsonb) to authenticated;

-- ============================================================================
-- STEP 2 (a LATER migration — apply ONLY after the RPC-using client is deployed to all users):
--   drop policy if exists product_events_insert_own on public.product_events;
-- This removes the client's direct-INSERT path, making record_product_event the ONLY writer and completing the
-- server-side enforcement. Do NOT include it here — it would break the currently-deployed direct-insert client.
-- ============================================================================
