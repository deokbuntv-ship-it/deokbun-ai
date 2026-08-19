-- Signup-first onboarding: required-consent facts on the app-owned profiles row (§17/§20/§21).
-- ADDITIVE + idempotent. RLS is unchanged: profiles is already owner-scoped (auth.uid() = id), so these
-- columns inherit the same per-user isolation — no policy change, no broadening.
--
-- All columns are nullable / defaulted, so every existing profile row stays valid. A null terms_version
-- means "has not accepted the CURRENT required terms" → the user is routed through the terms step exactly
-- once (existing beta members accept the new terms, but never re-enter their birth profile).
--
-- OWNER_APPLY: this migration is NOT pushed by the implementation sprint. Until it is applied, the client
-- degrades safely (routes to the terms step; terms save surfaces a retry) — it never crashes.

alter table public.profiles
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists marketing_opt_in_at timestamptz;

comment on column public.profiles.terms_version is 'Required-terms version the user last accepted (see features/onboarding/terms.ts TERMS_VERSION). Null = not accepted → onboarding routes to terms.';
comment on column public.profiles.marketing_opt_in is 'Optional marketing consent. Never pre-checked; genuinely optional (§19).';
