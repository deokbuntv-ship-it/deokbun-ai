# DeokbunAI — Database SQL Runbook (non-developer owner)

> Single reference for which DB setup files still need to run and how to run them
> safely. Run these by pasting a file's contents into the **Supabase SQL editor**
> (Dashboard → your project → **SQL Editor** → New query → paste → **Run**). Every
> file below is **additive and safe to re-run** — none delete data. If any step
> shows an error, **STOP**, do not continue, and report the exact error message.
> Project ref: `olvkpaldrwvtexxpoaag`.

## Status labels
- **APPLIED (per your report)** — already run; do not re-run.
- **PENDING — run now** — safe to apply; a feature stays off until you do.
- **UNCERTAIN — verify** — applied "out of band", not in your run history; a quick read-only check confirms the live DB matches.
- **HOLD — feature not built yet** — do not run until the related feature ships.

## A. PENDING files (in your queue) — run in this exact order
Backward-compatible; each turns on one extra capability. Order matters (later files use columns earlier ones add).

| # | File | Why | Depends on |
|---|------|-----|-----------|
| 1 | `docs/admin/ADMIN_04_UPDATE_usage_filter.sql` | 유형 필터 on `/admin/ai-usage`. Until applied, the unfiltered list works but selecting a type errors. | ADMIN_04 (applied) |
| 2 | `docs/admin/PUBLIC_UPDATE_search_alt.sql` | `/content` search + image alt (`hero_alt`). Browsing works; the search box errors until applied. | CONTENT_ASSETS (applied) |
| 3 | `docs/admin/VIDEO_SETUP.sql` | Public video seam (`video_url`). **Run AFTER #2** — references the `hero_alt` column #2 adds. | #2 above |
| 4 | `docs/admin/IMAGE_STORAGE_SETUP.sql` | Public `content-media` storage bucket for AI images. | is_admin (applied) |
| 5 | `docs/admin/SCHEDULER_SETUP.sql` | Read-only pipeline view for `/admin/publications` (publishes nothing). | PUBLICATION (applied) |
| 6 | `docs/admin/DASHBOARD_TRENDS_SETUP.sql` | Real 30-day trend charts on `/admin` (else "unavailable", never fake zeros). | ADMIN_04 (applied) |

**Pre-check (each file):** the top comment says "idempotent / re-runnable"; none contain `drop table`/`delete`/`truncate` — if you ever see those, STOP.
**Post-check:** #1 → filter loads on `/admin/ai-usage`; #2 → `/content` search filters; #3 → applied video shows ▶ on `/content/{slug}`; #4 → `select id from storage.buckets where id='content-media';` returns 1 row; #5 → `/admin/publications` loads; #6 → `/admin` 최근 30일 추이 charts render.
**Stop-on-failure:** most likely cause is running #3 before #2 (missing `hero_alt`).

## B. UNCERTAIN files (applied out-of-band) — VERIFY (read-only)

### B1. `docs/DRAFT_RLS_SETUP.sql` — SECURITY-CRITICAL, verify first
The consultation-draft feature saves a row containing an app-supplied user id. That is only safe if the DB rejects any row whose user id ≠ the logged-in user. Verify the policy is live:
```sql
select policyname, cmd, with_check
from pg_policies
where schemaname='public' and tablename='consultation_drafts';
```
**Expect:** four policies `drafts_select_own`/`insert_own`/`update_own`/`delete_own`, with insert/update `with_check` containing `user_id = auth.uid()`. Also `select relrowsecurity from pg_class where relname='consultation_drafts';` must be `t`.
**If 0 rows / RLS off:** apply `docs/DRAFT_RLS_SETUP.sql` (idempotent), then re-verify. **Priority.**

### B2. `docs/CONSUMER_CORE_SCHEMA.sql` — the 4 core consumer tables
`profiles`, `consultation_subjects`, `conversations`, `conversation_messages` — the tables exist and the app works, so **do NOT blindly re-run the whole file** against production; it is reconciliation scaffolding. (A `seq` ordering column was recently added to the artifact to match the live table — see the DEV note in the file.) **Owner action: none** unless a developer asks for a specific check:
```sql
select tablename, rowsecurity from pg_tables
where schemaname='public'
  and tablename in ('profiles','consultation_subjects','conversations','conversation_messages');
```
**Expect:** all four `rowsecurity = true`. If any false, flag to a developer.

### B3. `docs/AI_USAGE_LOGS_REQUEST_ID.sql` — optional, safe anytime
Adds a nullable `request_id` tracing column to `ai_usage_logs`. The app falls back automatically whether or not it is applied. Post-check: `select column_name from information_schema.columns where table_name='ai_usage_logs' and column_name='request_id';` → 1 row after applying.

## C. HOLD — do NOT run yet (feature not built)
`docs/FORTUNE_MAIL_SETUP.sql` and `docs/FORTUNE_DELIVERY_SETUP.sql` create fortune-mailbox tables that **no app code uses yet** (the admin fortune screen shows an empty "준비 중" state). Apply only when the fortune pipeline ships AND delivery Decision G (`OWNER_ACTIONS_AND_DECISIONS.md`) is made. Additive/safe when that time comes.

## D. Already applied — do not re-run
Per your report: `admin/ADMIN_SETUP`, `ADMIN_02..05`, `CONTENT_01`, `PUBLIC_SETUP`, `PUBLICATION_SETUP`, `CONTENT_ASSETS_SETUP`, `CONTENT_05_07_SETUP`, `FAMOUS_AI_SETUP`. RLS on all is correct (admin-only via `is_admin()`; public read only through curated published-only RPCs).

## E. Known DB behaviors (developer/DEFER — not owner actions)
- **conversation ordering** depends on a DB trigger bumping `conversations.updated_at` when a message is inserted into `conversation_messages` (history/최근 상담 sort by `updated_at`). Verify this trigger exists in the live DB; if ordering ever looks wrong, this is the cause.

## One-line safety rule
Every file is safe to re-run and never deletes data. If you ever see `drop table`, `delete from`, or `truncate` in a file you're about to run, **stop and ask**.
