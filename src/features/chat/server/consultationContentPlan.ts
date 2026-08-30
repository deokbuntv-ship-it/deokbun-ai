// CONSULTATION EXPRESSION ARCHITECTURE V1 (+ QUALITY-94 DEVELOPMENT REPAIR) — a pure, deterministic
// presentation layer between the already-computed Cross Judge verdict and the LLM prompt. It is NOT a new
// divination authority: it may only select, prioritize, order, group, and label material `CrossDivinationVerdict`
// already carries. It never computes a new fact, never changes `verdict.direction`, never invents a date, and
// never turns an INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE verdict into certainty (that guarantee stays with
// `applyVerdictAuthorityClamp`, downstream and untouched).
//
// REPAIR NOTE (dev verification round 1, 25 cases): the original selector allowed up to 4 supporting + 4
// counter = 8 items — a confirmed budget-contract violation (design intent was 2–4 TOTAL). Fixed here to a
// hard cap of 4 TOTAL, of which at most 1 is counter-evidence, never forced when none is materially relevant.
// Also: evidence was ranked by a coarse NATAL-vs-not binary; replaced with an explicit NATAL/PERIOD/CURRENT
// role so a baseline question ("체질이 있나?") and a current-execution question ("지금 해도 되나?") on the
// SAME chart genuinely rank different evidence first. Selected items are now reshaped into a compact,
// presentation-ready `ContentPlanEvidenceItem` (role/domain/temporalRole/anchor/meaning) rather than passing
// the raw engine-shaped `JudgmentEvidence` straight through, so the renderer never has to guess which raw
// fields matter. A `synthesis` field surfaces the verdict's OWN agreement/scope-separation material so the
// renderer can express what the systems jointly imply, instead of a flat per-system list. The directive text
// itself was shortened and re-framed (direct-answer-first, facets as optional reference not a checklist) to
// reduce prompt bulk/competing instructions — investigated as a plausible contributor to SEMANTIC_REJECTED.
import {
  type CrossDivinationVerdict, type JudgmentEvidence, type TemporalScope, type JudgmentDomain,
  routeConsultationJudgeDomain, type ConsultationJudgeDomain,
  isDeclinedToDecide,
} from '@/features/divination';

export type ContentDomain = ConsultationJudgeDomain | 'GENERAL';

export type DomainFacet = { key: string; label: string };

// Content PRIORITY MAPS (§3) — which aspects of an already-grounded answer to explain first, per domain.
// Pure structure: no divination content lives here, only which facets matter for this kind of question. Only
// the first 3 are ever rendered (renderContentPlanDirective) — kept as a slightly longer reference list here
// so a future domain need doesn't require redesigning the type, but the directive never shows more than 3.
const DOMAIN_FACETS: Record<ContentDomain, readonly DomainFacet[]> = {
  BUSINESS: [
    { key: 'fit', label: '사업 체질/적합성' },
    { key: 'timing', label: '현재 실행 타이밍' },
    { key: 'monetization', label: '수익화 경로' },
    { key: 'scalability', label: '확장 가능성' },
    { key: 'operatingRisk', label: '운영 부담/리스크' },
  ],
  MONEY: [
    { key: 'earningCapacity', label: '수입 창출력' },
    { key: 'timing', label: '시기' },
    { key: 'pathway', label: '재물이 들어오는 경로' },
    { key: 'retention', label: '축적/유지' },
    { key: 'leakage', label: '누수/리스크' },
  ],
  CAREER: [
    { key: 'orgFit', label: '조직 적합성' },
    { key: 'currentDecision', label: '현재 결정' },
    { key: 'expertise', label: '전문성/역할' },
    { key: 'independence', label: '독립·이직 성향' },
    { key: 'movementPressure', label: '이동/변화 압력' },
  ],
  LOVE: [
    { key: 'opening', label: '만남/시작' },
    { key: 'stability', label: '안정성' },
    { key: 'attraction', label: '끌림' },
    { key: 'conflictPattern', label: '갈등 패턴' },
    { key: 'longTerm', label: '장기 가능성' },
  ],
  REUNION: [
    { key: 'contactPossibility', label: '연락 가능성' },
    { key: 'actualReunion', label: '실제 재회' },
    { key: 'reconnection', label: '재접촉' },
    { key: 'postReunionStability', label: '재회 후 안정성' },
  ],
  CHANGE: [
    { key: 'feasibility', label: '실행 가능성' },
    { key: 'timing', label: '시기' },
    { key: 'pressure', label: '변화 압력' },
    { key: 'downside', label: '하방 리스크' },
  ],
  TIMING: [
    { key: 'executionWindow', label: '실행 시점' },
    { key: 'natalBaseline', label: '타고난 바탕' },
    { key: 'periodContext', label: '현재 기간의 맥락' },
  ],
  GENERAL: [
    { key: 'overview', label: '전반적 흐름' },
  ],
};

