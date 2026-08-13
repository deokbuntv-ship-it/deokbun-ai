# DEOKBUNAI V1.0 — INDEPENDENT REVIEW (pre-Beta red-team)

> Independent Review Board perspective (PM · UX · UX-research · AI product · LLM
> conversation design · full-stack · DB · security · growth · admin · reliability ·
> cost/scale · launch). **Review only — no code/DB/deploy/push changes.** Evidence is
> the actual repository at HEAD `e9016db`; where the SSOT and code disagreed, code won
> (they largely agreed). Golden Journeys were traced in code, not assumed.

---

## Executive Verdict

```
OVERALL SCORE:      55 / 100   (launch-weighted; honestly derived — see Scorecard note)
EXECUTIVE VERDICT:  PRODUCT_NOT_READY — FOUNDATION_STRONG   (not launchable today)
BETA STATUS:        NOT READY → reaches honest Beta after Wave 0 (P0) + Wave 1–2 (P1)
P0 COUNT:           3
P1 COUNT:           5
P2 COUNT:           8
```

**The one-sentence truth:** DeokbunAI has an unusually *strong, clean foundation*
(separated engines, fail-closed intelligence contracts, verified Naver auth, solid
admin authz, edge-side cost/error telemetry, coherent DB artifacts) but the **consumer
answer is not yet differentiated** — the deterministic engines are not wired into the
prompt and **the consultation system prompt is a one-line placeholder**, and no LLM/DB
production path is verified. Shipped as-is today, the *answer content* for "내 사주풀이
좀 해줘" is undifferentiated (gpt-5-mini from name+birthdate, no chart, no persona) —
though the surrounding product is not ChatGPT: it has auth-gated paid calls, rolling
memory, persistence, cost governance, and honesty scaffolding. The good news: the gap
to the moat is **one real prompt + engine wiring + production verification, not
rearchitecture** — and the single highest-leverage fix (a real prompt) is small.

> **This score/verdict was revised after an adversarial second-pass (§68).** See the
> "Second-pass adjustments" note at the end for exactly what changed and why.

---

## Scorecard (0–100, evidence-based, launch-weighted overall)

Weight key: ★★★ launch-critical · ★★ important · ★ supporting.

