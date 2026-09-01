// CONSULTATION DECISION DELIVERY V7 — THE ONE CUSTOMER MEANING.
//
// DecisionCrossSynthesisV1 classifies what three independent judgments of one proposition add up to, and it
// shipped with NO consumer. The graph verdict was deliberately left untouched, so a consultation whose
// synthesis says "the direction is supported, and its downstream result is limited" still reached the reader
// through the older vocabulary — which has exactly one word for that: 정하지 않겠습니다.
//
// Measured over the 77 replayable consultations, that is not an edge case: 28 are compound truths and 21 of
// those are OUTCOME_SPLIT. A delivery layer that can only say FOR, AGAINST or "I cannot decide" is unable to
// state the most common thing the system now knows.
//
// This module is the bridge. It turns the authoritative synthesis into ONE customer meaning, and every
// directional surface in the answer — headline, close, 좋은 흐름, 조심할 점, action, 한마디 — derives from it
// through `ConclusionSurfacePlan`, which V6 already established as the single polarity authority. Nothing
// here re-infers polarity from prose, and nothing here computes astrology.
//
// WHAT IT MAY NEVER DO:
//   1. Invent a fact, a relation, a period or an option winner. Every truth it carries is a sentence a
//      discipline already stated, with that discipline's own evidence ids attached.
//   2. Overclaim authority. The disclosure names only the disciplines that materially contributed, and
//      SINGLE_AUTHORITY says so rather than implying corroboration.
//   3. Turn a truthful inability into an answer. NO_APPLICABLE_JUDGMENT keeps the verdict's own state.
import {
  axisLabel,
  type CrossResolutionKind, type DecisionCrossSynthesisV1, type Discipline,
  type CrossDivinationVerdict, type JudgmentDomain, type RequestedOutcome, type SynthesisTruth,
} from '@/features/divination';
import { realizeForConsumer } from './koreanRealization';

export const CONSUMER_DECISION_PLAN_VERSION = 'consumer-decision-plan@1.0.0';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑',
};
const joinNames = (ds: readonly Discipline[]) => ds.map((d) => DISCIPLINE_LABEL[d]).join('·');

// EVERY sentence composed here glues a VARIABLE noun phrase — an axis name, a list of discipline names — to
// a particle, and Korean particles agree with the syllable before them. Hand-picking one produces "자리·직업는"
// and "끌리는 힘를", which is what the first replay actually rendered. The templates therefore write the
// UNRESOLVED placeholder form the product already defines (`은(는)`, `을(를)`, `이(가)`) and `say` resolves it
// through the product's one delivery pass, not a second copy of the rule.
//
// `realizeForConsumer` rather than the particle pass alone: some of these sentences EMBED a discipline's own
// statement verbatim (a timing reading inside the temporal action), and engine statements are written in
// 해라체 — "…이 축이 실제로 움직인다." landed in a 합쇼체 answer in the first replay. This is the same seam
// every other user-visible string already goes through.
const say = (text: string) => realizeForConsumer(text);

/**
 * The conclusion state the ANSWER is delivered in. Identical vocabulary to `ConclusionSurfacePlan`'s own
 * `ConclusionState`, declared here so this module owns the mapping and the surface plan simply reads it.
 */
export type ConsumerConclusionState = 'OPEN' | 'BLOCKED' | 'MIXED' | 'UNRESOLVED' | 'INSUFFICIENT';

/** What the reader is being pointed toward, if anything. `NONE` is a real value, never a missing one. */
export type ConsumerDirection = 'PROCEED' | 'HOLD' | 'NONE';

/** One thing a discipline actually said, in the form the answer may show it. */
export type ConsumerTruth = {
  readonly axis: JudgmentDomain;
  /** The consumer-facing name of the axis — never the enum. */
  readonly axisName: string;
  readonly discipline: Discipline;
  /** The discipline's own sentence. Not composed here. */
  readonly meaning: string;
  readonly evidenceIds: readonly string[];
};

