// Structured-answer persistence (Commercial UX V4 §13-§18). PURE + deterministic. Serializes the
// user-facing structured answer for storage and rebuilds a renderable view-model on reload, so a
// restored assistant answer keeps its card + follow-up chips instead of downgrading to plain text.
//
// DATA MINIMIZATION (§56): the persisted subset is the user-facing prose + follow-ups + state ONLY —
// NOT the grounding evidence payload (large + internal) and NOT the recomputable assessment. On
// reload a fail-closed assessment + GROUNDING_UNAVAILABLE are reattached, so the "왜 이렇게 해석했나요"
// evidence sheet degrades gracefully rather than showing stale/absent internals.
//
// FAIL-CLOSED (§17/§20): malformed / legacy JSON → undefined (the caller renders the plain text
// bubble); never throws, never logs the payload.
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type { PolarityTier } from '@/features/polarity/polarityKernel';
import type { ConsultationDecisionMeta } from '@/features/chat/server/serverConsultationTypes';
import { parseDecisionMeta } from '@/features/chat/server/decisionMeta';

export type PersistedStructured = {
  coreSummary?: string;
  disposition?: string;
  coreInterpretation?: string;
  currentFlow?: string;
  strengths?: string[];
  cautions?: string[];
  domainInterpretation?: { title: string; body: string }[];
  futureFlow?: string;
  followUps?: string[];
  state?: StructuredConsultationViewModel['state'];
  // SERVER-owned conclusion polarity (Sprint C §8) — persisted for the audit trail + future follow-up
  // version-mismatch handling. Backward-compatible: legacy rows lack it → undefined.
  conclusionPolarity?: PolarityTier;
  // SERVER-owned decision/audit context (Sprint D §D1) — versions + resolved target/temporal context.
  decisionMeta?: ConsultationDecisionMeta;
};

const POLARITY_TIERS: readonly PolarityTier[] = ['FAVORABLE', 'STEADY', 'DYNAMIC', 'CAUTION'];
const polarityTier = (v: unknown): PolarityTier | undefined =>
  typeof v === 'string' && (POLARITY_TIERS as readonly string[]).includes(v) ? (v as PolarityTier) : undefined;

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim().length > 0 ? v : undefined;
const strArr = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined;
const sections = (v: unknown): { title: string; body: string }[] | undefined =>
  Array.isArray(v)
    ? v
        .filter(
          (d): d is { title: string; body: string } =>
            !!d && typeof (d as { title?: unknown }).title === 'string' && typeof (d as { body?: unknown }).body === 'string',
        )
        .map((d) => ({ title: d.title, body: d.body }))
    : undefined;

// The subset written to conversation_messages.structured_result (JSONB). No grounding, no assessment.
export function serializeStructuredForPersistence(vm: StructuredConsultationViewModel): PersistedStructured {
  return {
    coreSummary: str(vm.coreSummary),
    disposition: str(vm.disposition),
    coreInterpretation: str(vm.coreInterpretation),
    currentFlow: str(vm.currentFlow),
    strengths: strArr(vm.strengths),
    cautions: strArr(vm.cautions),
    domainInterpretation: sections(vm.domainInterpretation),
    futureFlow: str(vm.futureFlow),
    followUps: strArr(vm.followUps),
    state: vm.state,
    conclusionPolarity: polarityTier(vm.conclusionPolarity),
    decisionMeta: vm.decisionMeta,
  };
}

const FAIL_CLOSED_ASSESSMENT = toConsumerAssessmentView([]);

// Rebuild a renderable VM from persisted JSON (object or JSON string). Tolerant of malformed/legacy
// shapes → undefined. Reattaches fail-closed assessment + GROUNDING_UNAVAILABLE.
export function parsePersistedStructured(raw: unknown): StructuredConsultationViewModel | undefined {
  if (raw === null || raw === undefined) return undefined;
  let obj: unknown = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  if (typeof obj !== 'object' || obj === null) return undefined;
  const p = obj as PersistedStructured;

  const hasContent =
    !!str(p.coreSummary) || !!str(p.coreInterpretation) || (strArr(p.strengths)?.length ?? 0) > 0;
  if (!hasContent && !p.state) return undefined; // not a structured answer → caller uses text

  return {
    coreSummary: str(p.coreSummary),
    disposition: str(p.disposition),
    assessment: FAIL_CLOSED_ASSESSMENT,
    coreInterpretation: str(p.coreInterpretation),
    currentFlow: str(p.currentFlow),
    strengths: strArr(p.strengths),
    cautions: strArr(p.cautions),
    domainInterpretation: sections(p.domainInterpretation),
    futureFlow: str(p.futureFlow),
    grounding: GROUNDING_UNAVAILABLE,
    followUps: strArr(p.followUps),
    state: p.state,
    conclusionPolarity: polarityTier(p.conclusionPolarity),
    decisionMeta: parseDecisionMeta(p.decisionMeta),
  };
}