| Area | Score | W | Basis |
|---|---|---|---|
| Product Strategy | 78 | ★★ | Clear, differentiated thesis (engine-grounded, multi-system consultation); coherent scope. Not yet executed live. |
| **Value Proposition (as shipped today)** | **48** | ★★★ | Answer content is undifferentiated (raw fields + 1-line prompt); but the product wrapper (auth-gated spend, memory, persistence, honesty, 시주-guard) already exceeds ChatGPT. Differentiator is one S-effort prompt + wiring away. |
| Information Architecture | 76 | ★★ | 4-tab IA (홈/상담/운세우편함/MY) is clean and final. |
| **First-time UX** | **40** | ★★★ | Auth wall lands *after* the full ~20-input birth form + typed question; login → Home loses thread+question; temp-subject trap. |
| Onboarding | 45 | ★★ | No value framing before the wall; birth-info "why" not explained. |
| Authentication UX | 60 | ★★ | Naver verified & smooth; but built error vocabulary is unwired (one generic string), redirect drops context. |
| Birth-information UX | 55 | ★★ | Handles exact/approximate/unknown time well; but heavy form, no mid-abandon recovery into the flow. |
| **Consultation UX** | **48** | ★★★ | Chat works with truthful states; but stub prompt → shallow output; welcome text falsely asserts "출생정보 등록 완료". |
| **Follow-up Consultation UX** | **45** | ★★★ | Message-level continuity works (summary+recent); but no engine/temporal grounding → 2027/월별 answers are pure generation (contradiction/hallucination risk). |
| **AI Response UX** | **35** | ★★★ | System prompt = one sentence; context = raw fields; no structure/evidence/uncertainty/unknown-time framing. |
| AI Trust / Explainability | 35 | ★★★ | No evidence, no uncertainty, no calc/gen separation surfaced → overclaim/fabrication risk. |
| Personalization / Memory | 58 | ★★ | Rolling summary + recent works in-thread; no longitudinal/life-event memory yet. |
| Retention | 30 | ★★ | Only in-thread memory is live; loop mostly absent; no push (no dependency). |
| Fortune / Fortune Mail | 35 | ★ | Scaffold + truthful stub (`listMail()→[]`); no pipeline. |
| Content / Famous / SEO | 65 | ★★ | Real routes, JSON-LD, 시주-fabrication guard; but needs SQL applied, **CTA→consultation missing** (funnel open). |
| Acquisition | 15 | ★★ | Not started; zero attribution/instrumentation. |
| Consumer UI | 72 | ★★ | Stitch system, consistent, truthful states. |
| Mobile UX | 64 | ★★ | RN/web + safe areas; heavy forms + long answers need care; unverified on device. |
| Accessibility | 45 | ★ | Not systematically addressed (contrast/labels/focus/reduced-motion unverified). |
| Admin UX | 68 | ★★ | Solid shell + real-data areas; 5 truthful seams; **false-success save bug**; weak root-cause path. |
| Operations Readiness | 48 | ★★ | Dashboards exist; cost/engine/intelligence are seams; no error observability. |
| Consultation Intelligence (foundation) | 70 | ★★ | Excellent fail-closed contracts + 22 tests + provenance/immutability. But zero caller, 0% production, live-wiring deferred post-beta — scored as a *design asset*, not shippable value. |
| AI Architecture | 70 | ★★ | Clean calc/LLM separation, adapter, server-authoritative model + edge cost/error telemetry; but the live pipeline's whole purpose (grounded answers) is unrealized — same missing wire penalized in the consumer rows. |
| Engine Architecture | 66 | ★★ | Engines pure + evidence contracts; but adapters partial, SAJU→evidence adapter missing, semantics unverified — if the divination math is wrong the moat is wrong and nobody has checked. |
| **Engine → Consultation Integration** | **20** | ★★★ | The critical missing link. Not wired (`ENGINE_CONNECTED` all false; contextSelector = raw strings). |
| Database / RLS | 68 | ★★ | Coherent artifacts + owner-scoped RLS pattern; no migration discipline; apply unverified; profiles contradiction. |
| Security | 66 | ★★★ | No client secret exposure; fail-closed admin; CSRF handled; drafts `user_id` closed *by artifact*. **Assumes RLS is applied** — apply state is unverified (the gap between "owner-scoped" and "cross-user exposure"). |
| Privacy | 72 | ★★ | Minimal collection; no PII duplication in intelligence; no birth-data logs; deletion/consent/retention absent. |
| Reliability | 52 | ★★★ | **Edge** degrades gracefully (429+Retry-After, 502 on provider/network/parse fail, non-blocking usage logging, server token cap). **Client** is the gap: dead retry/timeout, `catch{}` discards the exception. |
| Observability | 48 | ★★★ | **Edge** already logs requestId correlation + `latency_ms` + per-user tokens + distinct error codes + stage markers (`chat/index.ts`). Gap: **consumer funnel** (signup→birth→first-consult) + client error surfacing. Not "near-zero" — money-path telemetry exists. |
| Cost Efficiency | 60 | ★★ | Usage logged; server-bounded output; no caching; engine-context repetition risk once wired; cost calc unwired. |
| Scalability | 70 | ★ | Serverless scales; OpenAI token cost is the real limiter; DB fine at target scale. |
| Testing | 52 | ★★ | 200 disciplined pure-logic tests (real value on invariants/contracts); but **zero** coverage of any live surface (DB/edge/LLM/RLS/journey) — cannot catch a single regression on the surfaces that are all unverified pre-beta. |
| Production Readiness | 30 | ★★★ | Only Naver login + Vercel verified; LLM/DB path unproven. |
| **Beta Launch Readiness** | **35** | ★★★ | P0s outstanding (value chain, prompt, LLM prod, DB apply). |

**Weighted overall ≈ 55/100 — honestly derived.** The mechanical star-weighted mean of
the rows above is ≈ **53** (the triple-weighted launch-critical block averages in the
low-40s, so weighting pulls the total *below* the unweighted mean — an earlier draft
mis-stated this as pulling it up). I add a small deliberate **+2** because the residual
gap is **config/wiring/verification** (an S-effort prompt + OWNER deploy + engine wire),
not architecture rebuild — genuinely lower execution risk than the raw number implies.
Net **55**. This sits between the adversarial panel's honest range (a "too-generous"
read lands ~50, a "too-harsh"/foundation read lands ~63; the two fact-checking lenses
landed 57–58). The verdict does not depend on the exact number: every lens agreed the
product is **not launchable today** and the foundation is **strong**.

---

## Top 10 Findings (deduplicated by root cause — §59)

> Format: ID · Sev · Prio · Evidence → User/Business/Technical impact → Direction · Effort · Owner.

