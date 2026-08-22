# DEOKBUNI V1 — CURRENT REPOSITORY AUDIT

> Code-verified reassessment at HEAD `baa1a96` (+ uncommitted 04–05A working tree). **207 commits past the
> `cf2fe7e` SSOT**, which is stale (it predates engine-wiring, consultation-core, Duk economy, billing, WELCOME,
> analytics, and IAP). Old completion numbers discarded. Basis: 3 parallel code-mapping readers (UI, admin/
> retention, policy/release) + the Owner-Activation record (backend/staging truth). Read-only; nothing mutated.

## 1. Current Repo State
- Branch `admin/master-operations-content`, HEAD `baa1a96`. Committed through Sprints A–I + Activations 01/02/02A.
- **Uncommitted working tree = Activations 04–05A**: migrations `20260837/838/839` (session_reason fix, WELCOME
  trigger, server-analytics triggers), client analytics + INSUFFICIENT_DUK contract, native IAP layer, all reports.
- **Two Supabase projects.** Production `olvkpaldrwvtexxpoaag` (app's live target). Staging `aephpsiurgkvqcswyeie`
  (33 migrations, Duk billing ON + **live-validated**, WELCOME, server-analytics, IAP substrate deployed).
- **Critical deploy truth:** the entire Duk/billing/WELCOME/analytics/IAP stack is validated on **staging only** —
  **production was never mutated**, so none of it runs in production yet. Consultation/fortune/onboarding/admin were
  deployed earlier (web live at deokbunai.com; Naver login prod-verified).

## 2. V1 Feature Matrix
| # | Area | Status | Note |
|---|---|---|---|
| A | Authentication | **DONE** | OAuth-only (Naver prod-verified; Kakao/Google code-ready, owner-console-gated). No email/pw. |
| B | Terms / consent | **PARTIAL** | consent capture + versioning DONE; content is a visible DRAFT (lawyer-final = owner). |
| C | New-user onboarding | **DONE** | signup-first gate → terms → canonical SELF birth. |
| D | Birth / profile data | **DONE** | subjects + birth-info live. |
| E | Welcome 10 Duk | **DONE (staging)** | server trigger, live-verified (04D-B). **Not in production** (schema staging-only). |
| F | Duk wallet UI | **NOT_IMPLEMENTED** | `getWalletState()` exists; **no screen calls it**; no balance shown anywhere. |
| G | Candle UX | **NOT_IMPLEMENTED** | `lightCandle()` works (validated); **no button/screen**. |
| H | General consultation UX | **DONE** | chat live-wired to Edge; structured result + follow-ups. |
| I | Consultation paid-session UX | **NOT_IMPLEMENTED** | no turn/session/price display; billing backend done + staging-validated. |
| J | Follow-up / remaining-turn UX | **PARTIAL** | follow-ups DONE; remaining-turn/entitlement display absent. |
| K | Compatibility UX | **DONE** | pair picker + compat chat + tier + report. |
| L | Compatibility insufficient-Duk UX | **NOT_IMPLEMENTED** | server returns INSUFFICIENT_DUK{balance,required,shortfall}; screen shows a generic error, snapshot discarded. |
| M | Today fortune | **DONE** | load-or-generate, full states. |
| N | Monthly fortune | **DONE** | full states. |
| O | Fortune mailbox / nav | **PARTIAL** | inbox archive DONE; `mail-detail.tsx` orphaned + stub. |
| P | Birthday UX / trigger | **PARTIAL** | deterministic home card DONE; auto-notification not wired (no scheduler). |
| Q | Push notifications | **FOUNDATION_ONLY** | noop provider (no FCM/APNs/Expo); token registry + prefs UI real + honest. |
| R | Monthly fortune email | **NOT_IMPLEMENTED** | no email service/edge at all; monthly is in-app content, never emailed. |
| S | Admin dashboard | **DONE** | real `is_admin()` RPCs; only 오늘 AI 비용 = honest "준비 중". |
| T | User management | **DONE** | list/search/inspect, PII-curated. |
| U | Consultation / admin audit | **PARTIAL** | metadata-only (content never returned); intelligence inspector FOUNDATION_ONLY. |
| V | Duk / admin economy tools | **NOT_IMPLEMENTED** | spend-guard kill-switch DONE; but no grant/adjust or economy_policy admin. |
| W | LLM cost / admin monitoring | **PARTIAL** | usage log DONE; cost KRW panels foundation (no pricing/settlement API). |
| X | Acquisition / attribution | **DONE (code) / not deployed** | ad-track edge + CAC/CPA/funnel + XLSX + popular-questions; owner-deploy gated. |
| Y | Analytics | **DONE** | client (candle/consultation) wired + server-derived (welcome/duk_*/session triggers, staging LIVE). Client in-app live = deferred monitoring gate (04G). |
| Z | Policy (terms/privacy/AI-disclosure/paid) | **PARTIAL** | terms/privacy DRAFT; AI-disclaimer scattered (absent on chat/today/monthly/report); **paid/refund/minor policy NOT_IMPLEMENTED** (age-14 gate partial). |
| AA | IAP technical layer | **DONE** | server authority + SDK-agnostic client seam + 13 tests (05A); native SDK not installed/dev-built. |
| AB | Store real integration | **DEFERRED** | 05B, owner business-eligibility decision. |
| AC | App packaging | **PARTIAL** | app.json has ids/icons/splash; missing buildNumber/versionCode/runtimeVersion/eas projectId. |
| AD | Real-device QA | **NOT_IMPLEMENTED / DEFERRED** | no EAS/dev build yet. |
| AE | Release preflight | **PARTIAL** | real server-bundle/tsc/jest preflight; no store/native/EAS checks; no CI. |

## 3. Route / Screen Matrix (highlights)
58 route files. **Live-wired + healthy:** `/`(Home), `/chat`, `/compatibility`(+`/compatibility-chat`), `/today`,
`/monthly`, `/consult`, `/inbox`, `/my`, `/notifications`(+settings), `/life-events`, onboarding (`/login`,
`/login-callback`, `/onboarding/{terms,birth}`), `/birth-info`, `/subjects`, `/report/[id]`, `/shared-report/[token]`,
`/content/*`, `/famous/*`, `/privacy-policy`, `/terms-of-service`, `/admin/*` (~25, `is_admin`-gated). Nav = **5 tabs**
(홈·상담·궁합·운세우편함·MY). **Missing entirely:** wallet, candle, session/turn, paywall/top-up. **Orphaned/stub:**
`/mail-detail` (unreachable + engine returns null). **Dead-end:** `INSUFFICIENT_DUK` on chat (actionless) + compat (generic error).

## 4. Backend / Staging vs Production Matrix
| Capability | In code | Staging | Production |
|---|---|---|---|
| Consultation (server-trust, 3 engines, structured, WHY, safety) | ✅ | ✅ (billing-OFF path validated) | ✅ deployed earlier (LLM prod-verify still an owner item historically) |
| Duk billing (reserve/commit/refund/debt) | ✅ | ✅ **live-validated 5/12** | ❌ schema not applied (prod untouched) |
| WELCOME 10 / Candle | ✅ | ✅ live-verified | ❌ not in prod |
| Server analytics (welcome/duk_*/session) | ✅ | ✅ live (triggers) | ❌ not in prod |
| Client analytics (candle/consultation/compat-insufficient) | ✅ | code-verified; in-app live deferred | ❌ |
| IAP verify/refund/debt substrate + Edge seams | ✅ | ✅ deployed, fail-closed NOT_CONFIGURED | ❌ not deployed |
| Idempotency (global + paid-request + external-txn) | ✅ | ✅ validated | ❌/unknown in prod |
| Admin RPCs / attribution / retention tables | ✅ | ✅ (staging) | ⚠ partially applied historically (owner-apply) |
| Push / Email providers · Scheduler | ❌ noop/none | — | — |

**Headline:** the monetization stack is *built once, validated on staging, and not yet in production*. Promoting it to
production (apply `20260829–20260839`, deploy Edge, set flags, seed catalog) is an un-started release step.

## 5. Missing User Flows
1. **Entire Duk consumer surface** — wallet/balance, candle-lighting UX, session/turn/remaining-turn display,
   paywall/top-up. `src/features/duk/*` is fully built + tested but imported by **zero** screens.
2. **INSUFFICIENT_DUK is a dead-end** — authoritative balance snapshot reaches the client, then no top-up action
   (chat) / a misleading generic error (compat).
3. **mail-detail** orphaned; **AI disclaimer** not visible on the AI-output screens.

## 6. Admin / Operations Gaps
Duk economy admin (grant/adjust, economy_policy) NOT_IMPLEMENTED; cost KRW monitoring foundation-only; intelligence
inspector foundation; consultation audit metadata-only. (Dashboard/users/spend-guard/ads/popular/authz DONE.)

## 7. Retention Gaps
Push has no real provider (noop); **email doesn't exist**; **no scheduler/cron** (birthday/fortune auto-delivery not
triggered). In-app notification center, life-events, birthday card DONE.

