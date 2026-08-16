// Assemble the StructuredConsultationViewModel the chat renders (sprint §11/§14). Composes the
// LLM's parsed long-form (interpretation only) + the deterministic `grounding` (evidence/provenance,
// unchanged) + a FAIL-CLOSED assessment. Reuses the existing view-model contract — no new schema.
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import type { StructuredConsultationViewModel } from '@/features/intelligence/components/StructuredConsultationResult';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';

// No verified evidence→15-axis ruleset is connected (§7) → the consumer sees the honest
// not-connected assessment, NEVER a fabricated score/level. (Empty items ⇒ status 'unavailable'.)
const FAIL_CLOSED_ASSESSMENT = toConsumerAssessmentView([]);

export function buildStructuredConsultationResult(
  parsed: ParsedStructuredConsultation,
  grounding: ConsultationGrounding,
): StructuredConsultationViewModel {
  return {
    coreSummary: parsed.coreSummary,
    disposition: parsed.disposition,
    assessment: FAIL_CLOSED_ASSESSMENT,
    coreInterpretation: parsed.coreInterpretation,
    strengths: parsed.strengths,
    cautions: parsed.cautions,
    domainInterpretation: parsed.domainInterpretation,
    futureFlow: parsed.futureFlow,
    grounding,
    followUps: parsed.followUps,
  };
}
