# Consultation Quality & UX Sprint — Delivered + Build-Ready Contracts

Commercial Quality Sprint (2026-08-18). Constitution guard: 안정성 > 상담 품질 > 보안 >
비용 (§25); cost/quality never at the expense of the trust boundary, RLS, or engine integrity.

## Delivered this sprint (committed, gated, NOT pushed)

| Commit | What |
|---|---|
| `7a6d84d` | **TIMING_CLAIM_MISMATCH fix (§2)** — grounds the questioned year's 세운 (frozen engine) so future-timing questions (2027/내년/N년뒤) are ACCEPTED; validator NOT weakened. |
| `4b89aad` | **Commercial answer contract (§3-6/§9/§16)** — concise + conclusion-first, no internal/dev terms, no limitation exposure, no absolutes, EXACTLY 3 in-response follow-ups. |
| `f1fb5e0` | **Token/cost telemetry (§13)** — reasoning + cached tokens + complexity/effort/ceiling → ai_usage_logs (migration owner-apply). |

Answer-length policy is currently enforced by the prompt (conciseness + conclusion-first)
combined with the per-complexity reasoning-effort routing already live. Numeric per-complexity
targets (SIMPLE 250-500 / STANDARD 500-900 / DEEP 900-1600 chars) are a refinement below.

---

## Build-ready contracts (designed, NOT yet implemented — reserve for the next pass)

These are client-side UX features. Each is specified precisely so it can be built without
re-deciding architecture. They were NOT half-built (제3/4조: no incomplete/fake features).

### A. Presentation model separation (§7)
Keep the server's **StructuredConsultationResult** (needed for semantic validation) as the
INTERNAL contract; add a pure client adapter `toConsultationPresentation(structuredResult)` →
a lean **PresentationModel** the UI renders: `{ headline, why[2-4], keyPoints[], cautions?[],
followUps[3] }`. De-duplicate at the adapter (coreSummary vs coreInterpretation; strengths vs
interpretation) — never in the validator. Pure + unit-testable; no new LLM cost.

### B. Mobile-first hierarchy (§8)
Render order: (1) headline conclusion visible on first screen; (2) 2-3 key points; (3)
"자세히 보기" expands the per-학문 detail (collapsed by default); (4) follow-ups. Use
collapse/expand for long evidence, not smaller fonts. The existing `StructuredConsultationResult`
component is the mount point.

### C. Follow-up UI wiring (§9)
Schema now yields exactly 3 follow-ups (in the same OpenAI call — ZERO extra cost). Render them
as tappable chips (the `FollowUpSuggestions` component from Sprint 3A-B); a tap submits that
text as the next question. Verify the chip → submitQuestion wiring end-to-end.

### D. Consultation report UX (§10) + sharing (§11)
- **Deterministic first:** build the report from the stored structured consultation + history
  with NO extra LLM call — `{ 주제, 핵심 결론, 주요 포인트, 중요한 시기, 조언, 생성일 }`. Only if a
  narrative summary is required, add ONE gated LLM call (report cost, owner decision) — never
  auto-generate per Q&A.
- **Mailbox:** add a "보고서" category to 우편함; on generate show "상담 내용을 보고서로 정리해
  우편함에 넣어두었습니다" + CTA [보고서 확인하기]/[우편함으로 이동].
- **Sharing (auth-required, NO public page):** share link → 덕분AI → login → authorization
  check → report view. A report row is owner-scoped (RLS `user_id = auth.uid()`); a shared
  view needs an explicit grant table (never unguessable-id public access). Acquisition events
  (`report_shared`/`share_channel`/`share_opened`/`share_signup`) reuse the existing ad-track seam.

### E. Summary-call decision (§14)
FINDING: the summary LLM call fires (~every 28 turns) and its result is STORED to
`conversations.summary`, but the production consultation prompt hardcodes `conversationSummary:
null`, so the summary is not consumed by the answer. It is **stored, not discarded** → not pure
waste. DECISION for the owner (do NOT blind-remove — §14 caution): either (a) wire the stored
summary back into the prompt as history compression (replaces re-sending raw recent turns —
saves input tokens, the §14-preferred path), or (b) disable the summary loop until (a) is built.
Recommend (a). Requires a memory-architecture review + tests before changing.

### F. Per-complexity numeric length (§4 refinement)
Thread the already-computed `complexity` into the request → buildServerConsultation → the prompt
(same pattern as the timing `question` thread) and add per-complexity length guidance. Kept
above the substance gate (coreInterpretation ≥120 chars). Small, safe follow-up.

---

## Quality regression fixtures (§15) status
Router classification for all five directive questions is locked in tests
(`questionComplexity.test.ts`); the timing fix is locked in `rejectionRepro.test.ts` (2027
ACCEPTED, 2035 rejected); the commercial rules in `commercialInstruction.test.ts`. The one
**live-untestable** property is the model's actual answer quality/length at `low` effort under
the new prompt — validate on live traffic (the `[chat.route]` log + new telemetry make it
observable), revert instantly via `LLM_CONSULTATION_REASONING_EFFORT` if needed.
