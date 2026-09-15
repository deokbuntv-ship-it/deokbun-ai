// CONSULTATION REALIZATION V8 — WHAT THE CUSTOMER ANSWER IS ALLOWED TO COMMUNICATE.
//
// V7.1 finished the semantics: the system now decides correctly and safely (fabricated fact 0, wrong
// discipline 0, negative-authority-to-PROCEED 0). The controlled same-scorer comparison then showed the
// remaining loss is REALIZATION — the system knows more than the answer says. Two measurements make that
// concrete:
//
//   · 15 of 77 delivered consultations opened with "…한쪽 방향을 확정하기 어렵습니다" while their own
//     synthesis had resolved (OUTCOME_SPLIT 5, SINGLE_AUTHORITY 4, TEMPORAL_SPLIT 2, QUALIFIED 2, AGREED 1,
//     COMPOUND_MIXED 1). Their PUV-YES rate was 0.
//   · CROSS sat at 8.31/15 across ORIGINAL, V6.1 and V7.1 — three releases, zero movement.
//
// ROOT CAUSE OF THE FIRST. `applyVerdictAuthorityClamp` replaces `coreSummary` — the field the reader meets
// as 결론 — whenever `isDeclinedToDecide(verdict)`, and that predicate reads the GRAPH verdict's direction.
// V7 bound the surface plan to the synthesis but the clamp runs afterwards, on the accepted result, and
// overwrote the resolved conclusion with the generic decline. The graph declining is no longer the same
// question as the ANSWER declining, and this module is where that distinction is stated once.
//
// THIS CONTRACT IS AUTHORITATIVE MEANING. It carries no new fact: every truth in it is a sentence a
// discipline already stated, every discipline named actually participated, and every technical reference is
// one the verdict already carried.
import {
  axisLabel,
  type CrossDivinationVerdict, type CrossResolutionKind, type Discipline,
  type JudgmentDomain, type RequestedOutcome,
} from '@/features/divination';
import {
  buildConsumerDecisionPlan, type ConsumerConclusionState, type ConsumerDecisionPlanV1,
  type ConsumerDirection, type ConsumerTruth,
} from './consumerDecisionPlan';
import { buildDecisionProposition } from './decisionProposition';
import { resolveJudgmentDomain, resolveQuestionIntent } from '@/features/chat/services/consultationGrounding';
import { realizeForConsumer } from './koreanRealization';

export const CONSULTATION_NARRATIVE_CONTRACT_VERSION = 'consultation-narrative-contract@1.0.0';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑',
};
const joinNames = (ds: readonly Discipline[]) => ds.map((d) => DISCIPLINE_LABEL[d]).join('·');
const say = (t: string) => realizeForConsumer(t);

/** One discipline's actual part in this answer. Never a discipline that did not participate. */
export type DisciplineContribution = {
  readonly discipline: Discipline;
  readonly authority: 'DIRECT_PROPOSITION' | 'BOUNDED_DOMAIN_SUMMARY' | 'INDIRECT_QUALIFIER' | 'CONTEXT_ONLY';
  readonly axis: JudgmentDomain | null;
  readonly statement: string;
};

export type ConsultationNarrativeContractV1 = {
  readonly propositionId: string;
  readonly requestedOutcome: RequestedOutcome;
  /** The thing being decided, in the user's own words. Traceability and personalization — never judged. */
  readonly decisionObject: string | null;
  readonly options: readonly string[];
  readonly counterparty: 'PARTNER' | 'FORMER_PARTNER' | 'OTHER' | null;

  readonly resolutionKind: CrossResolutionKind;
  readonly primaryDirection: ConsumerDirection;
  readonly conclusionState: ConsumerConclusionState;
  /** THE conclusion the reader receives. Every other section must stay consistent with it. */
  readonly customerConclusionMeaning: string;

  readonly supportingTruths: readonly ConsumerTruth[];
  readonly limitingTruths: readonly ConsumerTruth[];
  readonly outcomeTruths: readonly ConsumerTruth[];
  readonly temporalTruths: readonly ConsumerTruth[];

  /** EXACTLY the disciplines that materially contributed. Never padded to three. */
  readonly participatingDisciplines: readonly Discipline[];
  readonly disciplineContributions: readonly DisciplineContribution[];
  /** The customer-facing explanation of HOW those systems combine — the Cross synthesis, in plain Korean. */
  readonly crossExplanation: string;

  readonly practicalImplications: readonly string[];
  readonly actionBoundaries: readonly string[];

  readonly evidenceRefs: readonly string[];
  /** Technical entities the answer is permitted to name, taken from what the verdict already carried. */
  readonly allowedTechnicalRefs: readonly string[];
  readonly provenance: readonly ['deokbunai.consultation-narrative-contract.v1'];
};

