-- ============================================================================
-- DeokbunAI — consultation_reports (Commercial UX V4 §29). Report saved to 우편함 > 보고서.
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Idempotent + additive + owner-only RLS.
--
-- Conversation-level artifact built DETERMINISTICALLY from the conversation's validated structured
-- answers + stored summary (buildConsultationReport — ZERO extra LLM calls, §65). One report per
-- conversation (unique) → regenerate = UPDATE (idempotency §37). report_payload stores only the
-- composed, user-facing sections (title/summary/keyFindings/cautions/coveredTopics) — NEVER raw
-- prompt / grounding / engine payload / birth data (privacy §50/§56).
--
-- SECURITY (§77): owner-only RLS. There is NO broad "authenticated can read reports" policy. A shared
-- report is delivered ONLY through a future SECURITY DEFINER RPC that validates an explicit share
-- grant (that path is deferred — see docs/COMMERCIAL_CONSULTATION_UX_V4.md).
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.consultation_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  title           text not null,
  report_payload  jsonb not null,               -- deterministic composed report (no raw internals)
  status          text not null default 'ready', -- ready | failed (V1 is synchronous/deterministic)
  report_version  int  not null default 1,
  model           text,                          -- null for the deterministic path
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- One report per conversation → regenerate overwrites (idempotency §37).
create unique index if not exists consultation_reports_owner_conversation_uniq
  on public.consultation_reports (user_id, conversation_id) where (conversation_id is not null);
create index if not exists consultation_reports_user_id_idx on public.consultation_reports (user_id);

drop trigger if exists consultation_reports_set_updated_at on public.consultation_reports;
create trigger consultation_reports_set_updated_at before update on public.consultation_reports
  for each row execute function public.set_updated_at();

-- RLS: owner-only CRUD (user_id = auth.uid()). No anonymous / cross-user access.
alter table public.consultation_reports enable row level security;
drop policy if exists reports_all_own on public.consultation_reports;
create policy reports_all_own on public.consultation_reports
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- ============================================================================
