# AI DISCLAIMER CONTRACT (§W)

> **Status:** CONTRACT ONLY (Sprint F). Defines the shared user-facing AI-notice principle and where it must
> appear. It does **not** replace or weaken any existing Safety Gate. Final Korean wording is an owner action.

## 1. The common principle (user-facing)

> 덕분이는 AI를 활용해 해석과 상담을 제공합니다. AI가 생성한 내용은 부정확하거나 실제 결과와 다를 수 있으며,
> 중요한 결정은 현실적인 상황과 해당 분야의 전문 정보를 함께 확인해 주세요.

Plain-English intent (for implementers): *Deokbuni uses AI for interpretation and consultation. AI-generated
content may be inaccurate or differ from real outcomes; for important decisions, also consult your real-world
situation and the relevant professional information.*

## 2. This notice does NOT replace the Safety Gate

The disclaimer is an **honesty notice**, not a safety mechanism. The existing deterministic safety policy stays
fully in force and is **unchanged** this sprint:

- **Self-harm / suicide** → crisis hard-stop response (no fortune, hotline info), before any spend/LLM.
- **Death / lifespan timing** → refused (no prediction).
- **Medical diagnosis / prognosis** → refused (defer to professionals).
- **Financial guarantee** → no guaranteed-outcome language (plan + certainty guard).
- **Other-person's will / behavior as certainty**, **winner/ranking**, **event-certainty** → forbidden by the
  answer plan + certainty/mitigation guard.

The disclaimer must never be used to justify relaxing any of the above.

## 3. Where it must appear (contract)

| Surface | Requirement |
|---|---|
| Onboarding / terms | the principle is acknowledged as part of terms acceptance |
| Consultation & compatibility answers | a persistent, unobtrusive AI-notice affordance is available (e.g. footer/info), not a per-message nag |
| Premium report | the notice is included in the report artifact |
| Today / Monthly fortune | the notice is discoverable on the fortune surface |

The exact placement/visual is a design decision; the **contract** is that every AI-output surface carries the
notice and that it is consistent (one source string, not per-screen variants).

## 4. Implementation note

Provide one shared constant (Korean copy above) consumed by every AI-output surface, so the wording cannot drift
between screens. Not built this sprint. When built, it lives alongside the existing safety copy, never inside it.
