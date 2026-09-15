# DEOKBUNI SPRINT J7 — RELEASE HARDENING / POLICY / DEVICE READINESS REPORT

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · No migrations, no production, nothing pushed. Frozen core untouched.

## §7.2 Environment separation
- `src/config/environment.ts` — single source of truth: infers env from the Supabase project ref (prod `olvkpaldrwvtexxpoaag` / staging `aephpsiurgkvqcswyeie`), or honors an explicit `EXPO_PUBLIC_APP_ENV`. **Fail-fast** `assertEnvironmentConsistency` wired into `src/services/supabase/config.ts`: a declared APP_ENV that contradicts the URL's ref throws (a staging build can never silently ship prod, or vice-versa). Backward-compatible (no APP_ENV → inference only).
- Fixed the misleading admin banner: `AdminTopBar` showed a hardcoded "운영 서버" in every build; now shows the **real** resolved env (`운영`/`스테이징`/`개발`, non-prod highlighted).
- 10 unit tests (`environment.test.ts`).

## §7.3/§7.4 Build profiles & native modules
- `eas.json` added: `development` / `staging` / `production` profiles, each pinning `EXPO_PUBLIC_APP_ENV` (so the backend target is a declared profile, enforced by the fail-fast). Store submit profile stubbed.
- Native audit: `react-native-iap` and `expo-notifications` are **absent** (seams only) → Expo Go insufficient; IAP + push are BLOCKED_EXTERNAL until installed + native build. `app.json` gaps noted (runtimeVersion, EAS projectId, bundle-id `com.deokbun.app` vs test `com.deokbuni.app`) — flagged for owner (not changed autonomously).

## §7.5 Release preflight
`scripts/release-preflight.mjs` (`npm run release-preflight`): tsc, jest, frozen-engine guard (no uncommitted frozen changes), client-grant guard presence, environment target/consistency, required public env names, migration contract, all six policy surfaces present, and edge-bundle secret scan. Returns non-zero on any blocker. **Current run: 17 ok / 1 warn (env unset in a bare run) / 0 blockers → PASS.**

## §7.6/§7.7/§7.8 Policy
- Added three DRAFT surfaces: **덕 유료 이용 정책** (`/duk-policy`), **환불·청약철회 정책** (`/refund-policy`), **미성년자 이용 안내** (`/minor-policy`) — each with the 검토 중 초안 banner, reachable from MY. Updated **privacy** to name Supabase + OpenAI processors, and **terms** to add a 덕/세션 clause.
- `docs/POLICY_MATRIX.md`: full classification + code↔policy value mapping + contradictions.
- **Contradiction flagged (HIGH):** `birthday_reward=5` is configured but no code grants it; the Duk policy honestly says it's not active, and a guard test enforces that. Wiring the grant is an economy change — deliberately NOT done autonomously.
- **Minor safety (§7.8):** only a 만14세 self-attestation exists; a real age gate + guardian consent for IAP is MISSING → LEGAL_REVIEW_REQUIRED before payments (documented; purchase inactive).

## §7.9 Secret / PII audit — **PASS**
No committed secrets; no service-role key in the client bundle; analytics allowlist (client + server) forbids PII; PII-safe logging; push tokens are server-only. MEDIUM (non-blocking): admin user-detail shows email + curated birth (is_admin-gated, operationally justified); chat edge top-level catch logs raw error.message.

## §7.10 Deep-link audit
`deepLinkRoutes.test.ts` (29 tests): every notification deep-link target resolves to a real route; unknown → safe fallback; all key consumer/policy routes exist; the removed mail-detail orphan stays removed.

## §7.11 Device QA + §7.14 Promotion
- `docs/DEVICE_QA_MATRIX.md`: 28-row iOS/Android checklist for a future on-device run (DEVICE_QA = NOT_RUN without devices).
- `docs/PRODUCTION_PROMOTION_RUNBOOK.md`: exact ordered runbook (backup → migrations → edge → secrets → flags → smoke → rollback) — PREPARED, NOT executed. Production untouched.

## §7.13 Release gates
`docs/RELEASE_GATES.md`: G1–G5 **PASS**; G6 (env/build) / G7 (policy) / G8 (retention delivery) **PARTIAL**; G9 (store/IAP) **DEFERRED/BLOCKED_EXTERNAL**; device QA NOT_RUN; promotion DEFERRED.

## Gates
tsc **0** · jest **192 suites / 1876 tests** (+environment, deepLinkRoutes, policySurfaces) · web export **PASS** (new policy routes) · frozen diff **0** · economy **0/11** · release-preflight **PASS**.

## Verdicts
- ENVIRONMENT_SEPARATION = **PASS** · RELEASE_PREFLIGHT = **PASS** · POLICY_MATRIX = **PARTIAL** (DRAFT + LEGAL_REVIEW_REQUIRED) · SECRET_AUDIT = **PASS** · DEVICE_QA = **NOT_RUN**
- FROZEN_CONSULTATION_CORE = YES · PRODUCTION_MUTATIONS = 0

## Owner action (deferred)
1. Legal review of all DRAFT policy surfaces before paid launch. 2. Decide the birthday-reward contradiction (wire grant or drop config). 3. Add `runtimeVersion`/EAS projectId to app.json; reconcile the bundle id; install `react-native-iap` + `expo-notifications` for a dev/internal build. 4. Set `EXPO_PUBLIC_APP_ENV` per EAS profile + the Supabase URL/key as EAS env (not committed). 5. Run the device QA matrix on real devices.