// ── THE DELIVERY-LEVEL DECLINE PREDICATE ──────────────────────────────────────────────────────────────
/**
 * Does the ANSWER decline — as opposed to the graph declining?
 *
 * `isDeclinedToDecide` asks whether the proposition GRAPH reached a direction. Since the synthesis exists
 * those are different questions: a graph that could not settle a compound truth still yields a resolved,
 * deliverable answer. Every delivery-side decision that used to consult the graph predicate must consult
 * this one, or the answer says "I cannot decide" about something the system decided.
 *
 * TRUE_STANDOFF, NON_DIRECTIONAL and NO_APPLICABLE_JUDGMENT still decline — truthfully, and they must.
 */
export function deliveryDeclines(verdict: CrossDivinationVerdict | null): boolean {
  if (!verdict) return true;
  const plan = buildConsumerDecisionPlan(verdict);
  if (!plan) return verdict.direction === 'INSUFFICIENT_DATA' || verdict.direction === 'INSUFFICIENT_EVIDENCE';
  return plan.conclusionState === 'UNRESOLVED' || plan.conclusionState === 'INSUFFICIENT';
}

// ── CUSTOMER-VISIBLE CROSS SYNTHESIS ──────────────────────────────────────────────────────────────────
//
// The reader is told HOW the systems combine, not given a list of three headings. The participant list is
// whatever actually contributed — one, two or three — because forcing a third would be the "세 체계 모두"
// fabrication the authority disclosure exists to prevent.
function crossExplanationFor(
  kind: CrossResolutionKind, deciders: readonly Discipline[], others: readonly Discipline[],
  primaryAxis: string, otherAxis: string | null, direction: ConsumerDirection,
): string {
  const opens = direction === 'PROCEED';
  const alsoLooked = others.length > 0
    ? ` ${joinNames(others)}은(는) 이 물음을 직접 판단할 자리가 없어, 참고로만 두었습니다.`
    : '';
  switch (kind) {
    case 'AGREED':
      return `${joinNames(deciders)}이(가) 서로 다른 자리를 보고도 ${primaryAxis}에 대해 같은 쪽을 가리킵니다. 한 곳의 판단이 아니라 각각 따로 본 결과가 겹친 것이라, 그만큼 방향은 분명하다고 보셔도 됩니다.${alsoLooked}`;
    case 'SINGLE_AUTHORITY':
      return `이 물음을 직접 볼 수 있는 자리가 ${joinNames(deciders)}에 있어, 그 판단으로 답을 드립니다.${alsoLooked} 근거가 약하다는 뜻이 아니라, 여러 학문이 같은 결론에 이르렀다고는 말씀드리지 않는다는 뜻입니다.`;
    case 'QUALIFIED':
      return `${joinNames(deciders)}이(가) 본 ${primaryAxis}${opens ? '은(는) 열려 있습니다' : '에는 제약이 있습니다'}. 다만 같은 판단 안에서 걸리는 지점이 함께 잡혀, 방향은 그대로 두되 범위를 좁혀서 보셔야 합니다.${alsoLooked}`;
    case 'OUTCOME_SPLIT':
      return `${joinNames(deciders)}이(가) 보기에 ${primaryAxis} 자체${opens ? '는 막히지 않습니다' : '는 지금 무리가 있습니다'}. 그런데 그 뒤에 남는 ${otherAxis ?? '결과'}은(는) 같은 쪽으로 보기 어렵습니다. 하는 것과 하고 난 뒤가 다르게 나오는 경우라, 두 가지를 나눠서 판단하셔야 합니다.${alsoLooked}`;
    case 'TEMPORAL_SPLIT':
      return `${joinNames(deciders)}이(가) 본 ${primaryAxis}은(는) 큰 흐름과 가까운 시기가 서로 다르게 나옵니다. 방향이 틀렸다는 뜻이 아니라 시점이 어긋나 있다는 뜻이라, 두 기간을 같은 것으로 묶지 마십시오.${alsoLooked}`;
    case 'COMPOUND_MIXED':
      return `${joinNames(deciders)}의 판단 안에 서로 다른 두 가지가 함께 서 있습니다. 어느 하나가 틀린 것이 아니라 둘 다 사실이라, 한쪽만 떼어 보시면 결론이 뒤집힙니다.${alsoLooked}`;
    case 'TRUE_STANDOFF':
      return `${joinNames(deciders)}이(가) 각각 이 물음을 직접 판단했는데, 서로 반대 방향을 가리킵니다. 어느 한쪽이 더 직접적이라고 볼 근거가 없어, 한쪽으로 정해 드리면 지금 있는 근거를 넘어서게 됩니다. 그래서 정하지 않고 양쪽을 그대로 보여 드립니다.${alsoLooked}`;
    case 'NON_DIRECTIONAL':
      return `물어보신 것이 좋다·나쁘다를 고르는 질문이 아니어서, 그 형태로는 답하지 않겠습니다. 대신 ${joinNames([...deciders, ...others])}에서 확인된 부분을 그대로 정리해 드립니다.`;
    case 'NO_APPLICABLE_JUDGMENT':
      return `이 물음을 직접 판단할 자리가 어느 쪽에도 서지 않았습니다. 없는 이야기를 만들어 드리지 않겠습니다.`;
  }
}

