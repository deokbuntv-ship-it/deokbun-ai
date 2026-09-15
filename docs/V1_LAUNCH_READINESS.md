# DeokbunAI (덕분이) V1.0 — Launch Readiness

> ⚠ **2026-09-06 — 출시 컷라인(무엇을 하고 무엇을 안 할지)은 `docs/V1_CUTLINE.md` 가 소유한다.**
> 이 문서는 게이트 정의를 소유하고, 그 게이트 중 무엇이 V1 필수인지는 컷라인 문서를 본다.

> ⚠ **HISTORICAL — Launch-Readiness Closure 스프린트 기준.** 현재 상태는 `PROJECT_STATE.md`, 기능 판정은 `FEATURE_MASTER_CHECKLIST.md`, 오너 액션은 `OWNER_TODO.md`.
> 이 문서의 테스트 수치·게이트 상태는 낡았다 (실제: **298 suites / 4,841 tests**, 2026-09-04).


Repository-grounded status, operations/recovery runbook, and owner boundary as of the
Launch-Readiness Closure sprint (HEAD after `feat(admin): retention control center`).
This document is the durable companion to that sprint's final report.

---

## A. V1 status matrix

Legend: **DONE** shipped in-repo · **PARTIAL** works but has a named gap · **MISSING** not built ·
**OWNER** requires a manual external action (deploy / credential / store).

| Area | Status | Evidence / gap |
| --- | --- | --- |
| Auth (signup-first) | DONE | `src/features/auth`, `OnboardingGate`; social login. |
| Onboarding | DONE | terms → canonical SELF birth → destination; gate-enforced. |
| Legal / consent capture | DONE | `TERMS_VERSION`, `profileService.saveConsent`, migration `20260820000000`. |
| Legal / policy documents | PARTIAL (DRAFT) | `/privacy-policy` + `/terms-of-service` real content, but **draft pending lawyer review** (OWNER). |
| Home IA | DONE (frozen) | order locked by `homeInformationArchitecture.test.ts`; bell added to header (not a card). |
| Today Fortune | DONE | V1.1; one-per-day cache. |
| Monthly Fortune | DONE | V1.2; civil-month coverage; one-per-month cache. |
| Consultation | DONE | decision engine + deterministic grounding; chat edge rate-limited. |
| Compatibility | DONE | V1. |
| Mailbox / Reports / Sharing | DONE | owner-RLS; share token. |
| Popular-question conversion | DONE | admin-managed + funnel; DB-truth fallback policy. |
| **Notification center (consumer)** | **DONE (this sprint)** | Home bell + badge + `/notifications`; deep-link allowlist. |
| **Retention admin** | **PARTIAL (this sprint)** | read-only overview `/admin/retention`; **create/send NOT built** (needs scheduler + safe cross-user targeting). |
| Acquisition tracking | PARTIAL | code + admin dashboard DONE (`/admin/ads`, `ads/performance`); **DB schema in `docs/ADVERTISEMENTS_SETUP.sql`, not migrations** (OWNER apply). |
| **Rate limit / abuse** | **PARTIAL→improved (this sprint)** | chat edge cap DONE; **analytics cap added** (`20260825000000`, OWNER apply); Today/Monthly generation count-gap remains (mitigated by server-owned date + cache). |
| **Monitoring** | **PARTIAL→improved (this sprint)** | PII-safe logging seam + **root ErrorBoundary added**; **no Sentry** (seam ready, OWNER credential later). |
| **Backup / recovery** | DOCS (this sprint) | see §B; live Supabase PITR/backup settings are OWNER-verify. |
| App store config | PARTIAL (this sprint) | name → 덕분이, bundle IDs added (`com.deokbun.app`); **OWNER confirm final IDs + store accounts**. |
| **Consumer brand → 덕분이** | **DONE (this sprint)** | all user-facing surfaces + LLM prompt self-name migrated; serverBundle regenerated; internal identifiers preserved. **OWNER: deploy chat edge** to activate the prompt self-name. |
| Push (external) | MISSING | provider abstraction only (noop); OWNER: FCM/APNs credentials. |
| Email (external) | MISSING | OWNER: email provider + API key. |
| Payment / monetization | MISSING (by design) | see §C — **review required before V1 freeze**. |

### P0 remaining
- Privacy policy / terms → final lawyer-reviewed wording (OWNER; content structure + versioning are in place).
- Apply the OWNER_APPLY migrations (see §D) so notification center, analytics rate limit, and retention admin function against real data.

### P1 remaining
- Retention admin create/send (blocked on a scheduler + external push/email — do not fake).
- Acquisition DB into version-controlled migrations (currently `docs/ADVERTISEMENTS_SETUP.sql`).
- Sentry (or equivalent) behind the existing logging/ErrorBoundary seam.
- Today/Monthly generation burst-count hardening in the chat edge (defense-in-depth; already cost-bounded by cache + server-owned date).

### Owner-only remaining
- Store accounts (Apple Developer, App Store Connect, Google Play), final bundle IDs, OAuth production redirect URIs, external push/email credentials.

---

## B. Operations & recovery runbook

Grounded in the repo's actual architecture (Expo web/native client · Supabase Postgres + RLS · Supabase Edge
Deno `chat`/`ad-track` functions · OpenAI provider). Migrations are versioned in `supabase/migrations/`;
the chat edge ships a prebuilt `serverBundle.mjs`.

