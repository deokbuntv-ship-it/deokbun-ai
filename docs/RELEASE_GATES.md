# DeokbunAI V1 — Release Gates G1–G9 (Sprint J7)

> ⚠ **2026-09-06 — 출시 컷라인(무엇을 하고 무엇을 안 할지)은 `docs/V1_CUTLINE.md` 가 소유한다.**
> 이 문서는 게이트 정의를 소유하고, 그 게이트 중 무엇이 V1 필수인지는 컷라인 문서를 본다.

> ⚠ **HISTORICAL — 2026-08 Sprint J7 기준.** 현재 상태는 `PROJECT_STATE.md`, 기능 판정은 `FEATURE_MASTER_CHECKLIST.md`, 오너 액션은 `OWNER_TODO.md`.
> 이 문서의 테스트 수치·게이트 상태는 낡았다 (실제: **298 suites / 4,841 tests**, 2026-09-04).


Reassessed against current code. Status: **PASS** · **PARTIAL** · **BLOCKED_EXTERNAL** (needs a provider/account we won't provision) · **DEFERRED** (owner-timed, e.g. 05B store). Store gates are NOT marked PASS without a real store sandbox.

| Gate | Scope | Status | Evidence / what remains |
|---|---|---|---|
| **G1 Type & test integrity** | tsc 0 + full jest + web export | **PASS** | tsc 0; jest 190+ suites; `expo export` ok; `npm run release-preflight` PASS |
| **G2 Frozen engine / decision integrity** | Saju/Ziwei/Qimen + decision/evidence/WHY + prices unchanged | **PASS** | frozen diff 0 across the batch; Duk prices unchanged (display mirrors economy_policy) |
| **G3 Economy / financial integrity** | ledger consistency + DEBT_OFFSET + diagnostics | **PASS** | economy diagnostics 0/11; DEBT_OFFSET fixed + proven (J6, scenarios A–H); debt/refund semantics intact |
| **G4 Server authority (no client grant)** | client cannot grant/spend Duk | **PASS** | `clientGrantGuard` test; adjustment only via is_admin server RPC; IAP grant only via verify-purchase Edge |
| **G5 Privacy & secrets** | no tracked secrets, PII-safe analytics/logs/admin | **PASS** | secret audit PASS; analytics allowlist (client+server); PII-safe logging; push tokens server-only |
| **G6 Environment separation & build config** | dev/staging/prod separation; build profiles | **PARTIAL** | env contract + fail-fast + eas.json profiles + honest admin env label DONE. Remaining: `app.json` `runtimeVersion`/EAS `projectId`; reconcile `com.deokbun.app` vs `com.deokbuni.app`; native IAP/push not installed |
| **G7 Policy surfaces** | terms/privacy/AI/Duk/refund/minor present | **PARTIAL** | all six surfaces IMPLEMENTED_UI as DRAFT; **LEGAL_REVIEW_REQUIRED** before paid launch |
| **G8 Retention/notification delivery** | scheduler + push/email workers | **PARTIAL** | substrate + pure workers + Edge seams + admin retry DONE, diagnostics 0. `PUSH_PROVIDER_LIVE`/`EMAIL_PROVIDER_LIVE` = **BLOCKED_EXTERNAL** (providers); cron trigger = owner |
| **G9 Store / IAP (payments)** | purchase → grant → refund → debt E2E | **DEFERRED / BLOCKED_EXTERNAL** | server IAP authority + client seam ready; `react-native-iap` absent; Activation 05B (store provisioning) intentionally deferred; Apple/Google sandbox required |
| **(G10) Device QA** | on-device iOS/Android run | **NOT_RUN** | `docs/DEVICE_QA_MATRIX.md` prepared; requires an EAS dev/internal build + devices |
| **(G11) Production promotion** | migrate + deploy + smoke | **DEFERRED** | `docs/PRODUCTION_PROMOTION_RUNBOOK.md` prepared, NOT executed; production untouched |

**Autonomous ceiling reached:** G1–G5 PASS; G6–G8 PARTIAL (provider/native remainder is external); G9/G10/G11 deferred/external by policy. Nothing here can be raised further without owner provisioning (providers, store, devices) or legal review.
