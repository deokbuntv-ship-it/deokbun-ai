# DeokbunAI — Database SQL Runbook (non-developer owner)

> **📍 문서 권위 (2026-09-04 확정)** — **DB 적용 절차와 그 역사**를 소유한다. 오너가 지금 할 일은 `OWNER_TODO.md` A1 을 보라. ⚠ 2026-09-04 승격으로 **staging 은 이 문서의 절차를 더 이상 쓰지 않는다**(마이그레이션으로 이관). production 만 해당.
> 전체 서열: `OWNER_TODO.md`(오너 액션) · `PROJECT_STATE.md`(운영 상태) · `FEATURE_MASTER_CHECKLIST.md`(기능 판정) · `KNOWN_RISKS.md`(위험) · `BACKLOG_V1_1.md`(V1.1) · `DATABASE_RUNBOOK.md`(DB 적용 절차).
> 충돌 시 판정 순서: **코드 → 테스트/빌드 → 라이브 스키마·배포 실측 → git 이력 → 프로덕션 E2E → 문서.**

> ## ⚠⚠ 이 문서의 신뢰도 (2026-09-04)
>
> **§C 의 production 기록이 실측과 달랐습니다.** "1차 적용이 실패하고 **아무것도 남기지 않았다**" 고
> 적혀 있었는데, 오너가 실제로 조회해 보니 테이블 3개·RLS 3개·정책 2개·함수 3개·트리거 2개가
> **들어가 있었습니다.** §B2 의 "정정문"(2026-08-14 "verified live") 도 낡았습니다 —
> `profiles` 와 `set_updated_at()` 이 **없다**고 적혀 있는데 지금은 **둘 다 있습니다.**
>
> **그래서 이 문서의 어떤 절도 DB 상태 판단의 근거로 쓰지 마십시오.**
> production 상태는 **`docs/PRODUCTION_PROMOTION_PREFLIGHT.sql` 실행 결과 하나**로만 판단합니다.
> 이 문서는 "과거에 무엇을 하려고 했는가" 의 기록으로 읽습니다.
> 승격 절차는 **`docs/PRODUCTION_SCHEMA_PROMOTION_PLAN.md`** 가 소유합니다.
>
> | 절 | 상태 |
> |---|---|
> | §A PENDING 6개 | ⚠ 미검증. **역할 종료** — 6개가 만드는 객체는 전부 5묶음 마이그레이션에 들어 있습니다(대조 완료) |
> | §B2 | ❌ 낡음 — 아래 정정 참조 |
> | §C | ❌ 틀림 — 아래 정정 참조 |
> | §D 적용 9개 | ⚠ 미검증. 문서 자신이 *"Per your report"* (구두)라고 밝히고 있습니다 |


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
**If 0 rows / RLS off:** apply migration `supabase/migrations/20260817000200_consultation_drafts.sql` (idempotent; now the canonical source — supersedes `docs/DRAFT_RLS_SETUP.sql`), then re-verify. **Priority.**

