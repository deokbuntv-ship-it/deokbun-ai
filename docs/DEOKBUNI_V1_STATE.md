# DeokbunAI V1 — Authoritative State (SSOT)

> **📍 문서 권위 (2026-09-04 확정)** — ⚠ **HISTORICAL — 2026-08-22 기준. 더 이상 SSOT 가 아니다.** 현재 상태는 `PROJECT_STATE.md`, 기능 판정은 `FEATURE_MASTER_CHECKLIST.md`. 이 문서의 수치(마이그레이션 40개, jest 195/1891 등)는 낡았다.
> 전체 서열: `OWNER_TODO.md`(오너 액션) · `PROJECT_STATE.md`(운영 상태) · `FEATURE_MASTER_CHECKLIST.md`(기능 판정) · `KNOWN_RISKS.md`(위험) · `BACKLOG_V1_1.md`(V1.1) · `DATABASE_RUNBOOK.md`(DB 적용 절차).
> 충돌 시 판정 순서: **코드 → 테스트/빌드 → 라이브 스키마·배포 실측 → git 이력 → 프로덕션 E2E → 문서.**


**As of:** 2026-08-22 · **Branch:** `admin/master-operations-content` · This supersedes earlier status docs (`V1_LAUNCH_READINESS.md`, `DEOKBUNI_V1_CURRENT_REPOSITORY_AUDIT.md`, the per-batch reports) as the current single source of truth. Those remain as history.

## Architecture (current)
- **Client:** Expo SDK 57 (React Native, expo-router, static app.json config), consumer app "덕분이" + a web-only admin console. Env resolved through one choke point (`src/config/environment.ts` + `src/services/supabase/config.ts`) with a production-boundary fail-fast; targets are declared per `eas.json` profile.
- **Backend:** Supabase — Postgres (RLS-first, append-only Duk ledger, SECURITY DEFINER RPCs), Edge Functions (Deno): `chat` (LLM consultation), `naver-auth`, `verify-purchase`, retention workers (`run-scheduled-notifications`, `run-email-campaigns`, `retry-*`), ad-track, content/media/video, apple/google IAP webhooks.
- **Two projects:** STAGING `aephpsiurgkvqcswyeie` (all migrations validated), PRODUCTION `olvkpaldrwvtexxpoaag` (**untouched by all autonomous batches**).

## Feature completeness (internal V1)
- **Consumer:** auth (Kakao/Google/**Apple** via Supabase, Naver via edge — **Apple is V1-required as of 2026-09-02**: iOS uses the native Sign in with Apple sheet, web/Android the Supabase provider flow; code complete, Apple Developer console setup pending), signup-first onboarding, canonical SELF birth, Home (덕 chip/today/monthly/popular-Q/recent), consultation (server-authoritative, idempotent, INSUFFICIENT_DUK paywall), compatibility, Today, Monthly, mailbox, MY, wallet + candle, AI disclosure everywhere, consumer error taxonomy, notification center + bell. **Complete.**
- **Economy (locked values):** Welcome +10, Candle +1/24h, **Birthday +5** (runtime live, exactly-once/user/year), General 5, Compatibility 12, Premium report 50; PLUS foundation-only (unmonetized). Ledger buckets PLUS→REWARD→PAID; refund→duk_debt; future PAID→DEBT_OFFSET (CHECK fixed). Client can NEVER grant (CI-guarded).
- **Retention:** scheduler substrate + birthday job (notification + reward), delivery history + bounded retry, push abstraction + concrete Expo adapter (client registration wired in 알림 설정) + email Resend adapter — all provider-independent, fail-closed. Real delivery = EXTERNAL_BLOCKED.
- **Admin/ops:** dashboard, users, consultations + decision-audit inspector, economy console + audited adjustment + audit log, LLM usage + per-model cost (Terra UNPRICED), spend-guard kill switch, retention/email campaign consoles, popular questions, acquisition/ads. Honest "연결 준비 중" where external.
- **Policies:** terms/privacy/AI-notice/Duk/refund/minor — all present as DRAFT (검토 중 banner); runtime-consistent with code; legal-final = owner.

## Staging vs production
- **Staging:** 40 migrations applied (through `20260845`), all diagnostics 0 (economy 0/11, notification 0/6, email 0/4). Edge functions from prior activations deployed; retention workers registered, NOT deployed. Billing flag validated, left as configured.
- **Production:** nothing applied/deployed by any batch. Promotion runbook prepared (`PRODUCTION_PROMOTION_RUNBOOK.md`), not executed.

## Deferred / external
- **STORE 05B:** deferred (no business reg / seller / real products / purchases) to preserve 예비창업자 eligibility. IAP server authority + client seam ready; `react-native-iap` absent (lazy require); no purchase reachable.
- **EXTERNAL_BLOCKED:** real push (FCM/APNs + EAS projectId + dev build), real email (Resend key + verified sender), staging OAuth provider consoles, device QA, production-like analytics live check.
- **LEGAL_BLOCKED:** lawyer review of DRAFT policies.
- **DEFERRED:** Codex final Red Team (post store-sandbox), production promotion.

## Release gates (summary)
G1 type/test, G2 frozen, G3 economy, G4 server-authority, G5 privacy/secrets = **CODE_PASS**. G6 env/build, G7 policy, G8 retention delivery = **PARTIAL** (external/legal remainder). G9 store = **DEFERRED**. Device QA = NOT_RUN. See `RELEASE_GATES.md`.

## Quality (HEAD)
tsc 0 · jest 195 suites / 1891 tests · web export PASS · release-preflight PASS · frozen diff 0 · economy/notification/email diagnostics 0 · secret audit PASS · production mutations 0.

## Commits (local; remote backup through `244bfd6` on origin)
J1 `c88d026` · J2 `14ef8c1` · J3 `e338161` · J4 `f1cfd48` · J5 `a32491a` · J6 `4758837` · J7 `49a310b` · Batch3 `feb0cab`/`244bfd6` · J8 `51a8b0d` · J9 (this batch's final). J8/J9 not yet pushed.

## Remaining owner actions (see the final batch report for the ordered checklist)
1. Google OAuth (staging) — smallest set to unlock a live device login. 2. EAS `projectId` + dev/internal build. 3. Push credentials (FCM/APNs) + `CRON_SECRET`/`PUSH_PROVIDER`. 4. Email `EMAIL_PROVIDER=resend` + key + sender. 5. Replace default Expo icon/splash before public release. 6. Legal review. 7. Wire Sentry (post-beta). 8. Production promotion when ready.
