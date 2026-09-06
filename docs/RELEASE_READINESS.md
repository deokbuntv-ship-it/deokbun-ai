# DeokbunAI — RELEASE READINESS (V1.0, Claude app track)

> ⚠ **HISTORICAL — 2026-08-17 기준.** 현재 상태는 `PROJECT_STATE.md`, 기능 판정은 `FEATURE_MASTER_CHECKLIST.md`, 오너 액션은 `OWNER_TODO.md`.
> 이 문서의 테스트 수치·게이트 상태는 낡았다 (실제: **298 suites / 4,841 tests**, 2026-09-04).


> Directives §16 (release readiness) + §17 (native readiness). Honest snapshot of
> what is code-complete vs. what still needs an **Owner action** or **Codex** before
> a real release. No fabricated "done". Date context: pre-Codex-return (2026-08-17).

> 📌 전체 V1.0 상태의 단일 기준선: [`DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md`](DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md)
> (production 검증 매트릭스 · readiness % · launch blockers). 이 문서는 그 하위 상세다.
> 운영/배포 준비(env·edge·DB/RLS·observability·failure matrix·smoke runbook)는
> [`BETA_PRODUCTION_READINESS.md`](BETA_PRODUCTION_READINESS.md) (Sprint 2B) 참조.
>
> **Sprint 2B 갱신 (2026-08-14):** 관리자 write false-success 제거(서비스가 실패 시 throw →
> 화면 에러 표시); 세션 만료(edge 401) → `AUTH_REQUIRED` 정규화 → 로그인·재개. `jest` 247.

## Quality gates (local, this branch)
| Gate | Command | State |
|---|---|---|
| Lint/format of diffs | `git diff --check` | clean |
| Types | `npx tsc --noEmit` | 0 real errors¹ |
| Unit tests | `npx jest --ci` | green |
| Web bundle | `npx expo export --platform web` | exit 0 |
| Deps | `npm ls --depth=0` | resolved |

¹ `.expo/types/router.d.ts` may emit `RelativePathString` false-positives that are
environmental (stale Metro type-gen); regenerate per `memory/router-dts-regen`.

## Feature readiness
| Area | Code | Blocker to "live" |
|---|---|---|
| Auth / Subjects / Consultation / Conversation persistence / Memory | ✅ | none |
| OpenAI chat (rate limit, requestId, error contract, context bounding) | ✅ | Owner: set `OPENAI_API_KEY` edge secret |
| 명리(saju) engine | ✅ | none |
| 자미두수(ziwei) engine — iztro adapter | ✅ code | Codex: independent golden-fixture verification |
| 기문둔갑(qimen) engine — qimen-dunjia adapter | ✅ code | Codex: independent golden-fixture verification |
| Fortune generation + delivery contracts | ✅ contracts | Owner §G: choose delivery provider; apply delivery SQL |
| Admin AI-cost aggregation | ✅ logic | Owner §I: supply pricing table (else cost = unknown) |
| Content/Image/Video/Famous pipelines | ✅ code | Owner: deploy edges + apply SQL (see OWNER_ACTIONS) |
| Consultation Intelligence (evidence/assessment/quality/outcome) | ✅ contracts (foundation) | Codex: evidence→assessment ruleset + wiring; Owner: apply `CONSULTATION_INTELLIGENCE_DB.sql` when pipeline ships (HOLD). Fail-closed until then — no fabricated assessments. |
| Consumer UI + Admin UI | ✅ (owned by Design track) | — |
| Web deployment (Vercel + www.deokbunai.com) | ✅ live | Owner: set `EXPO_PUBLIC_PUBLIC_BASE_URL` in Vercel for canonical/SEO |
| Web OAuth callback (`/login-callback`) | ✅ route added | works for google/kakao/naver; served as static `login-callback.html` |
| Naver login | ✅ **PRODUCTION E2E VERIFIED** (2026-08-12, web) | none — live; native gated on identifiers |

## Owner actions gating release
See `docs/OWNER_ACTIONS_AND_DECISIONS.md`. Summary of hard gates:
1. Edge secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — chat/admin fail
   closed (`SERVER_NOT_CONFIGURED`) until set. Names only: `docs/ENV_CONTRACT.md`.
2. SQL artifacts applied in order (`docs/OWNER_ACTIONS_AND_DECISIONS.md` §1A, §3C).
3. Native identifiers (below) — required for any native/store build.
4. Delivery provider (§G) + pricing table (§I) — optional; app is truthful without.

## Web deployment readiness (OWNER-AWAY sprint)
- **Domain live:** apex `deokbunai.com` → 308 → `https://www.deokbunai.com` (Production), via Vercel + Gabia DNS (Owner-configured).
- **Supabase env in Vercel:** `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set (confirmed by Owner).
- **Web OAuth:** uses `window.location` for the redirect (no base-URL var needed); `/login-callback` is a real static page now, so the popup completes/closes. For **google/kakao** (Supabase built-in OAuth), the Supabase **Redirect URLs** allow-list (Dashboard → Authentication → URL Configuration) must include `https://www.deokbunai.com/login-callback`. Naver uses the edge bridge and does not rely on Supabase Redirect URLs.
- **Canonical/SEO:** set `EXPO_PUBLIC_PUBLIC_BASE_URL=https://www.deokbunai.com` in Vercel to enable canonical/OG/sitemap (graceful/omitted until then — no fake domain). Not required for OAuth.
- **No `vercel.json`:** intentionally none — a broad SPA rewrite would override per-page SEO HTML. Static per-route files (incl. `login-callback.html`) are served directly.

## Native readiness (§17) — ⛔ DECISION_REQUIRED, not yet set
- `app.json`: `name`/`slug`=DeokbunAI, `scheme`=deokbunai, `version`=1.0.0. Icons set.
- **Missing (intentionally not set by Claude):** `ios.bundleIdentifier` and
  `android.package`. These are permanent store identity (reverse-DNS) and an owner
  branding decision — see OWNER_ACTIONS §H. **Do not guess them.**
- Web export does NOT need them and passes today. An **EAS/native build or store
  submission WILL fail** until both are set.
- Additional native prerequisites (when you go native): Apple Developer account
  ($99/yr) + Google Play Console ($25 once); push needs APNs/FCM setup (ties to §G).

## What is explicitly NOT in V1 scope (truthful non-features)
- No external fortune push/email send (in-app mailbox only) — §G.
- No real ₩ cost display until a pricing table is connected — §I (token counts show).
- Ziwei/Qimen ship as adapter-verified; academic golden-fixture sign-off is Codex's.
- Scheduler auto-publish (pg_cron→Edge) stays disabled without explicit approval.

## Release-candidate checklist (owner runs, in order)
1. Set edge secrets (`ENV_CONTRACT.md`) → smoke chat (real reply, not fallback).
2. Apply pending SQL (`OWNER_ACTIONS §1A`) → admin dashboards populate.
3. Run manual smoke script (`OWNER_ACTIONS §4`).
4. (Native only) Decide §H identifiers → EAS build.
5. (Optional) Decide §G delivery + §I pricing.
