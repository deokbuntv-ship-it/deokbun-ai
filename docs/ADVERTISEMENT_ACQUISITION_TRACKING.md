# Advertisement & Acquisition Tracking (Sprint 3B)

> Operator system to answer, per **광고 1건**: 얼마를 썼고 · 몇 명이 들어왔고 · 가입했고 ·
> 첫 상담을 했고 · 며칠 뒤에도 돌아왔는가. Primary entity = **Advertisement**. Primary id =
> **unique tracking URL**. Fail-closed, additive, no engine semantics touched.

## Advertisement model (`public.advertisements`)
`ad_type · publisher_nickname · ad_check_url · start_date · contract_type · cost_krw ·
notes · status · public_tracking_code · published_at`. Status lifecycle **draft → active →
ended / disabled** — status change over deletion; history is never destroyed (§6). Admin
CRUD only (RLS `is_admin()`). Code: `src/features/ads/services/adAdvertisementService.ts`,
UI `src/app/admin/ads/*`.

## Tracking URL
- Assigned **on 발행** (`publishAd`): a non-sequential `ad_XXXXXXXX` **public tracking code**
  (`trackingCode.ts`, CSPRNG bytes; a raw DB id is never exposed, §9). Stable/permanent —
  never regenerated on later edits (§10).
- The full URL is **derived**, not stored: `{origin}/?ad=CODE` (`trackingUrl.buildTrackingUrl`
  + `services/appOrigin.resolveAppOrigin`). Query-param form because `web.output:"static"`
  (§8). Origin = `EXPO_PUBLIC_PUBLIC_BASE_URL` → else `window.location.origin`; **localhost is
  rejected** so a dev URL is never a real tracking URL, and null → "도메인 설정 필요" (§59).
- **광고 확인 링크 (`ad_check_url`) ≠ 발급 URL (tracking)** — separate fields, never mixed
  (§39). The admin "광고 확인" opens the posted content; validated http(s) only (§40).
- QR = the **same** tracking URL as payload (no separate code, §58). Copy has explicit
  success/failure feedback (§11).

## First-touch attribution (§19–§21)
- `acquisition/acquisitionContext.ts` — ephemeral store mirroring `pendingConsultationIntent`
  (sessionStorage web / in-memory native+jest), 6h TTL. **First touch is never overwritten**
  by a later ad click (§20).
- `acquisition/AcquisitionBridge.tsx` (mounted once in root `_layout`, **additive**, renders
  nothing): on web landing reads `?ad=CODE`, captures it, fires the anonymous click, and
  **strips `?ad` from the URL** (never propagated through router params, §20). Survives
  home → login → OAuth popup → callback → birth → chat because sessionStorage lives in the
  opener window. An **organic visitor (no `?ad=`) is completely unaffected** (§54).
- On authentication the bridge links the user once (`recordAcquisitionAttribution`) via the
  `ad-track` edge; the DB upsert is `on conflict (user_id) do nothing` → first-touch, deduped.

## Funnel milestones (§22) — DEFINITIONS + write paths
| Milestone | Definition (NOT screen entry) | Write path (server-trusted, §50) |
|---|---|---|
| `ad_click` | Landing with a valid `?ad=CODE` | `ad-track` edge, service_role (rate-limited, bot-filtered §53) |
| `signup` | A **genuinely NEW account** acquired by the ad — `auth.users.created_at` is at/after the server-recorded ad-click time. A **pre-existing** member who clicks an ad gets attribution but is **NEVER** counted as a signup; a routine re-login never creates a new attribution row either. | attribution INSERT (edge, JWT-verified) → trigger `ad_reconcile_attribution` (new-account gate) |
| `birth_info_completed` | A committed `consultation_subjects` INSERT (real save, §23), for an ad-attributed user | trigger `ad_on_birth_info` (+ reconcile backfill) |
| `first_consultation` | FIRST `ai_usage_logs` row `status='success', request_type='chat'` per user (real LLM consultation, NOT chat entry, NOT the LOCAL_RESPONSE canned path, §25), for an ad-attributed user | trigger `ad_on_chat_success` (+ reconcile backfill) |
| `d1 / d7 / d30` | Derived at read time — see below | RPC `admin_ad_performance` |

