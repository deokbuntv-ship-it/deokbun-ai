# Codex Re-Review — Myungri FULL CONSULTATION PIPELINE FINAL CLOSURE

> The 5 Codex MATERIAL defects on the 명리 → Evidence → Grounding → Prompt → LLM → Structured Result
> pipeline, closed as LOCALIZED integration fixes. Frozen calc (`7c7ed82`) untouched; existing Ziwei
> (`02f1382`) preserved; **Qimen NOT connected**. Status: `READY_FOR_CODEX_MYUNGRI_PIPELINE_FINAL_CLOSURE_REVIEW`.

1. **Starting HEAD:** `02f1382` (Ziwei V1 dual-engine).
2. **Ending HEAD:** this commit — the single local closure commit atop `02f1382` (SHA in `git log -1`).
3. **Changed files (integration layer only):** `analysis/aiOutput.ts`, `analysis/index.ts`,
   `chat/prompts/structuredConsultation.ts`, `chat/prompts/grounding.ts`, `chat/prompts/promptBuilder.ts`,
   `chat/services/chatService.ts`, `chat/services/consultationGrounding.ts`,
   `myungri/adapters/sajuEvidenceAdapter.ts`, + NEW `chat/__tests__/pipelineClosure.test.ts`.
4. **Frozen engine integrity:** `git status -- src/features/interpretation` empty; `git diff 7c7ed82 HEAD
   -- src/features/interpretation` empty. No calc/calendar/立春/12-Jie/Daewoon/Sewoon/Wolwoon/relations change.
5. **Existing Ziwei preservation:** `ENGINE_CONNECTED={saju:true, ziwei:true, qimen:false}` unchanged; all
   ziwei + dual-engine suites green; no ziwei file reverted.

## The 5 material fixes

6. **FIX 1 — semantic rejection never renders raw.** NEW typed `classifyConsultationOutput()` returns
   `ACCEPTED | STRUCTURAL_FALLBACK | SEMANTIC_REJECTED`. chatService renders raw model text ONLY on
   STRUCTURAL_FALLBACK (safe prose, no schema). A SEMANTIC violation — in the structured JSON **or** the
   raw prose — discards the text and shows `SEMANTIC_REJECTION_MESSAGE` (a safe generic retry ask, never a
   fabricated interpretation). The "validate→null→render raw response.text" leak is gone.
7. **FIX 2 — timing covers ALL fields + followUps.** Timing is validated against structured, evidence-derived
   `EngineEvidenceTimingAnchors` (allowed Gregorian years = birth year + current 세운/월운; Daewoon age span),
   NOT a lone boolean. A specific "YYYY년" (or absurd age) not in the anchors is unsupported: in **core prose**
   → reject; in **futureFlow** → stripped; in a **followUp** → that followUp removed. Relative language
   (올해/내년/향후 몇 년) carries no year and is not flagged.