**R-01a · CRITICAL · P0 — The consultation system prompt is a 1-line placeholder.**
Evidence: `promptBuilder.ts:6-7` SYSTEM = `"You are the consultation assistant for
DeokbunAI."`; context = raw fields (`contextSelector.ts`). → **User:** generic, shallow,
overconfident answers; no persona/structure/uncertainty. **Business:** clears the "why
not ChatGPT?" bar only once fixed. **Technical:** a bare `const` string — **zero engine
dependency.** Direction: a real, structured, uncertainty-aware, unknown-시주-safe,
no-overclaim consultation prompt (this *includes* R-07). Effort: **S**. Owner:
CLAUDE_DESIGN (spec) → CODEX (in `promptBuilder.ts`). **This is the single biggest
impact-per-effort move in the review and clears the Beta value bar on its own (§38.2).**

**R-01b · HIGH · P1 — Deterministic engines are not wired into the prompt.**
Evidence: `ENGINE_CONNECTED={all:false}` (`engineOrchestration.ts:32`); no engine call in
the chat feature; SAJU→EngineEvidence adapter missing. → **User:** answers aren't chart-
grounded (the *full* moat). **Business:** the deep differentiator. **Technical:** the seam
exists (CODEX_HANDOFF §21); L-effort, semantics still need fixtures. Direction: wire
engines→EngineEvidence→prompt after R-01a. Effort: **L**. Owner: CODEX. *Not a beta
blocker — a prompt-grounded beta ships first (§38.2, Cut List); engine grounding is the
Wave-1 upgrade.*

**R-02 · CRITICAL · P0 — No production verification of the LLM/DB path.**
Evidence: only Naver + Vercel are E2E-verified (SSOT §21); `OPENAI_API_KEY` + edge
deploy + DB apply outstanding. → **User:** consultation may simply not work in prod.
**Business:** cannot launch. **Technical:** config + deploy + one E2E. Direction: apply
DB, set secrets, deploy `chat`, run E2E. Effort: **M**. Owner: OWNER. `OWNER_VERIFY_REQUIRED`.

**R-03 · HIGH · P1 — First-time auth-wall + context loss.**
Evidence: only gate is `chatService.sendMessage:54`; `login.tsx:24` `router.replace('/')`
(loses thread); **on the first-time/no-subject branch** `index.tsx:124-127` opens the
sheet and returns without forwarding the question (when a saved subject exists it *is*
forwarded via `?q=`, `index.tsx:130` — but `birth-info.tsx:282/288` still don't forward
`q` through the sheet→birth→chat hop); birth-info primary CTA makes a `temp:` subject
(`birth-info.tsx:288`) invisible to history. → **User:** a *first-time* user does maximum
work, hits a wall, loses the thread/question, and can't find the consultation.
**Business:** activation/conversion killer at the decisive moment. Direction: preserve
thread+question across the sheet/birth/login hops; make the default subject findable.
Effort: **M**. Owner: CLAUDE_DESIGN + CLAUDE_CODE.

