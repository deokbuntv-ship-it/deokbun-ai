// Consultation prompt version (directive §36/§37). Bump when the SYSTEM_CONSTITUTION,
// response policy, or grounding-rendering CONTRACT changes in a way that could alter
// answers — so a persisted consultation / Consultation-Intelligence case can record
// which prompt produced it. This is the PROMPT contract version, independent of the
// server model id (LLM_MODEL, edge-owned) and the future engineVersion (Codex-owned).
// 1.1.0 — Commercial Answer V5: conclusion+direction headline, self-scaling length, natural-Korean /
// anti-filler rules, and "detail must add new value" (no schema change — same fields, refined contract).
// 1.2.0 — Evidence-Calibrated Decision: clear grounded judgment (no habitual hedging), event-certainty vs
// suitability distinction, decision-first, and best-supported-alternative instead of user-blame / giving up.
// 1.3.0 — Future-Month Grounding: question-requested months (2027-02, best-month, month-vs-month) are now
// grounded from the frozen 월운 engine and become valid month-level timing anchors — the validator ALLOWS a
// grounded month suitability/comparison claim and (safer) REJECTS an ungrounded month even inside a
// grounded year. Same schema/frozen semantics; zero extra LLM calls.
// 1.4.0 — Server Decision Engine: the server derives intent / support level / assertiveness /
// comparison-ranking-claim permissions (answerPlan) from the question + grounding and hands the LLM a
// directive it verbalizes (the model no longer decides its own confidence); + consumer 간지-hanja hygiene.
// 1.4.1 — Compatibility answer-quality refinement: relationship-specific follow-up examples (no generic
// "더 궁금한 점?"), relationship-type adaptation (연인/친구/사업파트너/가족), and an explicit no-gender-
// stereotype rule in the 궁합 response policy. Solo prompt/schema unchanged; compatibility-only wording.
// 1.4.2 — Sprint C directive change: the comparison/ranking directive no longer authorizes the model to
// choose a winner / 1순위 (Option B — discuss each grounded candidate, no manufactured winner/order), and
// the directive now relays the SERVER-owned overall polarity tone + a mitigation instruction on a CAUTION
// conclusion. Same schema; the answer-shaping directive genuinely changed, so the prompt contract bumps.
export const CONSULTATION_PROMPT_VERSION = 'consultation@1.4.2';
