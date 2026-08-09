# Admin Authorization Setup (ADMIN-01)

This document describes the **user action** required to unlock the admin area.
It is a **proposal** — nothing here is applied automatically. Apply it only after
CTO review, in the Supabase SQL Editor.

## What ADMIN-01 shipped (code)

- Web-only `/admin` route with a **fail-closed** access gate.
- `useAdminAuthorization()` → `adminAuthorizationService.checkAdminAuthority()`,
  which calls the DB function `public.is_admin()` via `supabase.rpc('is_admin')`.
- No hardcoded admin emails, no `service_role` key in the client, no
  authorization-failure-as-success fallback.

Until the SQL below is applied, `public.is_admin()` does not exist, so the app
resolves authorization to **`unavailable`** and the admin UI stays locked. That
is the intended pre-apply state — not a bug.

## The authorization model

- `public.admin_users` — an allowlist table (one row per admin).
- `public.is_admin()` — a `SECURITY DEFINER` boolean over the caller's
  `auth.uid()`; the single seam the app calls.

The app **never** reads `admin_users` directly and **never** holds the
`service_role` key. Membership is managed only via the SQL Editor / `service_role`.

Rationale for `admin_users` (vs `profiles.is_admin`): admin membership is an
operational concern kept out of the user-owned `profiles` row (which has its own
`auth.uid() = id` RLS), avoids widening `profiles` write policies, and records
provenance (`created_at` / `created_by`). A single boolean on `profiles` would be
simpler but couples admin state to user-owned data; `admin_users` is recommended.

## Steps (Supabase SQL Editor)

1. Open the Supabase project → SQL Editor.
2. Paste and run the contents of [`ADMIN_SETUP.sql`](./ADMIN_SETUP.sql).
3. Find the operator's user id:
   ```sql
   select id, email from auth.users where email = 'operator@example.com';
   ```
4. Grant admin:
   ```sql
   insert into public.admin_users (user_id, role, created_by)
   values ('<USER_UUID>', 'admin', '<USER_UUID>');
   ```
5. Reload `/admin` on the web build — the shell should now unlock for that user.

## Security notes

- `service_role` key must live only in Supabase (server/edge secrets), never in
  the app bundle or client env.
- `admin_users` has RLS enabled (self-read only); it is not client-writable.
- Revoke admin with `delete from public.admin_users where user_id = '<UUID>';`.
