# DeokbunAI — Consultation Intelligence V1.0 (foundation)

> Goal: turn DeokbunAI from "역학 계산 → GPT 답변" into a system that can trace **why**
> a consultation was given (which evidence → which assessment → which answer) and
> accumulate **quality/outcome** data over time — the basis for future, *offline,
> human-reviewed* calibration. This sprint delivers the **data/contract foundation
> only** — no engine rules, no auto-learning, no fake scores.

## Architecture (layers)
```
[Deterministic Engines: SAJU/ZIWEI/QIMEN]   (frozen — Codex)
        ↓ EngineEvidence (facts-only)
[A. Evidence Ledger]      provenance + immutability      ← src/features/intelligence/evidenceLedger.ts
        ↓
[B. Assessment]           15 axes, fail-closed            ← assessment.ts (RULES = Codex)
        ↓
[C. Cross Analysis]       aligned/complementary/…          ← reuse src/features/analysis/crossAnalysis.ts
        ↓
[D. Consultation Case/Trace]  references-only              ← consultationCase.ts
        ↓
[E. LLM Consultation]     bounded, truthful                ← chat pipeline (Codex wires evidence in)
        ↓
[F. Response Quality]     separate from astrology          ← quality.ts
        ↓
[G. User Feedback + Admin Review]  signal, not truth       ← feedback.ts + quality.ts
        ↓
[H. Outcome Registry]     provenance, user≠verified        ← outcome.ts
        ↓
Consultation Intelligence Dataset → (future, offline) calibration / prompt / ranking / eval
```

## The four separated layers (never merged into one score/blob — §4)
- **A. Calculation FACT** — what the frozen engines computed (Evidence Ledger).
- **B. ASSESSMENT** — facts → user-facing axes, by a **verified ruleset** (Codex).
- **C. CONSULTATION** — LLM answers using assessment + evidence.
- **D. QUALITY / OUTCOME** — the *answer's* quality + the later real result.

## What this sprint built (Claude — pure contracts, `src/features/intelligence/`)
| File | Contract |
|---|---|
| `versions.ts` | schema/ruleset versions; `ASSESSMENT_RULESET_NOT_CONNECTED` sentinel |
| `evidenceLedger.ts` | `EvidenceRecord` (provenance: engine/version/ruleset; immutable) — reuses `EngineEvidence` |
| `assessment.ts` | 15-axis taxonomy + value contract (level/direction/confidence **separate**; agreement reuses cross-analysis; per-engine contributions; **supporting vs counter** evidence refs) + **fail-closed** `assembleFailClosed` + validator |
| `questionScope.ts` | scope → relevant-axes map (structural) |
| `consultationCase.ts` | reference-only trace + versions (reproducible) |
| `quality.ts` | response-quality dimensions/status (separate from astrology correctness); fail-closed `not_evaluated` |
| `feedback.ts` | user signal — never ground truth |
| `outcome.ts` | outcome registry; **user_report always `unverified`** (§30) |

**Invariants locked by tests (22):** fail-closed (no fabricated assessment level — incl. `mixed` — without a connected ruleset; blank/placeholder ruleset rejected), no fake numeric score, provenance preserved (incl. evidence `schemaVersion`), per-engine independence, qimen `not_applicable` preserved, support≠counter, user_report never `verified`, reproducible versions, JSON round-trip.

## Hard rules honored
- **Fail-closed (§44):** with no verified ruleset, assessments are `rules_not_connected` — never `strong`/`weak`/`mixed`. The validator uses a **positive allow-list**: any evaluative level (the five strengths **or** `mixed`) requires a genuinely connected ruleset — an empty, whitespace, sentinel, or missing `rulesetVersion` is rejected, so a fabricated conclusion cannot slip through on a blank field.
- **No fake score (§45):** categorical only; no `93점`/`87%` source of truth.
- **No auto-learning (§7/§31):** outcomes/feedback are captured for future offline analysis; nothing mutates any engine rule or weight.
- **Historical immutability (§9/§36):** every record carries the versions in effect; a re-evaluation is a NEW run, never an in-place overwrite.
- **No PII duplication (§23/§51):** the case stores references (conversation/message/subject ids), not name/email/birth/question/answer text.

## Storage — `docs/CONSULTATION_INTELLIGENCE_DB.sql` (OWNER_APPLY / HOLD)
5 RLS-enforced tables (`consultation_intelligence_runs`, `assessment_items`,
`consultation_quality_reviews` [admin-only], `user_feedback`, `consultation_outcomes`).
RLS is defense-in-depth aligned with the contracts:
- **runs + assessment_items** are read-only to owner/admin and **written only by the
  service role** (server-side pipeline) — no client write path, so a user can't
  fabricate provenance rows the app validator rejects.
- **user_feedback + outcomes** are owner-writable but **append-only**; the **§30
  invariant is enforced at the DB** (owner outcome must be `user_report`+`unverified`),
  and `user_feedback.reason` is a DB `CHECK` enum (no free-text PII).
- **Append-only everywhere** (only the quality-review workflow may UPDATE) → history
  immutable; SECURITY DEFINER functions `REVOKE`d from `public`.
**HOLD:** no app code writes these yet (engine→assessment pipeline is Codex) — apply
when the pipeline ships. Idempotent/additive; never auto-applied.

## What is CODEX (not Claude)
Evidence→assessment mapping (which evidence → what polarity/strength → which axis),
supporting/counter classification, timing rules, cross-engine reconciliation
semantics, golden fixtures, and wiring engine results into the case/prompt. See
`CODEX_HANDOFF_2026-08-17.md §21` (engine→prompt) — this foundation extends that:
`Engine → EngineEvidence → Evidence Ledger → Assessment → Cross Analysis →
Consultation Case → prompt`.

## Future learning boundary (§33/§34) — explicitly NOT in V1.0
Calibration of evidence→assessment, response-strategy tuning, prompt improvement,
retrieval, ranking, evaluator improvement, offline benchmark, fine-tuning — all
require **human-reviewed, versioned, offline** processes on the accumulated dataset.
The deterministic engine is the fact layer and never self-mutates from feedback.
