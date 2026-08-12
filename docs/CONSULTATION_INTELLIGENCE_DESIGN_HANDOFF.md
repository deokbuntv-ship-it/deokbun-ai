# Design Handoff — Admin Consultation Intelligence Inspector

> For the **Claude Design track** (visual owner). Claude app track built the read
> backend seam only (`adminIntelligenceService`, §40) — no screen. This doc is the
> contract Design builds the Inspector UI against. Directive §50.

## What the Inspector is for
Let an admin open a past consultation and see **why** the answer was given —
evidence → assessment → answer — plus its quality review, the user's feedback, and
any later real outcome. It is a **read-only trace viewer**, not an editor.

## Backend seam (already built)
`import { adminIntelligenceService } from '@/features/admin';`
- `isConnected(): Promise<boolean>` — gate the whole screen on this.
- `listRuns({search?, limit, offset}): Promise<AdminIntelligenceRunListItem[]>`
- `getRun(runId): Promise<AdminIntelligenceRunDetail | null>`

Types: `AdminIntelligenceRunListItem`, `AdminIntelligenceRunDetail`,
`AdminAssessmentRow`, `AdminOutcomeRow` (exported from `@/features/admin`).

## Truthful states (design ALL of them — never fake data)
1. **Not connected** (`isConnected() === false`, current reality): the
   engine→assessment pipeline is not wired. Show a calm "연결 준비 중 — 상담 인텔리전스
   파이프라인 미연결" empty state. **No skeleton rows, no placeholder numbers.**
2. **Connected + empty**: pipeline on but no runs match → normal empty list.
3. **Connected + data**: list + detail (below).
4. **Error/outage**: standard admin error + 다시 시도 (reuse `AdminStateView`).

Follow the existing admin fortune-mail Inspector for shell/table/detail-drawer
patterns (`AdminDataTable`, `AdminDetailDrawer`, `AdminDetailSection`, `AdminBadge`).

## List row (`AdminIntelligenceRunListItem`)
`runId` · `conversationRef` · `questionScope` · `createdAt` · `assessmentCount` ·
`qualityStatus` · `feedbackVerdict|null` · `outcomeCount`.

## Detail (`AdminIntelligenceRunDetail`)
- Header: `questionScope`, `createdAt`, `schemaVersion`, `conversationRef`.
- **Assessments** (`AdminAssessmentRow[]`): `axisKey`, `level`, `confidence`,
  `rulesetVersion`, `supportingEvidenceCount`, `counterEvidenceCount`.
- `qualityStatus`, `feedbackVerdict`, **Outcomes** (`AdminOutcomeRow[]`).

## Hard visual rules (match the data contract)
- **NO numeric score.** `level` is categorical (`very_strong … very_weak`, `mixed`,
  `not_applicable`, `insufficient`, `rules_not_connected`). Render as a badge/label,
  never as `87점`/`%`/a progress bar implying a computed score (§45).
- **Fail-closed is a real, expected state.** When `rulesetVersion === 'not_connected'`
  the level will be `rules_not_connected` — show it honestly ("평가 규칙 미연결"), not
  as an error and not hidden (§44).
- **Supporting vs counter** evidence are distinct — give them distinct affordances
  (e.g. ▲ 근거 N / ▼ 반대근거 M); never merge into one count.
- **User feedback / user-reported outcomes are signals, not truth.** Label outcomes
  with their `verificationStatus`; a user report always reads `unverified` (§27/§30).
  Do not style a user report as a confirmed prediction hit.
- **No PII on screen.** The seam returns refs/levels/counts only — never render
  name/email/birth/question/answer text (there is none to render).

## PII / privacy
The seam is PII-minimal by construction. If a future field would add personal text,
that is a backend change (and a policy decision) — Design should not synthesize it.
