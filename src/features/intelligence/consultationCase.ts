// Consultation Intelligence — CONSULTATION CASE / TRACE (directive §22/§23). Records
// which question used which evidence + assessments to produce which response, so a
// past consultation is reproducible. REFERENCES ONLY — no name/email/birth/question
// text/response text duplicated here (§23/§51); those stay in subject/conversation/
// message rows. PURE contract + validator.
import type { EngineKind } from '@/features/analysis';

import type { QuestionScope } from './questionScope';
import { CONSULTATION_CASE_SCHEMA_VERSION } from './versions';

// Which engines were used vs skipped, and WHY (so "was 기문 used? no — not a timing
// question" is answerable later). Reason mirrors availability/eligibility strings.
export type EngineUsage = {
  engine: EngineKind;
  used: boolean;
  reason: string | null; // e.g. 'not_applicable' | 'missing_birth_time' | 'engine_not_connected'
};

// Every version in effect at consultation time (§35) — makes the case reproducible.
export type ConsultationVersions = {
  intelligenceSchemaVersion: string;
  assessmentSchemaVersion: string;
  assessmentRulesetVersion: string;
  crossAnalysisVersion: string | null;
  promptVersion: string | null;
  model: string | null;
};

export type ConsultationCase = {
  consultationCaseId: string;
  // References (no PII duplication):
  conversationId: string;
  messageId: string;
  requestId: string;
  subjectId: string;
  questionScope: QuestionScope;
  usedEvidenceRefs: string[];
  usedAssessmentRefs: string[];
  engineUsage: EngineUsage[]; // includes UNUSED engines + reasons (§22)
  crossAnalysisRef: string | null;
  responseRef: string | null; // pointer to the assistant message, not its text
  versions: ConsultationVersions;
  schemaVersion: string;
  createdAt: string;
};

export type ConsultationCaseInput = Omit<ConsultationCase, 'schemaVersion'>;

export function buildConsultationCase(input: ConsultationCaseInput): ConsultationCase {
  return { ...input, schemaVersion: CONSULTATION_CASE_SCHEMA_VERSION };
}

export function isValidConsultationCase(c: ConsultationCase): boolean {
  return (
    c.consultationCaseId.length > 0 &&
    c.conversationId.length > 0 &&
    c.messageId.length > 0 &&
    c.requestId.length > 0 &&
    c.subjectId.length > 0 &&
    Array.isArray(c.usedEvidenceRefs) &&
    Array.isArray(c.usedAssessmentRefs) &&
    Array.isArray(c.engineUsage) &&
    c.createdAt.length > 0
  );
}