## 8. Policy / Release Gaps
Lawyer-final terms/privacy; unified AI-disclaimer constant + placement on output screens; **paid/refund(청약철회)/
minor-purchase policy missing**; EAS config + store build; CI; device E2E; Sentry/remote crash reporting; production
deployment of the monetization stack.

## 9. Current Completion %
Denominator = the **currently-intended monetized V1** (consultation + fortune + retention + Duk economy + IAP + admin +
release). The free consultation+fortune sub-product is much higher than these blended numbers.
- **BACKEND ≈ 85%** — consultation/engines/Duk/WELCOME/analytics/IAP/admin/attribution built + staging-validated;
  remaining: push/email providers, scheduler, **production promotion** of the monetization stack.
- **CLIENT / UI ≈ 72%** — all non-monetization journeys done; the entire Duk surface (wallet/candle/turns/paywall) +
  insufficient-UX + mail-detail are missing.
- **OPERATIONS / ADMIN ≈ 78%** — core ops done; Duk-economy admin + cost KRW + intelligence inspector pending.
- **RELEASE ≈ 35%** — preflight + error boundary done; EAS/store build, CI, device QA, final policies, Sentry, and
  production monetization deploy all pending (store deferred 05B).
- **OVERALL V1 ≈ 68%** (monetized denominator). *As a FREE consultation beta it is ≈ 88%* (blockers: production
  LLM/DB verify, lawyer policies, native build if native is in the beta).

