# Commercial Consultation UX V4 — Delivered + Build-Ready Contracts

Sprint 2026-08-18. Constitution guard (§25): 안정성 > 상담 품질 > 보안 > 비용. Nothing here
weakens the frozen engines, the semantic validator, the trust boundary, RLS, or auth.

---

## 0. Product-direction reconciliation (IMPORTANT — resolves a doc conflict)

`docs/GOLDEN_FLOW_V4_UX.md` §0 LOCKED "long-form, expanded by default; answer-first only
orients, never shortens." The **current owner directive** (the latest decision — which
outranks older specs in the constitution's Source-of-Truth order: 1. 사용자 최신 결정 → …)
**supersedes that**: production answers are "too long / hard to read on mobile / conclusion
buried" → the product now wants **concise, conclusion-first, detail-on-demand**.

**Resolution (authoritative from here):** UNDERSTAND FIRST → EVIDENCE SECOND → DETAIL ON
DEMAND. The core interpretation stays substantive but **concise**; strengths / cautions /
영역별 / 앞으로의 흐름 and all technical evidence move **behind a collapse** ("상세 근거 보기"),
not expanded by default. This is a deliberate reversal of GOLDEN_FLOW §0; that doc should be
banner-noted as superseded on its next edit.

---

## 1. Delivered this session (committed, gated, NOT pushed)

- **Backend answer contract already concise** (prior sprint `4b89aad`): conclusion-first, no
  dev terms, no limitation exposure, no absolutes, exactly-3 in-response follow-ups (zero extra
  LLM cost). This is the biggest lever for problems #1–#9.
- **Multi-year temporal grounding** (`9780d9f`/`b0b578d`): "앞으로 10년"/ranges resolve + ground.
- **Commercial-text hygiene guard** (`8f024a4`) **now WIRED at the render boundary** (`f0a0e93`):
  `stripEngineLabels` runs over every user-facing field in `buildStructuredConsultationResult`,
  so an internal engine label the model slips in never reaches the screen (§8/§9/§69) — tested.
- **Cost telemetry** (`f1fb5e0`): reasoning/cached tokens + complexity/effort now logged.

### Client integration WIRED (2026-08-18, commit `815c8a7`)
- **Presentation VM bound to the live component** (Task A/B): `StructuredConsultationResult` now renders
  via `toConsultationPresentation` — headline → concise core → key points → cautions → **detail collapsed
  by default** ("상세 근거 보기") → chips. The owner-approved reversal of GOLDEN_FLOW §0.
- **Structured answer persisted + restored** (Task C-E): `persistStructured` (pure, tested) +
  `conversationService.saveMessage/loadMessages` + the persistence hook now write/read
  `conversation_messages.structured_result` — a reload keeps the card + follow-up chips (fail-closed to
  text on malformed/legacy). Grounding is NOT persisted (data minimization).

### Still remaining (NOT implemented — honest status)
- **F. Summary → prompt (context compression):** deferred — `buildPrompt` renders `conversationSummary`
  as a SYSTEM message; wiring a real summary safely requires making it an UNTRUSTED bounded context
  section (never system/evidence) + threading it through `ServerConsultationRequest` +
  `createServerConsultationService` + regenerating the bundle. Trust-boundary-delicate; not rushed.
- **G-J. Report service + CTA + mailbox 보고서 category + report detail:** the deterministic composer +
  DB exist and persisted structured answers now provide the source; the report SERVICE
  (generate/load/list) + chat CTA + mailbox screens + routes are the remaining client work.
- **K-L. Auth-gated report sharing:** deferred (share-grant SECURITY DEFINER RPC + token-hash + revoke +
  auth returnTo + UI); NOT shipped insecurely (§79). Kakao = external OWNER_ACTION.

### Already built BEFORE this sprint (verified — do NOT rebuild)
The agent survey confirmed the consultation render layer is **complete and mounted**, so several
directive items are already satisfied:
- **Structured render (§5/§11):** `StructuredConsultationResult` is mounted in `chat.tsx` (L432),
  renders the answer-first hierarchy over `StructuredConsultationViewModel`, fail-closes empty
  sections, and routes truthful `state` to `ConsultationStateNotice`.
- **Follow-up chips (§14/§15/§16):** `FollowUpSuggestions` is fully wired — a chip tap →
  `submitQuestion` (same auth gate + idempotent persist). Exactly-3 from the same OpenAI call.
