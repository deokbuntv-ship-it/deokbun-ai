# DeokbunAI — Golden Flow V4 · Final UX + Developer Handoff

> **Method.** This is an *improvement* of the approved V3 system, not a redesign. The audit
> below is grounded in the **actually-implemented** V3 code (Sprint 3A/3A-B), not a
> hypothetical. Product philosophy, IA, and the fail-closed contracts are **frozen**; V4
> changes only where a real defect is identified. No new visual identity. No code in this
> pass — this is the spec + Claude-Code-ready handoff.
>
> **Design source of truth for components:** `src/features/intelligence/components/**`,
> `src/features/intelligence/presentation/**`, `src/app/chat.tsx`, `src/app/(tabs)/index.tsx`.
> **Frozen boundaries (§28):** UI never decides engine activation, never invents
> assessment/confidence semantics, never fabricates backend data.

---

## A. V3 → V4 UX AUDIT (evidence-grounded)

**Key finding up front:** V3 built a complete, correct, fail-closed *presentation layer*
(`StructuredConsultationResult`, `InterpretationEvidenceSheet`, `AssessmentSummary`/`Tile`,
`AssessmentDetailSheet`, `ConfidenceIndicator`, `ConsultationStateNotice`,
`FollowUpSuggestions`, `MemoryConfirmation`) — but **none of it is mounted in the live
consumer chat.** `src/app/chat.tsx` renders plain-text bubbles (`ChatMessage = {id, role,
text}`) and `scrollToEnd()` on every answer. So the approved V3 experience exists as parts on
the shelf; V4's core job is to **assemble and wire them behind one backend contract**, and fix
the two live behaviors that contradict the approved spec (scroll, answer-first). This is not a
new-product problem — it is an integration + two-defect problem.

Format per finding: **Problem → Why it matters → V4 correction → User impact → Implementation impact.**

### P0 — blocks consultation / loses user intent

**P0-1 · The structured first result is not rendered in the live chat.**
- Problem: assistant answers are plain text (`chat.tsx` `messages.map` → text bubble). The
  approved answer-first IA (§3: core conclusion → disposition → assessment → current flow →
  core interpretation → explainability → 더 자세히 보기) never appears.
- Why: this *is* the product's differentiation (§30). Without it the app reads as "AI chatbot
  wrapper" — exactly the forbidden feeling (§0).
- V4 correction: add an optional `structuredResult` payload to the assistant message contract;
  when present, the chat renders `<StructuredConsultationResult>` instead of a text bubble;
  when absent, it renders text (fail-closed, backward-compatible). No component redesign — the
  component already exists and is gate-green.
- User impact: the first answer becomes the approved comprehensive result, not a wall of text.
- Implementation impact: **backend contract required** — `ChatMessage.structuredResult?:
  StructuredConsultationViewModel`-shaped data from the chat edge; Claude Code wires rendering.

**P0-2 · Scroll throws the user to the absolute bottom on every answer (violates §9).**
- Problem: `chat.tsx:220/261/291` call `scrollToEnd({animated})`, and
  `onContentSizeChange → scrollToEnd({animated:false})`. A long structured answer opens at its
  *end*.
- Why: §9 is an explicit approved rule — a long answer must open at its **first line** so the
  user reads top-down. Opening at the bottom is disorienting and buries the core conclusion.
- V4 correction: on a *new assistant answer*, scroll to the **top offset of that message's
  container**, not the list end. Keep bottom-follow only while the *user's own* message is
  being sent. (Full spec in §G.)
- User impact: "긴 답변인데도 읽기 어렵지 않다" (§30.6).
- Implementation impact: **Claude Code can implement immediately** — measure the new message's
  `y` via `onLayout`, `scrollTo({y})`. No backend needed.

**P0-3 · Consultation dead-ends as "report finished" — no conversational continuation (§7).**
- Problem: `FollowUpSuggestions` exists but is unmounted; the live chat has only the free
  composer. After a rich answer there are no contextual next-question affordances.
