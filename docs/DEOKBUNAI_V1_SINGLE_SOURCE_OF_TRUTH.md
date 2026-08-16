# DEOKBUNAI V1.0 — SINGLE SOURCE OF TRUTH (SSOT)

> **Purpose.** One authoritative, code-verified baseline of what DeokbunAI actually
> is right now — implemented vs. documented, local vs. production, foundation vs.
> live-wired. This is the official input to the next *Independent Product + UX + AI +
> Architecture Review*. It is a **status document**, not an architecture spec — it
> references the detailed canonical docs, it does not replace them.
>
> **Precedence when sources conflict:** (1) actual code → (2) tests/build → (3) git
> history → (4) production E2E evidence → (5) docs. Where a doc disagrees with code,
> code wins and the drift is recorded (§25, §27).
>
> **Author / basis:** repository-wide integration audit (12 parallel domain readers +
> direct verification), HEAD `cf2fe7e`, 2026-08-14. Gates green at authoring time.
> **This audit built the baseline only — it did not score product/UX quality; that is
> the separate Independent Review (§26–§28).**

---

## 1. Product Mission

DeokbunAI is **not a simple "AI 사주 answer bot."** Its premise (PRD_MASTER §2–3) is to
take the *calculation outputs* of multiple East-Asian interpretation systems — 명리
(SAJU), 자미두수 (Ziwei), 기문둔갑 (Qimen) — **structure them as facts**, and integrate them
into a single consultation context so an LLM can give consistent, grounded, deep
consultation. The user experiences "good consultation," not "which discipline was
used" (discipline names are not foregrounded in the UI). Architecturally this demands
a hard **calculation ↔ LLM separation** and a **swappable model adapter**, with
stability (login/session/reliability) prioritized over cost.

> ⚠️ **Reality check (see §9–§11):** the *separation* exists, but the deterministic
> engines are **not yet wired into the live consultation prompt.** Today the LLM
> answers a 사주 question from raw birth strings, not from any computed chart. This is
> the single most important gap between mission and current implementation.

## 2. V1.0 Scope (in)

- Login-based personalized consultation (OAuth: Naver ✓ prod, Kakao/Google code-ready).
- Birth-info registration + multi-subject (본인/가족/지인) management.
- Free-form chat consultation with conversation history + rolling memory summary.
- Deterministic engines (SAJU/Ziwei/Qimen) computed as **facts**, wired into the prompt
  (engines exist; the live wire is the top remaining item — Codex, §11/§23).
- Server-side LLM via Supabase Edge (`chat` → OpenAI Responses API), calc/LLM separated.
- Admin operations console (users, consultations, content, AI-cost, dashboard).
- Public content + Famous-Saju SEO surface (acquisition funnel top).
- Korean-first, **web** as the launch platform.

## 3. Explicitly Deferred Scope (not V1 — not defects)

| Deferred | Status | Note |
|---|---|---|
| Payment / subscription / IAP | `DEFERRED_POST_V1` | V1 is free beta (PRD §4). No code — intended. |
| Advanced analytics / product funnels | `DEFERRED_POST_V1` | Only operational admin aggregates are in scope. |
| Native iOS/Android build & store | `BLOCKED_OWNER` | Web-only for V1; needs bundleId/package + store identity. |
| Foreign-language / non-KR market | `DEFERRED_POST_V1` | Not in V1 scope. |
| Automated fortune delivery + push | `DEFERRED_POST_V1` (mostly) | Retention loop is contract-only; see §13. |
| Email OTP login | `DEFERRED_POST_V1` | PRD Non-Goal. |
| Topic-select / question-form pre-UI | removed by decision | PRD Non-Goal (§4). |

## 4. Current Git Baseline

- **Branch:** `admin/master-operations-content` · **HEAD:** `cf2fe7e` · **working tree:** clean.
- **Remote:** `git@github.com:deokbuntv-ship-it/deokbun-ai.git`. `git fetch` **fails from
  the audit environment** (no SSH access), so remote state is *last-known-local*: cached
  `origin/main` and `origin/admin/master-operations-content` both `= cf2fe7e` (0/0
  ahead-behind). This *suggests* the branch was pushed/merged by the Owner, but it is
  **not independently verified**. No push is performed by this audit.
- **Recent line:** Naver login (…`f356ea5`) → web deploy fixes (`753af6d`,`0693e07`) →
  Naver prod-verified (`8f8c9b9`) → AUTO_SAFE hardening → integration docs (`4dad299`) →
  Consultation Intelligence foundation (`1da8083`,`cf2fe7e`).
- Many `app/**`, `engine/**`, `admin/**` feature branches exist locally (historical).

## 5. Architecture Map (as-built)

