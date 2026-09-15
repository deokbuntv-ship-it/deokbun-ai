-- RETENTION FOUNDATION (Retention sprint §19). Additive, idempotent, owner-only RLS. OWNER_APPLY — NOT pushed
-- by the sprint. Four tables that cleanly separate the retention concerns (preference / content / device /
-- delivery) so Push + Email can be layered later WITHOUT reworking product logic. No LLM, no chart/evidence,
-- no free-text transcripts. Reuses the shared public.set_updated_at() trigger.

-- 1) NOTIFICATION PREFERENCES (§4). One row per user; a preference is NOT OS permission (§4.3/§11). Service
-- notifications (monthly/birthday/schedule/service_notice) are kept SEPARATE from marketing (§4.1/§4.2); the
-- marketing flag mirrors the existing consent (profileService.marketing_opt_in) — legal wording is finalized
-- by the OWNER later. Conservative defaults: service categories on, marketing off (§4.4).
create table if not exists public.notification_preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  monthly_fortune boolean not null default true,
  birthday boolean not null default true,
  important_schedule boolean not null default true,
  service_notice boolean not null default true,
  marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();
alter table public.notification_preferences enable row level security;
drop policy if exists notification_preferences_all_own on public.notification_preferences;
create policy notification_preferences_all_own on public.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2) LIFE EVENTS (§8). A user's KNOWN, USER-CONFIRMED date (이사/면접/시험/계약…). Never auto-saved from chat
-- (§8.1) — `source` records how it was created and rows are only inserted after explicit confirmation. Minimal
-- free text: a short title only (§8.5), never a transcript. Reminders are preference-controlled (§8.6).
create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.consultation_subjects(id) on delete set null,
  title text not null,
  event_type text not null default 'OTHER'
    check (event_type in ('MOVE','INTERVIEW','EXAM','CONTRACT','TRAVEL','MEETING','OTHER')),
  event_date date not null,
  event_time time,
  timezone text not null default 'Asia/Seoul',
  status text not null default 'ACTIVE' check (status in ('ACTIVE','DONE','CANCELLED')),
  source text not null default 'manual' check (source in ('manual','chat_confirmed')),
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists life_events_owner_date on public.life_events (user_id, event_date);
drop trigger if exists set_life_events_updated_at on public.life_events;
create trigger set_life_events_updated_at
  before update on public.life_events
  for each row execute function public.set_updated_at();
alter table public.life_events enable row level security;
drop policy if exists life_events_all_own on public.life_events;
create policy life_events_all_own on public.life_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 3) PUSH DEVICES (§10). A provider-neutral device→token registry (FCM/APNs/Expo/web decided later). The token
-- is SENSITIVE operational data — never logged, never exposed cross-user (owner RLS). Multi-device (§10.4):
-- unique per (user, device_id); logout can disable the association (§10.5).
create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id text not null,
  platform text not null default 'unknown' check (platform in ('ios','android','web','unknown')),
  provider text not null default 'none' check (provider in ('none','expo','fcm','apns','webpush')),
  push_token text,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);
create index if not exists push_devices_owner_enabled on public.push_devices (user_id, enabled);
drop trigger if exists set_push_devices_updated_at on public.push_devices;
create trigger set_push_devices_updated_at
  before update on public.push_devices
  for each row execute function public.set_updated_at();
alter table public.push_devices enable row level security;
drop policy if exists push_devices_all_own on public.push_devices;
create policy push_devices_all_own on public.push_devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4) IN-APP NOTIFICATIONS (§5). The in-app retention inbox — DISTINCT from 운세우편함 (the canonical content
-- archive, §5.1/§5.5). A row is "새 콘텐츠/일정이 있음" pointing at a product destination via an ALLOWLISTED
-- deep-link target (§17), never a raw URL. `dedup_key` makes trigger creation idempotent (§3.5): one user's
-- "9월 운세 도착" can never create duplicates. No chart/evidence/free-text.
create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('monthly_fortune','birthday','important_schedule','service_notice','marketing')),
  title text not null,
  body text,
  deep_link_target text not null default 'HOME'
    check (deep_link_target in ('HOME','TODAY','MONTHLY','MAILBOX','CONSULT','COMPATIBILITY','REPORT','LIFE_EVENT')),
  deep_link_id text,
  dedup_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedup_key)
);
create index if not exists in_app_notifications_owner_recent on public.in_app_notifications (user_id, created_at desc);
create index if not exists in_app_notifications_owner_unread on public.in_app_notifications (user_id, read_at);
alter table public.in_app_notifications enable row level security;
drop policy if exists in_app_notifications_all_own on public.in_app_notifications;
create policy in_app_notifications_all_own on public.in_app_notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

comment on table public.notification_preferences is 'Per-user notification category preferences (NOT OS permission). Service categories separate from marketing.';
comment on table public.life_events is 'User-CONFIRMED known dates for reminders. Never auto-saved from chat. Minimal free text (title only).';
comment on table public.push_devices is 'Provider-neutral device/token registry. push_token is sensitive — never logged/exposed cross-user.';
comment on table public.in_app_notifications is 'In-app retention inbox (distinct from 운세우편함). Deep-links via allowlisted targets. dedup_key makes triggers idempotent.';
