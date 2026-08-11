-- =============================================================================
-- DeokbunAI — fortune_mail DELIVERY tracking columns  (ARTIFACT — owner-apply)
-- =============================================================================
-- Adds provider-neutral DELIVERY tracking to the existing public.fortune_mail
-- table (docs/FORTUNE_MAIL_SETUP.sql), matching the app delivery contract in
-- src/features/fortune/domain/fortuneJobs.ts (FortuneDeliveryJob). The generation
-- lifecycle (status/model/tokens/scheduled_at/sent_at) already lives in
-- fortune_mail; this only adds the channel + provider bookkeeping.
--
-- ⚠️ ARTIFACT ONLY — NOT applied automatically. Additive + idempotent +
-- non-destructive (all columns nullable; existing rows unaffected). No DROP /
-- TRUNCATE / DELETE. Apply only after reconciling with the live DB.
--
-- No delivery provider (push/email) is chosen for V1 — these columns stay null
-- until a provider is connected. The app reports not_configured /
-- provider_not_connected truthfully; it never writes a fake 'sent'.
-- =============================================================================

alter table public.fortune_mail
  add column if not exists delivery_channel     text
    check (delivery_channel in ('push','email','in_app')),
  add column if not exists provider_message_id  text,     -- set only by a real provider send
  add column if not exists delivery_retry_count integer not null default 0,
  add column if not exists delivery_error_code  text,
  add column if not exists cached_input_tokens  integer;  -- for cost separation (analysis.computeCost)

-- Lookup by delivery channel (e.g. "all push mails pending send").
create index if not exists fortune_mail_delivery_channel_idx
  on public.fortune_mail (delivery_channel);

-- NOTE (idempotency, already in FORTUNE_MAIL_SETUP.sql): the UNIQUE(idempotency_key)
-- constraint guards duplicate GENERATION. Duplicate SEND is guarded in-app by
-- canSendDelivery() (only a 'scheduled', ready, not-already-sent job may send);
-- once status='sent' + provider_message_id is set, re-send is rejected.
-- =============================================================================