- Why: the product promise is "다시 질문하게 되는 상담" (§0/§7). Ending on a static block breaks
  the loop and the retention design (§20).
- V4 correction: render `FollowUpSuggestions` (chips) beneath a structured answer, sourced from
  a backend `followUps` list; chips *prefill/send* a question but the free composer always
  stays. Never a nav menu (§7).
- User impact: "다음에 뭘 물어볼지 자연스럽다" (§30.4).
- Implementation impact: **backend provides `followUps: string[]`** (optional); Claude Code
  wires the existing component. Fail-closed: no list → no chips, composer unaffected.

### P1 — materially harms comprehension / trust

**P1-1 · Assessment tiles can't show the "한 줄 설명" the design mandates (§18 contract gap).**
- Problem: `AssessmentItem` has axis/level/direction/timing but **no user-facing `summary`
  sentence**. §18 requires `[재물] 기회 확대 · "수입을 늘릴 기회는 있지만…"` — the sentence has no
  source, so the tile can only show keyword+direction.
- Why: the sentence is what makes assessment *understandable without studying* (§0/§4).
- V4 correction: keep the tile fail-closed today (keyword+direction only); when the contract
  gains an optional `summary`, the tile renders it. UI must **never fabricate** the sentence.
- User impact: assessment reads as advice, not a label.
- Implementation impact: **backend/Codex contract** — add optional `AssessmentItem.summary`
  (or source it from the LLM result). Documented in `CODEX_HANDOFF §24/§25`.

**P1-2 · Answer-first layering (§4) isn't enforced in the live text answer.**
- Problem: a plain LLM paragraph mixes answer + interpretation + (sometimes) mechanics.
- Why: the user must get "무슨 말인지" before "왜" and before "무슨 근거" (§4). A single blob
  forces them to read everything to find the point.
- V4 correction: the structured result’s Layer 1 (one-sentence core conclusion) + Layer 2
  (core interpretation, expandable) + Layer 3 (Explainability sheet) enforce the layering
  structurally. Requires the backend to return the answer *segmented* (core / interpretation /
  detail), or Claude Code renders whatever segments exist and collapses the rest.
- User impact: "무슨 말인지 알겠다" in the first second (§30.1).
- Implementation impact: backend segments the response (core/interpretation/detail); fail-closed
  to a single readable block if only prose is available.

**P1-3 · Explainability entry ("왜 이렇게 해석했나요?") is unreachable in the live flow.**
- Problem: `InterpretationEvidenceSheet` exists (only-used-engines, 근거 일치도 hidden when
  absent) but isn't opened from any live answer.
- Why: §4/§5/§30.2 — the user must be *able* to ask "왜?" without it overwhelming the default.
- V4 correction: a quiet inline "왜 이렇게 해석했나요?" affordance under the core interpretation
  opens the existing bottom sheet, fed by the answer's `grounding`.
- User impact: "왜 그런 해석인지 궁금하면 확인할 수 있다" (§30.2).
- Implementation impact: **backend provides `grounding`** on the structured result; Claude Code
  wires the trigger + sheet. Fail-closed: unavailable → honest "근거를 아직 보여드리지 못해요".

### P2 — polish / efficiency

- **P2-1 · Home example breadth (§13).** Live home has good prompts (재물운/이직/변화) but is
  missing the "왜 꼬이는지" diagnostic tone and 관계/연애 + decision prompts. → Broaden the sample
  set to demonstrate breadth (§13 list). Claude Code immediate; copy-only.
- **P2-2 · Memory confirmation unmounted (§12).** `MemoryConfirmation` exists but isn't
  triggered; important life info isn't confirmed before reuse. → Render on a backend
  `memoryCandidate` with 맞아요/이번엔 제외 controls. Backend flag required.
- **P2-3 · User feedback control (§ trust).** `UserFeedbackControl` is honest-seam only
  (`canPersist:false`). Keep hidden or as an honest seam until a write path exists — do not
  show a fake "저장됨". No change needed; documented.
