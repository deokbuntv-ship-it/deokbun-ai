-- ============================================================================
-- DeokbunAI — SERVER-OWNED consultation decision store (Sprint E.1 BLOCKER 1 / §1-§4).
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- This sprint does not deploy or apply it. Additive + idempotent (create-if-not-exists).
--
-- WHY — the live follow-up path ("왜?" / "그럼 내년은?" / "둘 중에는?") needs the PREVIOUS decision's
-- authoritative polarity / target / version / evidence. Sprint E read it from
-- conversation_messages.structured_result.decisionMeta — but that row is written by the CLIENT (RLS lets a
-- user insert assistant messages into their own conversation), so a modified client could FORGE the polarity,
-- domain, target set, or versions and steer the next server turn. That is the release BLOCKER.
--
-- FIX — a decision store that ONLY the service-role Edge writes. The authoritative decisionMeta is persisted
-- here by the Edge AFTER safety + output validation + acceptance. RLS grants owners READ of their own rows
-- (transparency) and defines NO insert/update/delete policy, so anon/authenticated clients CANNOT write or
-- alter a decision — the service role bypasses RLS for the Edge write. The follow-up loader reads the latest
-- row for (conversation_id, user_id) from THIS table, never from client-written message rows.
--
-- Stores ONLY the server-produced decision/audit JSON (versions, resolved granularity/targets, polarity,
-- domain, comparison context, a minimal deterministic evidence snapshot, resolved temporal context). It
-- stores NO prompt text, NO question, NO answer prose, NO birth data, NO keys/JWT.
-- ============================================================================

create table if not exists public.consultation_decisions (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  workload         text not null,
  request_id       text not null,
  -- The server-produced ConsultationDecisionMeta (validated by parseDecisionMeta on read). Server-owned.
  decision_meta    jsonb not null,
  -- Denormalized audit scalars (also inside decision_meta) — cheap to index / eyeball without opening JSON.
  answer_plan_version    text,
  decision_policy_version text,
  engine_version   text,
  model_id         text,
  created_at       timestamptz not null default now()
);

-- A composite parent key makes the ownership invariant a DB constraint, not merely an Edge query filter.
create unique index if not exists conversations_id_user_id_uniq
  on public.conversations (id, user_id);
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'consultation_decisions_conversation_owner_fk'
  ) then
    alter table public.consultation_decisions
      add constraint consultation_decisions_conversation_owner_fk
      foreign key (conversation_id, user_id)
      references public.conversations (id, user_id) on delete cascade;
  end if;
end
$$;

-- Latest-per-conversation lookup (the follow-up loader orders by created_at desc, limit 1).
create index if not exists consultation_decisions_conv_latest_idx
  on public.consultation_decisions (conversation_id, created_at desc);
create index if not exists consultation_decisions_owner_latest_idx
  on public.consultation_decisions (conversation_id, user_id, created_at desc, id desc);
create index if not exists consultation_decisions_user_idx
  on public.consultation_decisions (user_id);
create unique index if not exists consultation_decisions_request_uniq
  on public.consultation_decisions (user_id, workload, request_id);

-- ============================================================================
-- ROW-LEVEL SECURITY — the trust boundary. Owners may READ their own decisions; NO client write path exists.
-- The service-role Edge (which bypasses RLS) is the ONLY writer. Idempotent (drop-if-exists + create).
-- ============================================================================
alter table public.consultation_decisions enable row level security;

-- Owner-scoped READ only. A cross-user row is invisible (returns no row), so a decision never leaks.
drop policy if exists consultation_decisions_select_own on public.consultation_decisions;
create policy consultation_decisions_select_own on public.consultation_decisions
  for select using (user_id = auth.uid());

-- INTENTIONALLY NO insert / update / delete policy: with RLS enabled and no such policy, every
-- anon/authenticated write is denied. Only the service role (Edge) can insert — it cannot be forged from a
-- client. Do NOT add a client write policy; that would reopen the BLOCKER.

-- Atomically closes the paid idempotency row and persists the accepted server decision. If ownership,
-- lease completion, or INSERT fails, PostgreSQL rolls back the whole call: no delivered-without-state and
-- no ghost decision. Service-role only; the Edge also verifies ownership before any paid work.
create or replace function public.complete_consultation_request_with_decision(
  p_user_id uuid,
  p_workload text,
  p_request_id text,
  p_lease_token uuid,
  p_response_json jsonb,
  p_conversation_id uuid,
  p_decision_meta jsonb,
  p_answer_plan_version text,
  p_decision_policy_version text,
  p_engine_version text,
  p_model_id text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_completed boolean;
  v_decision_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id and c.user_id = p_user_id
  ) then
    raise exception 'conversation owner mismatch' using errcode = '42501';
  end if;

  v_completed := public.complete_paid_request(
    p_user_id, p_workload, p_request_id, p_lease_token, p_response_json
  );
  if not v_completed then
    return null;
  end if;

  insert into public.consultation_decisions (
    conversation_id, user_id, workload, request_id, decision_meta,
    answer_plan_version, decision_policy_version, engine_version, model_id
  ) values (
    p_conversation_id, p_user_id, p_workload, p_request_id, p_decision_meta,
    p_answer_plan_version, p_decision_policy_version, p_engine_version, p_model_id
  )
  returning id into v_decision_id;
  return v_decision_id;
end;
$$;

revoke all on function public.complete_consultation_request_with_decision(
  uuid,text,text,uuid,jsonb,uuid,jsonb,text,text,text,text
) from public, anon, authenticated;
grant execute on function public.complete_consultation_request_with_decision(
  uuid,text,text,uuid,jsonb,uuid,jsonb,text,text,text,text
) to service_role;
