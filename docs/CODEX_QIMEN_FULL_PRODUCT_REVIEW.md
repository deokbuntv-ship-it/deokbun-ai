# Codex Review — Qimen Dunjia V1 FULL PRODUCT (engine → live tri-engine consultation)

> Independent review handoff for the third engine. **Question-time** based (not natal). Frozen Saju
> (`7c7ed82`) untouched; Ziwei calculator preserved. **Status: `READY_FOR_CODEX_QIMEN_FULL_PRODUCT_REVIEW`**
> (not APPROVED / PRODUCTION_READY / FULLY_VERIFIED). Local commits only; no push/deploy/DB.

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
 → computeQimenBoard (existing engine; not_applicable for natal, fail-closed on missing/invalid/unsupported)
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
   so "투자 성향은?" (natal) does NOT activate. Never LLM-decided. States: available / not_applicable /
   missing_question_time / unsupported_case / calculation_failed.
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
9. **No fake consensus (§14)** — "세 학문 일치" is now UNCONDITIONALLY rejected by the validator (V1 has no
   formal cross-engine consensus), even when all three engines are available.
10. **Structured safety (§17)** — Qimen-use claim allowed only when qimen `available`; rejected for
    not_applicable/unavailable; per-perspective separation accepted.
11. **Timing safety (§12)** — Qimen `hasTimingEvidence:false`, no timingAnchors → it does NOT license
    specific future-year claims; the Saju 1970–2050 timing gate is untouched.
12. **Follow-up (§18)** — activation is fresh per question (the question instant is passed each turn): a
    natal turn → not_applicable, a timing follow-up → freshly available.
13. **Assessment (§14)** — untouched, still fail-closed (`toConsumerAssessmentView([])`).
14. **Security (§20)** — qimen-dunjia is local (no external send); no birth/question payload logged; no
    secret; client cannot fabricate trusted evidence; grounding built server-path.

## Tests / gates

- Full Jest **53 suites / 610 tests PASS** (was 572 → +38; zero regression). NEW: `qimenActivation.test.ts`
  (classifier + Seoul instant), `qimenEvidenceSections.test.ts` (sections/honesty/no-timing), `triEngine
  Consultation.test.ts` (activation, prompt delivery, degraded/unsupported 節氣, Qimen-claim gating,
  3-consensus rejection, follow-up fresh-time, 5 scenarios). Existing qimen{Service,Evidence,Cache,Golden}
  unchanged & green.
- TypeScript: 0 in changed files (11 pre-existing Expo-Router route-union errors only). Expo web export
  `Exported: dist`. npm ls OK (qimen-dunjia@2.1.0). git diff --check clean. No secrets. Frozen identical.

## Remaining defects

- Material: none known.
- Minor: activation is a curated deterministic rule set (documented residual risk — a novel phrasing may
  mis-route; the prompt + validator are the safety nets, and mis-activation is fail-closed either way).
  structuredResult reload persistence remains DEFERRED_MINOR.

## OWNER_ACTION_REQUIRED

Deploy Supabase Edge `chat` + set `OPENAI_API_KEY` (server-side) for live LLM answers; then authenticated
live E2E (timing question → tri-engine; natal question → Qimen not_applicable). Nothing else blocks the pipeline.

## STATUS

`READY_FOR_CODEX_QIMEN_FULL_PRODUCT_REVIEW`.