### B2. `docs/CONSUMER_CORE_SCHEMA.sql` — the 4 core consumer tables
⚠️ **CORRECTION (verified live 2026-08-14):** this file was previously assumed applied, but a
read-only production probe (`docs/ADVERTISEMENTS_DIAGNOSTIC.sql`) found **`public.profiles` and
`public.set_updated_at()` do NOT exist in production**, while `consultation_subjects` +
`conversations` DO. So the "4 tables were applied together" assumption is FALSE — they were
applied piecemeal, and `profiles` + the shared `set_updated_at()` trigger fn were never run.
The app still "works" because auth uses `auth.users` and the client-side `profileService.
ensureProfile` silently logs-and-swallows its error when `profiles` is absent (display names
just aren't persisted). **This is a pre-existing gap to reconcile separately — do NOT create
`profiles` as a side effect of another feature.** Verify each table individually:
```sql
select tablename, rowsecurity from pg_tables
where schemaname='public'
  and tablename in ('profiles','consultation_subjects','conversations','conversation_messages');
```
**Reality:** `profiles` returns 0 rows (absent); the other three exist with `rowsecurity=true`.

> ### ⚠ §B2 재정정 (2026-09-04) — 위 "CORRECTION" 도 이제 **낡았습니다**
>
> 2026-08-14 실측은 production 에 `profiles` 와 `set_updated_at()` 이 **없다**고 했습니다.
> 2026-09-04 실측(오너 직접 실행)은 **둘 다 `true`** 입니다. 그 사이 어느 시점에 생겼습니다 —
> **언제 어떻게 생겼는지는 기록이 없습니다.**
>
> 이것이 이 문서를 근거로 쓰면 안 되는 이유의 두 번째 사례입니다. 정정문조차 유통기한이 있습니다.
> `profiles` 의 **컬럼 모양**은 아직 확인되지 않았습니다 — 승격 사전점검 §8 이 찍습니다.
Do NOT blindly re-run the whole file; if `profiles` is needed, apply only its table+trigger
after a developer review (it also needs a self-contained or restored `set_updated_at()`).

**Reproducibility (2026-08-17):** the three tables that DO exist live
(`consultation_subjects`, `conversations`, `conversation_messages`) are now
version-controlled as migration
`supabase/migrations/20260817000300_consumer_core_conversations.sql` — idempotent, so
a **safe no-op** against the live DB; it only matters for a from-migrations rebuild
(otherwise those tables would surface as PGRST205). Combined with `..._000100_profiles.sql`
the whole consumer core is now reproducible from migrations. Applying it changes nothing
in production; skipping it is fine until a rebuild is needed.

### B3. `docs/AI_USAGE_LOGS_REQUEST_ID.sql` — optional, safe anytime
Adds a nullable `request_id` tracing column to `ai_usage_logs`. The app falls back automatically whether or not it is applied. Post-check: `select column_name from information_schema.columns where table_name='ai_usage_logs' and column_name='request_id';` → 1 row after applying.

## C. HOLD — do NOT run yet (feature not built)
`docs/FORTUNE_MAIL_SETUP.sql` and `docs/FORTUNE_DELIVERY_SETUP.sql` create fortune-mailbox tables that **no app code uses yet** (the admin fortune screen shows an empty "준비 중" state). Apply only when the fortune pipeline ships AND delivery Decision G (`OWNER_ACTIONS_AND_DECISIONS.md`) is made. Additive/safe when that time comes.

`docs/ADVERTISEMENTS_SETUP.sql` (Sprint 3B, rev 2 — **production-schema-aligned**) creates the ad/acquisition tables (`advertisements`, `ad_tracking_events`, `user_acquisition_attribution`) + admin RLS + server-trusted conversion triggers + `admin_ad_performance` RPC. **Self-contained** — defines its own `ads_set_updated_at()`, does NOT depend on `profiles` or the shared `set_updated_at()`; signup is anchored on the JWT-verified `ad-track` edge's attribution insert. Prereqs (already applied): `is_admin()`, `ai_usage_logs`, `consultation_subjects`. Idempotent, non-destructive, safe to re-run. **Admin ad CRUD works once this is applied**; full funnel/CAC also needs the `ad-track` Edge Function deployed (`[functions.ad-track] verify_jwt=false`). Until then the 광고 성과 screen shows a truthful "집계 준비 중" state. Read-only pre-check: `docs/ADVERTISEMENTS_DIAGNOSTIC.sql`.

> ### ⚠⚠ §C 정정 (2026-09-04) — 이 절의 기록이 **틀렸습니다**
>
> **틀린 기록**: *"A first apply attempt on 2026-08-14 failed harmlessly … and left **nothing**
> behind."*
>
> **실측** (오너가 production 에서 `ADVERTISEMENTS_DIAGNOSTIC.sql` 직접 실행):
>
> | 있는 것 | |
> |---|---|
> | 테이블 | `advertisements` · `ad_tracking_events` · `user_acquisition_attribution` — **3/3** |
> | RLS | 셋 다 **활성** |
> | 정책 | `advertisements` 1개 · `user_acquisition_attribution` 1개 — **설계와 일치** |
> | 함수 | `ad_on_chat_success` · `ad_on_birth_info` · `admin_ad_performance` |
> | 트리거 | `trg_advertisements_updated_at` · `trg_ad_on_chat_success` |
> | 전제 | `is_admin()` · `set_updated_at()` · `profiles` · `ai_usage_logs` · `consultation_subjects` · `conversations` — **전부 있음** |
>
> "아무것도 남기지 않았다" 는 **사실이 아닙니다.** 광고 스키마는 사실상 다 들어가 있습니다.
>
> **⚠ 그리고 진단 파일이 사람을 오해시켰습니다.** 같은 실행에서 `ad_on_signup` ·
> `ad_backfill_attribution` · `trg_ad_on_signup` 이 **false** 로 나와 "절반만 적용됐고 가입 추적이
> 깨졌다" 는 결론으로 이어졌는데, 셋은 **rev 1 의 객체이고 rev 2 가 의도적으로 없앤 것**입니다.
> 레포 grep 결과 셋을 만드는 코드는 **0줄**이고, 유일한 등장처가 진단 파일 자신이었습니다.
> **진단이 대상보다 오래 살면 없는 고장을 보고합니다.** 진단 파일은 정정했습니다.
>
> **진짜 공백은 다른 데 있습니다**: `ad-track` Edge 가 배포되지 않아 **광고 퍼널이 통째로**
> 돌지 않습니다. 가입만이 아니라 클릭·출생정보·첫상담도 전부 안 잡힙니다 — 세 트리거가 모두
> attribution 행 존재를 전제하고, 그 행은 `ad-track` 만 만들기 때문입니다.
> 상세: `docs/PRODUCTION_SCHEMA_PROMOTION_PLAN.md` §1·§2.

## D. Already applied — do not re-run
Per your report: `admin/ADMIN_SETUP`, `ADMIN_02..05`, `CONTENT_01`, `PUBLIC_SETUP`, `PUBLICATION_SETUP`, `CONTENT_ASSETS_SETUP`, `CONTENT_05_07_SETUP`, `FAMOUS_AI_SETUP`. RLS on all is correct (admin-only via `is_admin()`; public read only through curated published-only RPCs).

## E. Known DB behaviors (developer/DEFER — not owner actions)
- **conversation ordering** depends on a DB trigger bumping `conversations.updated_at` when a message is inserted into `conversation_messages` (history/최근 상담 sort by `updated_at`). Verify this trigger exists in the live DB; if ordering ever looks wrong, this is the cause.

## One-line safety rule
Every file is safe to re-run and never deletes data. If you ever see `drop table`, `delete from`, or `truncate` in a file you're about to run, **stop and ask**.
