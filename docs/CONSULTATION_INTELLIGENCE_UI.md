# Consultation Intelligence UI — Sprint 3A (presentation foundation + entity audit)

> Implements the Claude-owned **presentation seam** for Golden Flow v3 / Consultation
> Intelligence: Korean label maps + fail-closed view adapters + the Assessment components,
> over the EXISTING intelligence contracts. **No 역학/quality semantics are computed here**
> (Codex owns level/direction/confidence/agreement/timing/polarity/grounding). Fail-closed
> is the default (engines off, ruleset `not_connected`, `isConnected()` false, DB HOLD), so
> the base screens honestly say "not connected yet" and never fabricate a reading.
> Design source: `design-handoff/golden-flow-v3/…` (sibling clone; not committed).

## Entity status audit (SCHEMA ≠ WRITE PATH ≠ LIVE WRITE ≠ ADMIN READ ≠ UI)
| Entity | Schema | Write path | Live write | Admin read | UI |
|---|---|---|---|---|---|
| **Engine Evidence** | ✅ `analysis/aiOutput.EngineEvidence` + `intelligence/evidenceLedger.EvidenceRecord` | ◐ contract; ziwei/qimen `to*Evidence` exist, **SAJU adapter MISSING** | ❌ `ENGINE_CONNECTED` all false | ◐ seam (`adminIntelligenceService`, `connected:false`→`[]`) | ◐ availability label map ready; **panel not built** |
| **Assessment** | ✅ `intelligence/assessment` (15 axes, `AssessmentItem`) + DB HOLD | ◐ `assembleFailClosed` (fail-closed); **real ruleset = CODEX** | ❌ ruleset `not_connected` | ◐ seam (`AdminAssessmentRow` subset) | ✅ **fail-closed UI built** (adapter + `AssessmentSummary`/`AssessmentTile`/`AssessmentMatrix`) |
| **Cross Analysis** | ✅ `analysis/crossAnalysis` | ◐ skeleton, no live caller | ❌ | ❌ not in seam | ◐ label map ready; **panel not built** |
| **Grounding** | ✅ `chat/prompts/grounding` | ◐ `chatService` sets `GROUNDING_UNAVAILABLE` | ❌ fail-closed (Codex replaces) | ❌ | availability label ready; **panel not built** |
| **Evaluation / Quality** | ✅ `intelligence/quality` + DB HOLD (admin-only) | ◐ `emptyQualityReview` | ❌ | ◐ seam (`qualityStatus`) | ❌ panel not built |
| **User Feedback** | ✅ `intelligence/feedback` + DB `user_feedback` HOLD (owner-insert RLS) | ◐ `buildUserFeedback` contract; **no client write service wired** | ❌ | ◐ seam (`feedbackVerdict`) | ❌ panel not built |
| **Human Review** | ◐ part of `QualityReview` (`reviewStatus`/`reviewer`/`reviewedAt`) | ◐ `isValidQualityReview` (reviewed⇒reviewer+time) | ❌ | ❌ not in seam | ❌ panel not built |
| **Outcome** | ✅ `intelligence/outcome` + DB `consultation_outcomes` HOLD (§30 WITH CHECK) | ◐ `fromUserReport` (always `unverified`) | ❌ | ◐ seam (`outcomeCount`) | ❌ panel not built |
| **Dataset Lifecycle** | ❌ no contract for Approved/Calibration stages | ❌ | ❌ | ❌ | ❌ (button intentionally NOT built, §54) |

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

## Remaining UI (documented continuation — mechanical over this seam)
Golden Flow v3 visual re-skin of home/login-interruption/birth-info/chat structured-result/
evidence-sheet; Consumer `AssessmentDetailSheet`/`InterpretationEvidenceSheet`/
`ConfidenceIndicator`/`FollowUpSuggestions`/`MemoryConfirmation`/feedback UI; Admin Inspector
route (gated on `isConnected()`→연결 준비 중) + `EngineEvidencePanel`/`CrossAnalysisPanel`/
`GroundingSummary`/`EvaluationSummary`/`FeedbackPanel`/`HumanReviewPanel`/`OutcomePanel`/
`QualityReviewTable` + sidebar 2 items. All consume the same adapters/labels + fail-closed states.