export type ConsumerDecisionPlanV1 = {
  readonly propositionId: string;
  readonly resolutionKind: CrossResolutionKind;
  readonly requestedOutcome: RequestedOutcome;
  /** The conclusion sentence the reader receives, in plain Korean, answering the asked proposition. */
  readonly headlineMeaning: string;
  readonly primaryDirection: ConsumerDirection;
  /** The state every directional surface in the answer must agree with. */
  readonly conclusionState: ConsumerConclusionState;
  readonly supportingTruths: readonly ConsumerTruth[];
  readonly limitingTruths: readonly ConsumerTruth[];
  readonly outcomeQualifications: readonly ConsumerTruth[];
  readonly temporalQualifications: readonly ConsumerTruth[];
  /** Present for TRUE_STANDOFF: which readings differ, and why neither may be promoted. */
  readonly conflictExplanation: string | null;
  /** How many disciplines materially contributed — factually, never "세 체계 모두" unless true. */
  readonly authorityDisclosure: string;
  /** What to actually do, bounded by what the synthesis supports. Never generic coaching. */
  readonly actionBoundary: string;
  readonly evidenceRefs: readonly string[];
  readonly provenance: readonly ['deokbunai.consumer-decision-plan.v1'];
};

// ── STATE + DIRECTION ─────────────────────────────────────────────────────────────────────────────────
//
// A compound truth is delivered as MIXED, not as OPEN with a footnote and not as a decline. MIXED is the
// product's existing "both sides are genuinely standing" state, and it is what stops the answer from either
// flattening the qualification away or refusing to answer because two truths differ in polarity.
const STATE_BY_KIND: Record<CrossResolutionKind, ConsumerConclusionState | 'FROM_STANCE'> = {
  AGREED: 'FROM_STANCE',
  SINGLE_AUTHORITY: 'FROM_STANCE',
  QUALIFIED: 'MIXED',
  COMPOUND_MIXED: 'MIXED',
  TEMPORAL_SPLIT: 'MIXED',
  OUTCOME_SPLIT: 'MIXED',
  TRUE_STANDOFF: 'UNRESOLVED',
  NON_DIRECTIONAL: 'UNRESOLVED',
  NO_APPLICABLE_JUDGMENT: 'UNRESOLVED',
};

const truthOf = (t: SynthesisTruth): ConsumerTruth => ({
  axis: t.axis, axisName: axisLabel(t.axis, '전반'), discipline: t.discipline,
  meaning: t.statement, evidenceIds: t.evidenceIds,
});

// ── HEADLINE ──────────────────────────────────────────────────────────────────────────────────────────
//
// One sentence per resolution kind, built from values the synthesis ALREADY resolved plus the shared axis
// vocabulary. It asserts nothing new: the direction is the synthesis's, the axes are the proposition's, and
// the qualification exists only when the synthesis produced one.
function headlineFor(
  kind: CrossResolutionKind, direction: ConsumerDirection,
  primaryAxis: string, otherAxis: string | null, disciplines: readonly Discipline[],
): string {
  const opens = direction === 'PROCEED';
  switch (kind) {
    case 'AGREED':
      return opens
        ? `${primaryAxis}에 대해서는 지금 열려 있는 쪽으로 봅니다. 서로 다른 근거가 같은 방향으로 함께 서 있습니다.`
        : `${primaryAxis}에 대해서는 지금 크게 벌일 자리는 아닙니다. 서로 다른 근거가 같은 제한을 가리킵니다.`;
    case 'SINGLE_AUTHORITY':
      return opens
        ? `${primaryAxis}에 대해서는 열려 있는 쪽으로 봅니다. 다만 이 판단은 ${joinNames(disciplines)} 한 곳에서 나온 것이라, 그만큼의 무게로 보시면 됩니다.`
        : `${primaryAxis}에 대해서는 크게 벌일 자리는 아닙니다. 다만 이 판단은 ${joinNames(disciplines)} 한 곳에서 나온 것이라, 그만큼의 무게로 보시면 됩니다.`;
    case 'QUALIFIED':
      return opens
        ? `${primaryAxis} 자체는 열려 있는 쪽으로 봅니다. 다만 함께 걸리는 부분이 있어, 그 범위 안에서 보셔야 합니다.`
        : `${primaryAxis}은(는) 지금 크게 벌일 자리는 아닙니다. 다만 아주 막혀 있는 것은 아니라, 범위를 좁히면 여지는 있습니다.`;
    case 'OUTCOME_SPLIT':
      return `${primaryAxis} 자체${opens ? '는 열려 있습니다' : '는 지금 무리가 있습니다'}. 다만 그 뒤에 오는 ${otherAxis ?? '결과'}은(는) 같은 쪽으로 보기 어렵습니다. 이 둘은 나눠서 보셔야 합니다.`;
    case 'TEMPORAL_SPLIT':
      return `${primaryAxis}은(는) 큰 흐름과 가까운 시기가 서로 다르게 나옵니다. 방향과 시점을 같은 것으로 묶지 마시고 나눠서 보십시오.`;
    case 'COMPOUND_MIXED':
      return `${primaryAxis}에 대해서는 서로 다른 두 가지가 함께 사실입니다. 어느 한쪽만 떼어 보시면 결론이 달라집니다.`;
    case 'TRUE_STANDOFF':
      return `${primaryAxis}에 대해서는 ${joinNames(disciplines)}이(가) 서로 다른 방향을 가리킵니다. 어느 한쪽으로 정하는 것은 지금 근거가 받쳐 주지 않아, 정하지 않고 양쪽을 그대로 보여 드립니다.`;
    case 'NON_DIRECTIONAL':
      return `${primaryAxis}에 대해 물어보신 것은 좋다·나쁘다를 정하는 질문이 아니어서, 그 형태로 답하지 않겠습니다. 아래에 확인된 부분을 그대로 정리해 드립니다.`;
    case 'NO_APPLICABLE_JUDGMENT':
      return `${primaryAxis}에 대해서는 지금 세울 수 있는 판단이 나오지 않았습니다. 없는 이야기를 만들어 드리지는 않겠습니다.`;
  }
}