## 10. BLOCKER (to a usable monetized V1 beta; store 05B intentionally excluded)
- **Duk consumer UI absent** — users cannot see balance, earn via candle, see turns, or recover from INSUFFICIENT_DUK.
  The economy is invisible + unusable despite a validated backend.
- **Monetization stack not in production** — apply `20260829–20260839` + deploy Edge + flags to prod (owner-gated).
- **Lawyer-final privacy/terms + paid/refund/minor policy** — legal blocker for any paid feature.

## 11. HIGH
- AI disclaimer not on AI-output screens; single-source disclaimer constant missing.
- EAS config + native/store build path (also required to run the IAP native module) — ties to deferred 05B.
- Production LLM path + consumer DB/RLS verification (carried P0 from SSOT; confirm current prod state).
- Client-analytics production-like live check (deferred monitoring gate, 04G) before public release.

## 12. MEDIUM
- mail-detail orphaned; birthday/fortune auto-notification (needs scheduler); cost KRW admin; intelligence inspector;
  attribution deploy to prod; migration reproducibility debt; config.toml prod-linked-by-default (discipline-only guardrail).

## 13. LOW
- Apple sign-in button (type exists, no button); my.tsx stale comment; reactCompiler/typedRoutes experiment smoke-test;
  Terra unpriced in cost model; duk_exhausted analytics (overlaps INSUFFICIENT_DUK).

