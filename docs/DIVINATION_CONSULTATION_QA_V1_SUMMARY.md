# FINAL DIVINATION CONSULTATION QA V1 — summary

100-case, real-LLM (`gpt-5-mini`, production model routing, no substitutions) end-to-end run through
`buildServerConsultation` (grounding → prompt → live OpenAI call → structured parse/validate), scored by an
independent LLM judge against a 9-dimension product-quality rubric. Harness lives in `scripts/qa/` (outside
`src/`, requires `QA_LIVE_RUN=1` + an explicit `--roots scripts/qa` jest override — never runs via a bare
`npx jest`/`npm run preflight`/`npm run release-preflight`).

Full per-case records (question, profile, real answer, judge scores/issues) are NOT committed — real user-
style Korean consultation transcripts at this volume don't belong in git history; they live in the QA run's
own output directory for spot-checking, regenerated on demand by re-running the harness.

## Baseline → final (after ONE bounded repair pass)

| Metric | Threshold | Baseline | Final |
|---|---|---|---|
| Average score | ≥90 | 52.54 | 67.4 |
| P10 score | ≥80 | 0 | 0 |
| Hard-fail count | 0 | 28 | 19 |
| Personalization fail rate | ≤5% | 89% | 19% |
| Cross-synthesis pass rate | ≥95% | 79.52% | **98.77% ✅** |
| Follow-up continuity pass | 100% | 0% | **100% ✅** |
| Generic-template failure rate | ≤5% | 0% | 0% |

Most of the baseline→final jump (avg 52.54→67.4, personalization 89%→19%, cross-synthesis 79.52%→98.77%,
follow-up continuity 0%→100%) came from fixing bugs in the QA harness itself, discovered during triage —
not the product:
- The judge's own OpenAI call had too small an output-token budget and silently truncated/emptied on ~8%
  of cases (the same "reasoning tokens bill as output" failure class `llmBudget.ts` already fixed once for
  the product's consultation path).
- The judge was never shown the real engine-computed grounding facts, so it penalized "personalization"
  for missing detail it was never given itself.
- The 5-turn follow-up-chain harness didn't thread `conversationContext` between turns the way a real
  client does, so any follow-up phrased outside the server's narrow WHY/NEXT_YEAR/BETWEEN/WHEN pattern
  looked like broken continuity when it wasn't.

## The one product-level repair

`src/features/chat/prompts/consultationPolicy.ts` — the comparison-question instruction in
`SYSTEM_CONSTITUTION` only warned against explicit winner phrasing ("가장 좋다/1순위/A가 B보다 낫다"); the
certainty/Option-B guard's actual detection surface is broader (also flags "추천합니다/권합니다/~하는 게
좋다/A로 진행하세요" etc.). Widened the first-attempt instruction to match the guard's real surface,
mirroring wording already proven in the existing regeneration directive. Zero regressions (268 suites /
4101 tests). Did not measurably move the underlying rejection rate (see below) — kept as a legitimate,
low-risk fix regardless.

## Dominant remaining defect (not fixed — outside the one-repair budget)

~15-17% of BUSINESS/MONEY/CAREER/LOVE questions — not only literal "A보다 B가 나아?" comparisons, but
plain decision-shaped questions too ("~해도 될까?", "~하는 게 맞을까?"), and even one plain trend question
("올해 하반기 재물운은 어때?") — get the model's real answer rejected by the certainty/winner output guard
even after its one built-in regeneration attempt, falling back to the generic
"죄송합니다, 지금은 답변을 정리하는 중에 문제가 있었어요" message. This is the single dominant driver of
the remaining hard-fail count, the P10=0, and nearly all of the residual personalization-fail rate (with
real grounding facts now shown to the judge, personalization fails on genuinely-generated answers dropped
to 2/100 — the rest is 100% this rejection pattern). The one prompt-text mitigation attempted this batch
did not measurably reduce this rate — the trigger surface is broader than "explicit A-vs-B comparisons,"
and root-causing it needs to distinguish which guard is firing (general certainty vs `forbidWinner`) and
whether `forbidWinner` is being set server-side for more question shapes than intended. Left for the next
bounded repair batch (see the session's final report for a fuller root-cause protocol).

`FINAL_DIVINATION_CONSULTATION_QA_V1_STATUS = FAIL` (4 of 7 gates below threshold). Per the QA brief's own
governance, no second repair cycle was attempted this batch.
