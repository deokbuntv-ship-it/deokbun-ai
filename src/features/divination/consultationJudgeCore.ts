// SHARED, DISCIPLINE-AGNOSTIC combination core for consultation-domain judges — used by BOTH
// `myungriConsultationJudge.ts` and `ziweiConsultationJudge.ts`. Extracted rather than duplicated
// because the combination mechanics (never voting/scoring, MIXED as first-class, UNRESOLVED requiring
// no synthesis) are a correctness-sensitive contract that must not drift between the two disciplines —
// see `myungriConsultationJudge.ts`'s own header for the full rationale.
import type { JudgmentDomain, JudgmentEvidence } from './contracts';
import {
  type ConsultationJudgeDomain, type DomainJudgeResult, type DomainJudgeStatus, type SyntheticInference,
} from './consultationJudgeTypes';

export type DomainRule = {
  kind: 'OPPORTUNITY' | 'RISK';
  reasoning: string;
  evidence: JudgmentEvidence[];
  structuralDriver?: string;
  /** Named per-discipline (e.g. Yongshin relevance for Myungri, 사화/大限 relevance for Ziwei). */
  disciplineNote?: string;
  temporalNote?: string;
};

const DOMAIN_LABEL: Record<ConsultationJudgeDomain, string> = {
  BUSINESS: '사업', MONEY: '재물', CAREER: '직업', LOVE: '연애', REUNION: '재회', CHANGE: '변화', TIMING: '시기',
};

/** Two grounded booleans → one of 4 categorical labels. Never a count, weight, or percentage (§5). */
export function combineStatus(hasOpportunity: boolean, hasRisk: boolean): DomainJudgeStatus {
  if (hasOpportunity && hasRisk) return 'MIXED';
  if (hasOpportunity) return 'FAVORABLE';
  if (hasRisk) return 'CAUTION';
  return 'UNRESOLVED';
}

function buildConclusion(domain: ConsultationJudgeDomain, status: DomainJudgeStatus, opportunities: DomainRule[], risks: DomainRule[]): string {
  const opp = opportunities.map((r) => r.reasoning).join(' ');
  const risk = risks.map((r) => r.reasoning).join(' ');
  switch (status) {
    case 'FAVORABLE': return opp;
    case 'CAUTION': return risk;
    case 'MIXED': return `${opp} 다만, ${risk}`;
    case 'UNRESOLVED': return `${DOMAIN_LABEL[domain]}을(를) 구조적으로 판단할 근거가 이번 배치에서 충분하지 않습니다.`;
  }
}

export function finalize(
  domain: ConsultationJudgeDomain, rules: DomainRule[], syntheticInferences: SyntheticInference[],
  unresolvedReasons: string[], reasoningRuleIds: string[], provenance: DomainJudgeResult['provenance'][0],
): DomainJudgeResult {
  const opportunities = rules.filter((r) => r.kind === 'OPPORTUNITY');
  const risks = rules.filter((r) => r.kind === 'RISK');
  const status = combineStatus(opportunities.length > 0, risks.length > 0);
  const dedupe = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => !!x))];
  return {
    domain, status,
    conclusion: buildConclusion(domain, status, opportunities, risks),
    supportingEvidence: opportunities.flatMap((r) => r.evidence),
    counterEvidence: risks.flatMap((r) => r.evidence),
    // §15 — every non-UNRESOLVED verdict carries at least one real multi-premise inference; UNRESOLVED
    // has nothing to synthesize by definition.
    syntheticInferences: status === 'UNRESOLVED' ? [] : syntheticInferences,
    structuralDrivers: dedupe(rules.map((r) => r.structuralDriver)),
    yongshinRelevance: dedupe(rules.map((r) => r.disciplineNote)),
    temporalDrivers: dedupe(rules.map((r) => r.temporalNote)),
    risks: risks.map((r) => r.reasoning),
    opportunities: opportunities.map((r) => r.reasoning),
    uncertaintyReasons: status === 'UNRESOLVED' ? unresolvedReasons : [],
    reasoningRuleIds,
    provenance: [provenance],
  };
}

// ── question routing — discipline-agnostic: maps the SAME routing the live pipeline already resolves
// (`resolveAskedTarget`/`resolveJudgmentDomain` in `chat/services/consultationGrounding.ts`) onto one
// of the 7 shared domains, for whichever discipline's judge the caller invokes. No new Korean keyword,
// no new doctrine. TIMING is deliberately excluded here — it is a SUPPORTING judgment, never the
// primary "asked matter" a question routes to. ─────────────────────────────────────────────────────
const ASKED_MATTER_TO_DOMAIN: Partial<Record<string, ConsultationJudgeDomain>> = {
  BUSINESS: 'BUSINESS', STARTUP: 'BUSINESS', MONEY: 'MONEY',
  JOB_CHANGE: 'CAREER', OCCUPATION: 'CAREER',
  MARRIAGE: 'LOVE', ROMANCE: 'LOVE', REUNION: 'REUNION',
  RELOCATION: 'CHANGE',
};
const AXIS_TO_DOMAIN: Partial<Record<JudgmentDomain, ConsultationJudgeDomain>> = {
  OPPORTUNITY: 'BUSINESS', MONEY_INFLOW: 'MONEY', MONEY_RETENTION: 'MONEY', CAREER: 'CAREER',
  RELATION_BOND: 'LOVE', RELATION_STABILITY: 'LOVE', MOVEMENT: 'CHANGE',
};

/**
 * Which of the 7 domains a question's already-resolved routing (`askedTarget`/`questionDomain`) names
 * as its PRIMARY matter, or `null` when the question names none of them (e.g. HEALTH_ENERGY/CONFLICT/
 * DECISION/GENERAL — genuinely outside this V1's 7 domains, not silently forced into one).
 */
export function routeConsultationJudgeDomain(
  askedTarget: { key: string } | null | undefined, questionDomain: JudgmentDomain,
): ConsultationJudgeDomain | null {
  if (askedTarget?.key.startsWith('ASKED_MATTER:')) {
    const mapped = ASKED_MATTER_TO_DOMAIN[askedTarget.key.slice('ASKED_MATTER:'.length)];
    if (mapped) return mapped;
  }
  return AXIS_TO_DOMAIN[questionDomain] ?? null;
}