```
Web (Expo Router static export, react-native-web) ── Vercel (dist/, cleanUrls)  [PROD ✓]
  src/app/(tabs): 홈 / 상담 / 운세우편함 / MY   + chat, birth-info, subjects, today, records
  src/app/admin/*  (web, URL-reachable; sidebar shows 7)
  src/app/content/*, famous/*  (public SEO)
        │
        ├─ Auth: Supabase (kakao/google built-in) + Naver trusted edge bridge  [Naver PROD ✓]
        ├─ Data: @supabase/supabase-js (RLS)  → profiles/subjects/conversations/messages/…
        ├─ Chat: chatService → contextSelector → promptBuilder → supabaseEdgeLLMAdapter
        │          → Edge `chat` (verify_jwt) → OpenAI /v1/responses (gpt-5-mini, server-decided)
        │          ⚠ engines NOT invoked in this path (raw birth strings only)
        ├─ Engines (pure, local): interpretation/SAJU, ziwei(iztro), qimen(qimen-dunjia),
        │          analysis (EngineEvidence / crossAnalysis / engineOrchestration seam)  ⚠ not wired
        ├─ Consultation Intelligence: src/features/intelligence/** (contracts+tests)  ⚠ not wired
        └─ Edge fns: chat, naver-auth[PROD ✓], content-generate, famous-suggest,
                     media-generate, video-generate, video-status
```
Detailed structure: `ARCHITECTURE.md` (⚠ stale — see §25), `docs/CODEX_HANDOFF_2026-08-17.md §21`.

## 5b. Readiness Matrix (code / integration / production)

Realistic, ~5% granularity, **basis attached** (no fake precision). *Code* = does the
code exist & compile; *Integration* = are the pieces actually wired together end-to-end;
*Production* = verified working in prod.

| Area | Code | Integ. | Prod | Basis |
|---|---|---|---|---|
| Authentication | 90% | 70% | 40% | Naver full+verified; Kakao/Google code-complete but unverified; guard/error-contract partial |
| Consumer UX / journey | 80% | 70% | 25% | screens FUNCTIONAL_LOCAL, connected locally; 3 friction traps; only web deploy proven |
| Consultation / Chat | 75% | 60% | 20% | E2E_LOCAL minus engines; no LLM prod proof |
| AI pipeline (engine-grounded) | 60% | 25% | 5% | engines exist, adapters partial, **the prompt wire is missing** |
| Deterministic engines (calc) | 80% | 40% | 10% | SAJU/Ziwei/Qimen compute; adapters partial; semantics unverified (Codex) |
| Consultation Intelligence | 85% | 10% | 0% | contracts+22 tests; not wired; SQL not applied |
| Memory / Retention / Fortune | 40% | 20% | 5% | memory live; fortune/mailbox scaffold; push absent |
| Content / Famous / SEO | 75% | 45% | 15% | routes+guards built; needs ~24 SQL applied; CTA-to-consult missing |
| Admin | 80% | 60% | 20% | real-data areas + solid authz; needs SQL applied; 5 truthful seams |
| Database / RLS | 85% | 40% | 30% | thorough artifacts; **no migrations dir**; apply manual/unverified |
| Infrastructure | 85% | 65% | 50% | Vercel verified; Supabase live; edges/secrets partial |
| Security / Privacy | 75% | 65% | 40% | no client secret exposure, RLS-based; drafts user_id + apply-dependence |
| Acquisition / Analytics | 5% | 0% | 0% | NOT_STARTED |
| Native (Android/iOS) | 25% | 10% | 0% | web-only; no bundleId/package |

**Roll-up (weighted, honest):** **Code ≈ 70%** · **Integration ≈ 45%** · **Production ≈ 20%.**
The gap between Code and Integration/Production *is the story*: much is built and cleanly
separated, but the engine→consultation chain, the DB/LLM production path, and retention are
not yet wired/verified.

## 6. Consumer Journey (code-verified)

Actual first-time path and where the wall lands:

```
Home(홈, index.tsx) ── type question / tap subject
  → PersonSelectorSheet → (no subject) → birth-info.tsx  (~8-field form)
  → 상담 시작하기  → chat.tsx  → type first message → send
  → chatService.sendMessage → authGuard()  ← ❗FIRST login gate is HERE
  → (logged in) context → prompt → Edge → OpenAI → answer → persist → history(상담)
```

- **The whole flow is code-connected end-to-end LOCALLY** (login→home→consult→person→birth→
  chat→persistence→history), per HANDOVER §0 and confirmed here.
- **BUT** two structural traps degrade the first-time experience (§7, findings F-C1/F-H1..3).
- Return visit: `getSession` restore + history hydration (resume/open-by-id/per-subject) work.

## 7. UX State (inventory for the Independent Review — not scored here)

Per-screen: 홈/상담/chat/birth-info/subjects/MY are `FUNCTIONAL_LOCAL` with proper
loading/empty/error states; 운세우편함(inbox)+mail-detail are `SCAFFOLDED` truthful-empty.
The Independent Review (§26) should score these. Structural UX issues already found:

- **F-C1 (critical) — auth wall timing:** the only login gate is inside
  `chatService.sendMessage` (`chat/services/chatService.ts:54`). A new user completes the
  question, subject sheet, full birth-info form, and the first message **before** being
  asked to log in.
- **F-H1 — thread loss on login:** `login.tsx:22` always `router.replace('/')`; the chat
  thread + just-typed message are lost, no auto-resend (`chat.tsx` handleSend).