> **Production-schema note (verified live 2026-08-14):** `public.profiles` and
> `public.set_updated_at()` do NOT exist in production — they live only in the never-applied
> `CONSUMER_CORE_SCHEMA.sql`. So signup is anchored on the **attribution row insert** (created
> only by the JWT-verified `ad-track` edge over `auth.users` identity), NOT a `profiles`
> trigger, and the migration defines its own `ads_set_updated_at()`. No `auth.users` trigger
> is created. Only `is_admin()`, `ai_usage_logs`, `consultation_subjects` (all present) are
> required.

Idempotency (§26): a unique index `(user_id, event_type)` on the one-time milestones — a
duplicated signup/first-consultation is impossible at the DB level.

**New-account gate (the signup rule) — FAIL-CLOSED, evidence-backed:** a pre-existing user
must **NEVER** be counted as a signup, and a signup must be backed by trusted server evidence.
Canonical spec in `signupEligibility.ts` (`isNewAccountSignup`), mirrored exactly by the
`ad_reconcile_attribution` SQL trigger:

> **SIGNUP = the JWT-verified account is genuinely new AND a server-recorded `ad_click` exists
> for the attribution AND `auth.users.created_at ≥ that ad_click.created_at`.**

- **created_at ≥ server click ⇒ NEW account** (born from this ad-driven session) ⇒ signup.
  **created_at < click ⇒ pre-existing** ⇒ attribution only, no signup.
- **Missing trusted click evidence means NO signup attribution.** Missing `created_at` → no
  signup. There is **no** inference from attribution time, no time window, no client
  timestamps, and no client `isNewUser` flag. We prefer an undercount from missing telemetry
  over contaminating CAC/conversion with an inferred acquisition.
- Both inputs are **server** timestamps. `signup_at` anchors on `created_at`.

**Cohort consistency:** because a pre-existing user is not a signup, their later birth /
first-consultation is **also** excluded from the funnel — the downstream milestone triggers
fire only for an attribution row that already carries a recorded `signup_at`. So the whole
funnel (clicks → **new signups** → birth → first-consult → D1/D7/D30) measures the newly-
acquired cohort; `clicks` is the only step that includes pre-existing users' ad clicks.

Examples — existing user (created 2026-06-01) clicks an ad 2026-08-14 → attribution YES,
signup **NO**. New user clicks an ad, creates the account via OAuth, attribution links after
auth → signup **YES** (once). Repeated login / repeated ad click → no duplicate signup, first
touch preserved.

**Ordering safety (race-free by construction):** the **attribution row is the single anchor**.
Its INSERT (by the edge, at first auth) fires `ad_reconcile_attribution`, which records signup
+ `signup_at` and adopts any birth/consultation activity that happened *before* attribution
landed. The two forward triggers (`ad_on_birth_info`, `ad_on_chat_success`) are guarded by
`exists(attribution)` and handle the normal *after*-attribution case. Because attribution is
created at first auth (before any consultation) and signup is co-written with it, there is no
cross-writer ordering race, and only ad-attributed users generate funnel events (privacy §52).

## First-consultation definition (§25)
The single server-authoritative point is the chat Edge Function success (it writes
`ai_usage_logs status='success' request_type='chat'` with the verified JWT `user_id`). The
first such row per user = first consultation. This excludes the canned LOCAL_RESPONSE branch
(never reaches the edge) and screen entry.

## D1 / D7 / D30 definition (§27/§29) — ONE window
**Rolling-return survival:** a user acquired by an ad is retained at **DN** iff they had a
**successful chat consultation** (`ai_usage_logs` success) at a timestamp **≥ signup + N
days**. So `D1 ≥ D7 ≥ D30`; reads as "N일 뒤에도 다시 돌아와 상담한 사용자". Denominator for a
retention rate = the ad's **signups**. Pure impl `retention.isRetainedAtDay`; SQL mirror in
`admin_ad_performance`. Page refresh / screen entry is never retention (§28).

## Metrics (§32–§35)
- Conversion (`유입→출생완료`, `유입→가입`, `가입→첫상담`, `유입→첫상담`) — `rate(num, den)`;
  **0 denominator → `—`**, never a fabricated 0% (§32).
