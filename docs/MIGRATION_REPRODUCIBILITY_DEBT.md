# MIGRATION REPRODUCIBILITY DEBT

> Engineering-debt note (Owner Activation 02A). This is **technical debt, not a staging activation blocker** —
> Option A resolved staging by applying the historical out-of-band baseline first. Do NOT rewrite old
> migrations, author genesis migrations, repair migration history, or touch production based on this note; it
> records the debt for a future, carefully-planned cleanup.

## The gap
`supabase/migrations/` is **not self-contained** — a from-scratch database built from migrations alone fails,
because some base objects were historically created **out-of-band** (Supabase SQL Editor, `docs/admin/*.sql`),
not by a migration. Production was built incrementally (migrations + out-of-band scripts), so it has these
objects; a fresh environment (e.g. staging `aephpsiurgkvqcswyeie`) does not.

Surfaced on 2026-08-22 when a fresh staging `db push` failed at
`20260818000000_ai_usage_logs_telemetry.sql`: `relation "public.ai_usage_logs" does not exist`.

## Out-of-band objects the migration chain assumes exist
| Object | Kind | Created by (out-of-band) | Consumed by migration(s) |
|---|---|---|---|
| `public.ai_usage_logs` | table | `docs/admin/ADMIN_04_SETUP.sql` | `20260818000000` (ALTER adds telemetry cols) |
| `public.is_admin()` | function | `docs/admin/ADMIN_SETUP.sql` | `20260824000000`, `20260826000000`, `20260828000000` |
| `public.admin_users` | table | `docs/admin/ADMIN_SETUP.sql` | dependency of `is_admin()` |
| `admin_dashboard_overview()`, `admin_list_ai_usage()` | functions | `docs/admin/ADMIN_04_SETUP.sql` | (admin dashboard; not a migration dep) |

The **monetization chain `20260829000000–20260836000000` is self-contained** (no out-of-band deps).

## How staging was resolved (Option A — the historical baseline)
A temporary, non-committed bootstrap (`tmp/staging-admin-baseline.sql` in the isolated staging worktree —
exact concatenation of the two `docs/admin/*.sql`, 0 seed rows, 0 destructive statements) was applied to staging
via `supabase db query --linked` BEFORE resuming `db push`. This mirrors production's actual build order. It is
NOT a migration and was NOT committed.

## Future cleanup options (owner-planned, NOT this activation)
1. **Genesis migrations** — convert the out-of-band `docs/admin/*.sql` DDL into early migrations (timestamped
   before their first consumer, e.g. before `20260818000000`) so the chain builds from scratch. Requires careful
   handling of EXISTING environments: production + staging already have these objects, so the genesis migrations
   must be idempotent (`create ... if not exists` / `create or replace`) AND their history entries reconciled
   (they are "already applied" in fact but absent from `schema_migrations`). This needs `migration repair` on
   each existing environment — an owner-gated, per-environment operation. Do not attempt casually.
2. **Keep the out-of-band scripts as the documented bootstrap** — accept that new environments run
   `docs/admin/ADMIN_SETUP.sql` + `ADMIN_04_SETUP.sql` first (as staging did), and document it in the env
   setup runbook. Lower effort, but the repo remains not-fully-reproducible-from-migrations.

## Risk if left unaddressed
Only affects **new environments** (staging, a future DR rebuild, local from-scratch). Existing production is
unaffected. Any future genesis-migration work must be idempotent and must not re-run destructively against
production/staging (which already have these objects).