- **F-H2 — dropped question on Home:** `(tabs)/index.tsx:123` opens the subject sheet
  without forwarding the typed question; `QuestionComposer` clears its input on submit.
- **F-H3 — temp-subject trap:** birth-info's primary CTA `상담 시작하기` creates a `temp:`
  subject (`birth-info.tsx:288`) that never appears in history/recents/switcher
  (keyed on `isSavedSubjectId`) — the default action yields an un-findable consultation.

## 8. Authentication

| Provider / piece | Status | Evidence |
|---|---|---|
| **Naver** (client bridge + `naver-auth` edge + `/login-callback` + session) | `PRODUCTION_E2E_VERIFIED` | `auth/naver/**`, `supabase/functions/naver-auth`, doc §7 (2026-08-12) |
| Kakao / Google (Supabase built-in) | `PRODUCTION_CONFIG_REQUIRED` | `authService.signInWithSupabaseOAuth`; **no prod evidence**; Kakao KOE205 (console) outstanding |
| Account-takeover guard | `PARTIAL` | server rule deployed+tested (`naver-auth` decideNaverLink → 403); find-or-create keyed by **email only** (a Naver email change → duplicate account) |
| Error contract / friendly messages | `PARTIAL` | `errors/authErrors.ts` exists+tested but **not wired to UI**; `login.tsx` shows one hardcoded string; `AuthContext` discards `reason` |
| Client route guard | `PARTIAL` | `requireAuthenticatedUser` exists but only tests consume it; enforcement = backend RLS + chat edge `verify_jwt`. Admin routes ARE fail-closed gated. |
| Logout / session restore / refresh | `FUNCTIONAL_LOCAL` | `my.tsx`→signOut; `getSession`+`onAuthStateChange`; supabase autoRefresh |

**Truth:** Naver is the only verified login. Kakao/Google are code-complete but
unverified (owner console + Supabase Redirect-URL allow-list outstanding).

## 9. Consultation & Chat

UI→service→memory→prompt→adapter→edge→persistence is `E2E_LOCAL` (works end-to-end
locally, minus engines). Login-before-LLM gate is enforced and **tested** (제12조: no paid
adapter call while unauthenticated). Conversation memory (rolling summary) works. The
consultation is currently a **general-purpose LLM chat with raw birth strings as
context** — see §10/§11.

## 10. AI Pipeline (live call path)

```
chat.tsx → chatService.sendMessage → authGuard ✓ → selectConsultationContext (RAW strings)
  → [❌ no engine step] → buildPrompt → supabaseEdgeLLMAdapter (sends only {messages,requestId})
  → Edge chat (verify_jwt) → readServerConfig (LLM_MODEL || 'gpt-5-mini', server maxOutputTokens)
  → OpenAI /v1/responses → parse → persist messages/draft → history
```

- **Model config is server-authoritative.** Client `chatConfig` (`defaultModel`
  `'gpt-mini-placeholder'`, `temperature`, `maxOutputTokens`, `retryCount`,
  `requestTimeoutMs`) is **dead** — the adapter forwards only `{messages, requestId}`
  (F-H: dead-config; no client retry/timeout). Not a security issue; a reliability +
  clarity issue.
- **No production evidence** for the LLM path — needs `OPENAI_API_KEY` edge secret +
  deploy + an E2E run. Only Naver is prod-verified.
- Edge failure contract + rate-limit are coarse (`RATE_LIMITED`/`SERVER_NOT_CONFIGURED`
  granularity deferred pending live Supabase error-shape verification).

## 11. Engines (deterministic)

| Engine | Calc | Adapter→EngineEvidence | Tests/Fixtures | Live-wired to prompt | Prod |
|---|---|---|---|---|---|
| **SAJU / Myungri** (in-repo, **FROZEN `7c7ed82`** — Codex `APPROVED_FREEZE`) | ✅ E2E_LOCAL — 立春 year / 12-Jie month + 십신·지장간·오행·관계·대운·세운·월운·시간축·대운십신·통근투간·월령득령 | ✅ **CONNECTED** (`toSajuEvidence` → `buildConsultationGrounding` → chatService) | 464 tests (+ grounding E2E: Solar/Lunar equivalence + fail-closed) | ✅ **grounding path** | ❌ |
| **Ziwei** (iztro `2.5.8`, MIT) | ✅ FUNCTIONAL_LOCAL — iztro-default@2.5.8, ko-KR, fixLeap | ✅ **CONNECTED** (`toZiweiEvidence` → structured sections → `buildConsultationGrounding`) | ziwei tests + evidence sections + dual-engine E2E | ✅ **grounding path (dual-engine)** | ❌ |
| **Qimen** (qimen-dunjia `2.1.0`, MIT, 時家·拆補法) | ✅ FUNCTIONAL_LOCAL | ✅ **CONNECTED** (`toQimenEvidence` → sections → grounding, QUESTION-TIME) | qimen tests + evidence sections + tri-engine E2E | ✅ **grounding path (question-time, activation-gated)** | ❌ |
| Orchestration/cross-analysis seam | — | ◐ SAJU+Ziwei+Qimen live; cross = per-engine, no fake consensus | analysis + dual/tri-engine tests | `ENGINE_CONNECTED={saju:true, ziwei:true, qimen:true}` | ❌ |