**R-04 · HIGH · P1 — Client reliability + consumer-funnel observability.**
Evidence: the **edge already** logs requestId/`latency_ms`/tokens/error-codes and
degrades gracefully (429/502) — the gap is the **client** (`chatService.ts:96` `catch{}`
discards the exception; dead `chatConfig` retry/timeout) and the **consumer funnel**
(signup→birth→first-consult events don't exist). → **User:** opaque client failures, hung
calls. **Business:** can measure *cost/errors* today (edge) but not *activation* (funnel).
Direction: add a client timeout, surface the real error, emit the consumer-funnel events.
Effort: **M**. Owner: CLAUDE_CODE.

**R-05 · HIGH · P1 — Admin false-success + error-swallow cluster.**
Evidence: `famousService.updateFamous:151` returns `void` on failure → green
"저장되었습니다" on a rejected save; `cancelContent`/`archiveFamous`/`listContent`/
`listFamous`/`getFamous`/`createFamous`/publication fns swallow errors. → **Business/Ops:**
operator trusts a save that didn't happen; outages look like "no data". Direction: one
focused pass to `throw` like the admin ops services (pattern `e67254e`). Effort: **S**.
Owner: CLAUDE_CODE.

**R-06 · HIGH · P0/verify — DB schema apply unverified + profiles contradiction.**
Evidence: no `supabase/migrations/`; `ADMIN_02_SETUP.sql:12` says `profiles` doesn't
exist while `CONSUMER_CORE_SCHEMA.sql:49` defines it and `profileService` writes it
fire-and-forget (errors swallowed at `AuthContext`). → **User/Business:** silent data
loss (display_name), RLS protecting a possibly-absent table. Direction: apply schema per
`DATABASE_RUNBOOK.md`, confirm profiles, keep migration discipline. Effort: **M**. Owner:
OWNER. `OWNER_VERIFY_REQUIRED`.

**R-07 · HIGH · P1 — AI trust/explainability absent.**
Evidence: no uncertainty, no evidence, no unknown-birth-time framing, no overclaim
guard in the prompt. → **User:** distrust ("AI가 아무 말이나 만든다") — the exact thing the
persona hates. **Business:** trust is the moat in 운세. Direction: prompt must express
uncertainty, separate 근거 from 생성, and handle unknown 시주 explicitly; optional
"왜 이렇게 봤나요?" disclosure. Effort: **S–M**. Owner: CLAUDE_DESIGN + CODEX.

**R-08 · MEDIUM · P1 — Retention loop is mostly absent.**
Evidence: only in-thread memory live; fortune/mailbox scaffold+stub; push has no
dependency (`expo-notifications` absent). → **Business:** no daily/weekly/event re-visit
reason → low D7/D30. Direction: pick ONE lightweight recurring hook for beta (e.g.
오늘의 운세 surface that reuses the subject); defer push/automation. Effort: **M**. Owner:
CLAUDE_DESIGN + CLAUDE_CODE (mostly DEFER).

**R-09 · MEDIUM · P1 — Acquisition instrumentation missing.**
Evidence: no UTM/attribution/funnel anywhere; CTA→consultation missing on SEO pages. →
**Business:** cannot attribute or measure a beta launch. Direction: capture UTM on
landing → persist to first-consultation; add SEO→consult CTA. Effort: **S–M**. Owner:
CLAUDE_CODE.

**R-10 · MEDIUM · P2 — Consultation Intelligence not live (but foundation strong).**
Evidence: contracts+tests done; zero live wiring; ruleset Codex; SQL HOLD. → **Business:**
the quality/moat flywheel is not yet spinning. Direction: after engines wire, emit
EvidenceRecord + ConsultationCase per answer (references only). Effort: **L**. Owner:
CODEX (post-engine). *Not a beta blocker.*

---

## Golden Journey Review

**JJ#1 "내 사주풀이 좀 해줘" — code-traced:**
`chat.tsx → chatService.sendMessage → gateway(local for greetings) → authGuard ✓ →
selectConsultationContext (RAW name/gender/DOB/시간요약/출생지) → computeConversationMemory
(summary+recent) → buildPrompt (1-line system + raw fields + summary + recent + user) →
supabaseEdgeLLMAdapter (sends only {messages,requestId}) → Edge chat (gpt-5-mini) →
answer → persist → history.`
**Connected:** UI, auth, subject/birth context, memory, prompt assembly, adapter, edge,
persistence, history. **Broken/absent:** deterministic engines, evidence, assessment,
cross-analysis, and any real system persona/structure. **Verdict:** end-to-end *plumbing*
works locally; the *substance* (why DeokbunAI ≠ ChatGPT) is absent.

**JJ#2 follow-up (사업 적합 → 2027 재물운 → 가장 좋은 달 → 확장 여부):**
- Context/subject continuity: ✓ (summary + recent messages + per-conversation subject).
- Engine reuse / assessment reuse: ✗ (none exist in the path).
- Temporal reasoning (2027 세운, 월운): ✗ — pure LLM generation with **no deterministic
  calendar/세운** → high risk of **fabricated specifics** and **cross-turn contradiction**
  ("가장 좋은 달" invented, then "확장해도 돼?" answered without any timing engine).
- Repetition/hallucination risk: **HIGH** given the stub prompt + no grounding.
**Verdict:** conversational memory is real; consultation *reasoning* is not — the more
specific the follow-up, the more the model must invent.

---

## Product / UX / AI / Engine / Intelligence Reviews (condensed)

- **Product & value (§46 competitive):** *Today* — a user's "그냥 ChatGPT에 물어보면?"
  has **no strong rebuttal** (raw fields + 1-line prompt). *After engine→intelligence→
  consultation completion* — a real rebuttal exists: deterministic multi-system chart +
  evidence-grounded, uncertainty-aware, longitudinally-remembered consultation. The moat
  is *architected but not delivered.*
- **AI response design (§50–52):** the proposed response architecture (Opening / Core
  Personality / Strengths / Risks / Career·Business / Money / Relationships / Current
  Timing / Evidence·Why / Follow-up) is **appropriate** — adopt it, but drive it via
  **progressive disclosure** (a tight opening + core read first, sections on demand), not
  one giant wall on mobile. Length: target ~short-to-medium initial answer (≈ 5–9 short
  paragraphs), with "더 자세히" expanders. Evidence should be an **optional "왜 이렇게 봤나요?"**
  panel, never a raw technical dump.
- **Assessment presentation (§53):** user-facing = **natural-language + coarse categorical**
  (강함/보통/주의 등), **never a fake numeric score** (matches the intelligence contract's
  no-fake-score rule). Internal/admin = full categorical level + confidence + evidence
  refs. Keep user and admin views separate.
- **Engine quality (§15):** calculation exists and is disciplined, but **semantic
  correctness is unverified** (학파/정국/fixtures = Codex). Do **not** raise consultation-
  quality scores because engines exist — they aren't in the answer yet.
- **Consultation Intelligence moat (§16–17, §47, §55):** the foundation is genuinely
  strong: fail-closed (no fabricated assessment), provenance + versioning + historical
  immutability, user-feedback ≠ ground-truth, outcome ≠ evidence, human-review boundary.
  The **data/evaluation flywheel is structurally valid** *and correctly avoids auto-
  learning from user feedback.* But it produces value **only after** live wiring +
  accumulation. Moat rating: `deterministic engine layer = MODERATE`, `cross-system
  interpretation = POTENTIALLY_STRONG`, `longitudinal memory = WEAK (today)`,
  `intelligence/outcome dataset = POTENTIALLY_STRONG (0 today)`, `proprietary UX = WEAK`,
  `content/distribution = MODERATE`.
- **Admin intelligence UX (§54):** recommended inspector order — Question → Response →
  Assessment (per-axis) → Evidence/Why → Cross-analysis → Quality → Feedback → Outcome →
  Version. (Lead with what was said + judged; evidence supports, not leads.)

## DB / Security / Privacy / Reliability / Cost / Scale

- **DB/RLS:** owner-scoped pattern is sound; **no migration discipline** (manual ~24
  SQL) is the real risk; profiles contradiction (R-06). Consultation-intelligence growth
  is bounded and reference-only (good).
- **Security (red-team):** no CRITICAL confirmed. Client bundle clean (no `service_role`/
  secrets). Admin authz fail-closed, no IDOR (cross-user admin read is `is_admin()`-gated).
  Naver CSRF/redirect handled + verified. **drafts `user_id`** is client-supplied but the
  RLS artifact pins `= auth.uid()` with WITH CHECK → **closed by design, pending apply**
  (`OWNER_VERIFY_REQUIRED`). **Prompt-injection boundary** must be designed *before*
  engines are wired (user text currently flows straight to the model).
- **Privacy:** minimal collection, no PII duplication, no birth-data logs. Missing: user
  data deletion/export, consent copy, retention policy — needed for a public beta.
- **Reliability:** R-04. Add client timeout + retry, surface real errors, define graceful
  degradation for OpenAI/Supabase/edge failures.
- **Observability:** R-04. Minimum for beta: signup/birth/first-consult funnel events,
  error events with `requestId`, latency, token cost per user.
- **Cost:** driver = OpenAI tokens. Once engines wire, **watch prompt size** (evidence
  repetition per turn) — cap evidence, summarize, and consider prompt caching. DB/Vercel/
  edge are negligible at target scale.
- **Scale (conceptual):** 1k–100k MAU: serverless is fine; the only real limiter is
  OpenAI spend + rate limits. 1M MAU: revisit caching, cheaper model tiers for cheap
  turns, and read-replica for history — **do not build for this now (§45).**

## Testing & Production Readiness (§36–37)

200 tests guarantee **pure-logic correctness** (auth mapping, prompt assembly order,
gateway gate, cost math, intelligence invariants, engine evidence shape). They do **not**
guarantee: DB persistence, live engine output, the LLM edge, security/RLS, or any E2E
flow. Production readiness by layer: **CODE READY** (most) · **LOCAL VERIFIED** (consumer
flow minus engines) · **PRODUCTION CONFIGURED** (partial) · **PRODUCTION VERIFIED** (only
Naver + Vercel).

---

## Beta Definition (§38) — 5 Core Capabilities

An honest, differentiated Beta needs exactly these — nothing more:
1. **One verified login** (Naver is enough for beta).
2. **A real, grounded consultation** for "내 사주풀이" — engines wired **or**, at minimum, a
   proper structured/uncertainty-aware prompt (the value bar).
3. **Persisted history + in-thread memory** (already works locally → verify in prod).
4. **Trustworthy answer UX** — structure, evidence/uncertainty, no overclaim, unknown-시주
   handled.
5. **Basic measurement** — the **consumer funnel** (signup→birth→first-consult→follow-up).
   Error/latency/cost telemetry **already exists on the edge**; the missing piece is the
   activation funnel. For a small hand-recruited beta this can be lightweight (even
   manual), which is why it sits at P1, not P0 — but it must exist before scaling the beta.

## Cut List (§39) — be aggressive

| Item | Verdict | Why |
|---|---|---|
| Push / notifications | **DEFER** | No dependency; not needed to validate core value. |
| Fortune-mail automation / scheduler | **DEFER** | Retention layer; validate consultation first. |
| Consultation Intelligence **live wiring** | **DEFER** | Foundation stays; wire post-beta once real consultations exist. |
| **Engine → prompt wiring (all 3 engines)** | **DEFER to Wave 1** | Ship **prompt-grounded** for the first beta (§38.2); engine grounding is the upgrade, not the gate. |
| Native iOS/Android | **DEFER** | Web-only beta. |
| Payment / advanced analytics | **REMOVE (from V1)** | Already deferred; keep out. |
| Admin cost KPIs / engine-status / intelligence inspector | **DEFER** | Seams; not needed to operate a small beta. |
| Video/image content generation | **DEFER** | Content growth, not core consultation. |
| **Acquisition attribution / UTM funnel** | **DEFER** | A hand-recruited closed beta needs no attribution; validate consultation value first. |
| **Retention hook (fortune/오늘의 운세)** | **DEFER** | You cannot retain on unvalidated value; add after the core answer is proven. |

## Priorities

**P0 (Beta blockers — 3 distinct workstreams):**
- **R-01a** — a real consultation system prompt (persona + structure + uncertainty +
  unknown-시주 + no-overclaim). *Includes R-07.* Owner: CLAUDE_DESIGN→CODEX. Effort S.
- **R-02** — LLM/DB **production verification**: `OPENAI_API_KEY` + deploy `chat` + apply
  DB + run one real consultation E2E (this is where "confirm login works" lives — Naver
  code is done). Owner: OWNER. Effort M.
- **R-06** — apply consumer schema + RLS and resolve the profiles contradiction. Owner:
  OWNER. Effort M.

**P1 (5):** R-01b (engine→prompt wiring — the deep differentiator, but a prompt-grounded
beta ships without it) · R-03 (first-time UX) · R-04 (client reliability + consumer
funnel) · R-05 (admin false-success cluster) · answer/assessment presentation design.

**P2 (8):** engine semantic fixtures · Consultation-Intelligence live wiring · R-08 (one
retention hook) · R-09 (acquisition/UTM min — a closed beta needs no attribution) ·
native iOS/Android · accessibility pass · persistence/engine/E2E/smoke tests · advanced
analytics/payment.

> **Note (§40 severity≠priority):** R-01b (engine wiring) is *high-severity for the moat*
> but *not a launch blocker* — the Beta value bar (§38.2) is cleared by R-01a alone.
> Keeping engine wiring off the P0 critical path is the single most schedule-shortening
> decision in this review.

## Impact × Effort + Quick Wins (§41–42)

**Genuine quick wins (HIGH consumer-beta impact · SMALL effort) — do first:**
1. **Write a real consultation system prompt** (persona + structure + uncertainty +
   unknown-시주 + no-overclaim — folds in what was listed separately as "unknown-birth-time").
   *Biggest impact-per-effort in the whole review.* S · CLAUDE_DESIGN→CODEX.
2. Preserve the typed question across the sheet→birth→login hops. S–M · CLAUDE_CODE.
3. Make the birth-info default CTA create a **findable** subject (drop the temp trap). S–M · CLAUDE_CODE.
4. Fix the welcome-text drift ("출생정보 등록이 완료되었습니다" shown unconditionally). S · CLAUDE_CODE.
5. Add a client timeout on the LLM call + surface the real error (the S half of R-04). S · CLAUDE_CODE.
6. Surface the already-built auth error vocabulary in `login.tsx`/`AuthContext`. S · CLAUDE_CODE.

*Real but lower consumer-beta impact (do, but not activation-critical):* fix
`famousService.updateFamous` false-success (S, operator-facing) · remove dead
`chatConfig` (S, cleanup). *Not quick wins:* funnel events (M-effort = part of R-04, not
"small") and UTM capture (defer — no attribution need for a closed beta).

## Responsibility Matrix (§43) + Parallel Execution (§44)

| Stream | Primary | Files (no overlap) | Depends on |
|---|---|---|---|
| Engine → prompt wiring | **CODEX** | `contextSelector.ts`, `engineOrchestration.ts`, `promptBuilder.ts`, `chatService.ts`, SAJU adapter | — |
| Consultation prompt/persona/structure | **CLAUDE_DESIGN** (spec) → CODEX (in promptBuilder) | prompt copy/spec doc → `promptBuilder.ts` | coordinate w/ engine stream (same file → sequence, don't co-edit) |
| First-time UX + question preservation | **CLAUDE_CODE** + DESIGN | `login.tsx`, `(tabs)/index.tsx`, `birth-info.tsx`, `chat.tsx` | — |
| Reliability + observability | **CLAUDE_CODE** | `supabaseEdgeLLMAdapter.ts`, `chatService.ts` (error surface), new events util | sequence w/ engine stream on chatService |
| Admin error-swallow fix | **CLAUDE_CODE** | `contentService.ts`, `famousService.ts`, `publicationService.ts` | — |
| DB apply + secrets + prod E2E | **OWNER** | Supabase console / edge deploy | — |
| Intelligence live wiring | **CODEX** | `intelligence/**`, new emit step | after engine wiring |

**Merge boundary rule (refined):** In `chatService.ts` the engine-wiring edit is a *new
step* between `selectConsultationContext` and `buildPrompt` (≈ lines 59–79) while the
reliability error-surface is the `catch` (≈ lines 86–99) — **different regions, they
rebase cleanly**, so land the S-effort error-surface **first** (Wave 0), not last.
`promptBuilder.ts` is the one true shared file: the prompt-copy edit (Wave 0) and the
engine-evidence rendering edit (Wave 1) touch the same builder → **sequence those two**
(prompt copy first, engine rendering second). **Real bottleneck ≠ file conflicts:**
CLAUDE_CODE owns ~5 of 7 streams — the schedule limiter is single-owner concentration, so
front-load CLAUDE_CODE onto R-03/R-05 activation work and let CODEX carry R-01b/engine and
OWNER carry the prod path in parallel.

## Execution Roadmap (Waves — §66)

- **Wave 0 — Blockers (P0).** Goal: a real, verified, **prompt-grounded** consultation
  exists. Tasks: real system prompt incl. uncertainty/no-overclaim/unknown-시주
  (DESIGN→CODEX, S); DB apply + secrets + deploy `chat` + one E2E incl. login (OWNER, M);
  resolve profiles contradiction (OWNER). **Exit:** "내 사주풀이" returns a structured,
  trustworthy, *verified-in-prod* answer — **engine grounding NOT required to exit Wave 0**
  (§38.2).
- **Wave 1 — Deepen the value chain.** Goal: the answer is chart-grounded and safe. Tasks:
  engine→prompt wiring incl. SAJU adapter (CODEX, L); prompt-injection boundary; client
  reliability (timeout + real errors). Exit: SAJU-grounded answer; no fabricated specifics
  on unknown data; graceful client failures.
- **Wave 2 — First-time UX.** Goal: users reach the first answer without losing work.
  Tasks: auth-wall timing, question/thread preservation, temp-subject fix, error vocab,
  welcome-text. Exit: measured first-consult completion ↑.
- **Wave 3 — Observability + Acquisition min.** Goal: the beta is measurable. Tasks:
  funnel/error/latency/cost events; UTM capture; SEO→consult CTA. Exit: the 30-day metrics
  (below) are all instrumented.
- **Wave 4 — Intelligence wiring + one retention hook.** Goal: the flywheel starts + a
  reason to return. Tasks: emit EvidenceRecord/ConsultationCase per answer; one recurring
  surface (오늘의 운세 reusing subject). Exit: cases accumulate; a daily/weekly hook ships.
- **Wave 5 — Beta hardening.** Goal: safe public beta. Tasks: privacy (delete/consent),
  admin false-success fix, smoke/E2E tests, accessibility pass. Exit: kill-metrics wired,
  rollback plan, no P0/P1 open.

## 30-Day Beta Learning Plan (§56) — measure these

Signup conversion · birth-info completion rate · **first-consultation rate** · consultation
completion · **follow-up rate** (turns/session) · D1 · D7 · D30 · answer feedback
(helpful/not) · hallucination/complaint flags · error rate (by code) · p50/p95 latency ·
token cost / consultation · unknown-birth-time share · SEO→consult conversion.

## Kill Metrics (§57) — early "it's going wrong" signals

Birth-info abandonment > ~40% · first-response abandonment (leaves before/at first answer)
· follow-up rate ≈ 1 (nobody asks a 2nd question) · repeated auth failures · high
"not helpful"/hallucination feedback · token cost/user materially above plan.

## Five Biggest Risks (§63)

1. **Product:** ships feeling like "ChatGPT + birthday" → no reason to stay (R-01/R-07).
2. **Launch:** unverified LLM/DB path → consultation may not work in prod at all (R-02/R-06).
3. **Activation:** first-time auth-wall + lost work destroys the first-answer funnel (R-03).
4. **Operational blindness:** swallowed errors + no funnel → can't tell if the beta works (R-04).
5. **Trust:** ungrounded, overconfident answers on 운세 → reputational damage + churn (R-07).

## Five Strongest Assets (§64)

1. **Clean calc/LLM separation + swappable adapter** — the hard architecture is right.
2. **Consultation Intelligence foundation** — fail-closed, provenance, no-fake-score, human
   boundary; a genuine future moat that most 운세 apps will never build.
3. **Verified Naver auth via a correct trusted-edge bridge** — a real, hard-won prod win.
4. **Disciplined truthfulness** — truthful empty states, no-fabrication guards, fail-closed
   admin; the codebase does not lie to users. Rare and valuable.
5. **Deterministic multi-system engines already in-repo** (SAJU ~10K LOC + Ziwei/Qimen) —
   the raw material of the moat exists.

## Do Not Touch — FREEZE (§65)

`FREEZE`: Naver auth (client + `naver-auth` edge + callback) · SAJU/Ziwei/Qimen engine
**semantics** · Consultation Intelligence **fail-closed contracts** (validators/versioning)
· the `is_admin()` authz model · Vercel static-export config. These are stable and load-
bearing; changing them now adds risk without beta value.

## SSOT Corrections Recommended (§69)

`SSOT_CORRECTION_RECOMMENDED` (do not mass-edit SSOT now; queue these):
1. Elevate "system prompt is a 1-line placeholder" to a **named P0** in SSOT §10/§27 — it
   currently reads as only "dead client config"; the *server-facing prompt substance* being
   a stub is a distinct, larger finding.
2. SSOT §19 marks drafts `user_id` `PARTIAL`; refine to "closed-by-artifact (WITH CHECK),
   `OWNER_VERIFY` apply" — the design fix already exists in `DRAFT_RLS_SETUP.sql`.
3. Add "prompt-injection boundary must precede engine wiring" to SSOT §19 (not currently called out).

---

## Final Recommendation

**Do not launch today.** But this is a *good* place to be: the expensive, easy-to-get-
wrong parts (architecture, separation, auth, intelligence contracts, edge telemetry,
truthfulness) are **done and sound**, and the P0 gap is **one real prompt + production
verification** — not a rebuild, and not (for the first beta) even the engine wiring.
Execute **Wave 0** (real prompt + OWNER deploy/apply/verify) and you have an honest beta
whose answer is structured, uncertainty-aware, and memory-backed; **Wave 1** adds SAJU
grounding for the full moat. The single highest-leverage action this week — days, not
weeks — is **replace the one-line system prompt with a real, structured, uncertainty-aware
consultation prompt.** That one S-effort change moves the product from "generic" to
"recognizably DeokbunAI," even before an engine is wired.

## Second-pass adjustments (§68 — what the adversarial red-team changed)

This review was re-challenged by a 4-lens adversarial panel (too-harsh / too-generous /
evidence-integrity / decision-utility), each verifying claims against code. Changes made:
- **Observability 30→48, Reliability 40→52:** the original scores were *client-only*; the
  **edge** (`chat/index.ts`) already has requestId correlation, `latency_ms`, per-user
  token logging, distinct error codes, and graceful 429/502 degradation. Corrected.
- **Foundation halo trimmed:** Intelligence 74→70, AI-Arch 74→70, Engine-Arch 70→66,
  Testing 60→52, Security 70→66 — they credited unshipped/unapplied value.
- **Overall 57→55 with honest arithmetic:** the original rationale wrongly claimed
  weighting held the score *above* the unweighted mean (triple-weighting the low
  launch-critical block pulls it *down*; mechanical ≈ 53).
- **Engine wiring reclassified P0→P1** (R-01b): it contradicted this review's own Beta
  Definition §38.2 + Cut List. The **prompt** (R-01a) is the true P0; a prompt-grounded
  beta ships without engine grounding. **P0 count 5→3.** R-07 folded into the P0 prompt.
- **R-03 evidence corrected:** the typed question *is* forwarded when a saved subject
  exists (`index.tsx:130`); the drop is the first-time/no-subject path — scope narrowed.
  `login.tsx` line 22→24.
- **Retention (R-08) + Acquisition (R-09) moved P1→P2** for a first closed beta (can't
  retain on unvalidated value; a closed beta needs no attribution).
- **Quick-wins de-mislabeled:** funnel events (M, = R-04) and UTM (defer) removed from the
  "small" list; the genuine S-effort consumer-activation set promoted.
- **Value Prop 42→48:** "indistinguishable from ChatGPT" softened — the *answer* is
  undifferentiated, but the product wrapper (auth-gated spend, memory, persistence,
  honesty, 시주-guard) is not.
Verdict unchanged: all four lenses agreed the product is **not launchable today** and the
foundation is **strong**.

```
INDEPENDENT_REVIEW_COMPLETE
```