- **P2-4 · Loading copy (§10).** Live loading has *no* fake engine stages (good). V4 sets one
  honest calm line ("덕분AI가 지금 질문과 흐름을 함께 살펴보고 있어요") + optional rotating subtitle
  that never claims engine progress. Claude Code immediate; copy + one component.

### P3 — optional enhancement

- **P3-1 · Timing/monthly deepening cues (§8).** When a backend answer carries a
  `timingContext`, a subtle "월별로 볼래" chip can appear — but never a "분석 레벨" selector (§8).
  Backend-gated.
- **P3-2 · Retention surfaces (§20).** 운세우편함 / turning-point notifications — architectural
  room only; not designed here.

**Audit stance:** every P0 is an *integration/wiring* item behind one contract, plus one
pure-frontend defect (scroll). Nothing in V3's philosophy or IA needs overturning (§25/§31).

---

## B. FINAL GOLDEN FLOW V4 MAP

```
HOME ──(tap example / type)──▶ CONSULTATION ENTRY
                                    │  question captured (survives everything below)
                                    ▼
                         SUBJECT SELECTION  (only when needed)
                                    ▼
                         BIRTH INFO  (only when needed · 정확/대략/몰라요)
                                    ▼
             AUTH INTERRUPTION  (only when needed · question+subject+birth preserved)
                                    ▼
             RETURN TO EXACT CONSULTATION INTENT  (never generic Home)
                                    ▼
                    LOADING  (one honest state, no fake stages)
                                    ▼
        FIRST COMPREHENSIVE RESULT  (answer-first structured, §3)
              │  core → disposition → assessment → current flow → interpretation
              │  → "왜 이렇게 해석했나요?"  → 더 자세히 보기
              ▼
        PROGRESSIVE DEEPENING  (emerges from conversation, not a level picker)
              │  L1 종합 → L2 영역 → L3 연도 → L4 월별 → L5 의사결정
              ▼
        FOLLOW-UP CONVERSATION  (chips = suggestions, free composer always present)
              │  "재물운은?" · "2027년은?" · "월별로 볼래" · "확장해도 될까?"
              ▼
        DYNAMIC QIMEN  (ONLY when backend activates it → 활용된 관점 shows 기문둔갑)
              ▼
        MEMORY / CONTINUITY  (confirm before reuse · 맞아요 / 제외)
              ▼
        FUTURE REVISIT  (운세우편함 / turning points — architectural room only)
```

**Frozen invariant:** auth is a *temporary interruption*. The typed question, selected subject,
and birth context survive it (already implemented: `pendingConsultationIntent`, Sprint 2A).

---

## C. SCREEN INVENTORY

| # | Screen | Live today? | V4 status |
|---|---|---|---|
| S1 | Home (consultation entry + examples) | ✅ | refine copy breadth (P2-1) |
| S2 | Subject selection | ✅ | frozen |
| S3 | Birth info (정확/대략/몰라요) | ✅ | frozen; keep graceful "몰라요" |
| S4 | Login interruption | ✅ | frozen (resume works) |
| S5 | OAuth callback/return | ✅ | minimal reassuring copy (§21) |
| S6 | Chat — loading | ✅ | one honest state (P2-4) |
| S7 | Chat — **first structured result** | ⛔ text only | **mount `StructuredConsultationResult`** (P0-1) |
| S8 | Chat — follow-up answer (deeper) | ⛔ text only | same component, deeper payload |
| S9 | Explainability bottom sheet | built, unmounted | **wire trigger** (P1-3) |
| S10 | Assessment detail sheet | built, unmounted | wire from tile tap |
| S11 | Memory confirmation | built, unmounted | wire on backend candidate (P2-2) |
| S12 | Error/degraded states | partial (inline card) | complete the §23 set (§H) |

---

## D. FIRST RESULT — FINAL IA + MOBILE SCREEN SPEC (375–430px)

