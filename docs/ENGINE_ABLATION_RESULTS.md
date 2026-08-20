# 덕분이 V1 — ENGINE ABLATION RESULTS (Sprint D §D9)

Offline diagnostic (`src/features/chat/server/__tests__/engineAblation.test.ts`). Compares STRUCTURED
decision outputs — never prose — across three conditions on identical fixtures:

- **A** — all engine evidence
- **B** — Ziwei omitted
- **C** — Qimen omitted

Decision signature compared: `supportLevel`, `resolvedGranularity`, `comparisonSupported`,
`rankingSupported`, `requireMitigation`, target-scoped `polarity`, `resolvedTargets`, `targetPolarities`.

Fixtures: `올해 재물운`, `내년 사업운`, `이번 달 직업운`, a Qimen-activating timing question, and a natal question.

## Result

For every fixture, omitting Ziwei or Qimen changed the engine **availability** (the ablation input) but left
the **decision signature identical** to condition A.

## Interpretation (for `PRODUCT_TRUTH_GUARD.md`)

> The current V1 Decision Plan is **not substantively using Ziwei/Qimen** in the tested cases.

This is a statement about the DECISION LAYER, **not** a claim that "Ziwei/Qimen have no value." The V1 Answer
Plan reads only the deterministic timing anchors + target polarities, which come from the 명리/Saju spine;
Ziwei/Qimen are currently prose-only (no timing anchors, no polarity), and are presented as separate
interpretive perspectives — a contribution this structural harness does not measure.

## Consequence

- Do **not** claim three-engine consensus / cross-validation / "all three agree" (see `PRODUCT_TRUTH_GUARD.md`)
  — the decision does not combine them.
- A future V1.1 that wants engines to substantively affect the decision must add a deterministic
  cross-engine contribution (and re-run this harness to show the signature actually changes).
