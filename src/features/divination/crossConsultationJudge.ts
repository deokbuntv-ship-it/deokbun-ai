// CROSS DIVINATION JUDGE V1 (consultation layer) — synthesizes Myungri's/Ziwei's/Qimen's already-computed
// consultation-domain judgments (`DomainJudgeResult`/`QimenDomainJudgeResult`) for the SAME routed domain
// into one proposition-specific compound verdict. Pure, additive, read-only over its three inputs: it never
// recalculates Ten Gods, Yongshin, palace placement, 四化, or the Qimen board/target — it only reads the
// `JudgmentEvidence`/status/conclusion each discipline already emitted.
//
// ROLE CONTRACT (not a vote): MYUNGRI = natal/long-structure, ZIWEI = palace + period structure, QIMEN =
// current question/situation/execution. This module does NOT hardcode "Myungri=baseline" as an authority
// rule — it reads the SCOPE each piece of evidence already carries (`JudgmentEvidence.temporalScope`,
// already emitted by each discipline's own consultation judge) and buckets it into NATAL_BASELINE /
// PERIOD_CONTEXT / CURRENT_SITUATION. In practice Myungri/Ziwei's non-TIMING evidence is NATAL (baseline),
// Ziwei's/Myungri's TIMING evidence is DAEWOON/SEWOON/WOLWOON (period), and Qimen's evidence is always
// PRESENT_MOMENT (current) — but the bucketing is driven by the tag on the evidence, not by which
// discipline produced it, so the SAME scope disagreeing across two disciplines (e.g. Myungri NATAL vs
// Ziwei NATAL) is what surfaces a genuine same-scope contradiction, never a cross-scope one.
//
// NO VOTING, NO SCORE (mirrors `combineStatus` in `consultationJudgeCore.ts`, reused unchanged here): the
// overall status is "does ANY grounded support exist" AND "does ANY grounded counterevidence exist" —
// never a count of how many disciplines said what.
import type { Discipline, JudgmentEvidence, TemporalScope } from './contracts';
import type { DomainJudgeResult, DomainJudgeStatus, SyntheticInference } from './consultationJudgeTypes';
import { combineStatus } from './consultationJudgeCore';
import type { QimenConsultationDomain, QimenDomainJudgeResult } from './qimenConsultationJudge';

export const CROSS_CONSULTATION_JUDGE_V1_METHOD = 'deokbunai.cross-consultation-judge.v1' as const;

export type CrossConsultationScope = 'NATAL_BASELINE' | 'PERIOD_CONTEXT' | 'CURRENT_SITUATION';
export type SystemAvailability = 'AVAILABLE' | 'NOT_APPLICABLE' | 'UNRESOLVED';

export type CrossSystemContribution = {
  system: Discipline;
  availability: SystemAvailability;
  domainStatus: DomainJudgeStatus | null;
  timeScope: CrossConsultationScope | null;
  proposition: string;
  supportingEvidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
  reasoning: string;
};

export type CrossConsultationResult = {
  domain: QimenConsultationDomain;
  questionProposition: string;
  status: DomainJudgeStatus;
  baselineConclusion: string | null;
  periodConclusion: string | null;
  currentSituationConclusion: string | null;
  finalConclusion: string;
  systemContributions: CrossSystemContribution[];
  supportingEvidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
  scopeSeparatedTruths: string[];
  trueContradictions: string[];
  syntheticInferences: SyntheticInference[];
  temporalDrivers: string[];
  uncertaintyReasons: string[];
  reasoningRuleIds: string[];
  provenance: readonly [typeof CROSS_CONSULTATION_JUDGE_V1_METHOD];
};

export type CrossConsultationJudgeInput = {
  domain: QimenConsultationDomain;
  myungri: DomainJudgeResult | null;
  ziwei: DomainJudgeResult | null;
  qimen: QimenDomainJudgeResult | null;
};

type AnyDomainResult = DomainJudgeResult | QimenDomainJudgeResult;
type TaggedEvidence = { discipline: Discipline; scope: CrossConsultationScope; evidence: JudgmentEvidence };

