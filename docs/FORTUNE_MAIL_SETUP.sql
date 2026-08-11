-- =============================================================================
-- DeokbunAI — FORTUNE MAIL table + idempotency + RLS  (ARTIFACT — owner-apply)
-- =============================================================================
-- Backs the fortune-mail generation pipeline. Aligned to the app domain in
-- src/features/fortune/domain/fortuneDomain.ts (FortuneMailStatus + the
-- deterministic fortuneIdempotencyKey) and the admin seam
-- src/features/admin/services/adminFortuneMailService.ts.
--
-- ⚠️ ARTIFACT ONLY — do NOT apply blindly. No fortune_mail table exists yet, so
-- this is safe to create fresh; still reconcile with any live schema first.
-- Idempotent (IF NOT EXISTS). Never applied automatically. Never generates
-- fortune content (제3조).
--
-- IDEMPOTENCY: `idempotency_key` mirrors fortuneIdempotencyKey(user,subject,type,
-- period) → a UNIQUE index prevents duplicate generation for the same
-- (user, subject, fortune_type, period).
-- =============================================================================

create table if not exists public.fortune_mail (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id       uuid references public.consultation_subjects (id) on delete set null,
  fortune_type     text not null check (fortune_type in ('weekly', 'monthly', 'yearly', 'special')),
  -- canonical period token: 2026-08 (monthly) / 2026-W33 (weekly) / 2026 (yearly) / special:<tag>
  period_token     text not null,
  idempotency_key  text not null,
  status           text not null default 'pending'
                     check (status in ('pending','generating','generated','scheduled',
                                       'sent','generation_failed','delivery_failed','cancelled')),
  title            text,
  summary          text,
  content          text,
  schema_version   text,
  model            text,
  prompt_version   text,
  input_tokens     integer,
  output_tokens    integer,
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  error_code       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Duplicate-generation guard (the core idempotency constraint).
create unique index if not exists fortune_mail_idempotency_key_uniq
  on public.fortune_mail (idempotency_key);
create index if not exists fortune_mail_user_id_idx on public.fortune_mail (user_id);
create index if not exists fortune_mail_status_idx on public.fortune_mail (status);

-- updated_at trigger (reuses public.set_updated_at from CONSUMER_CORE_SCHEMA.sql)
drop trigger if exists fortune_mail_set_updated_at on public.fortune_mail;
create trigger fortune_mail_set_updated_at before update on public.fortune_mail
  for each row execute function public.set_updated_at();

-- RLS: a user reads only their own fortune mail. Writes are performed by the
-- generation pipeline (Edge Function via service_role) — no user INSERT/UPDATE.
alter table public.fortune_mail enable row level security;
drop policy if exists fortune_mail_select_own on public.fortune_mail;
create policy fortune_mail_select_own on public.fortune_mail
  for select using (user_id = auth.uid());
-- (Admin reads go through SECURITY DEFINER RPCs gated by is_admin(), like the
--  other admin lists — no extra table policy needed here.)
-- =============================================================================