**Data criticality**
- Critical (irreplaceable): `profiles`/consent, `consultation_subjects`, conversations + messages, reports,
  `daily_fortunes`, `monthly_fortunes`, `life_events`, `notification_preferences`.
- Reconstructable: `product_events` (analytics), generated fortune views, aggregate metrics.

**DB incident (data loss / corruption)**
1. Stop writes if a bad actor/loop is suspected (disable the offending client path or rotate keys).
2. Restore from Supabase point-in-time recovery / daily backup via the Supabase dashboard. *(OWNER must verify
   PITR/backup retention is enabled — this cannot be confirmed from the repo.)*
3. Prefer restoring critical tables; analytics can be left to forward-fill.

**Bad migration**
- Never edit an applied migration (§63). Ship an **additive forward-fix** migration that corrects state.
- All new migrations here are idempotent (`create ... if not exists`, `on conflict do nothing`) and were
  authored OWNER_APPLY — apply them in filename order.

**Edge deploy rollback (`chat` / `ad-track`)**
- Redeploy the previous known-good function: `git checkout <good-sha> -- supabase/functions/chat` then
  `supabase functions deploy chat` (the `serverBundle.mjs` is committed, so a checkout fully pins behavior).
- The client tolerates edge failure via the typed error contract (friendly Korean message), so a brief rollback
  window degrades gracefully rather than crashing.

**Client rollback**
- Web: redeploy the previous static export (`npx expo export --platform web` output) or previous git tag.
- Native: submit/roll back the previous build via the store (OWNER).

**AI provider (OpenAI) outage**
- Stored Today/Monthly/mailbox/reports remain fully readable — they are owner-RLS direct reads with **no LLM at
  read time**.
- New consultation / first generation returns a graceful typed error (`LLM_TIMEOUT` / `LLM_FAILURE`), shown as
  "잠시 후 다시 시도해 주세요." — never a crash, never fabricated content.
- The new root ErrorBoundary catches any unexpected render fault with a retry.

---

## C. Monetization checkpoint

**MONETIZATION_REVIEW_REQUIRED_BEFORE_V1_FREEZE = YES**

No payment/IAP/Plus/premium-routing is implemented (by design). Before a V1 freeze, an OWNER discussion must
cover: FREE/PLUS structure; the ₩7,700 floor hypothesis vs. ₩9,900 / ₩12,900; Apple/Google auto-renew
subscriptions; web payment strategy; store-fee assumptions; heavy-user cost; premium model routing; the
FREE↔PLUS feature boundary; M1/M3 paid retention; churn; and willingness-to-pay. This is a documentation
checkpoint only — nothing here implements or commits to a pricing model.

---

## E. Brand migration (덕분이)

Consumer service name is **덕분이**. User-facing surfaces (login, onboarding/consent, Home header, consultation
welcome/composer/loading, birth-profile copy, MY disclaimer, shared-report + share copy, public site, legal
docs, content/famous SEO) now say 덕분이. **Intentionally preserved:** app slug/scheme + bundle IDs
(`DeokbunAI` / `deokbunai` / `com.deokbun.app`), all Latin `DeokbunAI` identifiers/comments + `DEOKBUNAI_*`
version constants, the operator-only admin console brand, and the **edge-bundled LLM system prompts**
(today/monthly/consultation) — the AI's self-name is a persona/behavior change requiring an edge redeploy.
Bundle identifiers were **not** changed by the brand rename (they are independent). Locked by
`src/app/__tests__/consumerBrand.test.ts`.

The AI self-name in the consultation / Today / Monthly system prompts is now 덕분이 (edge/server code changed
because the name is verbalized to the consumer), and `serverBundle.mjs` was regenerated + audited (덕분이
present, zero 덕분AI, 3 engine externals, no secrets, no client leak). **OWNER: `supabase functions deploy chat`
to activate the new persona** — until deployed, the running edge still self-refers as 덕분AI. Prompt versions
were intentionally not bumped (cosmetic self-name; absent from structured output → no fortune-cache
regeneration).

## D. Owner actions

**Now (to activate this sprint's work):**
1. Ensure `public.is_admin()` exists (`docs/admin/ADMIN_SETUP.sql`).
2. Apply OWNER_APPLY migrations in order (`supabase db push`, or apply individually):
   `20260821000000` daily_fortunes · `20260822000000` monthly_fortunes · `20260823000000` retention_foundation ·
   `20260824000000` popular_consultation_questions · `20260825000000` product_events_rate_limit ·
   `20260826000000` admin_retention_overview.
   *(Earlier product migrations `20260817*`–`20260820*` if not already applied.)*
3. **Deploy the chat edge** (`supabase functions deploy chat`) — the regenerated `serverBundle.mjs` carries the
   consumer-visible 덕분이 prompt self-name. Until deployed, generated answers still self-refer as 덕분AI.
   (This is the only edge change in the sprint.)

**Later (external, owner-only):**
- Final lawyer-reviewed privacy policy / terms wording.
- Acquisition DB (`docs/ADVERTISEMENTS_SETUP.sql`) into migrations + apply.
- Store: Apple Developer / App Store Connect / Google Play; confirm final bundle IDs; production OAuth redirect
  URIs; external push (FCM/APNs) and email provider credentials.
- Monetization review (§C) before V1 freeze.