- **Scroll-to-start (§50):** `scrollAnchor.computeAnswerAnchorOffset` anchors a new answer at its
  first line; `scrollToEnd` is used only for history restore.
- **Explainability sheet, assessment (fail-closed), loading, error states:** built components.

## 2. Summary-call decision (§35) — FINDING

`buildServerConsultation.ts` hardcodes `conversationSummary: null` at **two** call sites, so the
summary LLM call's output is **stored** (`conversations.summary`) but **never consumed** by the
consultation prompt. It is stored-not-discarded → not pure waste, but it spends tokens for no
answer benefit as wired. **Decision (do NOT blind-remove — memory-architecture risk):** wire the
stored summary into the prompt as history compression (replaces re-sending raw recent turns —
the §36 ContextSelector-compliant path), which also cuts input tokens. Until that lands, the
owner may set the summary threshold high to reduce the wasted call. Requires a memory-contract
review + tests; specified here, not changed this session.

---

## 3. Build-ready client contracts (NOT implemented — deliberately, per 제3/4조)

These are large RN-client features; half-built UI would violate "no incomplete features." Each
is specified so it builds without re-deciding architecture. All UI is fail-closed and reuses the
existing built components (`StructuredConsultationResult`, `FollowUpSuggestions`,
`ConsultationStateNotice`, `InterpretationEvidenceSheet`) and `@/theme` tokens — no new design system.

### A. Presentation adapter dedup + collapse (§45/§46/§10/§47) — hygiene DONE, refinement remaining
`buildStructuredConsultationResult` (`chat/services/structuredConsultationResult.ts`) is the single
prose adapter. Hygiene (`stripEngineLabels`) is now applied there (done). **Remaining refinement:**
(a) de-dup across sections (headline vs coreInterpretation; strengths vs interpretation) IN THE
ADAPTER, never the validator; (b) drop empty/filler sections (§47 — the render helpers already omit
empty). Keep it a thin, fail-closed pass-through. Optional pure helper, unit-tested.

### B. Long-form → concise-collapse (§5/§11/§12) — the ONE component edit that reverses GOLDEN_FLOW §0
`StructuredConsultationResult` currently renders the long-form (강점/주의점/영역별/앞으로의 흐름)
**EXPANDED by default** (locked by its header comment per GOLDEN_FLOW §0). Under the current
directive (§0 above), move those behind a **"상세 근거 보기" collapse**, keeping only headline +
concise core interpretation above the fold; the evidence sheet stays collapsed as today. This is a
**contained, reversible component edit** — but it contradicts a comment that calls the expanded
layout "locked", so it needs the owner's explicit product sign-off (it IS the latest directive, but
flag it as a deliberate reversal). Everything else (mount, chips, scroll, states) is already built.

### C. Follow-up chips (§14/§15/§16) — ALREADY DONE
Verified complete end-to-end: `FollowUpSuggestions` mounted in `StructuredConsultationResult`, chip
tap → `submitQuestion` (same auth gate + idempotent persist + anchor), exactly-3 from the same
OpenAI call (zero extra cost). Only refinement: a generic-filler filter ("추가로 궁금하신가요?") —
best applied in the prompt (already instructs contextual follow-ups) or the adapter.

### C2. Persist the structured answer + follow-ups (NEW gap — found this sprint)
`conversation_messages` stores assistant answers as **text only**; `structuredResult` + `followUps`
are NOT persisted, so on reload/history-open the answer **downgrades to a plain text bubble** and
the chips vanish — and there is no stored structured answer to build a report from. Fix: add a
nullable `structured_result jsonb` (or a `metadata jsonb`) column to `conversation_messages`
(migration, owner-apply, additive) + persist/restore it in `conversationService` +
`useConversationPersistence`. Enables both durable cards and deterministic report generation (D).

### D. Consultation report (§17–§27) — NEW feature
- **Eligibility (§63):** ≥ N successful assistant answers in the conversation OR explicit request.
- **Generation (§18/§19):** conversation-level, NOT per Q&A. Build **deterministically first** from
  the stored structured results + `conversations.summary` (reuse — no new LLM call); a narrative
  pass is ONE gated call only if the owner opts in (log under a distinct `request_type='report'`).