// ── PRACTICAL IMPLICATION ─────────────────────────────────────────────────────────────────────────────
//
// The "so what" of holding two truths together. Built from the truths the synthesis already produced — no
// implication is stated for a side that does not exist.
function implicationsFor(
  kind: CrossResolutionKind, supporting: readonly ConsumerTruth[], limiting: readonly ConsumerTruth[],
  outcome: readonly ConsumerTruth[], temporal: readonly ConsumerTruth[],
): string[] {
  const out: string[] = [];
  const names = (ts: readonly ConsumerTruth[]) => [...new Set(ts.map((t) => t.axisName))].join('·');
  if (outcome.length > 0) {
    out.push(`지금 결정하실 것은 ${names(outcome)}까지 함께 정하는 일입니다. 실행 여부만 정하고 그 뒤를 비워 두시면, 열려 있던 쪽이 그대로 손해로 돌아옵니다.`);
  }
  if (limiting.length > 0 && kind !== 'OUTCOME_SPLIT') {
    out.push(`${names(limiting)}에서 걸리는 부분은 시간이 지난다고 저절로 풀리는 종류가 아닙니다. 그 부분을 먼저 정리해 두셔야 방향이 그대로 유지됩니다.`);
  }
  if (temporal.length > 0) {
    out.push(`시점에 따라 같은 선택의 결과가 달라집니다. 방향을 바꾸실 것이 아니라, 언제 움직이실지를 따로 정하십시오.`);
  }
  if (supporting.length > 0 && out.length === 0) {
    out.push(`${names(supporting)}이(가) 받쳐 주는 동안 움직이시는 편이, 같은 일을 나중에 하시는 것보다 부담이 적습니다.`);
  }
  return out.map(say);
}

// ── BUILD ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * The one authoritative meaning for this answer. Pure: same verdict in, same contract out. `null` when the
 * verdict carries no synthesis (a legacy or restored row), so every caller keeps its pre-V8 behaviour.
 */
