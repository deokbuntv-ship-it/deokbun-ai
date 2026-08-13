// Consultation prompt version (directive §36/§37). Bump when the SYSTEM_CONSTITUTION,
// response policy, or grounding-rendering CONTRACT changes in a way that could alter
// answers — so a persisted consultation / Consultation-Intelligence case can record
// which prompt produced it. This is the PROMPT contract version, independent of the
// server model id (LLM_MODEL, edge-owned) and the future engineVersion (Codex-owned).
export const CONSULTATION_PROMPT_VERSION = 'consultation@1.0.0';
