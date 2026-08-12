// Consultation Intelligence — version constants (directive §35/§36).
//
// Every persisted intelligence record carries the schema/ruleset versions in
// effect when it was CREATED, so a historical consultation stays reproducible and
// is NEVER silently overwritten by a later ruleset change (§9/§36). A re-evaluation
// is a NEW run, not an in-place edit.

export const CONSULTATION_INTELLIGENCE_SCHEMA_VERSION = 'ci@1.0.0';
export const EVIDENCE_LEDGER_SCHEMA_VERSION = 'evidence@1.0.0';
export const ASSESSMENT_SCHEMA_VERSION = 'assessment@1.0.0';
export const CONSULTATION_CASE_SCHEMA_VERSION = 'case@1.0.0';
export const QUALITY_REVIEW_SCHEMA_VERSION = 'quality@1.0.0';
export const OUTCOME_SCHEMA_VERSION = 'outcome@1.0.0';

// The evidence→assessment RULESET is NOT connected yet — Codex owns the verified
// mapping (which evidence contributes what polarity/strength to which axis). Until
// a real ruleset ships, assessments are fail-closed (§44) and carry this sentinel
// so a fabricated evaluation can never be mistaken for a real one.
export const ASSESSMENT_RULESET_NOT_CONNECTED = 'not_connected';

// Sentinel for the quality-evaluator ruleset (LLM-answer quality) — also not
// connected in V1.0; reviews default to not_evaluated until a real evaluator/human.
export const QUALITY_EVALUATOR_NOT_CONNECTED = 'not_connected';