export function buildNarrativeContract(
  verdict: CrossDivinationVerdict,
): ConsultationNarrativeContractV1 | null {
  const plan = buildConsumerDecisionPlan(verdict);
  const synthesis = verdict.decisionCrossSynthesis;
  if (!plan || !synthesis) return null;

  // The proposition, rebuilt from the values the verdict already carries — no new classifier, no new input.
  const q = verdict.question ?? '';
  const proposition = buildDecisionProposition(q, {
    askedAxis: resolveJudgmentDomain(q),
    intent: resolveQuestionIntent(q),
    asksTiming: verdict.asksTiming,
  });

  const deciders = synthesis.primaryJudgments.map((p) => p.discipline);
  const contributors = synthesis.participatingJudgments
    .filter((p) => p.authority !== 'CONTEXT_ONLY')
    .map((p) => p.discipline);
  const others = contributors.filter((d) => !deciders.includes(d));
  const participating = [...new Set([...deciders, ...others])];

  const primaryAxis = axisLabel(synthesis.primaryJudgments[0]?.axis ?? verdict.questionDomain, '전반');
  const otherAxis = plan.outcomeQualifications[0]?.axisName ?? null;

  // Only what the verdict itself already named may be spoken as a technical reference.
  const allowedTechnicalRefs = [...new Set([
    ...verdict.favorableFactors.map((e) => e.fact),
    ...verdict.riskFactors.map((e) => e.fact),
    ...verdict.disciplineJudgments.flatMap((j) => [
      ...j.directEvidence.map((e) => e.fact), ...j.counterEvidence.map((e) => e.fact),
    ]),
  ])].filter((s) => typeof s === 'string' && s.length > 0);

  return {
    propositionId: plan.propositionId,
    requestedOutcome: plan.requestedOutcome,
    decisionObject: proposition.decisionObject,
    options: proposition.options,
    counterparty: proposition.counterparty,
    resolutionKind: plan.resolutionKind,
    primaryDirection: plan.primaryDirection,
    conclusionState: plan.conclusionState,
    customerConclusionMeaning: plan.headlineMeaning,
    supportingTruths: plan.supportingTruths,
    limitingTruths: plan.limitingTruths,
    outcomeTruths: plan.outcomeQualifications,
    temporalTruths: plan.temporalQualifications,
    participatingDisciplines: participating,
    disciplineContributions: synthesis.participatingJudgments
      .filter((p) => p.authority !== 'CONTEXT_ONLY')
      .map((p) => ({
        discipline: p.discipline, authority: p.authority, axis: p.axis, statement: p.statement,
      })),
    crossExplanation: say(crossExplanationFor(
      plan.resolutionKind, deciders.length > 0 ? deciders : contributors, others,
      primaryAxis, otherAxis, plan.primaryDirection,
    )),
    practicalImplications: implicationsFor(
      plan.resolutionKind, plan.supportingTruths, plan.limitingTruths,
      plan.outcomeQualifications, plan.temporalQualifications,
    ),
    actionBoundaries: [plan.actionBoundary],
    evidenceRefs: plan.evidenceRefs,
    allowedTechnicalRefs,
    provenance: ['deokbunai.consultation-narrative-contract.v1'],
  };
}

// ── DETERMINISTIC REALIZATION ─────────────────────────────────────────────────────────────────────────

export const CROSS_SECTION_TITLE = '세 갈래를 함께 보면';
export const MEANING_SECTION_TITLE = '이 결론을 어떻게 보면 되나요';
export const CONFLICT_SECTION_TITLE = '두 판단이 갈리는 지점';

/**
 * The contract as customer sections, composed WITHOUT the language model.
 *
 * This is both the fallback for a rejected realization and the acceptance surface the offline replay
 * measures — so every mandatory piece of synthesis meaning has to be expressible here: which systems spoke
 * and how they combine, what is favourable, what is limited, and what follows practically.
 */
export function renderNarrativeSections(
  contract: ConsultationNarrativeContractV1,
): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  const line = (t: ConsumerTruth) => `· ${t.axisName}: ${t.meaning}`;

  // HOW the systems combine — the piece that was missing entirely, and the reason CROSS never moved.
  out.push({ title: CROSS_SECTION_TITLE, body: contract.crossExplanation });

  const bothSides = [...contract.outcomeTruths, ...contract.limitingTruths];
  const compound = contract.conclusionState === 'MIXED';
  if (compound && bothSides.length > 0) {
    out.push({
      title: MEANING_SECTION_TITLE,
      body: [
        ...contract.supportingTruths.map(line),
        ...bothSides.map(line),
        ...contract.practicalImplications,
        ...contract.actionBoundaries,
      ].filter(Boolean).join('\n'),
    });
  }

  if (contract.resolutionKind === 'TRUE_STANDOFF') {
    out.push({
      title: CONFLICT_SECTION_TITLE,
      body: [
        ...contract.disciplineContributions
          .filter((c) => c.authority === 'DIRECT_PROPOSITION')
          .map((c) => `· ${DISCIPLINE_LABEL[c.discipline]}: ${c.statement}`),
        ...contract.actionBoundaries,
      ].join('\n'),
    });
  }
  return out;
}

