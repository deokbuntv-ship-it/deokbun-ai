# DeokbunAI — RELEASE READINESS (V1.0, Claude app track)

> Directives §16 (release readiness) + §17 (native readiness). Honest snapshot of
> what is code-complete vs. what still needs an **Owner action** or **Codex** before
> a real release. No fabricated "done". Date context: pre-Codex-return (2026-08-17).

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
| Consumer UI + Admin UI | ✅ (owned by Design track) | — |

## Owner actions gating release
See `docs/OWNER_ACTIONS_AND_DECISIONS.md`. Summary of hard gates:
1. Edge secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — chat/admin fail
   closed (`SERVER_NOT_CONFIGURED`) until set. Names only: `docs/ENV_CONTRACT.md`.
2. SQL artifacts applied in order (`docs/OWNER_ACTIONS_AND_DECISIONS.md` §1A, §3C).
3. Native identifiers (below) — required for any native/store build.
4. Delivery provider (§G) + pricing table (§I) — optional; app is truthful without.

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