- **Deterministic title (§27):** from the first meaningful question ("2027년 사업운 상담 보고서").
- **Structure (§20):** 핵심 / 현재 흐름 / 중요한 기회 / 주의할 점 / 추천 행동 / 기억해 둘 시기(grounded
  only) / 다룬 질문. No internal terms (run through the hygiene guard).
- **Idempotency (§24):** one report per conversation; regenerate = overwrite/version bump.
- **Completion UX (§23):** chat shows "상담 내용을 보고서로 정리했어요. 우편함에 넣어두었습니다." + CTA
  → 우편함 > 보고서 > that report.
- **DB (§21/§55/§56 — migration OWNER_APPLY, additive, RLS owner-only):**
```sql
create table if not exists public.consultation_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  content jsonb not null,          -- the sectioned report (NO prompt/grounding/birth dup — §56)
  status text not null default 'ready',  -- generating | ready | failed
  report_version int not null default 1,
  model text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- RLS: owner-only select/insert/update (user_id = auth.uid()); updated_at trigger; unique(conversation_id) for idempotency.
```

### E. Mailbox 보고서 category (§22/§26/§53) — reuse the existing 우편함 skeleton
A **fortune** mailbox skeleton already exists (`app/(tabs)/inbox.tsx` 운세우편함 tab,
`app/mail-detail.tsx` report-style detail, `features/fortune/fortuneMail.ts` types + empty service,
`fortuneJobs.ts` domain) — currently fortune-oriented (월간운세) and engine-disconnected. Reuse its
list/detail presentation patterns + filter-chip pattern; add a **"보고서" category** sourced from
`consultation_reports` (D), not the fortune seam. List = title · date · 대표 질문 · preview, newest
first; tap → report detail route (reuse router conventions; no deep-link/returnTo conflict).

### F. Report sharing (§28–§33) — auth-required, NO public page
- **Flow (§29):** share link → 덕분AI → login (reuse `pendingConsultationIntent`/safe returnTo,
  `resolveOAuthReturn` allowlist — no open redirect) → authorization check → read-only report view.
- **Security (§30/§55/§73):** a `report_shares` grant table with a high-entropy token; access =
  logged-in AND a valid, non-revoked (optionally non-expired) grant for that user/token. NEVER
  "know the id → read"; NEVER anonymous. Server-controlled read policy.
```sql
create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.consultation_reports(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token text not null unique,        -- high-entropy; treat as a secret in URLs
  revoked_at timestamptz, expires_at timestamptz,
  created_at timestamptz not null default now()
);
-- RLS: owner manages own grants; the recipient read path is a SECURITY DEFINER RPC that validates
-- (token present, not revoked, not expired) and returns the report ONLY then.
```
- **V1 scope (§31):** copy-link + Web Share API + email intent now; **Kakao SDK = OWNER_ACTION**
  (app key/domain registration). Acquisition seam (§32): tag share links `source=report_share` +
  events `report_share_created/opened/login_started/viewed` reusing the ad-track seam.
- **Privacy (§33/§65):** a pre-share notice ("이 보고서에는 개인 상담 내용이 포함되어 있습니다"); never
  put sensitive title/content in an OS share preview beyond a generic line.

---

## 4. Cost (§37/§38/§78) — estimates (telemetry now live to make them measured)
Reasoning-effort routing + the concise contract: ≈₩10.5 → ≈₩4/Q&A weighted (prior sprint). The
concise commercial contract further trims visible output; once the shipped telemetry
(cached/reasoning tokens) is applied + redeployed, replace these with measured values. Scale (₩4
avg): 30k≈₩119k, 150k≈₩595k, 300k≈₩1.19M, 900k≈₩3.57M/mo → at 900k, monetization/usage-policy
review (§78; no payment code this sprint, §79). SIMPLE→gpt-5-nano remains an owner/quality-gated
option (→~₩0.55). Report generation adds cost only on the explicit report action, not per Q&A.

---

## 5. Remaining limitations / risks
- The client UI (VM, mobile cards, report, mailbox, share, auth-share) is **specified, not built**
  this session — status PARTIAL_WITH_EVIDENCE. The backend answer quality (concise, grounded,
  hygiene-guarded) IS delivered.
- Live answer quality/length under the concise prompt is the one live-untestable property —
  validate on real traffic; the shipped telemetry + `[chat.route]` make it observable.
- GOLDEN_FLOW_V4_UX.md §0 (long-form-expanded) is superseded by this doc's §0 — reconcile that
  file's banner on its next edit.