- **CAC = 광고비 / 가입자**, **CPA = 광고비 / 첫상담자** — distinct (§34).
- **Missing cost → CAC/CPA `—`, never `0원`** (§35). All in `adMetrics.ts` (tested).

## XLSX (§42–§45)
- Pure dependency-free OOXML writer (`xlsx/` — CRC32 + STORED zip + UTF-8) → `npm ls` stays
  clean; numbers stay numeric, null → `—` (never 0), Korean preserved. Columns = §43
  (`adXlsxReport.XLSX_HEADERS`). **화면 필터 그대로 → XLSX** (the caller passes the filtered
  rows, §44). Admin-only (the route is admin-gated) and aggregate-only — **no user PII**
  (§45). Download via `services/xlsxDownload.ts` (web), truthful success/failure (§57).

## Security (§51)
Invalid/malformed/arbitrary codes rejected (`isValidTrackingCode`, edge `CODE_RE`); unknown/
inactive codes silently ignored (no enumeration oracle). Anonymous clicks are **service-role
edge inserts, never anon RLS inserts**. Attribution uses the **JWT-verified** user id, never a
client-sent one (no cross-user attribution). Admin analytics via `is_admin()`-gated
SECURITY DEFINER RPC (no client SELECT on the events table). External `ad_check_url` opened
as `noopener,noreferrer` after http(s) validation (§40).

## Privacy (§52)
No fingerprinting. `visitor_id` is an anonymous random id. Raw IP is **not** stored; the
user-agent is used only transiently for crawler filtering, then dropped. Only categorical /
count / timestamp columns; no name/email/birth/question text in the ad tables.

## Database — migration status
`docs/ADVERTISEMENTS_SETUP.sql` (rev 2, production-schema-aligned) — **ARTIFACT / HOLD,
owner-apply only** (idempotent, non-destructive, safe to re-run). Self-contained
`ads_set_updated_at()`; three tables + admin-CRUD RLS + append-only telemetry (no client
policies) + first-touch attribution + server-trusted conversion triggers (signup via the
attribution/edge anchor, first-consult/birth via ai_usage_logs/consultation_subjects) +
`admin_ad_performance` RPC. **Prereqs (ALL already applied in prod): `is_admin()`,
`ai_usage_logs`, `consultation_subjects`.** No `profiles` / `set_updated_at()` dependency.
**Not applied to production by this sprint** (§36/§67). `supabase/functions/ad-track` is
**owner-deploy** (add `[functions.ad-track] verify_jwt=false` to `supabase/config.toml`).
Read-only state check: `docs/ADVERTISEMENTS_DIAGNOSTIC.sql`.

## Production activation steps (owner)
0. (Optional) Re-run `docs/ADVERTISEMENTS_DIAGNOSTIC.sql` to confirm the clean slate.
1. Review + apply `docs/ADVERTISEMENTS_SETUP.sql` in the Supabase SQL editor. Prereqs
   `is_admin()` + `ai_usage_logs` + `consultation_subjects` are already present; the file is
   otherwise self-contained (no `profiles`, no shared `set_updated_at()`).
2. Deploy the `ad-track` Edge Function; add `[functions.ad-track] verify_jwt=false` to
   `supabase/config.toml`.
3. Set `EXPO_PUBLIC_PUBLIC_BASE_URL` to the production origin (build-time) and redeploy the
   web app, so tracking URLs render the real domain (else they show "도메인 설정 필요").
4. Register + 발행 a test ad, click its URL, sign up, run a consultation → verify the funnel
   populates and CAC/CPA compute. Until steps 1–2, the app runs fine: admin CRUD + URL
   issuance work; the performance screen shows a truthful "집계 준비 중" state.

## What is live now vs owner-activation-gated
- **Live (client):** admin ad CRUD + publish + tracking-URL derivation/copy/QR + `?ad=` capture
  + first-touch context + fire-and-forget click/attribution calls (no-op until the edge exists).
- **Owner-gated:** the DB tables/triggers/RPC (HOLD SQL) and the `ad-track` edge → until
  applied/deployed, every count is fail-closed and no journey is affected.