// ── AUTHORITY DISCLOSURE ──────────────────────────────────────────────────────────────────────────────
function disclosureFor(
  kind: CrossResolutionKind, deciders: readonly Discipline[], contributors: readonly Discipline[],
): string {
  if (kind === 'TRUE_STANDOFF' && deciders.length >= 2) {
    return `이 판단에는 ${joinNames(deciders)}가 각각 참여했고, 두 곳의 결론이 서로 다릅니다.`;
  }
  if (deciders.length >= 2) {
    return `${joinNames(deciders)}가 각각 따로 보고 같은 결론에 이르렀습니다.`;
  }
  if (deciders.length === 1) {
    const others = contributors.filter((d) => d !== deciders[0]);
    const tail = others.length > 0
      ? ` ${joinNames(others)}은(는) 이 질문을 직접 보는 자리가 없어 참고로만 두었습니다.`
      : '';
    return `이 결론은 ${joinNames(deciders)}이(가) 본 것입니다.${tail}`;
  }
  return contributors.length > 0
    ? `${joinNames(contributors)}에서 참고할 만한 내용은 있었지만, 이 질문을 직접 판단할 자리는 나오지 않았습니다.`
    : '이 질문을 직접 판단할 자리가 어느 쪽에도 나오지 않았습니다.';
}