The single most important screen (§3). Default-visible hierarchy, top → bottom:

```
┌────────────────────────────── 390px ──────────────────────────────┐
│  ← 뒤로            AI 상담                                          │  AppHeader (existing)
├────────────────────────────────────────────────────────────────────┤
│  (user bubble)                          "올해 사업 흐름 어때?"       │  right-aligned
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │  ← NEW ANSWER starts here
│  │  올해는 크게 벌이기보다 기반을 다질 때예요.                    │  │  1 · CORE CONCLUSION
│  │                                                    (bodyLarge/700)│  │    (scroll anchors to this top)
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  기본 성향 · 지금의 맥락                                        │  │  2 · DISPOSITION / CONTEXT
│  │  추진력은 강하지만 지금은 확장보다 정비가 어울리는 흐름.       │  │    (bodyMedium, textSecondary)
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  종합 평가                                                     │  │  3 · ASSESSMENT (compact tiles)
│  │  ┌───────────────┐  ┌───────────────┐                          │  │    2-col grid, categorical
│  │  │ 일·사업        │  │ 재물          │                          │  │    [domain][keyword/dir][1-line]
│  │  │ 정비 후 확장 → │  │ 기회 확대 ↑   │                          │  │    NO score / gauge (§18)
│  │  │ 기반부터 정리  │  │ 지출도 함께   │                          │  │
│  │  └───────────────┘  └───────────────┘                          │  │
│  │  ┌───────────────┐  ┌───────────────┐                          │  │
│  │  │ 관계          │  │ 변화          │                          │  │
│  │  │ 유지 →        │  │ 하반기 상승 ↑ │                          │  │
│  │  └───────────────┘  └───────────────┘                          │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  현재 흐름                                                     │  │  4 · CURRENT FLOW
│  │  지금은 새 판을 벌이기보다 …                                   │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  핵심 해석                                                     │  │  5 · CORE INTERPRETATION
│  │  명리와 자미두수가 함께 가리키는 건 … (conversational prose)   │  │    readable, short paragraphs
│  │                                                                │  │
│  │  왜 이렇게 해석했나요?  ›                                       │  │  6 · EXPLAINABILITY ENTRY (quiet)
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                    더 자세히 보기  ▾                           │  │  7 · PROGRESSIVE DISCLOSURE CTA
│  └──────────────────────────────────────────────────────────────┘  │    (강점/주의점/영역별/앞으로의 흐름)
│                                                                      │
│  이어서 물어볼 수 있어요                                            │  FOLLOW-UPS (chips, horizontal)
│  [ 재물운은? ] [ 2027년은? ] [ 월별로 볼래 ]                        │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│  [  메시지 입력…                                   ]  [ ↑ ]         │  STABLE bottom composer
└────────────────────────────────────────────────────────────────────┘
```

Notes: everything above maps 1:1 to `StructuredConsultationViewModel`
(`coreSummary`/`disposition`/`assessment`/`currentFlow`/`coreInterpretation`/`grounding`/
`strengths`/`cautions`/`domainInterpretation`/`futureFlow`/`followUps`). Sections with no
data are omitted (fail-closed) — never a placeholder.

---

## E. CRITICAL STATE VARIANTS (§23 — all 17)

1. **Normal comprehensive result** — the S7 layout above.
2. **Deeper follow-up result** — same component; lighter (may omit disposition/assessment when
   the question is narrow, e.g. a single-year answer → core + interpretation + timing chips).
3. **Qimen-active decision answer** — identical layout; the *only* visible difference is the
   Explainability sheet's 활용된 관점 now lists 명리·자미두수·**기문둔갑**. No new tab/badge (§6/§24).
4. **Confidence present** — `ConfidenceIndicator` chip renders "근거 일치도 · 높음/보통". Never
   "AI confidence", never a %.
