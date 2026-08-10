-- =============================================================================
-- DeokbunAI — Famous AI Suggestion Provenance (P0-6)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor AFTER ADMIN-05 (famous_profiles).
--
-- Stores provenance/history of AI-generated Famous profile/SEO suggestions written
-- by the famous-suggest Edge Function (service_role, server-side). Admin-only read
-- via RLS. OPTIONAL: the famous-suggest function works without this table (it writes
-- best-effort); applying it enables suggestion history/audit.
--
-- No fabricated data. Suggestions are proposals only; operator applies them by hand.
-- =============================================================================

begin;

create table if not exists public.famous_ai_suggestions (
  id             uuid primary key default gen_random_uuid(),
  famous_id      uuid references public.famous_profiles (id) on delete cascade,
  suggestion     jsonb not null,
  provider       text,
  model          text,
  workload       text,
  prompt_version text,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now()
);

create index if not exists famous_ai_suggestions_famous_idx
  on public.famous_ai_suggestions (famous_id, created_at desc);

alter table public.famous_ai_suggestions enable row level security;
drop policy if exists "famous_ai_suggestions admin all" on public.famous_ai_suggestions;
create policy "famous_ai_suggestions admin all" on public.famous_ai_suggestions
  for all using (public.is_admin()) with check (public.is_admin());

commit;

-- =============================================================================
-- After applying: famous-suggest records each suggestion for audit. Admin-only.
-- =============================================================================
