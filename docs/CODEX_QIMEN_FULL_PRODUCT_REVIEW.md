# Codex Review — Qimen Dunjia V1 FULL PRODUCT (engine → live tri-engine consultation)

> Independent review handoff for the third engine. **Question-time** based (not natal). Frozen Saju
> (`7c7ed82`) untouched; Ziwei calculator preserved. **Status: `SERVER_TRUST_BOUNDARY_BLOCKED`** (Closure
> A/B/E fixed; C server trust boundary unresolved — honest analysis in the Closure section). Not APPROVED /
> PRODUCTION_READY / FULLY_VERIFIED. Local commits only; no push/deploy/DB.

## Baseline / ancestry

- Starting HEAD: `494d946` (Ziwei closure). Ending: this Qimen integration commit.
- Frozen `interpretation/**` = byte-identical to `7c7ed82` (verified). Ziwei calculator unchanged since `494d946`.
- Pre-existing Qimen ENGINE (calculator) already in-repo (`src/features/qimen/**`, golden-validated). This
  work is the **product integration** (evidence sections + activation + grounding + prompt + tri-engine
  consultation), mirroring the Ziwei integration.

## Provider / profile

qimen-dunjia@2.1.0 (MIT, 時家·拆補法), `qimen-dunjia-chaibu@2.1.0`. Full profile + fact classification:
`docs/QIMEN_V1_PROFILE.md`.

## Production chain

```
chat userMessage + now(epoch)
 → resolveQimenActivation (chat/selectors/qimenActivation.ts, deterministic deokbunai.qimen-activation.v1):
     classifyTimingQuestion → isTimingQuestion; epochToSeoulQueryTime → question instant (Asia/Seoul, UTC+9)
 → computeQimenBoard (existing engine; not_applicable for natal; fail-closed on missing / IMPOSSIBLE civil
     date [2024-02-30 → unsupported_case, never rolled over — Closure PART A] / unsupported 節氣)
 → toQimenEvidence (+ structured sections + honest provenance + hasTimingEvidence:false)
 → buildConsultationGrounding (qimen slot; supplementary — natal spine governs availability)
 → toSafeGrounding → renderGroundingContext (Qimen section + question-time note + 3-engine attribution)
 → promptBuilder → LLM → classifyConsultationOutput → structuredResult
```

## Review checklist (what changed)

1. **Question-time semantics** — Qimen uses the QUESTION instant (Asia/Seoul), never the birth. The
   engine's `QimenQuery{isTimingQuestion, questionTime}` + `resolveQimenEligibility` enforce this; the new
   activation layer supplies both. Recorded in provenance (`상황판 기준` / `근거·한계`).
2. **Activation policy (§2)** — `classifyTimingQuestion`: deterministic, rule-based, two-tier (STRONG
   decision/timing/choice/flow signals; ACTION domain nouns only when paired with a decision/timing verb),
   so "투자 성향은?" (natal) does NOT activate. **Closure PART E:** an *ambient* timing word ("지금 / 이번 달")
   inside a natal-disposition question ("지금 어떤 성향을 가진 사람이야?") no longer activates — a `NATAL_INTENT`
   guard suppresses it, while a real decision/choice/flow/action still activates (checked first). Never
   LLM-decided. States: available / not_applicable / missing_question_time / unsupported_case / calculation_failed.
3. **Evidence (§11)** — `toQimenEvidence` → structured sections (상황판 기준 · 값부·값사 · 구궁(九宮) · 근거·한계);
   summary/detail preserved. No raw provider JSON dumped.
4. **Validation honesty (learned from Ziwei)** — `근거·한계` marks 陰陽遁·三元·節氣·query 干支 as
   INDEPENDENTLY_VALIDATED (lunar-javascript + universal 二至/拆補 rules; golden test), and 局數·八門·九星·八神
   placement as PROVIDER_DETERMINISTIC_CHARACTERIZATION_LOCKED (특성 고정) — NOT independently verified.
5. **Timezone honesty (§6)** — Asia/Seoul (UTC+9 fixed) question-time recorded as an assumption; the honest
   "no LMT / true-solar-time" limitation is stated (what the code does).
6. **Grounding (§13)** — the qimen slot is now real (was hardcoded engine_not_connected). Natal question →
   `not_applicable`; unsupported 節氣/provider throw → `calculation_failed`; Qimen is supplementary and does
   NOT make the grounding available on its own (natal spine governs).
7. **Orchestration (§14)** — `ENGINE_CONNECTED={saju:true, ziwei:true, qimen:true}` (flipped after the real path).
8. **Prompt (§16)** — `renderGroundingContext` renders the Qimen section + a question-time note (상황판, 출생
   기반 아님, no long-term year) + a 3-engine attribution/anti-consensus block.
