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
export const CONSULTATION_PROMPT_VERSION = 'consultation@1.3.0';