// ── SEMANTIC VALIDATION OF A LANGUAGE REALIZATION ─────────────────────────────────────────────────────

export type RealizationViolation =
  | 'CONCLUSION_POLARITY'        // the delivered conclusion points away from the plan
  | 'ACTION_CONTRADICTION'       // the advice points away from the conclusion
  | 'AUTHORITY_OVERCLAIM'        // more corroboration claimed than actually participated
  | 'FORCED_THIRD_DISCIPLINE'    // a discipline that did not participate is named as contributing
  | 'MATERIAL_SIDE_MISSING'      // a compound truth delivered with only one of its two sides
  | 'UNSUPPORTED_TECHNICAL_REF'; // a technical entity the verdict never carried

const MULTI_SYSTEM_CLAIM = /세\s*(?:체계|학문|가지)\s*(?:모두|다)|모든 체계|세 곳 모두/;
const TECHNICAL_LEXICON = /명궁|신궁|(?:형제|부처|자녀|재백|질액|천이|노복|교우|관록|전택|복덕|부모)궁|화록|화권|화과|화기|비견|겁재|식신|편재|정재|편관|정관|편인|재성|관성|식상|비겁|칠살/g;

/**
 * Validate a composed realization against the contract it was supposed to express.
 *
 * A bounded consistency test over the product's own closed advice lexicon and the verdict's own technical
 * whitelist — never an NL classifier, never a judgement of style. `directionOf` is injected so this module
 * does not import the surface plan; the caller passes `closingDirectionOf`, keeping one advice classifier.
 */
export function validateRealization(
  contract: ConsultationNarrativeContractV1,
  parts: { conclusion: string; action: string; body: string },
  directionOf: (text: string) => 'PROCEED' | 'HOLD' | 'NEUTRAL',
): RealizationViolation[] {
  const out: RealizationViolation[] = [];
  const norm = (d: 'PROCEED' | 'HOLD' | 'NEUTRAL'): ConsumerDirection => (d === 'NEUTRAL' ? 'NONE' : d);
  const conclusionDir = norm(directionOf(parts.conclusion));
  const actionDir = norm(directionOf(parts.action));

  if (contract.primaryDirection !== 'NONE' && conclusionDir !== 'NONE'
    && conclusionDir !== contract.primaryDirection) out.push('CONCLUSION_POLARITY');
  // A standoff or a non-direction request authorises no proceed/hold anywhere.
  if (contract.primaryDirection === 'NONE' && contract.conclusionState !== 'MIXED'
    && (conclusionDir !== 'NONE' || actionDir !== 'NONE')) out.push('CONCLUSION_POLARITY');
  if (conclusionDir !== 'NONE' && actionDir !== 'NONE' && conclusionDir !== actionDir) {
    out.push('ACTION_CONTRADICTION');
  }
  if (contract.participatingDisciplines.length < 2 && MULTI_SYSTEM_CLAIM.test(parts.body)) {
    out.push('AUTHORITY_OVERCLAIM');
  }
  const absent = (['MYUNGRI', 'ZIWEI', 'QIMEN'] as Discipline[])
    .filter((d) => !contract.participatingDisciplines.includes(d));
  for (const d of absent) {
    // Naming an absent system as having read something is the forced-third-discipline fabrication.
    const label = DISCIPLINE_LABEL[d];
    if (new RegExp(`${label}\\s*(?:도|가|는|은|에서는?)\\s*[^.]{0,20}(?:봅니다|보입니다|나옵니다|가리킵니다|판단)`).test(parts.body)) {
      out.push('FORCED_THIRD_DISCIPLINE');
      break;
    }
  }
  if (contract.conclusionState === 'MIXED') {
    const both = [...contract.outcomeTruths, ...contract.limitingTruths];
    const carried = both.length === 0
      || both.some((t) => parts.body.includes(t.axisName) || parts.body.includes(t.meaning));
    if (!carried) out.push('MATERIAL_SIDE_MISSING');
  }
  const refs = parts.body.match(TECHNICAL_LEXICON) || [];
  const allowed = contract.allowedTechnicalRefs.join(' ');
  if (refs.some((r) => !allowed.includes(r))) out.push('UNSUPPORTED_TECHNICAL_REF');
  return out;
}