- **Semantic/astrological correctness is `BLOCKED_OWNER`/Codex** (golden fixtures + 학파/정국
  canon required; `ZIWEI_ENGINE_SPEC.md`/`QIMEN_ENGINE_SPEC.md` are marked "RESEARCH/SPEC
  SCAFFOLD").
- **SAJU (2026-08-16) and Ziwei (Ziwei V1) are now wired** — both run in the consultation path
  (dual-engine, with honest SAJU-only / Ziwei-only degraded modes). The **Qimen** wire
  (`toQimenEvidence` → grounding) remains a *known, deliberate* Sprint 3 handoff, not a regression.
  **Do not change engine semantics (§19).**

### 11b. SAJU product integration (2026-08-16) — honest status

The frozen Saju/Myungri engine is connected to the live consultation, ending "engine exists but
consultation doesn't use it." Real production chain:
`draft.birthInfo → toSajuEngineInput → executeSajuFromBirthInput (frozen) → SajuEngineResult +
Myungri facts → toSajuEvidence (converter) → buildConsultationGrounding → chatService → promptBuilder`.

| Stage | Status |
|---|---|
| `SAJU_CALC` | **FROZEN** (`7c7ed82`) |
| `SAJU_EVIDENCE` (`toSajuEvidence`) | **CONNECTED** — facts-only converter (4주·일간·오행·십신·지장간·월령/득령·통근/투간·대운·대운십신·当年 세운/월운 + 立春/12-Jie provenance) |
| `SAJU_GROUNDING` | **CONNECTED** — fail-closed (unsupported/ambiguous/unknown-time-on-boundary → `unavailable`, no fabrication) |
| `SAJU_PROMPT` | **CONNECTED** — `promptBuilder` renders the facts + requests the structured schema; LLM interprets, does not calculate |
| `SAJU_LLM` | **CODE_COMPLETE / OWNER_ACTION** — `supabaseEdgeLLMAdapter` → edge `chat` (holds the OpenAI key server-side). Live calls need the edge deployed + `OPENAI_API_KEY` secret. Boundary integration-tested with a mock. |
| `STRUCTURED_RESULT` (`ChatMessage.structuredResult`) | **CONNECTED** — `parseStructuredConsultation` (backend validate) → `buildStructuredConsultationResult` → `chatService` → assistant message → `StructuredConsultationResult` render. Malformed/prose → plain-text fallback (no crash). |
| `SAJU_LIVE_CHAT` | **CONNECTED** — `chat.tsx` renders `StructuredConsultationResult` when `structuredResult` present (else `ChatBubble`); long-form EXPANDED; answer-start anchor preserved. |
| `SAJU_FOLLOW_UP` | **CONNECTED** — contextual `followUps` from the parsed result → `onSelectFollowUp` → `submitQuestion` (same conversation, subject/grounding preserved). |
| `ASSESSMENT` / `CROSS_ANALYSIS` | SAJU-only evidence; assessment **fail-closed** (`toConsumerAssessmentView([])` → not-connected, no fabricated 15-axis score); **no "3-학문 일치"** (ziwei/qimen unconnected) |

Deferred (recorded, do NOT start here): Qimen→grounding (Sprint 3, timing questions only);
deterministic SAJU+Ziwei cross-analysis domain mapping (Sprint 4). Detail: `docs/SAJU_INTEGRATION_SPRINT.md`.

### 11c. Ziwei (자미두수) V1 product integration — `READY_FOR_CODEX_ZIWEI_FULL_PRODUCT_REVIEW`

The existing iztro Ziwei engine is connected to the live consultation **alongside** the frozen SAJU
engine (dual-engine). Chain: `draft.birthInfo → toZiweiBirthInput (lunar→solar via lunar-javascript)
→ computeZiweiChartMemoized (iztro, unchanged) → toZiweiEvidence (+ structured sections) →
buildConsultationGrounding (SAJU + Ziwei) → prompt → structured consultation`.

| Stage | Status |
|---|---|
| `ZIWEI_CALC` | **FUNCTIONAL_LOCAL** — iztro `2.5.8` (MIT), `iztro-default@2.5.8`, fixLeap, ko-KR (engine unchanged) |
| `ZIWEI_INPUT` | **CONNECTED** — exact time required (else `missing_birth_time`); lunar→solar via lunar-javascript (leap = negative month); Solar/Lunar equivalent births → identical evidence |
| `ZIWEI_EVIDENCE` (`toZiweiEvidence`) | **CONNECTED** — facts-only sections (명반 기준·12궁·四化·근거·한계); provenance + Saju↔Ziwei convention note + characterization limitation; `hasTimingEvidence:false` (natal only) |
| `ZIWEI_GROUNDING` / orchestration | **CONNECTED** — `ENGINE_CONNECTED.ziwei=true`; dual / SAJU-only / **Ziwei-only** (pre-1970, iztro wider range) / both-unavailable; fail-closed, no fabrication |
| `ZIWEI_PROMPT` | **CONNECTED** — both engines' sections rendered + **엔진 구분** attribution + convention discipline + qimen 미연결 |
| `CLAIM_VALIDATION` | **CONNECTED** — Ziwei claim allowed only when available; Qimen claim / "세 학문 일치" / **strong Saju↔Ziwei full-consensus** rejected (V1 has no deterministic cross-map); forbidden theory rejected |
| `ZIWEI_LLM` / live | **CODE_COMPLETE / OWNER_ACTION** — same edge `chat` + `OPENAI_API_KEY` as SAJU |

**QIMEN stays disconnected** — no "기문둔갑 사용"/"세 학문 일치" claims. No new score system; cross-analysis
is per-engine separation (§22 insufficient_evidence is the honest default). Detail + Codex checklist:
`docs/CODEX_ZIWEI_FULL_PRODUCT_REVIEW.md`.

### 11a. Myungri V1 deterministic freeze — `APPROVED_FREEZE` (canonical commit `7c7ed82`)

Codex final review (2026-08-16) returned **`APPROVED_FREEZE`** for the Myungri deterministic
CALC layer at **`7c7ed82f9dcabad034795919f6103ef562d0a6bb`**. Freeze record + Codex's 12-point
PASS checklist: `docs/MYUNGRI_V1_FREEZE.md`. Detail: `MYUNGRI_TIME_AXIS_V1.md`,
`MYUNGRI_YEAR_MONTH_BOUNDARY_FIX.md`.

**Frozen (deterministic, fail-closed, facts-only):** natal Four Pillars · canonical year(立春)/
month(12 Jie) attribution · ten gods · hidden stems · five-element facts/distribution · pillar
relations (합충형파해·삼합·방합) · Daewoon (ENGINE-12) · Sewoon · Wolwoon · 원국↔대운↔세운↔월운
time-axis · Daewoon ten-gods · rooting/transparency (통근/투간) · month-command / 득령 input facts.

**Deferred / separately scoped (NOT in the freeze, do NOT start here):** EngineEvidence adapter +
live-wiring (§11 above) · 신강신약 verdict · 용신 · 격국 · 12운성 · 12신살. **Do NOT reopen:**
calendar / Solar-Term / 立春·12-Jie / Daewoon theory / new-OSS research (all settled & frozen).

## 12. Consultation Intelligence

Foundation (contracts + fail-closed validators + 22 tests) is `FUNCTIONAL_LOCAL`.
Full detail: `docs/CONSULTATION_INTELLIGENCE_V1.md`. Four axes, kept distinct:

| Axis | State |
|---|---|
| FOUNDATION (contracts) | ✅ done — evidence ledger / assessment / case / quality / feedback / outcome / versioning |
| LIVE_WIRING (into chat) | ❌ `NOT_STARTED` — no code emits runs/assessments |
| SEMANTIC_RULESET (evidence→axis) | `BLOCKED_CODEX` (역학 polarity/strength — CODEX_HANDOFF §22) |
| STORAGE (`CONSULTATION_INTELLIGENCE_DB.sql`) | `BLOCKED_OWNER` / HOLD (owner-apply when pipeline ships) |
| ADMIN backend / UI | seam `connected:false`, **no admin route**; UI `BLOCKED_DESIGN` |

**Truth:** a foundation exists; it is **not** applied to real consultations and must not
be presented as if it were.

## 13. Memory / Lifecycle / Retention

Target loop: 오늘/월 운세 → 상담 → memory → life-event/turning-point → 운세우편함 → push → 재방문.

| Node | State |
|---|---|
| Consultation memory (rolling summary) | `FUNCTIONAL_LOCAL` ✅ |
| 오늘/월 운세 generation | `SCAFFOLDED` (presentation only) |
| User-confirmed events / turning-point / lifecycle | `SCAFFOLDED` (contract types) |
| 운세우편함 (mailbox) | `SCAFFOLDED` — backend stub `listMail()→[]`, `getMailDetail()→null` |
| Fortune generation+delivery domain (`fortuneJobs.ts`) | contract+tests, **zero live callers** |
| Push / notification infra | `NOT_STARTED` — `expo-notifications` absent from deps |
| Scheduling / cron trigger | `NOT_STARTED` |
| 재방문 trigger | `NOT_STARTED` |

**Truth:** only consultation-memory is live. The rest of the retention loop is
contract/scaffold; push is unimplementable as-is (no dependency). Most is `DEFERRED_POST_V1`.

## 14. Content / Famous / SEO

- Content routes/categories/slug/publication + Famous detail (명식/십성/오행/대운 timeline/공개
  이력/내 사주 CTA) are built (`FUNCTIONAL_LOCAL`/`SCAFFOLDED`).
- **Famous 시주 fabrication guard is real** (`FUNCTIONAL_LOCAL`) — birth-time-unverified
  figures do not get a fabricated 시주. Good.
- JSON-LD (Article/Person) + robots.txt present; sitemap `SCAFFOLDED`; SEO metadata
  `PRODUCTION_CONFIG_REQUIRED`; dynamic slug prerender `PARTIAL` (static-export limits).
- **The whole public surface depends on ~24 owner-applied `docs/*.sql` (no
  `supabase/migrations/`)** → non-functional until applied (fail-closed).
- **CTA-to-consultation (SEO→app funnel) `NOT_STARTED`** — the acquisition funnel's join
  point is missing.

## 15. Acquisition / Analytics / Cost

- **Acquisition tracking (channel/campaign/UTM/attribution, click→signup→first-consult,
  D1/D7/D30, CAC): `NOT_STARTED`** — no code anywhere.
- **Product/marketing analytics / event tracking: `NOT_STARTED`.**
- **Cost:** OpenAI usage is logged to `ai_usage_logs` (`PRODUCTION_CONFIG_REQUIRED`); a
  pure, tested KRW cost calculator exists (`operationalContracts.ts`) but is **not wired**
  to any screen and has no pricing table. Cost KPIs on admin are static placeholder text.
- **Error observability: absent** (chatService catch swallows; PRD §29 confirms).

## 16. Admin

Web-only, fail-closed ops console. **Auth model is solid** (`is_admin()` server-side on
every `SECURITY DEFINER` RPC + admin-gated RLS; no `service_role` in client; no hardcoded
admins; tested). Admin auth is `PRODUCTION_CONFIG_REQUIRED` (owner applies `ADMIN_SETUP.sql`
+ inserts an `admin_users` row).

| Area | Data | Status |
|---|---|---|
| Dashboard KPIs / daily trends | REAL RPC | `PRODUCTION_CONFIG_REQUIRED` (오늘 AI 비용 = seam) |
| Users, Consultations (PII-minimal), AI-usage log, Publications-read | REAL RPC | `PRODUCTION_CONFIG_REQUIRED` |
| Content / Famous CRUD (+ `content-generate` / `famous-suggest` edges) | REAL table+edge | `PRODUCTION_CONFIG_REQUIRED` |
| Fortune-Mail, Intelligence Inspector, Engine-Status, System-Settings, AI-cost KPIs | **empty seams** (truthful "연결 준비 중") | `SCAFFOLDED` |
| Quality-Review / Feedback / Outcome admin | domain logic only, no UI/route | `NOT_STARTED` (admin surface) |
| Acquisition / Campaign admin, Push admin | none | `NOT_STARTED` |

**New correctness cluster (record, do not mass-fix here):** content/famous/publication
services **swallow DB errors** unlike the admin ops/users services (which were fixed to
`throw` in `e67254e`). Most serious: **`famousService.updateFamous` returns `void` on
failure → the editor shows a green "저장되었습니다" on a rejected save** (F-H admin). Sibling
functions (`cancelContent`, `archiveFamous`, `listContent`/`listFamous`/`listScheduled`,
`getFamous`, `createFamous`) swallow errors → false success / masked outages / latent
`TypeError`. One focused fix pass recommended (§23/code).

## 17. Database / RLS

- **Consumer core** (profiles, consultation_subjects, conversations, conversation_messages,
  consultation_drafts) + **admin** (admin_users, ai_usage_logs) + **content-domain**
  (content_items/versions/assets/publications, provider_connections, famous_profiles/
  snapshots/ai_suggestions) + **public read RPCs** + **Storage bucket**: all exist as
  `docs/**/*.sql` artifacts, all `PRODUCTION_CONFIG_REQUIRED` — **applied state is
  UNKNOWN from code** (`APPLIED_UNKNOWN`; owner reports some applied).
- **Consultation Intelligence tables:** `BLOCKED` / HOLD (owner-apply when wired).
- **Fortune tables:** `DEFERRED_POST_V1`.
- RLS pattern: owner-scoped (`auth.uid()`), admin via `is_admin()`, `SECURITY DEFINER` RPCs
  for cross-user/public reads. `DRAFT_RLS_SETUP.sql` + `CONSUMER_CORE_SCHEMA.sql` document
  the boundary. **No `supabase/migrations/` dir** → apply is manual (see `DATABASE_RUNBOOK.md`).
- **Contradiction (F-H):** `ADMIN_02_SETUP.sql:12` says `public.profiles` does NOT exist,
  while `CONSUMER_CORE_SCHEMA.sql:49` defines it and `profileService` writes it every login
  (fire-and-forget, errors swallowed at `AuthContext`) — a genuinely-missing table would
  silently drop every display_name write. **Owner must confirm which is true in prod DB.**

## 18. Infrastructure

| Service | Code | Env | Production |
|---|---|---|---|
| Vercel (web, dist/, cleanUrls) | ✅ | ✅ | `PRODUCTION_E2E_VERIFIED` (site live, Naver E2E) |
| Supabase (Auth/DB/Edge/Storage) | ✅ | partial | project live; DB apply + edge deploy partial/unverified |
| Edge fns | naver-auth `PROD ✓`; chat/content/famous/media/video `code-complete` | `BLOCKED_OWNER` deploy + secrets |
| OpenAI | ✅ (edge) | needs `OPENAI_API_KEY` secret | unverified |
| GitHub / Expo / Naver / Kakao / Google consoles | code refs | owner-config | Naver ✓; K/G outstanding |

Env contract: `docs/ENV_CONTRACT.md`. Client vars (`EXPO_PUBLIC_SUPABASE_URL`/
`…PUBLISHABLE_KEY`) verified; server secrets (`OPENAI_API_KEY`, `NAVER_CLIENT_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`) are edge-only. **No secret values in this doc.**

## 19. Security / Privacy

- **No client secret exposure** (verified: only "no service_role" assertion comments;
  `service_role` is edge-only). **CSRF/open-redirect on Naver login: handled + prod-verified.**
- **Admin authz:** fail-closed, no IDOR (admin cross-user read is `is_admin()`-authorized
  + PII-minimal).
- **Consumer RLS/IDOR:** depends entirely on applied RLS (artifacts exist; apply
  unverified). **`consultation_drafts` accepts a client-supplied `user_id` (prior M1)** —
  `PARTIAL`; must be pinned to `auth.uid()` by RLS `WITH CHECK`.
- **Prompt-injection boundary:** user text flows to the LLM; engines aren't wired so there's
  no engine-fact tampering surface yet, but the boundary should be designed before wiring.
- **PII:** Consultation Intelligence references message/subject ids (no PII duplication) —
  good. **No birth/consultation data in logs** (verified). Privacy posture is sound *given*
  RLS is applied.

## 20. Testing

`jest` + `ts-jest` (pure engine-external logic). **200 tests / 21 suites green**
(`analysis.spec.ts` is a helper module driven by `analysis.test.ts` — the 22-file/21-suite
gap is intentional, not a gap). `tsc --noEmit` is the type gate.

| Domain | Tests |
|---|---|
| auth, chat pipeline, analysis (errors/requestId/cross), ziwei, qimen, fortune, admin, intelligence | ✅ present |
| **persistence (DB services)** | ❌ **ZERO** |
| **engine (SAJU/interpretation/manse)** | ❌ **ZERO jest** (spec-driven only) |
| **security / content / edge functions** | ❌ **ZERO** |

Test count ≠ product completeness — most tests cover pure logic, not live wiring.

## 21. Production Verification Matrix

| PRODUCTION_E2E_VERIFIED (real evidence) | Everything else (code-complete / local / unverified) |
|---|---|
| Naver login (client+edge+callback+session), 2026-08-12 | Kakao, Google login |
| Vercel web deployment (site live) | LLM consultation path (chat edge + OpenAI) |
| Client Supabase config / client env | Consumer DB persistence + RLS (apply unverified) |
| | Admin console (all areas) |
| | Content/Famous/SEO public surface |
| | Fortune / memory / retention |
| | Consultation Intelligence |

**Rule honored:** absent documented E2E evidence, nothing above the Naver/Vercel line is
called "production verified." (Note: HANDOVER §0 claims the LLM edge is "배포·검증 완료" — this
is **not independently evidenced in the repo**; treat as owner-to-confirm, §25.)

## 22. Owner Actions (only what the Owner must do)

1. **Apply DB schema** (consumer core + admin + content + public RPCs + Storage) from
   `docs/**/*.sql` per `DATABASE_RUNBOOK.md`; then confirm the **profiles-table
   contradiction** (§17). `BLOCKED_OWNER`.
2. **Set edge secrets + deploy edges:** `OPENAI_API_KEY` (+ redeploy `chat`), content/
   famous/media/video functions. `BLOCKED_OWNER`.
3. **OAuth consoles:** finish Kakao (KOE205) + Google, and Supabase Redirect-URL allow-list
   → then run Kakao/Google E2E. (Or launch **Naver-only** for beta.)
4. **Run the LLM consultation E2E** once secrets/deploy are in place (first real proof).
5. **Native decision** (iOS `bundleIdentifier` / Android `package` + store identity) — only
   if native is in the beta.
6. **Apply `CONSULTATION_INTELLIGENCE_DB.sql`** only *after* the intelligence pipeline ships
   (HOLD).

## 23. Codex Actions (역학 domain — do not do in Claude scope)

1. **Engine → prompt live wiring** (the #1 gap): contextSelector runs engines → EngineEvidence
   → orchestration → promptBuilder; flip `ENGINE_CONNECTED`. Spec: `CODEX_HANDOFF §21`.
2. **SAJU → EngineEvidence adapter** (missing; blocks SAJU wiring).
3. **Semantic verification** of SAJU/Ziwei/Qimen (golden fixtures + 학파/정국 canon).
4. **Consultation Intelligence:** evidence→assessment ruleset (polarity/strength/timing/
   reconciliation) + live wiring + fixtures (`CODEX_HANDOFF §22`).
5. (code, non-역학, could be Claude/Codex) **Content/Famous error-swallow cluster fix** (§16) —
   make services `throw` like the admin ops services (pattern `e67254e`).

## 24. Claude Design Actions (UX/UI — not done in this audit)

1. **First-time onboarding / auth-wall redesign** — gate earlier or preserve the
   thread+question across login (F-C1/F-H1/F-H2/F-H3).
2. **Temp-subject** default-action redesign (findable consultations).
3. Consultation & **assessment presentation** (categorical, no fake score — per intelligence
   design handoff), retention/fortune-mail surfaces, Admin Intelligence Inspector UI.
4. Empty/error/loading consistency, mobile responsiveness, accessibility.

## 25. Document Reconciliation (drift found — 47 items)

Worst offenders (reconciled by this audit with SUPERSEDED banners → this SSOT):

- **`ARCHITECTURE.md`, `PROJECT_HISTORY.md`, `PRD_MASTER.md`** — frozen at the 2026-08-07
  `main` baseline; describe Edge/DB/engine/admin as unbuilt ("supabase/ 디렉터리 없음", "테스트
  프레임워크 MISSING", "kakao만 구현 / /login dead route", "~20%"). **All contradicted by code.**
  They are first in the prescribed read order → highest-risk drift.
- **`HANDOVER.md`** — §0 (current) vs §1–20 (stale 2026-08-07) internal contradictions; §0
  test count `178/178` is stale (now `200/200`); §0 has no Consultation-Intelligence entry;
  §0 claims LLM edge "배포·검증 완료" not repo-evidenced.
- **`CODEX_HANDOFF_2026-08-17.md`** header `원격 HEAD=390f8a8` + unpushed chain — stale (HEAD
  `cf2fe7e`); "테스트 러너 없음" (§13) — stale.
- **`docs/admin/CONTENT_02_SETUP.md`** claims migrations "applied ✅" — contradicts the
  proposal-only posture of the SQL headers.
- **Duplicate "V1.0 gap" tables** across CODEX_HANDOFF/HANDOVER — this SSOT is now the single
  top-level status source.

## 26. Known Risks

- **R1 (product):** core value prop (engine-grounded consultation) is not live — the LLM
  answers 사주 questions without a computed chart. Beta would ship a generic-feeling AI.
- **R2 (launch):** no LLM production proof; DB apply unverified — the consultation may not
  work end-to-end in prod at all until §22.1–2 are done.
- **R3 (UX):** first-time auth-wall + lost-thread + temp-subject traps sabotage the first
  consultation — the exact moment that determines activation.
- **R4 (data):** profiles-table contradiction + swallowed profile-write errors could silently
  lose data in prod.
- **R5 (reliability):** no client retry/timeout on the LLM call; no error observability.
- **R6 (retention):** the retention loop is mostly contract-only; push has no dependency yet.
- **R7 (growth):** acquisition/analytics `NOT_STARTED` — no attribution or funnel measurement
  for beta.

## 27. Launch Blockers

| P | Blocker | Owner |
|---|---|---|
| **P0** | LLM path production verification (`OPENAI_API_KEY` + deploy + E2E) | OWNER |
| **P0** | Apply + verify consumer DB schema & RLS (persistence, IDOR safety) | OWNER |
| **P0** | At least one verified consumer login end-to-end (Naver ✓; decide K/G) | OWNER |
| **P0/P1** | Engine → prompt live wiring (core value; P0 for the *product*, P1 for bare function) | CODEX |
| **P1** | First-time auth-wall + thread/question preservation + temp-subject | DESIGN+code |
| **P1** | profiles-table contradiction + swallowed write errors | OWNER+code |
| **P1** | Content/Famous false-success error cluster | code |
| **P2** | Engine semantic verification; Intelligence live wiring; retention; acquisition | CODEX / DEFERRED |

## 28. Independent Review Readiness — Review Pack

The next review should cover, with this SSOT as input:
Product Strategy · Consumer UX · Onboarding · Consultation UX · AI Response UX · Retention ·
Information Architecture · UI Consistency · Accessibility · Admin UX · AI Architecture ·
Engine Architecture · Consultation Intelligence · Database · Security · Privacy · Reliability
· Cost · Scalability · SEO · Acquisition · Launch Readiness.

**Core questions for the Independent Review:**
1. Does a first-time visitor grasp the value immediately (before the auth wall)?
2. Is first-consultation friction excessive (§7 traps)?
3. Once engines are wired, does the answer differ meaningfully from a generic 운세 service?
4. Can 종합평가 (assessment) be presented usefully without fake precision?
5. Is follow-up consultation (subject/scope/memory continuity) natural?
6. Is there a real reason to return (retention loop mostly absent today)?
7. Can Admin actually detect a quality problem (intelligence inspector is a seam)?
8. Does the intelligence architecture plausibly lead to real quality improvement?
9. Are engine facts and LLM-generated text cleanly separated (제17조) once wired?
10. Is privacy sufficient assuming RLS is applied — and is it applied?
11. Will the architecture survive 10× traffic; where does cost explode (OpenAI tokens)?
12. What is the minimum set of §27 P0/P1 items to reach an honest beta?
13. Which in-scope features can be cut or deferred without hurting the beta?

---

### Verdict
`SSOT_READY_FOR_INDEPENDENT_REVIEW` — this baseline is code-verified, distinguishes
code/local/production and foundation/live, and records the drift + blockers the review
needs. The dominant truth to carry into that review: **the pieces exist and are cleanly
separated, but the engine→consultation value chain and the production/DB path are not yet
live-wired or verified.**
