# Consultation Intelligence UI — Sprint 3A (presentation foundation + entity audit)

> Implements the Claude-owned **presentation seam** for Golden Flow v3 / Consultation
> Intelligence: Korean label maps + fail-closed view adapters + the Assessment components,
> over the EXISTING intelligence contracts. **No 역학/quality semantics are computed here**
> (Codex owns level/direction/confidence/agreement/timing/polarity/grounding). Fail-closed
> is the default (engines off, ruleset `not_connected`, `isConnected()` false, DB HOLD), so
> the base screens honestly say "not connected yet" and never fabricate a reading.
> Design source: `design-handoff/golden-flow-v3/…` (sibling clone; not committed).

## Entity status audit (SCHEMA ≠ WRITE PATH ≠ LIVE WRITE ≠ ADMIN READ ≠ UI)
> **Sprint 3A-B update:** the UI column is now built (fail-closed) for every entity except
> Dataset Lifecycle (intentionally not built — no contract). `LIVE WRITE` is still ❌
> everywhere (Codex owns engines + ruleset + persistence). Building the UI did not change
> any write/live-write state — it renders the not-connected state honestly.

| Entity | Schema | Write path | Live write | Admin read | UI |
|---|---|---|---|---|---|
| **Engine Evidence** | ✅ `analysis/aiOutput.EngineEvidence` + `intelligence/evidenceLedger.EvidenceRecord` | ◐ contract; ziwei/qimen `to*Evidence` exist, **SAJU adapter MISSING** | ❌ `ENGINE_CONNECTED` all false | ◐ seam (`adminIntelligenceService`, `connected:false`→`[]`) | ✅ `EngineEvidencePanel` (5 states distinct) + consumer Explainability (`toExplainabilityView`) |
| **Assessment** | ✅ `intelligence/assessment` (15 axes, `AssessmentItem`) + DB HOLD | ◐ `assembleFailClosed` (fail-closed); **real ruleset = CODEX** | ❌ ruleset `not_connected` | ◐ seam (`AdminAssessmentRow` subset) | ✅ `AssessmentSummary`/`Tile`/`Matrix` + `AssessmentDetailSheet` (consumer) + `toAdminAssessmentDetail` |
| **Cross Analysis** | ✅ `analysis/crossAnalysis` | ◐ skeleton, no live caller | ❌ | ❌ not in seam | ✅ `CrossAnalysisPanel` (`toCrossAnalysisView`, signals never merged) |
| **Grounding** | ✅ `chat/prompts/grounding` | ◐ `chatService` sets `GROUNDING_UNAVAILABLE` | ❌ fail-closed (Codex replaces) | ❌ | ✅ `GroundingSummary` (`toGroundingView`) + consumer `InterpretationEvidenceSheet` |
| **Evaluation / Quality** | ✅ `intelligence/quality` + DB HOLD (admin-only) | ◐ `emptyQualityReview` | ❌ | ◐ seam (`qualityStatus`) | ✅ `EvaluationSummary` (`toEvaluationView`, fail-closed not_evaluated) |
| **User Feedback** | ✅ `intelligence/feedback` + DB `user_feedback` HOLD (owner-insert RLS) | ◐ `buildUserFeedback` contract; **no client write service wired** | ❌ | ◐ seam (`feedbackVerdict`) | ✅ admin `FeedbackPanel` + consumer `UserFeedbackControl` (`canPersist:false` — honest seam) |
| **Human Review** | ◐ part of `QualityReview` (`reviewStatus`/`reviewer`/`reviewedAt`) | ◐ `isValidQualityReview` (reviewed⇒reviewer+time) | ❌ | ❌ not in seam | ✅ `HumanReviewPanel` (`writePathConnected:false` — action shown not-connected) |
| **Outcome** | ✅ `intelligence/outcome` + DB `consultation_outcomes` HOLD (§30 WITH CHECK) | ◐ `fromUserReport` (always `unverified`) | ❌ | ◐ seam (`outcomeCount`) | ✅ `OutcomePanel` (`toOutcomeView`, unverified preserved) |
| **Dataset Lifecycle** | ❌ no contract for Approved/Calibration stages | ❌ | ❌ | ❌ | ❌ (button intentionally NOT built, §35/§54) |

**One-line truth:** contracts exist for almost everything (SCHEMA ✅), **nothing has a live
write** (engines + ruleset are Codex), admin read is the `connected:false` seam, and the UI
built this sprint is the **Assessment presentation foundation + the label/adapter seam**.

## What this sprint built (Claude-owned, contract-faithful)
- `intelligence/presentation/labels.ts` — Korean label maps for axis/level/direction/
  confidence/agreement/availability + tone maps. **`not_applicable` (미사용) ≠
  `calculation_failed` (계산 실패) ≠ `engine_not_connected` (미연결)** (§29/§30). No numeric.
- `intelligence/presentation/assessmentView.ts` — fail-closed adapters:
  `toConsumerAssessmentView` (tiles only for committal evaluative levels; `insufficient`
  confidence hidden — never "낮음"; `rules_not_connected` → honest unavailable state;
  missing-birth-time axes grouped) and `toAdminAssessmentRow` (all 7 columns; **▲supporting
  / ▼counter never summed**; admin shows `insufficient` truthfully).