5. **Confidence absent** — the entire confidence area is **removed** (not "N/A"/"0%") (§F/§11-F).
6. **Engine disagreement** — `ConsultationStateNotice state="engine_conflict"`: "관점에 따라
   해석이 조금 다르게 나타납니다." then present common ground first (§11-A). Never "ERROR".
7. **Partial engine completion** — quiet "확인된 관점까지 정리했어요." Keep the answer (§11-B).
8. **Analysis failure** — concise reason + 다시 시도, question preserved (§11-C).
9. **Network failure** — "다시 시도"; typed question never lost (§11-D).
10. **Birth time unknown** — grouped guidance card ("출생시간이 없으면 일부 해석 범위가 달라질 수
    있어요"), never a fabricated hour (§11-E/§14).
11. **Auth interruption** — see §L; before-state preserves the question visibly.
12. **Auth resume** — returns to the exact consultation intent (never generic Home).
13. **Memory confirmation** — see §K.
14. **Long-answer scroll** — opens at the answer's first line (§G).
15. **Mobile keyboard open** — composer sticks above the keyboard; last answer stays readable
    (keyboard-safe layout, §16).
16. **Empty/new consultation** — Home examples + composer; no mandatory questionnaire (§24).
17. **Returning consultation** — prior thread hydrated; optional memory cue at top (§12/§20).

---

## F. INTERACTION NOTES

- **Progressive disclosure** is *within* an answer (더 자세히 보기 expands strengths/cautions/
  domain/future). The user never picks an "analysis level" (§8).
- **Follow-up chips** prefill+send; the free composer is always available and is the primary
  path (§7). Chips are horizontally scrollable, thumb-height (≥44px).
- **Explainability** is a bottom sheet (thumb-friendly), opened from a quiet inline link — not a
  persistent panel (§5/§16).
- **Assessment tile tap** opens the consumer `AssessmentDetailSheet` (fields only, no raw ids).
- **Engine activation is invisible to the user** except through 활용된 관점 (§6).

---

## G. SCROLL BEHAVIOR SPECIFICATION (fixes P0-2)

**Rule (§9):** when a *new assistant answer* is appended, scroll so the **top of that answer's
container** aligns near the top of the viewport (a small `TOP_GAP`, e.g. 12–16px), so the user
reads from its first line. Do **not** `scrollToEnd`.

- While the **user** sends their own message → follow to bottom (their bubble should be visible)
  — that's expected and desired.
- When the **assistant** answer arrives → capture the new message container's `y` (via
  `onLayout` on the message wrapper) and `scrollView.scrollTo({ y: y - TOP_GAP, animated: true })`.
- Remove the unconditional `onContentSizeChange → scrollToEnd`. Content growth during streaming
  must **not** yank the viewport; keep the reading position stable.
- Edge: if the new answer is shorter than the viewport, top-align anyway (never bottom-align).
- Test hooks (frontend, no backend): assert the target offset equals the message top minus
  `TOP_GAP`, and that a long answer's computed offset is its *start*, not the list end.

---

## H. LOADING / ERROR SPECIFICATION

**Loading (§10):** one honest state. Primary copy: *"덕분AI가 지금 질문과 흐름을 함께 살펴보고
있어요."* Optional secondary line may rotate (calm, non-progress: "필요한 관점을 함께 살펴보는 중…")
but must **never** name engines or show %/stages. Calm, premium, alive — no particles/casino/
progress bar. Single reusable `<ConsultationLoading/>`.

**Errors/degraded (§11)** — all via `ConsultationStateNotice` (built) with truthful copy; retry
reuses the existing chat retry (Sprint 2A/2B). Each preserves the typed question:

| State | Copy stance | Retry? |
|---|---|---|
| engine_conflict | "관점에 따라 해석이 조금 다르게 나타납니다." + common ground first | no |
| partial_analysis | "확인된 관점까지 정리했어요." keep the answer | no |
| analysis_failure | concise reason | **yes** |
| network_error | "연결이 불안정해요." | **yes** |
| birth_time_unknown | "출생시간이 없으면 일부 해석 범위가 달라질 수 있어요." | no |
| confidence_unavailable | *hide the confidence area entirely* (not shown as an error) | — |
| engine_disconnected | "아직 계산 근거가 연결되지 않았어요." (fail-closed default) | no |

