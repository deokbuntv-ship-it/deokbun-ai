// Server-produced decision/audit context (Sprint D §D1). Composed from the Answer Plan + grounding +
// resolved temporal context and persisted inside structured_result JSON, so a follow-up can reason about
// the previous decision (§D2/§D3) and detect a decision-version mismatch (§D4). Pure; no LLM, no I/O.
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION, type AnswerPlan } from './answerPlan';
import { classifyConsultationDomain, type ConsultationDomain } from './consultationDomain';
import type { CrossDivinationVerdict } from '@/features/divination';
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
    // §17 — persist the FULL cross verdict so a later "왜요?" explains the SAME judgment (subject, evidence
    // and contradiction resolution), instead of falling back to a Myungri-only polarity snapshot.
    ...(grounding.status === 'available' && grounding.divinationVerdict
      ? { divinationVerdict: grounding.divinationVerdict }
      : {}),
    ...(plan.selectedTargetPolarity && grounding.status === 'available' && grounding.engineVersion
      ? {
          evidenceSnapshot: {
            schemaVersion: 'decision-evidence@1.0.0' as const,
            target: {
              granularity: plan.selectedTargetPolarity.granularity,
              key: plan.selectedTargetPolarity.targetKey,
            },
            polarity: plan.selectedTargetPolarity.polarity,
            derivation: plan.selectedTargetPolarity.derivation,
            supportLevel: plan.supportLevel,
            assertiveness: plan.assertiveness,
            intents: plan.intents,
            engineVersion: grounding.engineVersion,
          },
        }
      : {}),
    resolvedTemporalContext,
  };
}

const POLARITY_TIERS = ['FAVORABLE', 'STEADY', 'DYNAMIC', 'CAUTION'];
const DOMAINS = ['사업', '창업', '이직', '직업', '재물', '결혼', '연애', '관계', '건강', '시험', '이사', '계약', '전반'];
const PILLAR_POSITIONS = ['YEAR', 'MONTH', 'DAY', 'HOUR'];
const STEM_RELATION_KINDS = ['STEM_COMBINATION', 'STEM_CLASH'];
const BRANCH_RELATION_KINDS = [
  'BRANCH_SIX_COMBINATION', 'BRANCH_CLASH', 'BRANCH_HALF_THREE_HARMONY',
  'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM',
];
const isFiniteInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v);
const strictNumArray = (v: unknown): number[] | undefined =>
  Array.isArray(v) && v.length <= 24 && v.every(isFiniteInteger) ? v : undefined;
const validRelationArray = (v: unknown, kinds: readonly string[]): boolean =>
  Array.isArray(v) && v.length <= 8 && v.every((item) => {
    if (item === null || typeof item !== 'object') return false;
    const r = item as Record<string, unknown>;
    return typeof r.position === 'string' && PILLAR_POSITIONS.includes(r.position) &&
      typeof r.kind === 'string' && kinds.includes(r.kind);
  });

function parseEvidenceSnapshot(v: unknown): ConsultationDecisionMeta['evidenceSnapshot'] | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const ev = v as Record<string, unknown>;
  const target = ev.target as Record<string, unknown> | null;
  const derivation = ev.derivation as Record<string, unknown> | null;
  if (ev.schemaVersion !== 'decision-evidence@1.0.0' || !target || typeof target !== 'object') return undefined;
  if ((target.granularity !== 'YEAR' && target.granularity !== 'MONTH') || !isFiniteInteger(target.key)) return undefined;
  if (typeof ev.polarity !== 'string' || !POLARITY_TIERS.includes(ev.polarity)) return undefined;
  if (!derivation || typeof derivation !== 'object') return undefined;
  if (!isFiniteInteger(derivation.harmony) || derivation.harmony < 0 || derivation.harmony > 8) return undefined;
  if (!isFiniteInteger(derivation.friction) || derivation.friction < 0 || derivation.friction > 8) return undefined;
  if (!validRelationArray(derivation.stemRelations, STEM_RELATION_KINDS) ||
      !validRelationArray(derivation.branchRelations, BRANCH_RELATION_KINDS)) return undefined;
  if (typeof ev.supportLevel !== 'string' || typeof ev.assertiveness !== 'string' || typeof ev.engineVersion !== 'string' || ev.engineVersion.length === 0) return undefined;
  if (!Array.isArray(ev.intents) || ev.intents.length > 8 || !ev.intents.every((x) => typeof x === 'string')) return undefined;
  return ev as ConsultationDecisionMeta['evidenceSnapshot'];
}

/**
 * Fail-closed parse of a persisted decisionMeta (Sprint D/E). Malformed → undefined (never a silent default
 * that pretends a legacy row used the current versions). Server-side so the Edge follow-up loader can reuse
 * it on a row it queried; also used by the client persistence layer.
 */
/**
 * V3 §34/§44 — deserialize the persisted cross-discipline verdict. Validates the SHAPE the follow-up turn
 * actually depends on (direction + per-discipline judgments + axes + evidence), so a truncated or foreign
 * payload is rejected instead of silently restoring a hollow judgment. Structure only — no astrology here.
 */
export function parseDivinationVerdict(v: unknown): CrossDivinationVerdict | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.direction !== 'string' || typeof o.primaryConclusion !== 'string') return undefined;
  if (typeof o.verdictVersion !== 'string') return undefined;
  if (!Array.isArray(o.disciplineJudgments) || o.disciplineJudgments.length === 0) return undefined;
  for (const j of o.disciplineJudgments) {
    if (j === null || typeof j !== 'object') return undefined;
    const dj = j as Record<string, unknown>;
    if (typeof dj.discipline !== 'string' || typeof dj.stance !== 'string' || typeof dj.applicable !== 'boolean') return undefined;
    if (!Array.isArray(dj.domainSubJudgments)) return undefined;
  }
  if (!Array.isArray(o.axisVerdicts) || !Array.isArray(o.contributions)) return undefined;
  if (!Array.isArray(o.evidenceReferences)) return undefined;
  return v as CrossDivinationVerdict;
}