## 14. External / Deferred
- **05B store/business provisioning** (Apple seller / Google merchant / real products / real sandbox purchases) —
  DEFERRED_FOR_BUSINESS_ELIGIBILITY_DECISION (예비창업자 / 2027 program).
- Real push (FCM/APNs/Expo) + email (Resend/SES/…) providers — owner credentials.
- Kakao/Google OAuth console verification; Sentry credentials; lawyer policy finalization.

## 15. Next Sprint Recommendation
**Complete the end-user loop that is achievable WITHOUT store provisioning.** The free economy loop already works
server-side (WELCOME 10 + candle +1/day give users spendable Duk); the only thing missing is the **client surface**.
Build the Duk consumer UI against the staging-validated backend, make INSUFFICIENT_DUK actionable (earn-a-candle /
come-back-tomorrow now; store top-up later), and add the AI-disclaimer placement. This closes the single largest UI
gap, makes the economy visible/usable, and needs **no** business/store provisioning.

## 16. Estimated Remaining Development
- Duk consumer surface (Sprint J): ~1 focused sprint.
- AI-disclaimer + mail-detail cleanup: small, foldable into Sprint J.
- Production promotion of monetization stack: ~1 owner-gated activation (apply migrations + deploy Edge + flags).
- Retention real providers + scheduler: ~1 sprint, owner-credential-gated (external).
- Release hardening (EAS/store/CI/device-QA/policies): tied to 05B (deferred).
Rough path to a monetized beta (excluding deferred store): **~3–4 sprints**, the first being client-only + store-independent.

## 17. Owner Actions Required (only unavoidable)
- (Later, deferred) 05B store/business provisioning — held by owner decision.
- Lawyer-final terms/privacy + paid/refund/minor policy wording.
- Provider credentials: push (FCM/APNs/Expo), email, Sentry; Kakao/Google OAuth consoles.
- Authorize production promotion of the staging-validated monetization stack when ready.
- No business registration / paid-seller setup is requested now.

---

## NEXT_SPRINT_NAME
**SPRINT J — DUK CONSUMER SURFACE (store-independent economy UI)**

Dependency-safe ordered task list:
1. **Wallet/balance surface** — a MY row + a compact balance chip; wire `getWalletState()` (read-only, RLS). States: loading/zero/error.
2. **Candle UX** — a candle affordance (Home or wallet) → `lightCandle()`; success (+1) / cooldown (next-available) / error; emit `candle_lit` (already wired). This is the store-independent "earn Duk" loop.
3. **Session/turn display in chat** — show remaining turns / paid-session state via `getSessionStatus()` (read-only) so a paid consultation's turns are legible. (Backend billing already staging-validated; this is display-only.)
4. **INSUFFICIENT_DUK → actionable** — consume the `insufficientDuk{balance,required,shortfall}` snapshot already on the service result; show a top-up affordance that (store-deferred) routes to candle/come-back-tomorrow; fix the compat path to stop collapsing it into a generic error. (`consultationErrors` already has the `insufficient` kind.)
5. **Top-up/paywall screen (store-gated shell)** — render the catalog packs (First 20 / Base 50 / Large 120) read-only with a clear "준비 중" for actual purchase until 05B; no fake buy. Reuse the 05A `purchaseFlow` seam so it's ready when store opens.
6. **AI-disclaimer placement** — add one shared disclaimer constant + render it on chat/today/monthly/report output screens (compliance).
7. **mail-detail** — either route inbox items to it or remove the orphan; no dead routes.
8. Gates each step: `tsc` 0 · jest green · frozen engine diff ZERO · no client Duk-grant path introduced.

Do NOT implement Sprint J in this audit turn.

DEOKBUNI_V1_REBASE_AUDIT_COMPLETE
