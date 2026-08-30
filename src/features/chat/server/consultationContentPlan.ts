// CONSULTATION EXPRESSION ARCHITECTURE V1 — a pure, deterministic presentation layer that sits between the
// already-computed Cross Judge verdict and the LLM prompt. It is NOT a new divination authority: it may only
// select, prioritize, order, group, and label material `CrossDivinationVerdict` already carries. It never
// computes a new fact, never changes `verdict.direction`, never invents a date, and never turns an
// INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE verdict into certainty (that guarantee stays with
// `applyVerdictAuthorityClamp`, downstream and untouched — this layer runs strictly before it, at prompt
// construction, and cannot see or affect the LLM's actual output).
//
// Root cause this addresses (see buildServerConsultation.ts's buildMessages): the prompt used to hand the
// LLM every available evidence line (`renderEvidenceDirective` over the FULL `evidenceReferences` list) and
// ask it, in one prose sentence, to pick 1–3 relevant ones — discarding each JudgmentEvidence atom's own
// `domain`/`temporalScope`/`directness` metadata at the render boundary instead of using it to select. This
// module uses that metadata to pick a bounded, question-relevant slice deterministically, and adds a small,
// domain-aware set of facets to prioritize (a content PRIORITY MAP — labels only, never prose templates).
import {
  type CrossDivinationVerdict, type JudgmentEvidence,
  routeConsultationJudgeDomain, type ConsultationJudgeDomain,
  isDeclinedToDecide,
} from '@/features/divination';

export type ContentDomain = ConsultationJudgeDomain | 'GENERAL';

export type DomainFacet = { key: string; label: string };

// Content PRIORITY MAPS (§3) — which aspects of an already-grounded answer to explain first, per domain.
// Pure structure: no divination content lives here, only which facets matter for this kind of question.
const DOMAIN_FACETS: Record<ContentDomain, readonly DomainFacet[]> = {
  BUSINESS: [
    { key: 'fit', label: '사업 체질/적합성' },
    { key: 'monetization', label: '수익화 경로' },
    { key: 'scalability', label: '확장 가능성' },
    { key: 'operatingRisk', label: '운영 부담/리스크' },
    { key: 'timing', label: '현재 실행 타이밍' },
  ],
  MONEY: [
    { key: 'earningCapacity', label: '수입 창출력' },
    { key: 'pathway', label: '재물이 들어오는 경로' },
    { key: 'retention', label: '축적/유지' },
    { key: 'leakage', label: '누수/리스크' },
    { key: 'timing', label: '시기' },
  ],
  CAREER: [
    { key: 'orgFit', label: '조직 적합성' },
    { key: 'expertise', label: '전문성/역할' },
    { key: 'independence', label: '독립·이직 성향' },
    { key: 'movementPressure', label: '이동/변화 압력' },
    { key: 'currentDecision', label: '현재 결정' },
  ],
  LOVE: [
    { key: 'opening', label: '만남/시작' },
    { key: 'attraction', label: '끌림' },
    { key: 'conflictPattern', label: '갈등 패턴' },
    { key: 'stability', label: '안정성' },
    { key: 'longTerm', label: '장기 가능성' },
  ],
  REUNION: [
    { key: 'contactPossibility', label: '연락 가능성' },
    { key: 'reconnection', label: '재접촉' },
    { key: 'actualReunion', label: '실제 재회' },
    { key: 'postReunionStability', label: '재회 후 안정성' },
  ],
  CHANGE: [
    { key: 'pressure', label: '변화 압력' },
    { key: 'feasibility', label: '실행 가능성' },
    { key: 'downside', label: '하방 리스크' },
    { key: 'timing', label: '시기' },
  ],
  TIMING: [
    { key: 'natalBaseline', label: '타고난 바탕' },
    { key: 'periodContext', label: '현재 기간의 맥락' },
    { key: 'executionWindow', label: '실행 시점' },
  ],
  GENERAL: [
    { key: 'overview', label: '전반적 흐름' },
  ],
};

export type ConsultationContentPlan = {
  domain: ContentDomain;
  proposition: string;
  verdictState: 'DIRECTIONAL' | 'DECLINED';
  directAnswerIntent: string;
  coreTension: string | null;
  natalBaseline: string | null;
  periodContext: string | null;
  timingConclusion: string | null;
  facets: readonly DomainFacet[];
  selectedEvidence: readonly JudgmentEvidence[];
  counterEvidence: readonly JudgmentEvidence[];
  mustExplain: readonly string[];
  mustNotClaim: readonly string[];
  actionBoundary: 'GUIDED' | 'CAUTIOUS';
  provenance: readonly ['deokbunai.consultation-content-plan.v1'];
};

// 14-value JudgmentDomain → the 7 content domains, mirroring consultationJudgeCore's own AXIS_TO_DOMAIN so
// "does this evidence match the question's domain" agrees with how the judges already group axes.
const JUDGMENT_TO_CONTENT_DOMAIN: Partial<Record<string, ContentDomain>> = {
  OPPORTUNITY: 'BUSINESS', MONEY_INFLOW: 'MONEY', MONEY_RETENTION: 'MONEY', CAREER: 'CAREER',
  RELATION_BOND: 'LOVE', RELATION_STABILITY: 'LOVE', MOVEMENT: 'CHANGE', TIMING: 'TIMING',
};