// ── ACTION BOUNDARY ───────────────────────────────────────────────────────────────────────────────────
//
// Bounded by what the synthesis actually supports, and it NAMES what has to be watched. A sentence that says
// only "신중하게 결정하세요" is exactly the generic coaching the delivery contract forbids, so every branch
// below either names a grounded limit/axis or says plainly that no boundary is available.
function actionFor(
  kind: CrossResolutionKind, direction: ConsumerDirection,
  limits: readonly ConsumerTruth[], outcomes: readonly ConsumerTruth[], temporal: readonly ConsumerTruth[],
  primaryAxis: string,
): string {
  const named = [...limits, ...outcomes];
  const watch = named.length > 0
    ? [...new Set(named.map((t) => t.axisName))].join('·')
    : null;
  switch (kind) {
    case 'AGREED':
    case 'SINGLE_AUTHORITY':
      return direction === 'PROCEED'
        ? `${primaryAxis}은(는) 지금 움직이셔도 되는 쪽입니다. 다만 한 번에 크게 벌리기보다, 되돌릴 수 있는 크기에서 시작하십시오.`
        : `${primaryAxis}에서는 지금 새로 벌이는 쪽은 미루십시오. 이미 하고 계신 범위를 지키는 것이 이번 흐름에 맞습니다.`;
    case 'QUALIFIED':
      return watch
        ? `${primaryAxis}은(는) ${direction === 'PROCEED' ? '가셔도 되는 쪽입니다' : '지금은 미루시는 쪽입니다'}. 대신 ${watch}에서 걸리는 부분을 먼저 정리해 두고 움직이십시오.`
        : `${primaryAxis}은(는) ${direction === 'PROCEED' ? '가셔도 되는 쪽이되' : '미루시는 쪽이되'}, 범위를 좁혀서 보십시오.`;
    // An axis label is a NOUN PHRASE for a reading ("끌리는 힘", "돈이 남는 쪽"), never an action, so it may
    // not be glued into a verb phrase — "끌리는 힘를 실행하는 것" is what that produced. It stays a topic.
    case 'OUTCOME_SPLIT':
      return `${primaryAxis} 자체는 ${direction === 'PROCEED' ? '지금 막히지 않습니다' : '지금은 무리입니다'}. 문제는 그 다음이라, ${watch ?? '뒤따르는 결과'} 쪽을 미리 정해 두고 들어가십시오.`;
    case 'TEMPORAL_SPLIT':
      return temporal.length > 0
        ? `방향은 그대로 두시고 시점만 나눠 보십시오. ${temporal[0].meaning}`
        : `방향은 그대로 두시고, 시점만 따로 확인하고 움직이십시오.`;
    case 'COMPOUND_MIXED':
      return watch
        ? `두 가지가 함께 걸려 있어, 한쪽만 보고 정하시면 뒤집힙니다. ${watch} 쪽을 함께 두고 판단하십시오.`
        : `두 가지가 함께 걸려 있습니다. 한쪽만 떼어 놓고 정하지 마십시오.`;
    case 'TRUE_STANDOFF':
      return watch
        ? `어느 쪽으로 정해 드리지 않겠습니다. 대신 ${watch}에서 확인된 부분은 실제로 확인이 가능하니, 그것부터 확인하고 결정하십시오.`
        : `어느 쪽으로 정해 드리지 않겠습니다. 지금은 되돌릴 수 있는 범위 밖으로 나가지 않는 것까지가 근거로 말씀드릴 수 있는 선입니다.`;
    case 'NON_DIRECTIONAL':
      return named.length > 0
        ? `${watch} 쪽에서 확인된 부분을 먼저 챙기십시오.`
        : '지금 확인된 범위 안에서만 보시고, 그 밖으로는 넘겨짚지 마십시오.';
    case 'NO_APPLICABLE_JUDGMENT':
      return '지금은 이 질문을 판단할 근거가 서지 않아, 무엇을 하시라고 말씀드리지 않겠습니다.';
  }
}

// ── BUILD ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Build the one customer meaning from the verdict's own synthesis. Pure: same verdict in, same plan out.
 *
 * Returns `null` when the verdict carries no synthesis — a legacy or restored row — so every caller keeps its
 * pre-V7 behaviour unchanged rather than being handed a fabricated plan.
 */
export function buildConsumerDecisionPlan(verdict: CrossDivinationVerdict): ConsumerDecisionPlanV1 | null {
  const s: DecisionCrossSynthesisV1 | undefined = verdict.decisionCrossSynthesis;
  if (!s) return null;

  const deciders = s.primaryJudgments.map((p) => p.discipline);
  const contributors = s.participatingJudgments
    .filter((p) => p.authority !== 'CONTEXT_ONLY')
    .map((p) => p.discipline);

  const direction: ConsumerDirection =
    s.finalStance === 'FOR' || s.finalStance === 'QUALIFIED_FOR' ? 'PROCEED'
      : s.finalStance === 'AGAINST' || s.finalStance === 'QUALIFIED_AGAINST' ? 'HOLD'
        : s.finalStance === 'COMPOUND'
          // A compound still has a primary side — that is what the reader acts on, with the other half
          // stated beside it. It is read off the deciding judgments, never re-inferred from prose.
          ? (s.primaryJudgments.some((p) => p.direction === 'FAVORABLE') ? 'PROCEED'
            : s.primaryJudgments.some((p) => p.direction === 'UNFAVORABLE') ? 'HOLD' : 'NONE')
          : 'NONE';

  const mapped = STATE_BY_KIND[s.resolutionKind];
  const conclusionState: ConsumerConclusionState = mapped !== 'FROM_STANCE' ? mapped
    : direction === 'PROCEED' ? 'OPEN' : direction === 'HOLD' ? 'BLOCKED' : 'UNRESOLVED';

  const supportingTruths = s.supportingTruths.map(truthOf);
  const limitingTruths = s.limitingTruths.map(truthOf);
  const outcomeQualifications = s.outcomeQualifications.map(truthOf);
  const temporalQualifications = s.temporalQualifications.map(truthOf);

  const primaryAxis = axisLabel(
    s.primaryJudgments[0]?.axis ?? verdict.questionDomain, '전반',
  );
  const otherAxis = outcomeQualifications[0]?.axisName ?? null;

  const conflictExplanation = s.resolutionKind === 'TRUE_STANDOFF'
    ? say([
      ...s.primaryJudgments.map((p) => `${DISCIPLINE_LABEL[p.discipline]}은(는) "${p.statement}"`),
      s.unresolvedReason ?? '',
    ].filter((x) => x.length > 0).join(' / '))
    : null;

  return {
    propositionId: s.propositionId,
    resolutionKind: s.resolutionKind,
    requestedOutcome: s.requestedOutcome,
    headlineMeaning: say(headlineFor(
      s.resolutionKind, direction, primaryAxis, otherAxis, deciders.length > 0 ? deciders : contributors,
    )),
    primaryDirection: direction,
    conclusionState,
    supportingTruths,
    limitingTruths,
    outcomeQualifications,
    temporalQualifications,
    conflictExplanation,
    authorityDisclosure: say(disclosureFor(s.resolutionKind, deciders, contributors)),
    actionBoundary: say(actionFor(
      s.resolutionKind, direction, limitingTruths, outcomeQualifications, temporalQualifications, primaryAxis,
    )),
    evidenceRefs: [...new Set([
      ...supportingTruths, ...limitingTruths, ...outcomeQualifications, ...temporalQualifications,
    ].flatMap((t) => t.evidenceIds))],
    provenance: ['deokbunai.consumer-decision-plan.v1'],
  };
}

