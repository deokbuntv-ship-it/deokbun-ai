# Owner Actions — Release Readiness (2026-08-29)

Everything Claude could verify/fix directly has been done this batch (see the product-integration-readiness
report). This file lists only what genuinely needs the owner. For the full standing list (OAuth consoles,
push/email credentials, store setup, legal review, production promotion), see `docs/DEOKBUNI_V1_STATE.md` —
unchanged by this batch except for the one new item below.

## New this batch

1. **Review + apply migration `20260846000000_fix_reservation_release_reuse.sql`, together with its paired
   TypeScript fix already in `supabase/functions/chat/index.ts` (committed, NOT deployed).** Fixes a real
   billing-correctness bug pair found during this audit: a guard-rejected non-answer was still committing a
   full charge, and a released reservation could be silently resumed as a free consultation. Written and
   locally verified (source-assertion tests, `migration-preflight.mjs` clean, ordering correct); not applied
   to staging and not deployed, by design — this repo's own convention (see the header of every prior Duk
   migration) is that billing-schema changes get an owner-gated staging validation pass before going live,
   the same way `20260837`/`20260838`/etc. were each their own reviewed "Activation." Applying it needs: (a)
   a rolled-back DB-integration smoke on staging (mirrors how `20260837`'s fix was verified), (b)
   `node supabase/functions/chat/_server/build.mjs` + `supabase functions deploy chat --project-ref
   aephpsiurgkvqcswyeie` from a worktree synced to this commit (the existing staging-linked worktree at
   `C:\Development\DeokbunAI-staging-activation` is on an older checkout and needs updating first).

## Still open (unchanged from `DEOKBUNI_V1_STATE.md`, re-confirmed this batch)

2. **Staging OAuth provider consoles** — still the reason a full live AUTH→consultation→DUK→follow-up
   smoke through the real app can't be run (by Claude or otherwise) right now; re-confirmed blocking this
   batch's staging-E2E attempt exactly as documented. Google OAuth on staging remains the single smallest
   unlock.
3. Everything else on the standing list (EAS build, push/email credentials, icon/splash, legal review,
   Sentry, production promotion) — unchanged, not touched this batch.
