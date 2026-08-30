// CONSULTATION EXPRESSION ARCHITECTURE V1 (+ QUALITY-94 REPAIR + AUDIT-DRIVEN REMEDIATION V1) — a pure,
// deterministic presentation layer between the already-computed Cross Judge verdict and the LLM prompt/final
// answer. It is NOT a new divination authority: it may only select, prioritize, order, group, and label
// material `CrossDivinationVerdict` already carries. It never computes a new fact, never changes
// `verdict.direction`, never invents a date, and never turns an INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE
// verdict into certainty.
//
// AUDIT-DRIVEN REMEDIATION V1 (independent 30-case holdout, root cause 1): the LLM was free to author the
// final "전문근거" (technical evidence) prose from scratch, so even with a correctly-curated evidence
// DIRECTIVE it could still invent/substitute palace·star identities (phantom 관록/화기, 부처→명궁 swaps).
// A prompt instruction ("do not fabricate") cannot structurally prevent this. Fixed here by introducing a
// VerifiedEvidenceCatalog — server-materialized, discipline-attributed evidence with stable IDs (E1..E4) —
// and a deterministic renderer (`renderVerifiedEvidenceSection`) that produces the ACTUAL technical evidence
// shown to the user directly from this catalog, with no LLM step in between. The LLM still writes the
// plain-language synthesis prose (coreInterpretation/domainInterpretation) exactly as before; it simply no
// longer has authority over which technical entity relationships reach the user.
import {
  type CrossDivinationVerdict, type JudgmentEvidence, type TemporalScope, type JudgmentDomain,
  type Discipline, type DivinationJudgment,
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

const DISCIPLINE_LABEL: Record<Discipline, string> = { MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑' };

/** VerifiedEvidenceCatalog item (§ Primary Architectural Change) — server-materialized, discipline-attributed
 *  evidence with a stable local id. Every field traces to an existing JudgmentEvidence atom plus the
 *  DivinationJudgment it came from; nothing here is computed, inferred, or LLM-authored. */
export type VerifiedEvidenceCatalogItem = {
  id: string; // E1, E2, E3, E4 — stable within one plan, in final selected order
  discipline: Discipline;
  domain: JudgmentDomain;
  temporalScope: TemporalScope;
  temporalRole: EvidenceRole; // derived convenience over temporalScope, used for ranking/tests
  evidenceRole: 'SUPPORTING' | 'COUNTER';
  provenance: string; // e.g. "MYUNGRI:directEvidence" — which discipline judgment array this came from
  canonicalTechnicalAnchor: string; // JudgmentEvidence.fact, engine vocabulary, verbatim
  canonicalMeaning: string; // JudgmentEvidence.meaning, plain Korean, verbatim and NEVER truncated
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
   *  to actually synthesize from (§6), never a new conclusion. ALL agreement points and ALL contradiction
   *  resolutions are carried (not just the first) so a material stance is never silently dropped (§9). */
  synthesis: { agreements: readonly string[]; scopeSeparations: readonly { conflict: string; resolution: string }[] } | null;
  facets: readonly DomainFacet[];
  selectedEvidence: readonly VerifiedEvidenceCatalogItem[];
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
// voting — ties are broken by the next category, never summed. Role-relevance: a timing-flavored question
// (asksTiming) ranks CURRENT then PERIOD ahead of NATAL; a baseline/fitness question ranks NATAL first — so
// "체질이 있나" and "지금 해도 되나" on the same chart genuinely select different evidence first.
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

type PooledEvidence = { evidence: JudgmentEvidence; discipline: Discipline; provenance: string };

// SERVER OWNS TECHNICAL FACT IDENTITY (§1/§2) — the pool is drawn from each APPLICABLE discipline's OWN
// judgment (`disciplineJudgments[].directEvidence/counterEvidence/timingSignals`), never from a
// discipline-less flattened list, so every catalog item is attributable to the exact discipline that
// computed it. This is a straight relabeling/regrouping of existing DivinationJudgment output — no new fact,
// no new Judge.
function pooledEvidence(verdict: CrossDivinationVerdict): { supporting: PooledEvidence[]; counter: PooledEvidence[] } {
  const supporting: PooledEvidence[] = [];
  const counter: PooledEvidence[] = [];
  for (const j of verdict.disciplineJudgments as DivinationJudgment[]) {
    if (!j.applicable) continue;
    for (const e of j.directEvidence) supporting.push({ evidence: e, discipline: j.discipline, provenance: `${j.discipline}:directEvidence` });
    if (verdict.asksTiming) {
      for (const e of j.timingSignals) supporting.push({ evidence: e, discipline: j.discipline, provenance: `${j.discipline}:timingSignals` });
    }
    for (const e of j.counterEvidence) counter.push({ evidence: e, discipline: j.discipline, provenance: `${j.discipline}:counterEvidence` });
  }
  return { supporting, counter };
}

// §1 REPAIR (quality-94 batch) — TOTAL selected evidence must never exceed 4, and counter-evidence is
// included ONLY when the risk pool is non-empty (never forced), capped at 1 of the 4 so it is preserved
// (must not hide disagreement) without ever crowding out the direct answer.
const MAX_TOTAL_EVIDENCE = 4;
const MAX_COUNTER_EVIDENCE = 1;

/** Deterministically ranks and slices the verdict's OWN per-discipline evidence into a VerifiedEvidenceCatalog
 *  — selects and attributes, never invents. Total output is always <= MAX_TOTAL_EVIDENCE, with at most
 *  MAX_COUNTER_EVIDENCE counter items, each carrying a stable id (E1..E4) in final selected order. */
export function selectEvidence(verdict: CrossDivinationVerdict, domain: ContentDomain): VerifiedEvidenceCatalogItem[] {
  const { supporting, counter } = pooledEvidence(verdict);
  const rankOf = (p: PooledEvidence) => evidenceRank(p.evidence, domain, verdict.asksTiming);
  const byRank = (a: PooledEvidence, b: PooledEvidence) => compareRank(rankOf(a), rankOf(b));
  const counterPicked = [...counter].sort(byRank).slice(0, MAX_COUNTER_EVIDENCE);
  const supportBudget = MAX_TOTAL_EVIDENCE - counterPicked.length;
  const supportPicked = [...supporting].sort(byRank).slice(0, supportBudget);
  const toCatalogItem = (p: PooledEvidence, evidenceRoleTag: 'SUPPORTING' | 'COUNTER', index: number): VerifiedEvidenceCatalogItem => ({
    id: `E${index + 1}`,
    discipline: p.discipline,
    domain: p.evidence.domain,
    temporalScope: p.evidence.temporalScope,
    temporalRole: roleOf(p.evidence.temporalScope),
    evidenceRole: evidenceRoleTag,
    provenance: p.provenance,
    canonicalTechnicalAnchor: p.evidence.fact,
    canonicalMeaning: p.evidence.meaning,
  });
  const ordered = [...supportPicked.map((p) => ({ p, tag: 'SUPPORTING' as const })), ...counterPicked.map((p) => ({ p, tag: 'COUNTER' as const }))];
  return ordered.map(({ p, tag }, i) => toCatalogItem(p, tag, i));
}

function buildSynthesis(verdict: CrossDivinationVerdict): ConsultationContentPlan['synthesis'] {
  const agreements = verdict.agreementPoints;
  const scopeSeparations = verdict.contradictionResolutions.map((r) => ({ conflict: r.conflict, resolution: r.resolution }));
  return agreements.length > 0 || scopeSeparations.length > 0 ? { agreements, scopeSeparations } : null;
}

/** Pure: builds the plan from the verdict alone. Same verdict in ⇒ same plan out, every time. */
export function buildConsultationContentPlan(verdict: CrossDivinationVerdict): ConsultationContentPlan {
  const domain: ContentDomain = routeConsultationJudgeDomain(undefined, verdict.questionDomain) ?? 'GENERAL';
  const declined = isDeclinedToDecide(verdict);
  const selectedEvidence = selectEvidence(verdict, domain);
  const hasCounter = selectedEvidence.some((e) => e.evidenceRole === 'COUNTER');

  const mustNotClaim: string[] = [];
  if (declined) mustNotClaim.push('방향이 정해지지 않은 판정을 확정된 결론처럼 말하지 말 것');
  if (verdict.timingConclusion) {
    // §10 TIMING FIDELITY — a timing conclusion WAS supplied; the renderer must not claim there is none.
    mustNotClaim.push('이미 제공된 시기 근거가 있으므로 "시기 근거가 없다"고 말하지 말 것');
  } else {
    mustNotClaim.push('근거 없는 정확한 날짜·시점을 새로 만들지 말 것');
  }
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

/** Renders the plan as the CONTROLLED RENDERER's PROMPT directive text (what the LLM sees while composing
 *  its plain-language synthesis). This is advisory context for the LLM's prose — the AUTHORITATIVE technical
 *  evidence the user actually sees comes from `renderVerifiedEvidenceSection` below, not from anything the
 *  LLM does with this directive. Direct-answer-first framing up top, facets capped to 3 and phrased as
 *  optional reference (never a checklist that could crowd out a direct answer), a bounded evidence list
 *  (<=4 total), and an explicit, COMPLETE cross-synthesis instruction (all agreement/scope-separation
 *  material, never truncated to one item so a material discipline contribution is never silently erased). */
export function renderContentPlanDirective(plan: ConsultationContentPlan): string {
  const lines: string[] = [
    '[콘텐츠 계획 — 서버가 이미 선별한 초점. 무엇보다 먼저 사용자의 질문에 직접 답하십시오.]',
  ];
  const topFacets = plan.facets.slice(0, MAX_RENDERED_FACETS).map((f) => f.label).join(', ');
  lines.push(`· 질문 영역: ${plan.domain}. 관련이 있는 만큼만 참고하십시오 — ${topFacets}`);

  if (plan.selectedEvidence.length > 0) {
    lines.push('· 참고할 근거 (자연스러운 설명을 위한 참고용 — 정확한 기술 근거는 서버가 별도로 표시합니다):');
    for (const e of plan.selectedEvidence) {
      const tag = e.evidenceRole === 'COUNTER' ? '반대/주의' : '뒷받침';
      lines.push(`  - [${tag}] ${e.canonicalMeaning}`);
    }
  }

  if (plan.synthesis) {
    const parts: string[] = [];
    if (plan.synthesis.agreements.length > 0) parts.push(`일치: ${plan.synthesis.agreements.join(' / ')}`);
    for (const s of plan.synthesis.scopeSeparations) parts.push(`영역 분리: ${s.conflict} → ${s.resolution}`);
    lines.push(
      `· 체계를 합쳐서 실제로 무엇을 뜻하는지 전부 반영해 종합하십시오 (${parts.join(' / ')}). 일부만 골라 쓰지 말고, "명리는 A, 자미는 B"처럼 나열만 하지도 마십시오.`,
    );
  }

  if (plan.mustNotClaim.length > 0) {
    lines.push(`· 하지 말아야 할 것: ${plan.mustNotClaim.join(' / ')}`);
  }
  // GROUNDED_NARRATIVE_V2 §4/§10 — the LANGUAGE is yours; the technical/시기 FACTS are not. The server gate
  // enforces this deterministically after the fact, so stating it here is what keeps a compliant answer
  // from being rewritten into the deterministic composition unnecessarily.
  lines.push(
    '· 위·아래에 제공된 근거에 실제로 나온 표현이 아니면, 전문 용어(궁·성·화·문·신·십신·간지·원국/대운/세운/월운 같은 시기 층)를 새로 만들어 쓰지 마십시오. 정확한 기술 근거는 서버가 따로 붙입니다 — 당신은 그 뜻을 쉬운 말로 풀어 주면 됩니다.',
  );
  lines.push(
    plan.timingConclusion
      ? '· 앞으로의 흐름은 위에 주어진 시기 근거 안에서만 쓰고, "28~37세" 같은 나이 구간은 근거에 그대로 나온 것만 쓰십시오.'
      : '· 시기 근거가 없으므로 "앞으로의 흐름"은 비워 두십시오. 나이 구간·연도·대운 구간을 만들어 채우지 마십시오.',
  );
  return lines.join('\n');
}

/** SERVER-MATERIALIZED "전문근거" (§1/§2/§3) — the ACTUAL technical evidence shown to the user, built
 *  directly from the VerifiedEvidenceCatalog with NO LLM step. Each item's meaning is rendered whole, never
 *  split (§8 atomic stance — a two-clause meaning like "가능성은 있지만 지금은 아닙니다" survives intact). The
 *  LLM cannot alter, recombine, or invent a technical entity relationship here: this function is the only
 *  thing that writes it, and it only ever echoes `canonicalMeaning`/`canonicalTechnicalAnchor` verbatim. */
export function renderVerifiedEvidenceSection(catalog: readonly VerifiedEvidenceCatalogItem[]): { title: string; body: string }[] {
  return catalog.map((e) => ({
    title: `전문근거 · ${DISCIPLINE_LABEL[e.discipline]} (${e.id})`,
    body: `${e.canonicalMeaning} (근거: ${e.canonicalTechnicalAnchor})`,
  }));
}