// ── THE READING CONTRACT HANDED TO THE LANGUAGE LAYER ─────────────────────────────────────────────────
//
// One instruction per state, in the same register `verdictDirective` already uses. The LLM composes language
// from this; it never decides polarity, and every branch that is not OPEN/BLOCKED explicitly withholds
// proceed/hold vocabulary rather than leaving it to the model's judgement.
const INSTRUCTION_BY_STATE: Record<ConsumerConclusionState, string> = {
  OPEN: '결론은 "하는 쪽"입니다. 분명하게 말하되 과장하지 마십시오.',
  BLOCKED: '결론은 "하지 않는 쪽"입니다. 분명하게 말하십시오.',
  MIXED: '이 답은 한쪽으로 정해지지 않습니다. 서로 다른 두 가지가 함께 사실이므로, 반드시 둘 다 말하고 어느 한쪽으로 요약하지 마십시오. "좋은 점도 있고 나쁜 점도 있습니다" 같은 뭉뚱그린 문장으로 줄이지도 마십시오.',
  UNRESOLVED: '방향을 정하지 않았습니다. 억지로 좋다·나쁘다를 만들지 말고, 무엇이 보이고 무엇이 안 보이는지 그대로 말하십시오.',
  INSUFFICIENT: '지금 근거로는 방향을 정하지 않습니다. 무엇이 있어야 볼 수 있는지 솔직하게 말하십시오.',
};

/** The plan as the language layer's binding reading contract. Pure projection — no new field is decided. */
export const consumerMeaningDirective = (plan: ConsumerDecisionPlanV1) => ({
  headlineMeaning: plan.headlineMeaning,
  instruction: INSTRUCTION_BY_STATE[plan.conclusionState],
  authorityDisclosure: plan.authorityDisclosure,
  actionBoundary: plan.actionBoundary,
  directional: plan.conclusionState === 'OPEN' || plan.conclusionState === 'BLOCKED',
});

// ── SEMANTIC COVERAGE VALIDATION ──────────────────────────────────────────────────────────────────────
//
// A deterministic check that runs BEFORE delivery: does the composed answer actually say what the plan
// decided? It is a bounded consistency test over the product's own closed advice lexicon (`closingDirectionOf`
// — the same classifier the conclusion surface already uses), never an NL classifier and never a fact
// detector. A violation means the language layer drifted, and the caller falls back to the deterministic
// rendering rather than shipping the drift.
export type CoverageViolation =
  | 'HEADLINE_POLARITY'      // the answer pushes the opposite way from the plan
  | 'ACTION_CONTRADICTION'   // the advice pushes the opposite way from the conclusion
  | 'AUTHORITY_OVERCLAIM'    // more corroboration is claimed than actually participated
  | 'COMPOUND_FLATTENED';    // a compound truth was delivered as a single direction

/** Claims of multi-system agreement. A closed set of the product's own phrasings, not a general detector. */
const MULTI_SYSTEM_CLAIM = /세\s*(?:체계|학문|가지)\s*(?:모두|다)|세 곳 모두|모든 체계|three systems/;

