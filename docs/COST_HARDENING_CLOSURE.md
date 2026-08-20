# 덕분이 V1.0 — Cost / Server-Authority Hardening

This file records the Closure A architecture now present in the repository. It does not claim remote
deployment: the migration and Edge function still require owner-controlled rollout and live verification.

## Canonical Today / Monthly generation

- The authenticated Edge derives user, canonical `consultation_subjects.is_self`, server civil day/month,
  server tier (`FREE` today), and semantic version.
- A DB-clock lease covers that full identity. PostgreSQL generates the owner token; only the current,
  unexpired token can persist/complete or release it. A stale lease is atomically reclaimable.
- The lease RPC rechecks canonical persistence before granting a new lease. A live loser rechecks once and
  receives the canonical row or `GENERATION_IN_PROGRESS`; it never deletes or generates.
- Edge completion persists `daily_fortunes` / `monthly_fortunes` in the token-checked transaction before
  success. The official clients only read canonical rows and never claim or upsert.

## Paid-work reservation

`reserve_paid_work` uses a per-user transaction advisory lock and DB clock to serialize the rolling-window
count and insert. It covers `chat`, `today_fortune`, and `monthly_fortune`; compatibility and summary reserve
through the `chat` workload. Rejection, RPC failure, null result, or canonical-cache read failure all stop
before LLM work. Existing canonical Today/Monthly reads use zero reservation and zero LLM.

## Request idempotency

`paid_request_idempotency` is keyed by `(user_id, workload, request_id)` for consultation, compatibility,
and summary. A completed key returns the stored response; a live processing key returns
`REQUEST_IN_PROGRESS`; an expired processing lease is reclaimable. The normal chat retry keeps its original
request ID, so a lost response can be recovered without another LLM call.

## Server authorization

Before paid work, Edge verifies the current required `profiles.terms_version` and resolves the one owned
canonical SELF row. Normal client `birthInput`, `subjectLabel`, and `subjectProfileId` cannot replace SELF.
Compatibility resolves an owned target ID server-side or accepts only an explicitly marked `RAW_UNSAVED`
target. Input and body limits are enforced before grounding or LLM work.

## Notification account scope

Unread state stores `{ ownerUserId, count }`; rendering shows zero on an owner mismatch, and request tokens
prevent stale async results from crossing an account switch.

## Required owner verification

- `MIGRATION_REQUIRED = YES`: `20260827000000_fortune_generation_claims.sql` was revised before deployment.
- `EDGE_DEPLOY_REQUIRED = YES`: `supabase/functions/chat/index.ts` and its generated `serverBundle.mjs` changed.
- Real concurrent PostgreSQL transactions and the deployed Deno/Supabase runtime remain owner E2E because
  this workspace has neither Supabase CLI nor Docker/Postgres.
- Verify Today and Monthly with two tabs/devices, direct-JWT onboarding/SELF bypass attempts, 100 parallel
  reservation attempts, response-loss retry, compatibility owned/raw target behavior, and A→B unread state.

No database push, Edge deploy, remote mutation, or git push was performed by this remediation.
