// Assemble the StructuredConsultationViewModel the chat renders (sprint §11/§14). Composes the
// LLM's parsed long-form (interpretation only) + the deterministic `grounding` (evidence/provenance,
// unchanged) + a FAIL-CLOSED assessment. Reuses the existing view-model contract — no new schema.
import { stripEngineLabels } from '@/features/chat/presentation/commercialText';
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';

// No verified evidence→15-axis ruleset is connected (§7) → the consumer sees the honest
// not-connected assessment, NEVER a fabricated score/level. (Empty items ⇒ status 'unavailable'.)
const FAIL_CLOSED_ASSESSMENT = toConsumerAssessmentView([]);

// Presentation-boundary hygiene (V4 §8/§9/§69): strip any internal engine LABEL the model may have
// slipped in ("(엔진: SAJU)" …) from every user-facing string. Conservative — a no-op on a clean answer;
// never rewrites prose. The prompt is the primary defense; this is defense-in-depth at the render seam.
const clean = (s: string | undefined): string | undefined =>
  typeof s === 'string' ? stripEngineLabels(s) : s;
const cleanArr = (a: string[] | undefined): string[] | undefined => a?.map((x) => stripEngineLabels(x));

export function buildStructuredConsultationResult(
  parsed: ParsedStructuredConsultation,
  grounding: ConsultationGrounding,
): StructuredConsultationViewModel {
  return {
    coreSummary: clean(parsed.coreSummary),
    disposition: clean(parsed.disposition),
    assessment: FAIL_CLOSED_ASSESSMENT,
    coreInterpretation: clean(parsed.coreInterpretation),
    strengths: cleanArr(parsed.strengths),
    cautions: cleanArr(parsed.cautions),
    domainInterpretation: parsed.domainInterpretation?.map((d) => ({
      title: stripEngineLabels(d.title),
      body: stripEngineLabels(d.body),
    })),
    futureFlow: clean(parsed.futureFlow),
    grounding,
    followUps: cleanArr(parsed.followUps),
  };
}
