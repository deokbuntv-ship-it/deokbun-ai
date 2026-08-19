-- ============================================================================
-- DeokbunAI — Consultation feedback persistence (solo + 궁합)
--
-- OWNER_APPLY_REQUIRED — DO NOT auto-apply. Apply via the Supabase migration flow.
-- Additive + idempotent. This sprint does not deploy or apply it (NO db push).
--
-- PURPOSE — the "도움이 됐어요 / 아쉬웠어요" control existed as an HONEST SEAM (no write path,
-- so it never faked "저장됨"). This adds ONE generic feedback table used by BOTH solo and
-- compatibility (no compatibility-only table). Feedback is a SIGNAL for offline analysis —
-- it NEVER mutates an engine rule or assessment.
--
-- PRIVACY (§28) — NO raw question/answer, NO name/birth/email/phone. Only: which assistant
-- MESSAGE (client_message_id), the verdict, an optional bounded reason code, and version tags.
--
-- IDEMPOTENCY (§30) — unique (user_id, message_id): re-voting (👍→👎) UPDATES the row, never
-- creates junk duplicates.
--
-- RLS (§29) — owner-only; INSERT additionally requires the referenced conversation to belong to
-- the caller (composite ownership, like report_shares). anon has no access.
-- ============================================================================

create table if not exists public.consultation_feedback (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conversation_id   uuid references public.conversations (id) on delete cascade,
  message_id        text not null,                 -- the assistant message's client_message_id
  consultation_mode text,                          -- 'solo' | 'compatibility' | null
  verdict           text not null check (verdict in ('helpful', 'not_helpful')),
  reason_code       text,                          -- optional bounded reason (nullable)
  policy_version    text,
  engine_version    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- One feedback row per (user, assistant message) — the upsert conflict target for re-votes.
create unique index if not exists consultation_feedback_user_message_uniq
  on public.consultation_feedback (user_id, message_id);
create index if not exists consultation_feedback_conversation_idx
  on public.consultation_feedback (conversation_id);

drop trigger if exists consultation_feedback_set_updated_at on public.consultation_feedback;
create trigger consultation_feedback_set_updated_at before update on public.consultation_feedback
  for each row execute function public.set_updated_at();

-- ---- RLS (owner-only; INSERT also requires owned conversation) ------------------
alter table public.consultation_feedback enable row level security;
alter table public.consultation_feedback force row level security;

drop policy if exists consultation_feedback_select_own on public.consultation_feedback;
create policy consultation_feedback_select_own on public.consultation_feedback
  for select using (user_id = auth.uid());

drop policy if exists consultation_feedback_insert_own on public.consultation_feedback;
create policy consultation_feedback_insert_own on public.consultation_feedback
  for insert with check (
    user_id = auth.uid()
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = conversation_id and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists consultation_feedback_update_own on public.consultation_feedback;
create policy consultation_feedback_update_own on public.consultation_feedback
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