9. **No fake consensus (§14, broadened in Closure PART B)** — a formal three-engine CONSENSUS claim is
   rejected (V1 has no cross-engine map) even when all three are available. Now bounded by concept, not one
   phrase: a consensus PREDICATE (일치 / 동일 / 같은 결론 / 모두 같 / 100% 동일 / 한목소리 …) co-occurring with a
   three-engine reference — either a "세 학문/엔진/관점" count OR the three names enumerated ("명리, 자미두수,
   기문둔갑이 모두 …"). Separate sourced perspectives with NO agreement predicate stay ACCEPTED.
10. **Structured safety (§17, broadened in Closure PART B)** — a Qimen-use claim is allowed only when qimen
    is `available`; rejected for not_applicable/unavailable; per-perspective separation accepted. Detection
    now covers the previously-missed forms — 기문에서 / 기문 결과 / 기문국에서 / 기문상 / 기문판 and unambiguous
    Qimen-fact terms (값부 · 값사 · 值符 · 值使 · 八門 · 九星 · 八神 · 九宮) — applied to every field incl. followUps;
    a rejected main body fails closed to the safe message (raw text never rendered).
11. **Timing safety (§12)** — Qimen `hasTimingEvidence:false`, no timingAnchors → it does NOT license
    specific future-year claims; the Saju 1970–2050 timing gate is untouched.
12. **Follow-up (§18)** — activation is fresh per question (the question instant is passed each turn): a
    natal turn → not_applicable, a timing follow-up → freshly available.
13. **Assessment (§14)** — untouched, still fail-closed (`toConsumerAssessmentView([])`).
14. **Security (§20)** — qimen-dunjia is local (no external send); no birth/question payload logged; no
    secret in client. **Trust-boundary correction (Codex PART C):** the deterministic grounding is
    **CLIENT-authored** — `buildConsultationGrounding` runs in the app and the built system messages are
    forwarded by `supabaseEdgeLLMAdapter` to the Edge `chat`, which validates only message *shape*
    (`isValidMessages`) and relays them to OpenAI. So the client-side guarantees (fail-closed states,
    civil-date validation, claim/consensus rejection) are **integrity of an honest client**, not a server
    trust boundary: a *modified* client could still send fabricated "verified facts." A real server trust
    boundary (server recomputes/​signs the grounding) is **NOT yet implemented** — see
    `SERVER_TRUST_BOUNDARY_BLOCKED` in the Closure section below. The earlier wording here ("grounding built
    server-path / client cannot fabricate") was inaccurate and is retracted.

## Tests / gates

- Full Jest **54 suites / 629 tests PASS** (Qimen build 53/610 → closure +19; zero regression). Closure
  NEW: `qimenClosure.test.ts` (PART A impossible civil dates → unsupported_case; PART B broadened
  Qimen-claim + 3-engine consensus rejection incl. per-perspective acceptance + raw-leak fail-closed;
  PART E ambient-timing-natal suppression, natal→timing→natal no-leak, distinct-instant question times).
  Qimen build tests (`qimenActivation` / `qimenEvidenceSections` / `triEngineConsultation`) + existing
  qimen{Service,Evidence,Cache,Golden} unchanged & green.
- TypeScript: 0 in changed files (11 pre-existing Expo-Router route-union errors only). Expo web export
  `Exported: dist`. npm ls OK (qimen-dunjia@2.1.0). git diff --check clean. No secrets. Frozen identical.

## Closure — Codex REJECTED verdict (target `9a83419`)

Codex rejected the Qimen build on three material defects. **A + B (+ E) are fixed and verified; C is
`SERVER_TRUST_BOUNDARY_BLOCKED`** — attempted honestly, cannot be safely + verifiably implemented under
this environment's constraints, and not faked.

- **PART A — civil-date trust (FIXED).** `qimenInputAdapter.isValidQueryTime` now validates the day against
  a pure `daysInGregorianMonth(year, month)` (proleptic leap rule, no `Date` → no silent rollover), so an
  IMPOSSIBLE civil datetime (2024-02-30, 2023-02-29, 2024-04-31, month 0/13, day 0) → `unsupported_case`
  (`QUESTION_TIME_INVALID`) BEFORE the provider is called; it can never become a trusted board. Mirrors the
  Ziwei Gregorian guard. Tests: `qimenClosure.test.ts` PART A (valid/invalid tables + no-facts-promoted).
- **PART B — Qimen-claim / consensus coverage (FIXED).** Replaced the brittle phrase-list with a bounded
  semantic policy: `QIMEN_USE` covers 기문/기문둔갑 as a fact source (에서 / 결과 / 국 / 상 / 판 / 으로 보면 …) plus
  unambiguous Qimen-fact terms (값부 · 값사 · 值符 · 值使 · 八門 · 九星 · 八神 · 九宮) — the ambiguous bare Korean
  forms are deliberately NOT matched to avoid flagging ordinary prose; `hasMultiEngineConsensus` requires a
  consensus PREDICATE AND a three-engine reference (count OR three-name enumeration). Applied to core /
  futureFlow (reject-whole) and followUps (filtered); separate sourced perspectives stay accepted; rejected
  → safe message, raw never rendered. Tests: `qimenClosure.test.ts` PART B.
- **PART E — activation minors (FIXED).** `NATAL_INTENT` guard suppresses an *ambient* 지금/이번 달 inside a
  natal-disposition question (a real decision/choice/flow/action still activates, checked first);
  natal→timing→natal produces not_applicable→available→not_applicable with no stale board leak; distinct
  question instants yield distinct question times. Tests: `qimenClosure.test.ts` PART E.

### PART C — SERVER TRUST BOUNDARY: `SERVER_TRUST_BOUNDARY_BLOCKED`

**Finding (confirmed accurate).** The deterministic grounding is built in the **client**
(`buildConsultationGrounding`) and the resulting system messages are sent by `supabaseEdgeLLMAdapter` to
Edge `chat`, which validates only message *shape* (`isValidMessages`: array of `{role, content}`) and
relays them to OpenAI as `input`. The Edge reads only `ai_usage_logs` (rate-limit) — it never recomputes or
verifies any engine fact. **A modified client can therefore send fabricated "verified facts."**

**Why a real fix requires server-side engine execution.** Trusted deterministic facts must be computed
where the client cannot forge them. Sending client-signed facts is not viable (the signing secret cannot
live in the client/Expo-public bundle). A server-issued signed artifact still requires the **server** to
run the engines. So either path requires SAJU/Ziwei/Qimen to execute server-side.

**What blocks that here (all three must be resolved; none can be within this task's constraints):**
1. **No runtime to build or verify it.** Edge `chat` is Supabase **Deno**; this workspace runs Jest on
   **Node** with **no Deno/Supabase runtime** and a hard **no-deploy** constraint. An Edge engine
   reimplementation could not be executed or tested here — shipping it and claiming success would be
   fabricated completion (explicitly disallowed).
2. **No server source of trusted birth.** `supabase/migrations/` is **empty** and there is **no consumer
   birth/profile schema** anywhere in `supabase/`. The server cannot resolve authoritative birth from the
   DB. (`CONSUMER_CORE_SCHEMA.sql` remains OWNER_APPLY/HOLD.)
3. **Frozen engine is not Deno-importable without forbidden changes.** `src/features/interpretation/**`
   (freeze `7c7ed82`) and the grounding graph use `@/` path aliases and are `exclude`d from the Edge; they
   bundle via Metro, not Deno. Making them Deno-importable means editing frozen imports (violates the
   `git diff 7c7ed82 HEAD -- interpretation` = EMPTY invariant) or a new bundling/port whose correctness
   can't be verified without deploy (#1). Forking/copying the engines is disallowed (freeze + drift).

**Interim edge hardening was considered and deliberately NOT shipped:** rejecting client `system` messages
at the Edge is safe + testable, but with no server-built grounding to replace them it would strip ALL engine
facts and degrade every live consultation to no-grounding — a breaking change, net-negative without its
server-compute counterpart. It is step (b) of the path, not a standalone fix.

**Minimal architectural path (owner/next-sprint — NOT executed here):** (a) extract a runtime-neutral
`grounding-core` package (pure TS; engine deps via `npm:` in Deno) — requires re-baselining the freeze so
the engine is import-clean → **owner sign-off**; (b) redesign the request contract so the client sends
**canonical inputs only** (birth fields + question + nonce), the **server** injects the instant, runs
`buildConsultationGrounding`, builds the system messages itself, and **ignores client-sent grounding**; (c)
apply the consumer birth/profile schema so the server can persist/validate birth; (d) **deploy** + add a
Deno/Supabase-local integration test — the verification this environment cannot perform. Optional (b′):
server computes + signs an evidence artifact verified on the LLM-call path (same prerequisite: server runs
the engines).

## Remaining defects

- Material: **PART C server trust boundary is UNRESOLVED** (`SERVER_TRUST_BOUNDARY_BLOCKED`, analysis
  above) — the client-side integrity guarantees are real but are not a server boundary. PART A / B / E
  closed.
- Minor: activation is a curated deterministic rule set (documented residual risk — a novel phrasing may
  mis-route; the prompt + validator are the safety nets, and mis-activation is fail-closed either way).
  structuredResult reload persistence remains DEFERRED_MINOR.

## OWNER_ACTION_REQUIRED

Deploy Supabase Edge `chat` + set `OPENAI_API_KEY` (server-side) for live LLM answers; then authenticated
live E2E (timing question → tri-engine; natal question → Qimen not_applicable). Nothing else blocks the pipeline.

## STATUS

`SERVER_TRUST_BOUNDARY_BLOCKED` — Closure material defects A (civil-date), B (Qimen-claim / consensus
coverage), E (activation minors) FIXED + verified (54 suites / 629 tests). **C (server trust boundary)
remains UNRESOLVED**: attempted honestly, blocked by no-deploy + no-Deno runtime + empty `migrations/` (no
server birth source) + the frozen engine not being Deno-importable without breaking the freeze. Not
self-approved; no push / deploy / DB change. Minimal path documented above for owner/next sprint.