- Consumer `components/AssessmentSummary.tsx` (`AssessmentSummary` + `AssessmentTile`) —
  token-based, categorical, fail-closed copy.
- Admin `components/AssessmentMatrix.tsx` — 7-col matrix, empty-state honest, level badge.
- 12 tests locking: fabricated-level rejected, insufficient≠low, supporting≠counter, no
  numeric, not_connected vs insufficient reason, missing-birth-time grouping.

**Architectural guarantee (§70):** the UI renders these ViewModels. When Codex wires real
engines → evidence → assessment, only the seam produces populated ViewModels — **no UI
rewrite**. Import components by path (`@/features/intelligence/components/…`), NOT via the
pure barrel (kept react-native-free for the node test suites).

## Contract gaps found (for Codex / contract owners)
- **`AssessmentItem` has no user-facing `summary`/description field.** The design's per-tile
  "meaning sentence" has no contract source; the UI must not fabricate it (§8). Either add
  an optional `summary: string` to `AssessmentItem` (Codex ruleset fills it) or source the
  sentence from the LLM response. Until then, tiles show axis + level + direction + timing.
- The admin seam (`adminIntelligenceService`) returns an `AdminAssessmentRow` **subset**
  (no direction/agreement/timing); the full matrix needs the seam to return `AssessmentItem`s.

## What Sprint 3A-B added (Claude-owned UI, over the same seam)
**Pure adapters** (`intelligence/presentation`, all fail-closed, +18 tests):
`evidenceView` (`toEngineEvidenceView`/`toGroundingView`/`toExplainabilityView` — 5
availability states stay distinct, summary never fabricated, only-available engines counted
as used), `crossAnalysisView` (signals never merged), `intelligenceViews`
(`toEvaluationView`/`toHumanReviewView`/`toFeedbackView`/`feedbackControlState`/`toOutcomeView`),
`assessmentDetailView` (consumer hides insufficient + raw ids; admin shows them). Extended
`labels.ts` with the grounding/cross/quality/outcome/feedback/applicability maps.

**Consumer components** (`intelligence/components`, imported by PATH — never via the pure
barrel): `StructuredConsultationResult` (Golden Flow v3 hybrid result + progressive
disclosure), `ConsultationStateNotice` (7 truthful states), `ConfidenceIndicator`,
`InterpretationEvidenceSheet`, `AssessmentDetailSheet`, `FollowUpSuggestions`,
`MemoryConfirmation`, `UserFeedbackControl`.

**Admin** (`admin/components/intelligence`) + route `/admin/consultation-intelligence`
(sidebar: 상담 인텔리전스): `ConsultationInspector` composes the full trace chain, gated on
`adminIntelligenceService.isConnected()` → `NOT_CONNECTED_INSPECTOR` (fail-closed);
`EngineEvidencePanel`/`CrossAnalysisPanel`/`GroundingSummary`/`EvaluationSummary`/
`FeedbackPanel`/`HumanReviewPanel`/`OutcomePanel` + reused `AssessmentMatrix`.

## The one seam that still blocks LIVE consumer rendering (Codex)
The consumer components are **built, exported, and gate-green, but NOT yet mounted in the
live chat screen** — and mounting them without fabricating data needs a Codex/contract
decision. Two gaps:
1. **No structured-result attachment on a chat message.** `conversation_messages` / the chat
   message contract has no field carrying a `StructuredConsultationViewModel` (or its
   source: `AssessmentItem[]` + `ConsultationGrounding` + prose sections). Until a message
   can carry a real structured result, `StructuredConsultationResult` has no honest data
   source — mounting it would either never render (no source) or fabricate (forbidden §37).
   → Codex: define how a structured consultation result attaches to a message, then the chat
   screen renders `<StructuredConsultationResult vm={…}/>` with no component rewrite (§70).
2. **`AssessmentItem.summary` still missing** (carried over from Sprint 3A) — the per-tile
   meaning sentence has no contract source; the LLM prose sections in
   `StructuredConsultationViewModel` are the interim source, but the tile's own sentence
   needs either `AssessmentItem.summary` or an explicit "no sentence" contract.
3. **Admin seam returns thin subsets.** `adminIntelligenceService.getRun()` →
   `AdminIntelligenceRunDetail` carries `AdminAssessmentRow`/`AdminOutcomeRow` subsets, not
   the full domain objects the panels consume (`AssessmentItem`, `ConsultationGrounding`,
   `DomainCross[]`, `QualityReview`, `UserFeedback`, `ConsultationOutcome`). The inspector
   renders `NOT_CONNECTED_INSPECTOR` today; to show live runs, enrich the seam to return the
   full trace (or a `ConsultationCase`), then pass it to `<ConsultationInspector data={…}/>`.

## Still NOT built (correctly — no contract / needs live wiring)
- **Scroll-to-start-of-answer (§17)** and follow-up/composer wiring live in the **chat
  screen**, which this sprint did not touch (no structured-result source yet). Deferred with
  gap #1 above — it's a wiring step, not a new component.
- **Dataset Lifecycle actions (§35)** — no contract for Approved/Calibration; button
  intentionally absent. Absolutely no `AI에게 학습시키기`.