/**
 * Validate one composed answer against the plan it was supposed to express.
 *
 * `directionOf` is injected so this module does not import the surface plan (which imports this one); the
 * caller passes `closingDirectionOf`, so there is exactly one advice-lexicon classifier in the product.
 */
export function validateConsumerCoverage(
  plan: ConsumerDecisionPlanV1,
  parts: { headline: string; action: string; body: string },
  // The product's own advice classifier (`closingDirectionOf`). Its "asserts nothing" value is NEUTRAL while
  // a plan's is NONE; they are normalised here rather than compared across two vocabularies — comparing them
  // directly made every neutral sentence read as directional and fired on the plan's own text.
  directionOf: (text: string) => 'PROCEED' | 'HOLD' | 'NEUTRAL',
): CoverageViolation[] {
  const out: CoverageViolation[] = [];
  const asConsumer = (d: 'PROCEED' | 'HOLD' | 'NEUTRAL'): ConsumerDirection => (d === 'NEUTRAL' ? 'NONE' : d);
  const headlineDir = asConsumer(directionOf(parts.headline));
  const actionDir = asConsumer(directionOf(parts.action));

  // A directional plan must not be read back the other way. NONE is always allowed: stating no direction is
  // never a contradiction of one, and it is what an UNRESOLVED plan requires.
  if (plan.primaryDirection !== 'NONE' && headlineDir !== 'NONE' && headlineDir !== plan.primaryDirection) {
    out.push('HEADLINE_POLARITY');
  }
  if (headlineDir !== 'NONE' && actionDir !== 'NONE' && actionDir !== headlineDir) {
    out.push('ACTION_CONTRADICTION');
  }
  // An UNRESOLVED plan authorises no proceed/hold anywhere — that is the standoff guarantee.
  if (plan.primaryDirection === 'NONE' && plan.conclusionState !== 'MIXED'
    && (headlineDir !== 'NONE' || actionDir !== 'NONE')) {
    out.push('HEADLINE_POLARITY');
  }
  if (plan.resolutionKind === 'SINGLE_AUTHORITY' && MULTI_SYSTEM_CLAIM.test(parts.body)) {
    out.push('AUTHORITY_OVERCLAIM');
  }
  // A compound truth that reaches the reader with only one of its two sides is the flattening this whole
  // layer exists to prevent, so it is checked structurally: the limiting/outcome material must be present.
  if (plan.conclusionState === 'MIXED') {
    const both = [...plan.outcomeQualifications, ...plan.limitingTruths];
    const carried = both.length === 0
      || both.some((t) => parts.body.includes(t.axisName) || parts.body.includes(t.meaning));
    if (!carried) out.push('COMPOUND_FLATTENED');
  }
  return out;
}

// ── SERVER-RENDERED SECTIONS ──────────────────────────────────────────────────────────────────────────

export const DECISION_MEANING_TITLE = '이 결론을 어떻게 보면 되나요';
export const CONFLICT_SECTION_TITLE = '두 판단이 갈리는 지점';

/**
 * The plan's material as server-owned sections. Rendered, not asked of the model, so the compound and
 * standoff cases cannot be lost in composition — which is the whole reason the synthesis exists.
 *
 * A section is emitted only when it has grounded material; nothing here produces a heading over an empty
 * body, and nothing here restates the headline.
 */
export function renderConsumerDecisionSections(
  plan: ConsumerDecisionPlanV1,
): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  const line = (t: ConsumerTruth) => `· ${t.axisName}: ${t.meaning}`;

  // The compound cases are the ones that MUST carry both sides. A single-direction answer already states its
  // own side in the headline, so repeating it here would be noise.
  const compound = plan.conclusionState === 'MIXED';
  const bothSides = [...plan.outcomeQualifications, ...plan.limitingTruths];
  if (compound && bothSides.length > 0) {
    const body = [
      ...plan.supportingTruths.map(line),
      ...bothSides.map(line),
      plan.actionBoundary,
    ].join('\n');
    out.push({ title: DECISION_MEANING_TITLE, body });
  }

  if (plan.conflictExplanation) {
    out.push({
      title: CONFLICT_SECTION_TITLE,
      body: [plan.conflictExplanation, plan.authorityDisclosure, plan.actionBoundary].join('\n'),
    });
  }
  return out;
}
