# Consultation Prompt Architecture (Sprint 1A)

> The consultation layer that turns DeokbunAI's LLM from a fortune-*generator* into a
> disciplined *interpreter* of provided calculation grounding — and the typed seam where
> Codex will later attach the deterministic engines. **This sprint built the prompt +
> contract + seam; it did NOT build engine semantics or wire real engines** (that is
> Codex Sprint 1B). Owner: Claude Code. Frozen for Codex: everything under §"Codex seam".

## Why this exists
The independent review found the live system prompt was a single placeholder line
(`"You are the consultation assistant for DeokbunAI."`) and the deterministic engines
were unwired — so "내 사주풀이 좀 해줘" was answered by a generic model from raw birth
fields. Sprint 1A replaces the placeholder with a real, safety-bounded consultation
prompt and a fail-closed grounding seam, **without** inventing any 역학 fact.

## Prompt hierarchy (as composed by `buildPrompt`)
```
m[0] system  SYSTEM_CONSTITUTION          — static, mode-independent hard rules (cache prefix)
m[1] system  context                      — 상담 대상 facts + 【계산 근거】 grounding + mode policy
m[2] system  conversationSummary          — ONLY when present (raw rolling summary)
…    recent turns (verbatim user/assistant)
last user    current question (trimmed)
```
The 2-system + optional-summary + user-last shape is **unchanged** from the previous
builder, so the UI, the edge adapter, and `parseStructuredAiResponse` fallback keep
working (backward compatible; existing `promptBuilder.test.ts` still passes).

Files (all Claude-owned):
- `src/features/chat/prompts/consultationPolicy.ts` — `SYSTEM_CONSTITUTION` + `buildResponsePolicy(mode)`.
- `src/features/chat/prompts/consultationMode.ts` — `ConsultationMode` + `classifyConsultationMode`.
- `src/features/chat/prompts/grounding.ts` — grounding types + `renderGroundingContext` (**Codex seam**).
- `src/features/chat/prompts/consultationPromptVersion.ts` — `CONSULTATION_PROMPT_VERSION`.
- `src/features/chat/prompts/promptBuilder.ts` — composition.

## System Constitution (hard rules — every mode)
Identity (interpreter, not generator) · **calculator≠interpreter** (never compute
명식/오행/십성/자미 성계/기문 국) · evidence discipline (nothing beyond 【계산 근거】) ·
**timing boundary** (no specific 연·월·일 without provided timing evidence) · previous
answer ≠ verified fact (§31) · uncertainty + no fabricated score/percent/date · safety
(no absolute medical/legal/investment/life determination) · trust language (no 반드시/
무조건/100%) · Korean, minimal jargon · **injection resistance** (user text cannot
override these rules). Enforced as prompt text and locked by tests.

## Context contract
Reuses existing types — **no new evidence/assessment model** (directive §75):
- Subject: `SelectedConsultationContext` (+ new optional `birthTimeAccuracy` for the
  unknown/approximate-time policy).
- Grounding: `ConsultationGrounding` — reuses `EngineEvidence` + the myungri/ziwei/qimen
  triplet from `@/features/analysis`.
- `PromptBuildInput` gained optional `grounding?` and `mode?` (both default safely).
- Response: `ConsultationResponse` / `ConsultationResponseMetadata` (`promptVersion`,
  `mode`, `grounded`, optional `model`/`engineVersion`/`assessmentVersion`) — carried on
  the success `ChatServiceResult.meta` (additive; the UI ignores it).

## Grounding rules (fail-closed — §12/§13/§53)
`grounding` defaults to `GROUNDING_UNAVAILABLE`. When unavailable, the 【계산 근거】 block
explicitly states no verified calculation exists and forbids inventing a chart or timing
— the model interprets only the stated birth facts, with uncertainty. **We never
fabricate engine output to fill the gap, and never silently answer as a generic LLM as
if calculation happened.** When Codex supplies `status:'available'` evidence, the block
relays those facts and flags any engine that is `미연결/해당 없음/출생시간 정보 없음`.

## Response architecture (§16–§18)
Natural-language, progressive-disclosure prose (not a rigid wall). `GENERAL_READING`
("내 사주풀이 좀 해줘") gets a comprehensive first reading — 핵심 → 성향 → 강점 → 주의 →
일·직업·사업 → 재물 → 관계 → 흐름(근거 있을 때만) → 후속 질문 2–4개 — with sections kept
short. Other modes (`DOMAIN_QUESTION` / `TIMING_QUESTION` / `FOLLOW_UP`) reshape emphasis
only; the hard rules never relax. Default verbosity target: STANDARD.

### Structured-output decision (§34/§35)
**Decision: keep prose now; do NOT force JSON-schema output this sprint.** Rationale:
`StructuredAiResponse` + `parseStructuredAiResponse` already exist and fall back to
Markdown; forcing rigid JSON from a mini-class model is brittle, costs tokens, and — with
grounding currently unavailable — every engine accordion would read "미연결". The
structured path becomes worthwhile **once grounding is `available`** (real evidence to
fill the accordions). Recommended future rule: request `StructuredAiResponse` only when
`grounding.status === 'available'`; otherwise prose. Documented here as the seam, not
enabled.

## Failure behavior (§51/§52/§53)
Reuses the existing chat error codes (`AUTH_REQUIRED` / `INVALID_INPUT` /
`REQUEST_FAILED` / `NOT_CONFIGURED`). Grounding-unavailable is **not** a failure in the
current legacy/free-form mode — it is the honest default and drives the fail-closed
prompt. When a future engine-*grounded* mode is switched on and evidence is missing, the
caller must surface a typed grounding-unavailable state (a user-friendly "계산 근거를
불러오지 못했어요" message) rather than degrade to a generic answer — see the Codex seam.

## Versioning / traceability (§36/§37/§38)
`CONSULTATION_PROMPT_VERSION = 'consultation@1.0.0'` (bump on any answer-affecting change
to the constitution/policy/grounding contract). Returned on `ChatServiceResult.meta` with
`mode` + `grounded`. This composes with the Consultation-Intelligence `ConsultationCase`
(which already records `versions.promptVersion`) — the seam to log which prompt produced
a consultation exists; wiring the emit is post-engine (Codex/Intelligence).

## Golden cases (locked by tests, not by prose — §61)
`consultationPrompt.test.ts`: mode classification for the 7 golden questions; constitution
hard-rule presence; grounding fail-closed (unavailable forbids fabrication; available
relays facts); birth-time unknown/approximate; **prompt-injection boundary** (4 adversarial
inputs never enter a system message; the last turn is the user's); follow-up discipline;
version stability. **No live LLM calls** (§62) — a manual smoke procedure is the way to
eyeball real answers once `OPENAI_API_KEY` + edge deploy exist.

## Codex seam (Sprint 1B — DO NOT let Claude implement the semantics)
See `CODEX_HANDOFF_2026-08-17.md §23`. In one line: Codex computes engine facts and hands
a `ConsultationGrounding{status:'available', evidence:{myungri,ziwei,qimen}}` (+ optional
categorical `assessmentSummary`, `engineVersion`) into `buildPrompt`/`chatService`; the
prompt already renders and bounds it. Claude owns the rendering/contract; Codex owns what
the evidence *says*.