const DIRECTNESS_RANK: Record<JudgmentEvidence['directness'], number> = { DIRECT: 0, ADJACENT: 1, GENERAL: 2 };
const TIMING_SCOPES = new Set<JudgmentEvidence['temporalScope']>(['PRESENT_MOMENT', 'WOLWOON', 'SEWOON', 'DAEWOON']);

// Structural precedence, not a score: three ordinal category comparisons in fixed priority order
// (directness, then domain match, then temporal relevance to the asked question). No weights, no
// arithmetic, no voting — ties are broken by the next category, never summed.
function evidenceRank(e: JudgmentEvidence, domain: ContentDomain, asksTiming: boolean): readonly [number, number, number] {
  const domainMatch = JUDGMENT_TO_CONTENT_DOMAIN[e.domain] === domain ? 0 : 1;
  const temporalMatch = asksTiming
    ? (TIMING_SCOPES.has(e.temporalScope) ? 0 : 1)
    : (e.temporalScope === 'NATAL' ? 0 : 1);
  return [DIRECTNESS_RANK[e.directness], domainMatch, temporalMatch];
}

function compareRank(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

const MAX_EVIDENCE_PER_SIDE = 4;

/** Deterministically ranks and slices the verdict's OWN evidence pools — selects, never invents. */
export function selectEvidence(
  verdict: CrossDivinationVerdict, domain: ContentDomain,
): { supporting: JudgmentEvidence[]; counter: JudgmentEvidence[] } {
  const rankOf = (e: JudgmentEvidence) => evidenceRank(e, domain, verdict.asksTiming);
  const bySelectorRank = (a: JudgmentEvidence, b: JudgmentEvidence) => compareRank(rankOf(a), rankOf(b));
  return {
    supporting: [...verdict.favorableFactors].sort(bySelectorRank).slice(0, MAX_EVIDENCE_PER_SIDE),
    counter: [...verdict.riskFactors].sort(bySelectorRank).slice(0, MAX_EVIDENCE_PER_SIDE),
  };
}

/** Pure: builds the plan from the verdict alone. Same verdict in ⇒ same plan out, every time. */
export function buildConsultationContentPlan(verdict: CrossDivinationVerdict): ConsultationContentPlan {
  const domain: ContentDomain = routeConsultationJudgeDomain(undefined, verdict.questionDomain) ?? 'GENERAL';
  const declined = isDeclinedToDecide(verdict);
  const { supporting, counter } = selectEvidence(verdict, domain);
  const facets = DOMAIN_FACETS[domain];

  const mustExplain: string[] = ['사용자의 질문에 대한 직접적인 답', ...facets.slice(0, 3).map((f) => f.label)];

  const mustNotClaim: string[] = [];
  if (declined) mustNotClaim.push('방향이 정해지지 않은 판정을 확정된 결론처럼 말하지 말 것');
  if (!verdict.timingConclusion) mustNotClaim.push('근거 없는 정확한 날짜·시점을 새로 만들지 말 것');
  if (verdict.confidence === 'LOW') mustNotClaim.push('낮은 확신을 과장된 확신으로 바꾸지 말 것');
  if (counter.length > 0) mustNotClaim.push('반대·주의 근거를 숨기거나 결론에 유리하게 지우지 말 것');

  return {
    domain,
    proposition: verdict.question,
    verdictState: declined ? 'DECLINED' : 'DIRECTIONAL',
    directAnswerIntent: verdict.primaryConclusion,
    coreTension: verdict.contradictionPoints[0] ?? verdict.contradictionResolutions[0]?.conflict ?? null,
    natalBaseline: verdict.natalBaseline,
    periodContext: verdict.currentFlow,
    timingConclusion: verdict.timingConclusion,
    facets,
    selectedEvidence: supporting,
    counterEvidence: counter,
    mustExplain,
    mustNotClaim,
    actionBoundary: declined || verdict.confidence === 'LOW' ? 'CAUTIOUS' : 'GUIDED',
    provenance: ['deokbunai.consultation-content-plan.v1'],
  };
}

/** Renders the plan as the CONTROLLED RENDERER's directive text — replaces the old dump-everything evidence
 *  directive. Emits `meaning` (plain Korean) first with `fact` only as a short technical anchor, matching the
 *  existing verdict/evidence directives' proven-safe phrasing (never raw engine jargon as the lead phrase). */
export function renderContentPlanDirective(plan: ConsultationContentPlan): string {
  const lines: string[] = ['[콘텐츠 계획 — 이번 답변이 우선적으로 다뤄야 할 초점 (서버가 이미 선별함)]'];
  lines.push(`· 질문 영역: ${plan.domain} — 다음 관점을 우선순위로 설명하십시오: ${plan.facets.map((f) => f.label).join(', ')}`);
  if (plan.selectedEvidence.length > 0) {
    lines.push('· 이번 답변에 구체적으로 반영할 근거 (아래 목록 안에서만 사용, 새로 만들지 마십시오):');
    for (const e of plan.selectedEvidence) lines.push(`  - ${e.meaning} (근거: ${e.fact})`);
  }
  if (plan.counterEvidence.length > 0) {
    lines.push('· 함께 보존해야 할 반대/주의 근거 (결론을 깔끔하게 보이려고 감추지 마십시오):');
    for (const e of plan.counterEvidence) lines.push(`  - ${e.meaning} (근거: ${e.fact})`);
  }
  if (plan.mustNotClaim.length > 0) {
    lines.push(`· 하지 말아야 할 것: ${plan.mustNotClaim.join(' / ')}`);
  }
  return lines.join('\n');
}