8. **FIX 3 — full deterministic time-axis evidence.** `calculateMyungriTimeAxis` is now actually CALLED in the
   grounding builder. Evidence preserves: Daewoon **direction** (순행/역행) + start/**end** age + **active/current
   cycle** marker (resolved from the current age); Sewoon **relationsToNatal**; Wolwoon **relationsToNatal** +
   relationToSewoon; the connected **원국↔대운↔세운↔월운** cross-layer relations (합충형파해 + 삼합/방합) as its own
   `시간축 연결` section; per-layer ruleVersions/assumptions/limitations in `근거·한계`. Facts only — no new calc,
   no strength/용신/격국.
9. **FIX 4 — Solar/Lunar canonical full-prompt equivalence.** When a 명식 is available, the subject block's
   reasoning identity is the confirmed 사주 in 【계산 근거】 (identical for the same instant). The raw input
   date/calendar is kept ONLY as a clearly-marked `※ 입력 원본(참고용, 비추론)` audit line. The same birth instant
   entered as 양력 2024-01-03 or 음력 2023-11-22 produces a BYTE-IDENTICAL reasoning prompt (audit line excluded) —
   verified on the real `buildPrompt` output, not just the grounding string.
10. **FIX 5 — strict runtime grounding validation.** `toSafeGrounding` now validates the FULL shape: availability
    enum, summary/detail types, section shape (`label:string`, `lines:string[]`), timingAnchors shape,
    hasTimingEvidence boolean, unavailable-reason enum, engineVersion type, and connected-engine consistency
    (an `available` engine with no usable fact is rejected). Malformed → fail-closed UNAVAILABLE. `buildPrompt`
    now runs inside a guard in chatService (outside the network boundary) so it can never throw uncaught.

## Behavior detail

11. **Semantic rejection behavior:** false engine use (Ziwei when unconnected / Qimen), fake multi-engine or
    Saju↔Ziwei consensus, unsupported theory (신강/신약/용신/격국/12운성/12신살), or unsupported specific timing.
12. **Raw fallback behavior:** only harmless, schema-less prose is shown raw; anything semantically unsafe is replaced.
13. **Timing anchor design:** `{ years:number[], daewoonAgeSpan:{min,max}|null }` built in `sajuEvidenceAdapter`
    from real 세운/월운 target years + birth year + Daewoon cycle ages; consumed by the validator as an allowlist.
14. **All-field validation coverage:** coreSummary/disposition/coreInterpretation/strengths/cautions/
    domainInterpretation/futureFlow/followUps.
15. **Follow-up validation:** empty/duplicate not introduced; unsupported-timing / unconnected-engine / theory
    followUps individually dropped; a bad followUp does NOT reject the whole (still-safe) answer.
16. **Time-axis evidence preservation:** see FIX 3 — reaches the rendered prompt (`시간축 연결`, 대운, 세운, 월운).
17. **Provenance preservation:** 立春(`START_OF_SPRING_IPCHUN`)/12-Jie(`TWELVE_JIE_JIEQI`) + every reused ruleVersion
    (product, ten-gods, 세운, 월운, time-axis) survive to the prompt.
18. **Solar/Lunar full prompt equivalence:** verified via `buildPrompt` (pipelineClosure §FIX 4).
19. **Malformed grounding behavior:** strict `toSafeGrounding` → UNAVAILABLE; a builder returning malformed
    grounding degrades the request to fail-closed (grounded=false), never crashes (tested).
20. **Five consultation scenarios:** 성격 / 직업 / 재물 / 흐름 / follow-up — distinct, grounded, safe (pipelineClosure §8).
21. **SAJU regression:** green (frozen + myungri time-axis + grounding E2E).
22. **Ziwei regression:** green (engine + evidence sections + dual-engine E2E).
23. **Qimen remains unconnected:** `ENGINE_CONNECTED.qimen=false`; any Qimen-use claim rejected.
24. **Total tests:** **49 suites / 523 tests PASS** (was 505 → +18; zero regression).
25. **TypeScript:** 0 errors in changed files (11 pre-existing Expo-Router route-union errors only — baseline unchanged).
26. **npm ls:** OK (iztro@2.5.8, lunar-javascript@1.7.7).
27. **Expo production web export:** `Exported: dist` (exit 0).
28. **git diff --check:** clean (LF→CRLF warnings only).
29. **Security:** no OPENAI_API_KEY / secret in client or commit; user input cannot overwrite system grounding;
    client never fabricates trusted facts; rejected raw LLM content never shown via a validation bypass.
30. **Remaining material defects:** none known.
31. **Remaining minor defects:** structuredResult reload persistence = DEFERRED_MINOR (live render works; not
    extended by this closure); false-claim/consensus validation uses narrow high-precision regexes (documented
    residual risk — the prompt is the first defense; a rejected result is un-blessed, not regenerated).
32. **Owner actions (do NOT do now):** deploy Supabase Edge `chat` + set `OPENAI_API_KEY` (server-side); then a
    logged-in live consultation / Solar-Lunar / timing / Ziwei test. Code+tests complete against the mock boundary.
33. **Commit hash:** this local closure commit (SHA in `git log -1`) — local only. No push / deploy / DB migration.
34. **Final status:** `READY_FOR_CODEX_MYUNGRI_PIPELINE_FINAL_CLOSURE_REVIEW`.
