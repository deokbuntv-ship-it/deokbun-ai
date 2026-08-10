# Scheduler / automated publishing — design (CONTENT-07, §30–32)

Status: **persistence done, execution intentionally NOT built** (owner approval +
deploy required). This documents the executor design so it can be implemented
safely once the owner authorizes automatic external publishing.

## What exists today (safe, no auto-publish)
- `content_publications` persists schedules: `status` (draft→scheduled→queued→
  processing→published/failed/cancelled), `scheduled_at`, `timezone`,
  `attempt_count`, `last_error`, `external_id`, `published_at`, `idempotency_key`,
  `provider`. Admin-only RLS.
- Admins set a schedule from the content Publication panel (`status='scheduled'`).
- **Nothing executes automatically.** No cron, no worker.

## Why not built yet
§32: external auto-publish must be **fail-closed** until the owner explicitly
approves it, AND every channel needs a real integration (Naver = manual only;
Instagram = OAuth + App Review pending). Building an executor now would either do
nothing (no channel can auto-publish) or risk premature external posting. So this
stays a documented design, not inert code.

## Executor design (implement after owner approval)
1. **Trigger:** Supabase `pg_cron` (every N minutes) → invokes a `scheduler-run`
   Edge Function (server-side; USER ACTION to create the cron + deploy the edge).
2. **Due query (service_role, server-side):**
   `select … from content_publications where status='scheduled'
    and scheduled_at is not null and scheduled_at <= now()
    order by scheduled_at asc limit N`.
3. **Claim / lock (avoid double-run):** atomically transition each row
   `scheduled → queued` guarded by status, e.g.
   `update content_publications set status='queued', attempt_count=attempt_count+1
    where id=$1 and status='scheduled' returning *` — only the worker that flips the
   status proceeds (optimistic lock; safe across concurrent cron fires).
4. **Idempotency:** before any external call, require a unique `idempotency_key`;
   a provider `external_id` already present means "already published" → skip. This
   prevents duplicate posts on network/function/cron retries (§25).
5. **Gate before publish (§32):** publish ONLY if channel connection READY +
   content READY + asset READY + publication authorized. Otherwise → `failed` with
   `last_error`, no external call.
6. **Execute:** call the channel adapter (Instagram Graph 2-step, etc.). On
   success → `status='published'`, set `external_id`/`external_url`/`published_at`.
   On failure → `status='failed'`, `last_error`; **bounded** retry via a max
   `attempt_count` (no infinite retry).
7. **Observability:** reuse `ai_usage_logs`/publication rows; surface failures in
   the admin publication history (already rendered).

## USER ACTION (when approved)
- Deploy `scheduler-run` Edge Function.
- Create the pg_cron schedule (Supabase SQL/dashboard).
- Explicitly authorize auto-publish per channel.
- Provide the channel credentials (e.g. Instagram — see OWNER_ACTIONS §3E).

Until then: schedules are recorded and shown, and the operator publishes manually.