Never "ERROR", never "N/A"/"0%"/"분석 불가" for missing confidence.

---

## I. EXPLAINABILITY SHEET SPECIFICATION (§5)

Component: `InterpretationEvidenceSheet` (built). Trigger: quiet "왜 이렇게 해석했나요?" under
core interpretation. Structure:

- **A · 활용된 관점** — only engines the backend actually used (`grounding.evidence[*]
  availability === 'available'`). Never all three by default; Qimen appears *only* when active.
- **B · 종합하면** — a short plain-language synthesis (from `grounding` summaries). No mechanics.
- **C · 근거 일치도** — rendered **only** when the backend provides an agreement value; else the
  whole section is absent (fail-closed §F). Semantic words (일치/보완/상충), never a %/score.
- **D · 분석 범위** — availability language: 출생시간 포함/미상, 현재 시점 포함, 특정 의사결정 시점
  분석 포함 — from the per-engine availability states.
- **Never** raw JSON / prompt / chain-of-thought / debug (§5).

---

## J. ASSESSMENT COMPONENT SPECIFICATION (§18)

Component: `AssessmentSummary` + `AssessmentTile` (built, fail-closed). Compact semantic tiles,
2-col on mobile. Recommended domains: 일·사업 · 재물 · 관계 · 변화.

- Tile = `[domain] · [keyword/direction + arrow] · [one-line explanation]`.
- **NO** score / gauge / ★ / ranking / 점 (locked by tests: `insufficient≠낮음`, no numeric).
- Only *committal evaluative* levels produce a tile; non-committal → the tile is omitted, and if
  nothing is evaluative the summary shows the honest "아직 평가를 보여드리지 않아요" state.
- The one-line explanation needs `AssessmentItem.summary` (P1-1 contract gap). Until then: show
  keyword+direction+timing only; **never fabricate** the sentence.
- Direction arrows (↑→↓↕) are decoration for the categorical direction, not data.

---

## K. MEMORY CONFIRMATION SPECIFICATION (§12)

Component: `MemoryConfirmation` (built). Shown **only** on a backend `memoryCandidate` (never
inferred by the UI). Copy: "지난번에 말씀하신 [사업 확장 계획]을 기준으로 볼까요?" with **맞아요 /
이번에는 제외할게요**. Never imply the AI stored something it didn't; never silently convert an
uncertain statement into a permanent fact. Decline → the current consultation proceeds without
that memory; the choice is passed back to the backend (no client-side "memory" store).

---

## L. AUTH INTERRUPTION / RESUME SPECIFICATION (§21)

Already implemented (Sprint 2A `pendingConsultationIntent`); V4 keeps it and specifies the
*feel*:

- **Before login:** the interruption surface shows the *pending question* ("2027년에 사업 확장해도
  될까?") so login feels like a pause, not a reset. Subject + birth context are already held.
- **Login:** minimal, reassuring OAuth callback screen ("로그인 처리 중입니다…") — **no** OAuth /
  token / provider jargon in consumer UI. (See the separate OAuth redirect hardening —
  `authRedirect.ts` — production returns to `www.deokbunai.com/login-callback`.)
- **After login:** resume to the exact `/chat` intent with the question restored (never
  auto-sent; never generic Home). returnTo is allowlist-validated (no open redirect).

---

## M. RESPONSIVE BEHAVIOR (§16)

- Design target **375–430px**; one-hand operation; stable bottom composer; keyboard-safe.
- Assessment tiles: 2-col ≤430px, may go 3–4-col on tablet/desktop but **never** a dense table
  on consumer screens.
- Bottom sheets (Explainability/Assessment detail) are thumb-reachable, max-height ~85vh,
  internal scroll.
- No horizontal page scroll ever; only intentional horizontal scrollers (follow-up chips,
  admin-only wide tables) with their own `overflow-x`.
- Desktop **adapts from** mobile — it does not define the experience (§16/§22).

---

## N. ACCESSIBILITY

- Touch targets ≥44×44 (chips, sheet handles, composer send).
- Korean line-height comfortable (≈1.6), short paragraphs, strong hierarchy, restrained bold
  (§17) — readable for minutes without fatigue.
- Color never the sole signal (assessment direction pairs arrow + word; state notices pair a
  dot + text). Meets the theme's light/dark tokens.
- Sheets/modals trap focus, restore focus on close, closable by scrim + explicit control.
- Screen-reader labels on chips ("후속 질문: …"), the explainability trigger, and assessment
  tiles (domain + level read together).
- Respect font scaling; the structured result must reflow, not clip.

---

## O. DEVELOPER HANDOFF (per-component, §27 format)

> Format: **UI · Required · Optional · Loading · Empty · Error · Interaction · Backend dep ·
> Fail-closed.** All components already exist unless marked (NEW).

**StructuredConsultationResult** (built)
- UI: the answer-first first result (§3). · Required: `assessment` (ConsumerAssessmentView),
  `grounding`. · Optional: `coreSummary`, `disposition`, `currentFlow`, `coreInterpretation`,
  `strengths`, `cautions`, `domainInterpretation`, `futureFlow`, `followUps`, `state`. ·
  Loading: parent shows `<ConsultationLoading/>`. · Empty: sections with no data are omitted. ·
  Error: `state` → `ConsultationStateNotice`. · Interaction: 더 자세히 보기 expands; chips send;
  explainability trigger opens sheet. · Backend dep: the whole VM comes from the chat edge’s
  structured result. · Fail-closed: no VM → render plain text (P0-1 backward-compat).

**ChatMessage rendering** (chat.tsx — MODIFY)
- UI: user bubble vs assistant answer. · Required: `text`. · Optional (NEW):
  `structuredResult`. · Interaction: if `structuredResult` present → `StructuredConsultationResult`,
  else text bubble. · Backend dep: **`ChatMessage.structuredResult?`** added to the contract +
  populated by the edge. · Fail-closed: absent → text (today's behavior, unbroken).

**InterpretationEvidenceSheet** (built) — as §I. Required: `grounding`. Optional: agreement,
scope. Fail-closed: no agreement → omit 근거 일치도; unavailable grounding → honest copy.

**AssessmentSummary / AssessmentTile** (built) — as §J. Required: `ConsumerAssessmentView`.
Optional: `AssessmentItem.summary` (P1-1). Fail-closed: non-evaluative → tile omitted; nothing
evaluative → honest unavailable state; never a score.

**ConfidenceIndicator** (built) — Required: a categorical agreement label. Empty/absent →
render nothing (§F). Never %, never "AI confidence".

**ConsultationStateNotice** (built) — Required: `state` enum. Interaction: retry for
failure/network. Fail-closed: unknown → engine_disconnected copy.

**FollowUpSuggestions** (built) — Required: `suggestions: string[]`, `onSelect`. Empty → render
nothing; composer unaffected. Backend dep: `followUps`. Never a nav menu.

**MemoryConfirmation** (built) — as §K. Required: `itemLabel`, `onConfirm`, `onDismiss`.
Backend dep: `memoryCandidate`. Fail-closed: no candidate → not shown.

**ConsultationLoading** (NEW, trivial) — one honest state (§H). No data. No fake stages.

---

## §31 — REQUIRED FINAL LISTS

### 1. What stayed FROZEN from V3
- Hybrid consultation (structured + conversational). · Progressive deepening. · Dynamic engine
  activation (UI never decides; Qimen only when backend activates). · Answer-first / progressive
  disclosure IA. · Fail-closed everything (no fabricated scores/confidence/engines/stages). ·
  Categorical assessment (no numbers/gauges). · 근거 일치도 terminology (hidden when absent). ·
  One honest loading state (already true — no fake engine %). · Auth-as-interruption with
  question/subject/birth preservation (`pendingConsultationIntent`). · Premium modern-Korean
  visual direction + `@/theme` tokens. · All built components + their fail-closed contracts.

### 2. What CHANGED in V4
- **Mount** the structured first result in the live chat (P0-1). · **Scroll to the start of a
  new answer**, not the bottom (P0-2). · **Follow-up chips** after answers, composer always
  present (P0-3). · **Explainability trigger** wired into live answers (P1-3). · **Answer-first
  segmentation** enforced structurally (P1-2). · Assessment tile ready for a one-line `summary`
  (P1-1). · One honest **ConsultationLoading** component (P2-4). · Broader **home examples**
  (P2-1). · **Memory confirmation** wired on a backend candidate (P2-2). · Complete the
  degraded-state set (§H).

### 3. Why each material change was necessary
- P0-1: without the structured result the app is a chatbot wrapper — it fails §30's core
  acceptance ("무슨 말인지 알겠다"). · P0-2: scroll-to-bottom violates the explicit §9 rule and
  buries the conclusion. · P0-3: dead-ending as "report finished" breaks the "다시 질문하게 되는
  상담" promise and the retention loop. · P1-x: answer-first + explainability + the assessment
  sentence are what let a user understand *without studying* (§0/§4). · P2/P3: polish that
  raises trust and readability.

### 4. Changes that REQUIRE backend data / contracts (Codex-owned)
- `ChatMessage.structuredResult?` payload from the chat edge (shape ≈
  `StructuredConsultationViewModel`: core/disposition/assessment/currentFlow/interpretation/
  grounding/strengths/cautions/domain/future/followUps/state). · `AssessmentItem.summary`
  (one-line explanation, §18). · `grounding` (used engines + synthesis + optional agreement +
  scope) per answer. · `followUps: string[]` per answer. · `memoryCandidate` flag. · optional
  `timingContext` for deepening cues. *(All already flagged in `CODEX_HANDOFF §23/§24/§25` +
  `CONSULTATION_INTELLIGENCE_UI.md`.)*

### 5. Changes Claude Code can implement IMMEDIATELY (no backend)
- **Scroll-to-start-of-answer** (P0-2) — pure frontend, testable. · **ConsultationLoading**
  copy/component (P2-4). · **Home example breadth** (P2-1) — copy. · The **rendering switch**
  (`structuredResult ? StructuredConsultationResult : text`) can be added now, fail-closed to
  text until the backend populates it — mounting the pipeline safely ahead of data. · Wire the
  **Explainability/Assessment-detail/Memory** components to *open* from a structured answer (they
  render fail-closed states until real data arrives).

### 6. Remaining UX RISKS before production
- **Data readiness:** all P0/P1 comprehension wins depend on the backend emitting the structured
  result; until then the live app stays a text chat (functional, but not the differentiated
  experience). Sequence: land the contract, then wire. · **Answer segmentation quality:** if the
  LLM returns one blob, Layer-1/2 separation degrades to a single block — acceptable fail-closed,
  but the core-conclusion win needs the model to actually produce a one-sentence core. ·
  **Assessment sentence:** without `AssessmentItem.summary`, tiles read as labels, not advice —
  the smallest contract add with the biggest comprehension payoff. · **Scroll tuning:** the
  top-gap and streaming-growth behavior need real-device QA (keyboard + long Korean answers). ·
  **Qimen restraint:** ensure no surface ever shows 기문둔갑 unless `grounding` marks it used —
  regression-guard it. · **Mock discipline (§29):** any prototype must keep mock values visibly
  identifiable and must not depend on a field absent from the production contract.
```

Acceptance (§30) is met when the structured result + scroll + follow-ups + explainability are
wired behind the one contract above; the components and fail-closed guarantees already exist.
```