const SCOPES: readonly CrossConsultationScope[] = ['NATAL_BASELINE', 'PERIOD_CONTEXT', 'CURRENT_SITUATION'];
const SCOPE_LABEL: Record<CrossConsultationScope, string> = {
  NATAL_BASELINE: '원국 바탕(장기)', PERIOD_CONTEXT: '지금 대운/세운 흐름(기간)', CURRENT_SITUATION: '지금 이 시점(현재 상황)',
};
const STATUS_LABEL: Record<DomainJudgeStatus, string> = {
  FAVORABLE: '우호적', CAUTION: '주의가 필요', MIXED: '기회와 리스크가 함께 존재', UNRESOLVED: '판단 근거 부족',
};
const DISC_LABEL: Record<Discipline, string> = { MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑' };
const SYSTEM_ROLE_NOTE: Record<Discipline, string> = {
  MYUNGRI: '명리는 원국 구조에 기반한 장기·바탕 판단을 담당합니다.',
  ZIWEI: '자미두수는 명반 궁 구조와 大限 시기 판단을 담당합니다.',
  QIMEN: '기문둔갑은 현재 질문 시점의 상황·실행 판단을 담당합니다.',
};
const QUESTION_PROPOSITION: Record<QimenConsultationDomain, string> = {
  BUSINESS: '사업을 진행·유지하는 것이 구조적으로 적절한가',
  MONEY: '금전적 기회가 있고, 그것을 지킬 수 있는가',
  CAREER: '지금의 진로·직업 방향이 적절한가',
  LOVE: '이 관계가 형성·유지될 수 있는가',
  REUNION: '재회가 가능하고 안정적으로 이어질 수 있는가',
  CHANGE: '변화·이직을 지금 실행해도 되는가',
  EVENT_SUCCESS: '이 사안이 지금 성사될 수 있는가',
  TIMING: '지금이 행동할 시점인가',
};

function crossScope(t: TemporalScope): CrossConsultationScope {
  if (t === 'PRESENT_MOMENT') return 'CURRENT_SITUATION';
  if (t === 'DAEWOON' || t === 'SEWOON' || t === 'WOLWOON') return 'PERIOD_CONTEXT';
  return 'NATAL_BASELINE'; // NATAL, UNSCOPED
}
function systemTemporalDrivers(result: AnyDomainResult): string[] {
  return 'temporalDrivers' in result ? result.temporalDrivers : result.timingDrivers;
}
function systemRuleIds(result: AnyDomainResult): string[] {
  return 'reasoningRuleIds' in result ? result.reasoningRuleIds : result.ruleIds;
}
const uniqueMeanings = (xs: TaggedEvidence[]): string[] => [...new Set(xs.map((t) => t.evidence.meaning))];
function composeScopeText(status: DomainJudgeStatus, supp: TaggedEvidence[], cntr: TaggedEvidence[]): string {
  const s = uniqueMeanings(supp).join(' ');
  const c = uniqueMeanings(cntr).join(' ');
  if (status === 'CAUTION') return c;
  if (status === 'MIXED') return `${s} 다만, ${c}`;
  return s; // FAVORABLE
}
function dedupeByFact(xs: JudgmentEvidence[]): JudgmentEvidence[] {
  const seen = new Set<string>();
  return xs.filter((e) => (seen.has(e.fact) ? false : (seen.add(e.fact), true)));
}

/**
 * Synthesizes Myungri/Ziwei/Qimen's already-computed consultation-domain results for ONE shared routed
 * domain into a single compound cross verdict. Pure, deterministic, no LLM, no randomness — same three
 * inputs always produce the same output. Missing/inapplicable systems never become negative evidence
 * (§25/§26 of the implementation brief): a `null` input is NOT_APPLICABLE, an UNRESOLVED discipline status
 * stays UNRESOLVED, and neither ever contributes to `supportingEvidence`/`counterEvidence`.
 */
export function judgeCrossConsultation(input: CrossConsultationJudgeInput): CrossConsultationResult {
  const systems: { discipline: Discipline; result: AnyDomainResult | null }[] = [
    { discipline: 'MYUNGRI', result: input.myungri },
    { discipline: 'ZIWEI', result: input.ziwei },
    { discipline: 'QIMEN', result: input.qimen },
  ];

  const supportTagged: TaggedEvidence[] = [];
  const counterTagged: TaggedEvidence[] = [];
  for (const { discipline, result } of systems) {
    if (!result) continue;
    for (const e of result.supportingEvidence) supportTagged.push({ discipline, scope: crossScope(e.temporalScope), evidence: e });
    for (const e of result.counterEvidence) counterTagged.push({ discipline, scope: crossScope(e.temporalScope), evidence: e });
  }

  // ── per-scope status/conclusion — the NATAL_BASELINE / PERIOD_CONTEXT / CURRENT_SITUATION contract ──
  const scopeStatus: Record<CrossConsultationScope, DomainJudgeStatus | null> =
    { NATAL_BASELINE: null, PERIOD_CONTEXT: null, CURRENT_SITUATION: null };
  const scopeConclusion: Record<CrossConsultationScope, string | null> =
    { NATAL_BASELINE: null, PERIOD_CONTEXT: null, CURRENT_SITUATION: null };
  for (const scope of SCOPES) {
    const supp = supportTagged.filter((t) => t.scope === scope);
    const cntr = counterTagged.filter((t) => t.scope === scope);
    if (supp.length === 0 && cntr.length === 0) continue;
    const st = combineStatus(supp.length > 0, cntr.length > 0);
    scopeStatus[scope] = st;
    scopeConclusion[scope] = composeScopeText(st, supp, cntr);
  }

  // ── true contradictions (§8/§9): SAME scope, opposing evidence from TWO DIFFERENT disciplines. A
  // discipline's own internal support+counter split is that discipline's own MIXED-ness, not a NEW
  // cross-system finding, so same-discipline pairs are excluded. ──────────────────────────────────────
  const trueContradictions: string[] = [];
  for (const scope of SCOPES) {
    const supp = supportTagged.filter((t) => t.scope === scope);
    const cntr = counterTagged.filter((t) => t.scope === scope);
    for (const s of supp) {
      const opposing = cntr.find((c) => c.discipline !== s.discipline);
      if (opposing) {
        trueContradictions.push(
          `${SCOPE_LABEL[scope]} 기준, ${DISC_LABEL[s.discipline]}는 "${s.evidence.meaning}"로 보는 반면 `
          + `${DISC_LABEL[opposing.discipline]}는 "${opposing.evidence.meaning}"로 보아, 같은 시점·같은 주제에서 결론이 갈립니다.`,
        );
        break;
      }
    }
  }

  // ── scope-separated compound truths (§10, the PRIMARY product): different scopes pointing different
  // directions is the NORMAL case, never neutralized into one flat verdict. ──────────────────────────
  const scopeSeparatedTruths: string[] = [];
  const scopePairs: [CrossConsultationScope, CrossConsultationScope][] = [
    ['NATAL_BASELINE', 'PERIOD_CONTEXT'], ['NATAL_BASELINE', 'CURRENT_SITUATION'], ['PERIOD_CONTEXT', 'CURRENT_SITUATION'],
  ];
  for (const [a, b] of scopePairs) {
    const sa = scopeStatus[a]; const sb = scopeStatus[b];
    if (!sa || !sb || sa === sb) continue;
    scopeSeparatedTruths.push(
      `${SCOPE_LABEL[a]}는 ${STATUS_LABEL[sa]}이나, ${SCOPE_LABEL[b]}는 ${STATUS_LABEL[sb]}로 나타나, `
      + `시점에 따라 결론이 다릅니다. (${SCOPE_LABEL[a]}: ${scopeConclusion[a]} / ${SCOPE_LABEL[b]}: ${scopeConclusion[b]})`,
    );
  }

  // Overall status — genuine support/counterevidence existing ANYWHERE, never a discipline count (§4/§5/§42).
  const status = combineStatus(supportTagged.length > 0, counterTagged.length > 0);

  const finalConclusion = scopeSeparatedTruths[0]
    ?? scopeConclusion.NATAL_BASELINE ?? scopeConclusion.PERIOD_CONTEXT ?? scopeConclusion.CURRENT_SITUATION
    ?? '통합 판단에 필요한 근거가 이번 배치에서 충분하지 않습니다.';

  // ── genuine cross-system synthetic inference (§27/§47): only when 2+ DISCIPLINES actually contributed
  // evidence, and the result is not UNRESOLVED. Never a copy/concatenation of individual conclusions. ──
  const contributingDisciplines = [...new Set([...supportTagged, ...counterTagged].map((t) => t.discipline))];
  const syntheticInferences: SyntheticInference[] = [];
  if (contributingDisciplines.length >= 2 && status !== 'UNRESOLVED') {
    const premises = contributingDisciplines.map((d) => {
      const mine = [...supportTagged, ...counterTagged].filter((t) => t.discipline === d);
      return `${DISC_LABEL[d]}(${SCOPE_LABEL[mine[0].scope]}): ${uniqueMeanings(mine).join(' ')}`;
    });
    const conclusion = scopeSeparatedTruths[0] ?? trueContradictions[0]
      ?? `${contributingDisciplines.map((d) => DISC_LABEL[d]).join('·')}가 서로 다른 판단 체계에서 같은 결론 방향으로 수렴해, 교차 검증된 판단입니다.`;
    syntheticInferences.push({ premises, conclusion });
  }

  const uncertaintyReasons: string[] = [];
  for (const { discipline, result } of systems) {
    if (!result) {
      uncertaintyReasons.push(`${DISC_LABEL[discipline]}: 이 주제에 대한 판정 대상이 아니거나 근거 자료가 없습니다.`);
    } else if (result.status === 'UNRESOLVED') {
      uncertaintyReasons.push(`${DISC_LABEL[discipline]}: ${result.uncertaintyReasons.join(' ') || '이 주제를 구조적으로 판단할 근거가 부족합니다.'}`);
    }
  }

  const reasoningRuleIds = [
    ...new Set(systems.flatMap(({ result }) => (result ? systemRuleIds(result) : []))),
    ...(scopeSeparatedTruths.length > 0 ? ['CROSS-CONSULT-01:scope_separated_truth'] : []),
    ...(trueContradictions.length > 0 ? ['CROSS-CONSULT-02:true_contradiction'] : []),
  ];

  const dominantScopeOf = (discipline: Discipline): CrossConsultationScope | null => {
    const mine = [...supportTagged, ...counterTagged].filter((t) => t.discipline === discipline);
    if (mine.length === 0) return null;
    const counts: Record<CrossConsultationScope, number> = { NATAL_BASELINE: 0, PERIOD_CONTEXT: 0, CURRENT_SITUATION: 0 };
    for (const t of mine) counts[t.scope] += 1;
    return SCOPES.reduce((best, s) => (counts[s] > counts[best] ? s : best), SCOPES[0]);
  };
  const systemContributions: CrossSystemContribution[] = systems.map(({ discipline, result }) => ({
    system: discipline,
    availability: !result ? 'NOT_APPLICABLE' : result.status === 'UNRESOLVED' ? 'UNRESOLVED' : 'AVAILABLE',
    domainStatus: result?.status ?? null,
    timeScope: dominantScopeOf(discipline),
    proposition: result?.conclusion ?? '',
    supportingEvidence: result?.supportingEvidence ?? [],
    counterEvidence: result?.counterEvidence ?? [],
    reasoning: SYSTEM_ROLE_NOTE[discipline],
  }));

  return {
    domain: input.domain,
    questionProposition: QUESTION_PROPOSITION[input.domain],
    status,
    baselineConclusion: scopeConclusion.NATAL_BASELINE,
    periodConclusion: scopeConclusion.PERIOD_CONTEXT,
    currentSituationConclusion: scopeConclusion.CURRENT_SITUATION,
    finalConclusion,
    systemContributions,
    supportingEvidence: dedupeByFact(supportTagged.map((t) => t.evidence)),
    counterEvidence: dedupeByFact(counterTagged.map((t) => t.evidence)),
    scopeSeparatedTruths,
    trueContradictions,
    syntheticInferences,
    temporalDrivers: [...new Set(systems.flatMap(({ result }) => (result ? systemTemporalDrivers(result) : [])))],
    uncertaintyReasons,
    reasoningRuleIds,
    provenance: [CROSS_CONSULTATION_JUDGE_V1_METHOD],
  };
}
