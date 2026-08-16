# SAJU Product Integration — Sprint record (frozen engine → consultation)

> Wires the **frozen** Saju/Myungri engine (`7c7ed82`, `APPROVED_FREEZE`) into the live
> consultation. No engine change, no calculation in the app layer — adapters convert only.
> Local commits only. No push/deploy/DB.

## Production chain (built)

```
draft.birthInfo
  → toSajuEngineInput            (manse/services/birthInputMapper — REUSED)
  → executeSajuFromBirthInput    (interpretation — FROZEN producer, deps: digest + Asia/Seoul resolver)
  → SajuEngineResult             (status SUCCESS | PARTIAL | UNAVAILABLE)
  → Myungri facts                (natalContextFromFourPillars + calculateMonthCommand +
                                  calculateRootingTransparency + calculateSajuDaewoon +
                                  calculateDaewoonTenGods + calculateSewoon/WolwoonForInstant)
  → toSajuEvidence               (myungri/adapters — CONVERTER ONLY → app EngineEvidence)
  → buildConsultationGrounding   (chat/services/consultationGrounding — assembles ConsultationGrounding,
                                  ziwei/qimen = engine_not_connected; fail-closed)
  → chatService (3rd arg: GroundingBuilder, fail-closed try/catch)
  → promptBuilder.renderGroundingContext  → LLM (interprets, never calculates)
```

`ENGINE_CONNECTED = { saju: true, ziwei: false, qimen: false }`.

## Evidence transferred (facts-only, provenance-preserving)

Natal: 4주(년 立春 / 월 12-Jie) · 일간 · 오행 분포 · 십신(주별) · 지장간. Time: 대운 + 대운십신 ·
当年 세운/월운. Additional: 월령/득령(旺相休囚死, single-factor input) · 통근/투간. Provenance line:
`년주=START_OF_SPRING_IPCHUN · 월주=TWELVE_JIE_JIEQI · saju-pillar-rules.v2 · 십신 rule` (sprint §5).
**No strength verdict / 용신 / 격국 / 12운성 / 12신살 / fake score** (sprint §2).

## Fail-closed (sprint §6/§16 — proven by `consultationGrounding.test.ts`)

unsupported date (2051) · engine UNAVAILABLE · unknown/approximate time on a 立春/Jie boundary date ·
missing subject/birth → grounding `unavailable`, **no fabricated evidence**. Boundary-minute ties are
proven at the resolver level (`sajuBoundaryFix.test.ts` FIX 1).

## E2E (sprint §15)

Solar `2024-01-03` ≡ Lunar `2023-11-22` → `癸卯 / 甲子 / 丙寅`, **identical** grounding evidence
(summary + detail byte-equal). LLM mocked; EngineEvidence/Grounding/PromptBuilder are the real path.

## NOT connected yet (honest — do NOT claim otherwise)

- **`structuredResult` / followUps** (`ChatMessage.structuredResult`, `StructuredConsultationResult`):
  the prompt does not yet request the JSON schema; `parseStructuredAiResponse` returns null →
  plain-text render (unchanged). The seam exists; wiring it is the next task. **Do not fake a
  structuredResult by parsing prose.**
- **Assessment 15-axis semantics**: no real evidence→axis ruleset — must stay `insufficient`, no fake
  confidence/score (separate task).

## Next integration seams (READ-ONLY this sprint — sprint §17/§26/§27)

- **Sprint 2 — Ziwei → grounding:** `toZiweiEvidence(result)` already exists
  (`ziwei/adapters/ziweiEvidenceAdapter.ts`, facts-only). Seam: in `buildConsultationGrounding`, when
  birth **time is known**, run the ziwei producer (needs an app producer like manse's for SAJU),
  adapt via `toZiweiEvidence`, set `evidence.ziwei`, and flip `ENGINE_CONNECTED.ziwei=true` only with a
  tested path. Ziwei calc correctness is `BLOCKED_OWNER`/Codex (school/star canon) — wire evidence, not new calc.
- **Sprint 3 — Qimen → grounding:** `toQimenEvidence` exists (`qimen/adapters/qimenEvidenceAdapter.ts`).
  Qimen is **timing-questions-only** (`resolveEngineEligibility` already gates `isTimingQuestion`); the
  grounding builder must pass the question's timing nature + question-time, run only when eligible, and
  never fabricate a board for a non-timing question. Flip `qimen=true` only with a tested path.
- **Sprint 4 — Cross-Analysis:** only after ≥2 engines emit live evidence; until then Cross-Analysis is
  SAJU-only and must never claim "3-학문 일치".

## Files changed

- NEW `myungri/adapters/sajuEvidenceAdapter.ts`, `chat/services/consultationGrounding.ts`,
  `chat/__tests__/consultationGrounding.test.ts`.
- MOD `analysis/engineOrchestration.ts` (saju flag), `chat/services/chatService.ts` (optional grounding
  builder), `chat/index.ts` + `myungri/index.ts` (exports), `app/chat.tsx` (production wire),
  `analysis/__tests__/analysis.spec.ts` (saju-now-wired assertion).
