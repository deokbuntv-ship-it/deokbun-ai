# Codex Review — Myungri FULL PIPELINE (engine → live consultation)

> One-pass independent review handoff: frozen engine → EngineEvidence → Grounding → Prompt → LLM →
> structured consultation → live chat → follow-up. **Status: `READY_FOR_CODEX_FULL_PIPELINE_REVIEW`**
> (not APPROVED_FREEZE / PRODUCTION_READY / FULLY_VERIFIED). Local commits only; no push/deploy/DB.

## Production chain (complete)

```
draft.birthInfo
 → toSajuEngineInput (manse)                         [reuse]
 → executeSajuFromBirthInput (FROZEN 7c7ed82)        [frozen producer]
 → SajuEngineResult + Myungri facts
 → toSajuEvidence (myungri/adapters — CONVERTER)     [facts only]
 → buildConsultationGrounding (chat/services)        [fail-closed; ziwei/qimen not-connected]
 → chatService (grounding builder injected)
 → promptBuilder.renderGroundingContext + STRUCTURED_OUTPUT_INSTRUCTION
 → supabaseEdgeLLMAdapter → edge `chat` (OpenAI key server-side)   [OWNER_ACTION for live]
 → parseStructuredConsultation (validate) → buildStructuredConsultationResult
 → ChatServiceResult.structuredResult → chat.tsx assistant message
 → <StructuredConsultationResult> (long-form EXPANDED)  +  contextual followUps
 → onSelectFollowUp → submitQuestion (same conversation, subject/grounding preserved)
```

## Review checklist (Codex)

1. **Frozen engine untouched** — `git diff 7c7ed82 -- src/features/interpretation` limited to prior
   accepted commits; this sprint changed **no** `interpretation/**` file. ✅
2. No calendar/theory reinvention — none. ✅
3. Saju evidence correctness — `toSajuEvidence` reads frozen facts only (4주/십신/지장간/오행/관계/대운/
   대운십신/세운/월운/통근투간/월령득령); no calc.
4. Provenance survival — evidence `detail` carries `START_OF_SPRING_IPCHUN` / `TWELVE_JIE_JIEQI` +
   ruleVersions; `grounding.engineVersion` set.
5. Fail-closed — unsupported/ambiguous/unknown-time-on-boundary/missing → grounding `unavailable`.
6. Assessment honesty — `toConsumerAssessmentView([])` → not-connected (no fabricated 15-axis score).
7. Cross-Analysis honesty — SAJU-only; ziwei/qimen `engine_not_connected`; no "3-학문 일치".
8. Grounding correctness — `renderGroundingContext` emits the facts + "interpret only within these".
9. Prompt factual isolation — SYSTEM_CONSTITUTION: LLM interprets, never calculates; §80 sanitization.
10. LLM does not recalculate — prompt forbids it; grounding is the only authoritative calc source.
11. No unsupported Myungri theory — instruction bans 신강/신약/용신/격국/12운성/12신살 as computed facts.
12. Structured schema — `structuredConsultation.ts` reuses the view-model field names.
13. Parser/validator — `parseStructuredConsultation`: typed, substance-gated, null on malformed.
14. Malformed-output fallback — null → `responseText` plain text; no crash (tested).
15. Long-form contract — instruction demands substantial 핵심 해석 + 강점/주의점/영역별; render EXPANDED.
16. chatService structuredResult population — `ChatServiceResult.structuredResult` actually set + assigned in `chat.tsx`.
17. Golden Flow V4 rendering — `chat.tsx:428` switch already present; now driven by real data.
18. Follow-up loop — `followUps` → `onSelectFollowUp` → `submitQuestion` (existing wiring).
19. Conversation continuity — history is context, not engine truth (SYSTEM_CONSTITUTION reinforces).
20. Timing behavior — 대운/세운/월운 in grounding; instruction gates timing on evidence; Qimen not claimed.
21. Solar/Lunar equivalence — identical grounding evidence (tested: `consultationGrounding.test.ts`,
    `structuredConsultationPipeline.test.ts`).
22. Unsupported/ambiguous states — grounding `unavailable`, structuredResult grounding reflects it.
23. No fake Ziwei/Qimen — `engine_not_connected`; `ENGINE_CONNECTED={saju:true,ziwei:false,qimen:false}`.
24. Secrets/security — no API key in client; key is edge-side; no secret committed; injection boundary intact.
25. Regression — 45 suites / 470 tests PASS (frozen Myungri/boundary/ADOPT/Ziwei/Qimen/auth/V4/scroll).
26. Production readiness — code complete; **live LLM = OWNER_ACTION** (deploy edge + `OPENAI_API_KEY`).

## OWNER_ACTION_REQUIRED

Live LLM answers require (nothing else blocks the pipeline):
1. Deploy the Supabase Edge Function `chat`.
2. Set the edge secret **`OPENAI_API_KEY`** (server-side; never in the app bundle).
3. A logged-in user (login gate already enforced before any paid call).

## Owner manual test plan (non-developer)

1. **Run:** `npm run web`  → open the printed URL (e.g. `http://localhost:8081`).
2. **Login:** required before the AI answers (Naver/Google). If not logged in, the app preserves the
   question and asks you to log in first — that is expected.
3. **Birth info:** on the consultation start, enter a subject's 생년월일 (양력 or 음력) + 성별 (+ 시간 if known).
   Example: 양력 **2024-01-03**, 남성, 시간 12:00.
4. **Ask:** e.g. "제 성격과 타고난 강점은 무엇인가요?" → send.
5. **Expected (with the edge + key configured):** an answer-first card — 한 줄 핵심 → 기본 성향 →
   핵심 해석(길게, 펼쳐진 상태) → 강점/주의점/영역별 해석 → "왜 이렇게 해석했나요?"(펼치면 명리 근거:
   년 癸卯·월 甲子·일 丙寅 …) → 후속 질문 칩.
6. **Long-form check:** the 핵심 해석·강점·주의점·영역별 해석 must be **fully shown (not hidden)** behind
   "더 보기"; only the evidence/methodology is collapsible.
7. **Follow-up check:** tap a suggested 후속 질문 chip → it asks in the SAME conversation and produces a
   new grounded answer; the free text box is always available too.
8. **Failure signs (report these):** a fabricated 신강/용신/격국; a claim that 자미두수/기문둔갑 were used;
   a specific date with no basis; an app crash; a raw JSON blob shown instead of a formatted card.
9. **If no answer appears:** the LLM edge/key is likely not configured — see OWNER_ACTION_REQUIRED.

## NOT started (per directive — Codex reviews next; do not infer these are done)

Ziwei→grounding (Sprint 2) · Qimen→grounding (Sprint 3) · cross-analysis (Sprint 4) · 신강신약/용신/
격국/12운성/12신살. Assessment 15-axis semantics remain `not_connected` (fail-closed).