const MAX_RENDERED_FACETS = 3;

/** Which time-layer role this evidence plays, collapsed from the 6-value TemporalScope to the 3 roles the
 *  brief asks to keep distinct: structural baseline, the active multi-year/month period, or the question's
 *  own instant. UNSCOPED evidence is treated as baseline (no period/instant claim to make). */
export type EvidenceRole = 'NATAL' | 'PERIOD' | 'CURRENT';
function roleOf(scope: TemporalScope): EvidenceRole {
  if (scope === 'PRESENT_MOMENT') return 'CURRENT';
  if (scope === 'DAEWOON' || scope === 'SEWOON' || scope === 'WOLWOON') return 'PERIOD';
  return 'NATAL'; // NATAL, UNSCOPED
}

/** Compact, presentation-ready evidence — reshaped from the raw engine-vocabulary JudgmentEvidence so the
 *  renderer works from a small, labeled structure instead of guessing which raw fields to use (§3). Every
 *  field traces to an existing JudgmentEvidence atom; nothing here is computed or inferred. */
export type ContentPlanEvidenceItem = {
  role: 'SUPPORTING' | 'COUNTER';
  domain: JudgmentDomain;
  temporalRole: EvidenceRole;
  anchor: string; // JudgmentEvidence.fact — engine-traceable, short
  meaning: string; // JudgmentEvidence.meaning — plain Korean
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
  /** What the Cross verdict's own agreement/scope-separation material says — raw material for the renderer
   *  to actually synthesize from (§6), never a new conclusion. Both fields are direct verdict passthroughs. */
  synthesis: { agreement: string | null; scopeSeparation: { conflict: string; resolution: string } | null } | null;
  facets: readonly DomainFacet[];
  selectedEvidence: readonly ContentPlanEvidenceItem[];
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

// Structural precedence, not a score: three ordinal category comparisons in a fixed priority order
// (directness, then domain match, then role-relevance to THIS question). No weights, no arithmetic, no
// voting — ties are broken by the next category, never summed. Role-relevance is the §2/§9 fix: a
// timing-flavored question (asksTiming) ranks CURRENT then PERIOD ahead of NATAL; a baseline/fitness
// question ranks NATAL first — so "체질이 있나" and "지금 해도 되나" on the same chart genuinely differ.
const ROLE_PRIORITY_WHEN_ASKING_TIMING: Record<EvidenceRole, number> = { CURRENT: 0, PERIOD: 1, NATAL: 2 };
const ROLE_PRIORITY_WHEN_BASELINE: Record<EvidenceRole, number> = { NATAL: 0, PERIOD: 1, CURRENT: 2 };

function evidenceRank(e: JudgmentEvidence, domain: ContentDomain, asksTiming: boolean): readonly [number, number, number] {
  const domainMatch = JUDGMENT_TO_CONTENT_DOMAIN[e.domain] === domain ? 0 : 1;
  const roleRank = (asksTiming ? ROLE_PRIORITY_WHEN_ASKING_TIMING : ROLE_PRIORITY_WHEN_BASELINE)[roleOf(e.temporalScope)];
  return [DIRECTNESS_RANK[e.directness], domainMatch, roleRank];
}

function compareRank(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function toItem(e: JudgmentEvidence, role: 'SUPPORTING' | 'COUNTER'): ContentPlanEvidenceItem {
  return { role, domain: e.domain, temporalRole: roleOf(e.temporalScope), anchor: e.fact, meaning: e.meaning };
}

// §1 REPAIR — the confirmed budget-contract defect: TOTAL selected evidence must never exceed 4, and
// counter-evidence is included ONLY when the risk pool is non-empty (never forced), capped at 1 of the 4 so
// it is preserved (§7's "must not hide disagreement") without ever crowding out the direct answer.
const MAX_TOTAL_EVIDENCE = 4;
const MAX_COUNTER_EVIDENCE = 1;

/** Deterministically ranks and slices the verdict's OWN evidence pools — selects, never invents. Total
 *  output is always <= MAX_TOTAL_EVIDENCE, with at most MAX_COUNTER_EVIDENCE counter items. */
export function selectEvidence(verdict: CrossDivinationVerdict, domain: ContentDomain): ContentPlanEvidenceItem[] {
  const rankOf = (e: JudgmentEvidence) => evidenceRank(e, domain, verdict.asksTiming);
  const bySelectorRank = (a: JudgmentEvidence, b: JudgmentEvidence) => compareRank(rankOf(a), rankOf(b));
  const counter = [...verdict.riskFactors].sort(bySelectorRank).slice(0, MAX_COUNTER_EVIDENCE);
  const supportBudget = MAX_TOTAL_EVIDENCE - counter.length;
  const supporting = [...verdict.favorableFactors].sort(bySelectorRank).slice(0, supportBudget);
  return [...supporting.map((e) => toItem(e, 'SUPPORTING')), ...counter.map((e) => toItem(e, 'COUNTER'))];
}

function buildSynthesis(verdict: CrossDivinationVerdict): ConsultationContentPlan['synthesis'] {
  const agreement = verdict.agreementPoints[0] ?? null;
  const resolution = verdict.contradictionResolutions[0];
  const scopeSeparation = resolution ? { conflict: resolution.conflict, resolution: resolution.resolution } : null;
  return agreement || scopeSeparation ? { agreement, scopeSeparation } : null;
}

/** Pure: builds the plan from the verdict alone. Same verdict in ⇒ same plan out, every time. */
export function buildConsultationContentPlan(verdict: CrossDivinationVerdict): ConsultationContentPlan {
  const domain: ContentDomain = routeConsultationJudgeDomain(undefined, verdict.questionDomain) ?? 'GENERAL';
  const declined = isDeclinedToDecide(verdict);
  const selectedEvidence = selectEvidence(verdict, domain);
  const hasCounter = selectedEvidence.some((e) => e.role === 'COUNTER');

  const mustNotClaim: string[] = [];
  if (declined) mustNotClaim.push('방향이 정해지지 않은 판정을 확정된 결론처럼 말하지 말 것');
  if (!verdict.timingConclusion) mustNotClaim.push('근거 없는 정확한 날짜·시점을 새로 만들지 말 것');
  if (verdict.confidence === 'LOW') mustNotClaim.push('낮은 확신을 과장된 확신으로 바꾸지 말 것');
  if (hasCounter) mustNotClaim.push('반대·주의 근거를 숨기거나 결론에 유리하게 지우지 말 것');

  return {
    domain,
    proposition: verdict.question,
    verdictState: declined ? 'DECLINED' : 'DIRECTIONAL',
    directAnswerIntent: verdict.primaryConclusion,
    coreTension: verdict.contradictionPoints[0] ?? verdict.contradictionResolutions[0]?.conflict ?? null,
    natalBaseline: verdict.natalBaseline,
    periodContext: verdict.currentFlow,
    timingConclusion: verdict.timingConclusion,
    synthesis: buildSynthesis(verdict),
    facets: DOMAIN_FACETS[domain],
    selectedEvidence,
    mustNotClaim,
    actionBoundary: declined || verdict.confidence === 'LOW' ? 'CAUTIOUS' : 'GUIDED',
    provenance: ['deokbunai.consultation-content-plan.v1'],
  };
}

/** Renders the plan as the CONTROLLED RENDERER's directive text. Shortened from round 1: direct-answer-first
 *  framing up top, facets capped to 3 and phrased as optional reference (never a checklist that could crowd
 *  out a direct answer, §4), a bounded evidence list (<=4 total, §1), and an explicit cross-synthesis
 *  instruction built only from the verdict's own agreement/scope-separation material (§6). */
export function renderContentPlanDirective(plan: ConsultationContentPlan): string {
  const lines: string[] = [
    '[콘텐츠 계획 — 서버가 이미 선별한 초점. 무엇보다 먼저 사용자의 질문에 직접 답하십시오.]',
  ];
  const topFacets = plan.facets.slice(0, MAX_RENDERED_FACETS).map((f) => f.label).join(', ');
  lines.push(`· 질문 영역: ${plan.domain}. 관련이 있는 만큼만 참고하십시오 — ${topFacets}`);

  if (plan.selectedEvidence.length > 0) {
    lines.push('· 구체적으로 반영할 근거 (아래 목록 안에서만, 새로 만들지 마십시오):');
    for (const e of plan.selectedEvidence) {
      const tag = e.role === 'COUNTER' ? '반대/주의' : '뒷받침';
      lines.push(`  - [${tag}] ${e.meaning} (근거: ${e.anchor})`);
    }
  }

  if (plan.synthesis) {
    const parts: string[] = [];
    if (plan.synthesis.agreement) parts.push(`일치: ${plan.synthesis.agreement}`);
    if (plan.synthesis.scopeSeparation) {
      parts.push(`영역 분리: ${plan.synthesis.scopeSeparation.conflict} → ${plan.synthesis.scopeSeparation.resolution}`);
    }
    lines.push(
      `· 체계를 합쳐서 실제로 무엇을 뜻하는지 종합하십시오 (${parts.join(' / ')}). "명리는 A, 자미는 B"처럼 나열만 하지 마십시오.`,
    );
  }

  if (plan.mustNotClaim.length > 0) {
    lines.push(`· 하지 말아야 할 것: ${plan.mustNotClaim.join(' / ')}`);
  }
  return lines.join('\n');
}