export function parseDecisionMeta(v: unknown): ConsultationDecisionMeta | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.answerPlanVersion !== 'string' || typeof o.decisionPolicyVersion !== 'string' || typeof o.promptVersion !== 'string') return undefined;
  if (o.resolvedGranularity !== 'NONE' && o.resolvedGranularity !== 'YEAR' && o.resolvedGranularity !== 'MONTH') return undefined;
  const resolvedTargets = strictNumArray(o.resolvedTargets);
  if (!resolvedTargets) return undefined;
  const rtc = o.resolvedTemporalContext as Record<string, unknown> | null;
  if (rtc === null || typeof rtc !== 'object' || !isFiniteInteger(rtc.anchorEpochSeconds)) return undefined;
  const rtcTargets = strictNumArray(rtc.resolvedTargets);
  if (!rtcTargets || rtc.timezone !== 'Asia/Seoul' || typeof rtc.qimenActive !== 'boolean') return undefined;
  if (rtc.referenceYear !== null && !isFiniteInteger(rtc.referenceYear)) return undefined;
  if (rtc.referenceMonth !== null && (!isFiniteInteger(rtc.referenceMonth) || rtc.referenceMonth < 1 || rtc.referenceMonth > 12)) return undefined;
  const p = typeof o.polarity === 'string' && POLARITY_TIERS.includes(o.polarity) ? (o.polarity as ConsultationDecisionMeta['polarity']) : undefined;
  if (o.polarity !== undefined && !p) return undefined;
  // Sprint E.1 §16-17 — comparison context is parsed fail-closed: a malformed/absent value → NOT a comparison
  // (never a silent "true" that would let a follow-up invent a winner over ungrounded candidates).
  const cc = o.comparisonContext as Record<string, unknown> | null | undefined;
  let comparisonContext: ConsultationDecisionMeta['comparisonContext'];
  if (o.comparisonContext !== undefined) {
    const candidates = cc && typeof cc === 'object' ? strictNumArray(cc.candidates) : undefined;
    if (!cc || typeof cc !== 'object' || typeof cc.isComparison !== 'boolean' || !candidates) return undefined;
    if (cc.isComparison && candidates.length < 2) return undefined;
    comparisonContext = { isComparison: cc.isComparison, candidates };
  }
  // A claimed optional authority object is all-or-nothing. Malformed claims reject the whole row instead of
  // being silently dropped and letting an action proceed with a weaker authority substrate.
  const evidenceSnapshot = o.evidenceSnapshot === undefined ? undefined : parseEvidenceSnapshot(o.evidenceSnapshot);
  if (o.evidenceSnapshot !== undefined && !evidenceSnapshot) return undefined;
  // V3 §34 — the cross-discipline verdict was WRITTEN by the builder but never read back here, so on the REAL
  // production path (write → JSONB → parse) it was silently discarded and a follow-up explained a degraded,
  // Myungri-only judgment. Restored fail-closed: a malformed claim rejects the row rather than downgrading
  // the session's judgment behind the user's back.
  const divinationVerdict =
    o.divinationVerdict === undefined || o.divinationVerdict === null
      ? undefined
      : parseDivinationVerdict(o.divinationVerdict);
  if (o.divinationVerdict !== undefined && o.divinationVerdict !== null && !divinationVerdict) return undefined;
  if (evidenceSnapshot && (
    p !== evidenceSnapshot.polarity ||
    o.engineVersion !== evidenceSnapshot.engineVersion ||
    o.resolvedGranularity !== evidenceSnapshot.target.granularity ||
    !resolvedTargets.includes(evidenceSnapshot.target.key)
  )) return undefined;
  if (comparisonContext?.isComparison &&
      !comparisonContext.candidates.every((candidate) => resolvedTargets.includes(candidate))) return undefined;
  if (o.domain !== undefined && (typeof o.domain !== 'string' || !DOMAINS.includes(o.domain))) return undefined;
  return {
    answerPlanVersion: o.answerPlanVersion,
    decisionPolicyVersion: o.decisionPolicyVersion,
    promptVersion: o.promptVersion,
    ...(typeof o.engineVersion === 'string' ? { engineVersion: o.engineVersion } : {}),
    ...(typeof o.modelId === 'string' ? { modelId: o.modelId } : {}),
    resolvedGranularity: o.resolvedGranularity,
    resolvedTargets,
    ...(p ? { polarity: p } : {}),
    ...(typeof o.domain === 'string' ? { domain: o.domain as ConsultationDecisionMeta['domain'] } : {}),
    ...(comparisonContext ? { comparisonContext } : {}),
    ...(evidenceSnapshot ? { evidenceSnapshot } : {}),
    ...(divinationVerdict ? { divinationVerdict } : {}),
    resolvedTemporalContext: {
      anchorEpochSeconds: rtc.anchorEpochSeconds,
      timezone: 'Asia/Seoul',
      referenceYear: typeof rtc.referenceYear === 'number' ? rtc.referenceYear : null,
      referenceMonth: typeof rtc.referenceMonth === 'number' ? rtc.referenceMonth : null,
      resolvedTargets: rtcTargets,
      qimenActive: rtc.qimenActive,
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
