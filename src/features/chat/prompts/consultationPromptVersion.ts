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
// 1.4.3 — Sprint C.1 shared-prompt closure: removed the SURVIVING winner-authorizing language from the
// System Constitution ("2월을 먼저 추천 / 5월보다 7월이 더 유리 / 가장 좋다 / 1순위 / A가 B보다 낫다") and the
// structured-output instruction ("더 나은 쪽 / 이 시기가 더 유리합니다"). Single decisions stay decisive;
// cross-candidate winner/order is forbidden across the FULL prompt stack.
// 1.5.0 — Consultation V1 Finalization (interpretation depth): (a) QUESTION-FIRST domain routing — the
// answer-plan directive names the asked life-domain and forbids opening with unrelated 성격/기질 analysis or
// defaulting every answer to 재물; (b) NATAL+TEMPORAL synthesis — connect 원국 baseline + 대운 + 세운 to the
// question in plain language, prefer ≥2 grounded facts, no ungrounded generic 처세 advice; (c) ACTION =
// behavioral direction, not a productivity/service checklist (paired with a new output guard reusing the
// Today/Monthly checklist-tone detectors + a regen directive clause). Same schema/frozen semantics.
export const CONSULTATION_PROMPT_VERSION = 'consultation@1.5.0';
