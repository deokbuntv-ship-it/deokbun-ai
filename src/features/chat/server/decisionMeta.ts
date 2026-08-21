// Server-produced decision/audit context (Sprint D §D1). Composed from the Answer Plan + grounding +
// resolved temporal context and persisted inside structured_result JSON, so a follow-up can reason about
// the previous decision (§D2/§D3) and detect a decision-version mismatch (§D4). Pure; no LLM, no I/O.
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION, type AnswerPlan } from './answerPlan';
import { classifyConsultationDomain, type ConsultationDomain } from './consultationDomain';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsultationDecisionMeta, ResolvedTemporalContext } from './serverConsultationTypes';

export function buildConsultationDecisionMeta(
  question: string,
  plan: AnswerPlan,
  grounding: ConsultationGrounding,
  resolvedTemporalContext: ResolvedTemporalContext,
  modelId?: string | null,
  // Sprint E.1 §18 — a follow-up ("그럼 내년은?") that inherits the prior topic supplies it here, so the NEW
  // decision persists the CARRIED domain (the bare follow-up question classifies as 전반 on its own). When
  // absent/전반, the domain is classified fresh from the question.
  carriedDomain?: ConsultationDomain | null,
): ConsultationDecisionMeta {
  const domain = carriedDomain && carriedDomain !== '전반' ? carriedDomain : classifyConsultationDomain(question);
  return {
    answerPlanVersion: ANSWER_PLAN_VERSION,
    decisionPolicyVersion: DECISION_POLICY_VERSION,
    promptVersion: CONSULTATION_PROMPT_VERSION,
    ...(grounding.status === 'available' && grounding.engineVersion ? { engineVersion: grounding.engineVersion } : {}),
    ...(modelId ? { modelId } : {}), // Sprint E §10 — actual runtime model id, server-supplied (never client)
    resolvedGranularity: plan.resolvedGranularity,
    resolvedTargets: resolvedTemporalContext.resolvedTargets,
    ...(plan.polarity ? { polarity: plan.polarity } : {}),
    domain,
    comparisonContext: plan.comparisonContext,
    evidence: { supportLevel: plan.supportLevel, assertiveness: plan.assertiveness, intents: plan.intents },
    resolvedTemporalContext,
  };
}

const POLARITY_TIERS = ['FAVORABLE', 'STEADY', 'DYNAMIC', 'CAUTION'];
const numArray = (v: unknown): number[] => (Array.isArray(v) ? v.filter((n): n is number => typeof n === 'number') : []);

/**
 * Fail-closed parse of a persisted decisionMeta (Sprint D/E). Malformed → undefined (never a silent default
 * that pretends a legacy row used the current versions). Server-side so the Edge follow-up loader can reuse
 * it on a row it queried; also used by the client persistence layer.
 */
export function parseDecisionMeta(v: unknown): ConsultationDecisionMeta | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.answerPlanVersion !== 'string' || typeof o.decisionPolicyVersion !== 'string' || typeof o.promptVersion !== 'string') return undefined;
  if (o.resolvedGranularity !== 'NONE' && o.resolvedGranularity !== 'YEAR' && o.resolvedGranularity !== 'MONTH') return undefined;
  const rtc = o.resolvedTemporalContext as Record<string, unknown> | null;
  if (rtc === null || typeof rtc !== 'object' || typeof rtc.anchorEpochSeconds !== 'number') return undefined;
  const p = typeof o.polarity === 'string' && POLARITY_TIERS.includes(o.polarity) ? (o.polarity as ConsultationDecisionMeta['polarity']) : undefined;
  // Sprint E.1 §16-17 — comparison context is parsed fail-closed: a malformed/absent value → NOT a comparison
  // (never a silent "true" that would let a follow-up invent a winner over ungrounded candidates).
  const cc = o.comparisonContext as Record<string, unknown> | null | undefined;
  const comparisonContext =
    cc && typeof cc === 'object' && typeof cc.isComparison === 'boolean'
      ? { isComparison: cc.isComparison, candidates: numArray(cc.candidates) }
      : undefined;
  // Sprint E.1 §5-6 — the stored evidence snapshot; parsed only when fully well-formed.
  const ev = o.evidence as Record<string, unknown> | null | undefined;
  const evidence =
    ev && typeof ev === 'object' && typeof ev.supportLevel === 'string' && typeof ev.assertiveness === 'string'
      ? {
          supportLevel: ev.supportLevel,
          assertiveness: ev.assertiveness,
          intents: Array.isArray(ev.intents) ? ev.intents.filter((s): s is string => typeof s === 'string') : [],
        }
      : undefined;
  return {
    answerPlanVersion: o.answerPlanVersion,
    decisionPolicyVersion: o.decisionPolicyVersion,
    promptVersion: o.promptVersion,
    ...(typeof o.engineVersion === 'string' ? { engineVersion: o.engineVersion } : {}),
    ...(typeof o.modelId === 'string' ? { modelId: o.modelId } : {}),
    resolvedGranularity: o.resolvedGranularity,
    resolvedTargets: numArray(o.resolvedTargets),
    ...(p ? { polarity: p } : {}),
    ...(typeof o.domain === 'string' ? { domain: o.domain as ConsultationDecisionMeta['domain'] } : {}),
    ...(comparisonContext ? { comparisonContext } : {}),
    ...(evidence ? { evidence } : {}),
    resolvedTemporalContext: {
      anchorEpochSeconds: rtc.anchorEpochSeconds,
      timezone: 'Asia/Seoul',
      referenceYear: typeof rtc.referenceYear === 'number' ? rtc.referenceYear : null,
      referenceMonth: typeof rtc.referenceMonth === 'number' ? rtc.referenceMonth : null,
      resolvedTargets: numArray(rtc.resolvedTargets),
      qimenActive: rtc.qimenActive === true,
    },
  };
}

// True when a persisted decision was produced under a DIFFERENT decision version than the current server
// (§D4). Compares only the decision-affecting versions (engine ruleset + answer plan + decision policy) —
// a prompt/model change alone is verbalization-only and does not count as a decision mismatch.
export function isDecisionVersionMismatch(
  persisted: ConsultationDecisionMeta | undefined,
  current?: { engineVersion?: string | null },
): boolean {
  if (!persisted) return false; // legacy row with no meta → caller decides how to treat (never silently equal)
  if (persisted.answerPlanVersion !== ANSWER_PLAN_VERSION) return true;
  if (persisted.decisionPolicyVersion !== DECISION_POLICY_VERSION) return true;
  // engineVersion is decision-affecting too (Sprint E.1 §7) — compared when a current value is available.
  if (current?.engineVersion && persisted.engineVersion && persisted.engineVersion !== current.engineVersion) return true;
  return false;
}
