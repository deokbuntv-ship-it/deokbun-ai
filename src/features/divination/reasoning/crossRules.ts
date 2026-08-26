// V4A §16–§18 — CROSS DERIVATION.
//
// Cross never reads "which discipline's stance won". It receives SEMANTIC PROPOSITIONS, first classifies how
// each pair relates, and only then derives. That ordering is what removes C7 as a CLASS of bug rather than as a
// patched case: the old judge asked "is one side structural and the other near-term?" before asking "are these
// even about the same thing?", so an unrelated structural positive could convert a direct negative into
// FOR_BUT_LATER. Here `DIFFERENT_TIME` is only reachable after `sameProposition()` has already confirmed the
// two claims are about the same axis and the same target.
import type { ContradictionResolutionKind, JudgmentDomain, TemporalScope } from '../contracts';
import { axesShareOneMatter } from '../axisOntology';

/** Which named decomposition a compound pair represents — carried through so the verdict can report it. */
type CompoundKind = ContradictionResolutionKind;
import {
  computeAdequacy, sameTarget, target, temporalBand,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticTarget,
  type TargetKind,
} from './kernel';

/** How two propositions relate. Decided structurally, before any dominance question is asked. */
export type CrossRelation =
  | 'SAME_PROPOSITION'   // same axis, same target, same time band
  | 'DIFFERENT_AXIS'     // both true, about different things
  // V4D §4 — TIME IS SPLIT IN TWO, because the two cases mean different things.
  //
  // DIFFERENT_TIME_BAND is one matter whose long-run direction and near-term moment come apart — the only
  // situation in which "방향은 맞지만 지금은 아니다" is a true statement about a single thing.
  //
  // DIFFERENT_TIME_SCALE is two INDEPENDENT time-scoped truths at the same distance: 올해 and 이 달, or 원국
  // and 대운. V4C called both of these DIFFERENT_TIME because it compared BANDS, so a year-level pressure and
  // a month-level window were fed to the direction/execution rule as though one were the "structural" half —
  // and the timing rule then picked its "structural" half by array position. Neither is the
  // structural half. Both are simply true, and both survive (§4: "keep both").
  | 'DIFFERENT_TIME_BAND'
  | 'DIFFERENT_TIME_SCALE'
  | 'DIFFERENT_TARGET'   // same axis, but about different seats/palaces
  | 'REINFORCING'        // SAME target, SAME exact scope, same direction
  | 'CONTRADICTORY'      // SAME target, SAME exact scope, opposed directions
  // V4C §4/§5 — two DIFFERENT structures, each a rival ANSWER to the asked question. They may agree or
  // disagree, but they are never one claim about one thing, and the vocabulary now says so: V4B returned
  // REINFORCING / CONTRADICTORY / SAME_PROPOSITION here, so `answersAsked` was silently doing the work of
  // target identity and every downstream branch believed the two halves shared a seat.
  | 'RIVAL_AGREEMENT'
  | 'RIVAL_CONFLICT'
  | 'ORTHOGONAL';        // no meaningful relation

const band = temporalBand;
const opposed = (a: ReasonedProposition, b: ReasonedProposition): boolean =>
  (a.direction === 'FAVORABLE' && (b.direction === 'UNFAVORABLE' || b.direction === 'RESTRICTED'))
  || (b.direction === 'FAVORABLE' && (a.direction === 'UNFAVORABLE' || a.direction === 'RESTRICTED'));

/**
 * RELATION CLASSIFICATION ORDER — V4B §4.
 *
 * V4A asked "different temporal band?" BEFORE "different target?", so two propositions about different things
 * could be classified DIFFERENT_TIME and then temporally decomposed into "방향은 맞지만 지금은 아니다". Identity
 * is settled first here — subject, claim kind, then target — and TIME IS ASKED LAST, inside the same-target
 * branch only. A temporal split with differing targets is unreachable by construction rather than by a guard
 * inside the timing rule.
 */
export function classifyPair(a: ReasonedProposition, b: ReasonedProposition): CrossRelation {
  // 1. SAME SUBJECT? Two people's charts never contradict each other.
  if (a.subject !== b.subject) return 'ORTHOGONAL';
  // A claim with no direction cannot agree or disagree with anything.
  if (a.direction === 'NONE' || b.direction === 'NONE') return 'ORTHOGONAL';
  // 2. COMPATIBLE CLAIM TYPE? A description and a recommendation are not rival answers.
  const decisional = (p: ReasonedProposition) => p.conclusionType !== 'STRUCTURAL' && p.conclusionType !== 'CAUSAL';
  if (decisional(a) !== decisional(b)) return 'ORTHOGONAL';

  // 3. SAME STRUCTURAL TARGET? This is the branch that may reach a temporal relation.
  if (sameTarget(a.target, b.target)) {
    if (a.questionAxis !== b.questionAxis) return 'DIFFERENT_AXIS';
    // V4D §4 — EXACT scope, not band. Two claims agree, contradict or restate each other only when they are
    // about the SAME MOMENT. V4C compared bands, so a 세운 conclusion and a 월운 conclusion about the same
    // seat were classified REINFORCING and merged into ONE cross conclusion whose scope was whichever of the
    // two the loop reached first — the exact scope collapse the audit names in §5.
    if (a.temporalScope !== b.temporalScope) {
      return band(a.temporalScope) !== band(b.temporalScope) ? 'DIFFERENT_TIME_BAND' : 'DIFFERENT_TIME_SCALE';
    }
    if (opposed(a, b)) return 'CONTRADICTORY';
    if (a.direction === b.direction) return 'REINFORCING';
    return 'SAME_PROPOSITION';
  }

  // 4. DIFFERENT structural targets. Two claims may still be rival ANSWERS to the asked question — 명리 reading
  //    월지 and 자미 reading 관록궁 are reading different structures but answering the same thing. That is enough
  //    to agree or disagree, and NOT enough to decompose into direction-vs-timing: no single thing is being
  //    described, so there is nothing whose direction could be right while its timing is wrong.
  //    DIFFERENT_TIME is unreachable from here — which is precisely the C7 fix.
  //    V4C §4 — `answersAsked` means QUESTION-RELEVANCE and nothing else. V4B let it return
  //    SAME_PROPOSITION / REINFORCING / CONTRADICTORY from here, which told every downstream branch that two
  //    different seats were one claim; the RIVAL_* relations keep the disagreement without the false identity.
  //    Rivalry is also CROSS-DISCIPLINE by definition: two seats read by the SAME discipline are two findings
  //    of one reading, not two independent answers that could corroborate each other.
  if (a.answersAsked && b.answersAsked && a.questionAxis === b.questionAxis && a.discipline !== b.discipline) {
    // The temporal band is deliberately NOT consulted here. These two are rival answers, so they can conflict
    // or agree — but with different structural targets there is no single thing whose direction and timing
    // could come apart, so DIFFERENT_TIME must stay unreachable no matter which bands they sit in.
    if (opposed(a, b)) return 'RIVAL_CONFLICT';
    if (a.direction === b.direction) return 'RIVAL_AGREEMENT';
    return 'DIFFERENT_TARGET';
  }

  return a.questionAxis === b.questionAxis ? 'DIFFERENT_TARGET' : 'DIFFERENT_AXIS';
}

/**
 * WHY one proposition is SUBORDINATE to another — V4B §14.
 *
 * These are not a priority ladder. V4A ran an ordered sequence (directness → named obstruction → exactness →
 * derived status → definiteness → first match) and returned the first hit, which is rank arbitration with the
 * ranks spelled in words. Each reason below is instead a PREDICATE whose applicability arises from the actual
 * relationship between the two propositions; a reason that does not apply says nothing at all.
 *
 * Resolution requires UNANIMITY among the reasons that apply. If two applicable reasons point at different
 * subordinates, the relationship does not settle the matter and the result is a standoff — deliberately, since
 * picking between them again would need an ordering, which is the thing being removed.
 */
export type SubordinationReason =
  | 'EXACT_TARGET_VS_CONTEXT'
  | 'EXACT_TIME_VS_BROAD_TIME'
  | 'DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT'
  | 'DATA_KNOWN_VS_DATA_UNCERTAIN'
  | 'DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED';

export const SUBORDINATION_TEXT: Record<SubordinationReason, string> = {
  EXACT_TARGET_VS_CONTEXT: '한쪽은 물어보신 그 대상을 직접 다루고, 다른 쪽은 그 주변 맥락을 말합니다',
  EXACT_TIME_VS_BROAD_TIME: '한쪽은 물어보신 시점을 정확히 다루고, 다른 쪽은 넓은 시기를 말합니다',
  DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT: '한쪽은 이 질문에 직접 닿는 근거 위에 서 있고, 다른 쪽은 배경 맥락뿐입니다',
  DATA_KNOWN_VS_DATA_UNCERTAIN: '한쪽은 확정된 입력에서 나왔고, 다른 쪽은 불확실한 입력에 기대고 있습니다',
  DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED: '한쪽은 채택된 학설로 판단할 수 있고, 다른 쪽은 판단 근거가 보류된 상태입니다',
};

export type SubordinationContext = {
  askedAxis: JudgmentDomain;
  /** True when the QUESTION is about a moment ("지금 계약해도 될까요?"), which is what makes time decisive. */
  asksTiming: boolean;
};

/** One relational test. Returns the SUBORDINATE side, or null when this reason has nothing to say here. */
type Test = (
  a: ReasonedProposition, b: ReasonedProposition,
  premises: Map<string, DivinationPremise>, ctx: SubordinationContext,
) => ReasonedProposition | null;

const applies = (aWins: boolean | null, a: ReasonedProposition, b: ReasonedProposition) =>
  (aWins === null ? null : aWins ? b : a);

/** Structures a discipline actually READ — the thing itself. */
const CONCRETE_TARGET_KINDS = new Set<TargetKind>([
  'NATAL_SEAT', 'NATAL_SEAT_PAIR', 'TEN_GOD_FAMILY', 'DAY_MASTER_FOOTING', 'PALACE', 'BOARD_SEAT',
]);
/**
 * Identities that describe the SURROUNDINGS of the asked matter rather than the matter: a spanning composite,
 * a place doctrine declines to look, a bare luck layer. Deliberately NOT "everything that is not concrete" —
 * an ADAPTED_READING is a discipline's real finding with the seat information merely unavailable, so this
 * reason has nothing to say about it and abstains rather than demoting it.
 */
const CONTEXT_TARGET_KINDS = new Set<TargetKind>(['COMPOSITE', 'DOCTRINE_GAP', 'LUCK_LAYER']);

/**
 * §9/§13 — is THIS side of a compound independently strong enough to assert its own half?
 *
 * A compound ("방향은 맞지만 지금은 아니다", "버는 쪽과 남는 쪽이 다르다") asserts TWO things at once. V4B asked
 * only whether each half cited ANY premise id, so a half resting on one BACKGROUND premise from an approximate
 * birth time could still claim ownership of the direction while a well-evidenced negative was demoted to
 * "timing". Both halves must now be adequately supported in their own right, or no compound is stated at all.
 */
const halfIsAsserted = (p: ReasonedProposition): boolean =>
  p.adequacy.supportAdequacy === 'ADEQUATE' && p.supportingPremiseIds.length > 0;

const TESTS: Record<SubordinationReason, Test> = {
  // V4C §8 — A TARGET TEST, not an axis test wearing a target's name. V4B fired whenever ONE side happened to
  // sit on the asked axis, so any adjacent-axis proposition lost to a reason whose own text promises to
  // compare targets ("물어보신 그 대상을 직접 다루고"). It now applies only when both claims are on the asked
  // axis, about DIFFERENT structures, and exactly one of those structures is a concrete seat the discipline
  // actually read — the other being a composite, a doctrine gap or an unscoped layer, i.e. real context.
  EXACT_TARGET_VS_CONTEXT: (a, b, _p, ctx) => {
    if (sameTarget(a.target, b.target)) return null;
    if (a.questionAxis !== ctx.askedAxis || b.questionAxis !== ctx.askedAxis) return null;
    const concrete = (p: ReasonedProposition) => CONCRETE_TARGET_KINDS.has(p.target.kind);
    const context = (p: ReasonedProposition) => CONTEXT_TARGET_KINDS.has(p.target.kind);
    if (concrete(a) && context(b)) return b;
    if (concrete(b) && context(a)) return a;
    return null;
  },
  // Applies only when the QUESTION is about a moment. Otherwise "sooner" is not a reason to believe something.
  EXACT_TIME_VS_BROAD_TIME: (a, b, _p, ctx) => {
    if (!ctx.asksTiming) return null;
    const near = (p: ReasonedProposition) => band(p.temporalScope) === 'NEAR';
    return near(a) === near(b) ? null : applies(near(a), a, b);
  },
  DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT: (a, b, premises) => {
    const direct = (p: ReasonedProposition) => [...p.supportingPremiseIds, ...p.opposingPremiseIds]
      .some((id) => premises.get(id)?.applicability === 'DIRECT');
    return direct(a) === direct(b) ? null : applies(direct(a), a, b);
  },
  DATA_KNOWN_VS_DATA_UNCERTAIN: (a, b) => {
    const known = (p: ReasonedProposition) => p.adequacy.dataCompleteness === 'COMPLETE';
    return known(a) === known(b) ? null : applies(known(a), a, b);
  },
  DOCTRINE_APPLICABLE_VS_DOCTRINE_BLOCKED: (a, b) => {
    const ok = (p: ReasonedProposition) => p.adequacy.doctrineApplicability === 'ADOPTED';
    const blocked = (p: ReasonedProposition) => p.adequacy.doctrineApplicability === 'BLOCKED';
    if (ok(a) && blocked(b)) return b;
    if (ok(b) && blocked(a)) return a;
    return null;
  },
};

export type Subordination = {
  dominant: ReasonedProposition;
  subordinate: ReasonedProposition;
  /** EVERY reason that applied. They all agree — that is the condition for subordination at all. */
  reasons: SubordinationReason[];
};

/**
 * Try to subordinate one proposition to the other from their RELATIONSHIP. Returns null for a genuine standoff:
 * either no reason applied, or the applicable reasons disagreed. §14 — a standoff is a valid outcome.
 */
export function subordinate(
  a: ReasonedProposition, b: ReasonedProposition,
  premises: Map<string, DivinationPremise>, ctx: SubordinationContext,
): Subordination | null {
  const verdicts: { reason: SubordinationReason; subordinate: ReasonedProposition }[] = [];
  for (const [reason, test] of Object.entries(TESTS) as [SubordinationReason, Test][]) {
    const loser = test(a, b, premises, ctx);
    if (loser) verdicts.push({ reason, subordinate: loser });
  }
  if (verdicts.length === 0) return null;
  const losers = new Set(verdicts.map((v) => v.subordinate.id));
  if (losers.size > 1) return null; // the applicable reasons disagree → the relationship does not settle it
  const subordinateProp = verdicts[0].subordinate;
  return {
    dominant: subordinateProp === a ? b : a,
    subordinate: subordinateProp,
    reasons: verdicts.map((v) => v.reason),
  };
}

/**
 * V4C §14 — THIS TABLE NAMES A COMPOUND. IT NO LONGER DECIDES THAT ONE EXISTS.
 *
 * V4B required a hit here before any compound could be derived, so a hand-written whitelist of four axis pairs
 * was the authority on whether two true statements could be reported as a compound truth — a lookup deciding
 * a conclusion, which is the pattern this kernel exists to remove. Whether a compound exists is now decided
 * STRUCTURALLY by compoundEligible() below (different structures, opposed, each independently asserted, one of
 * them on the asked axis). A pair the table does not list still forms a compound; it is simply named from its
 * two axis labels and filed under the generic DIFFERENT_DOMAIN decomposition.
 */
const COMPOUND_FRAMES: { a: JudgmentDomain; b: JudgmentDomain; frame: string; kind: CompoundKind }[] = [
  { a: 'MONEY_INFLOW', b: 'MONEY_RETENTION', frame: '돈이 들어오는 것과 남는 것', kind: 'INFLOW_VS_RETENTION' },
  { a: 'RELATION_BOND', b: 'RELATION_STABILITY', frame: '끌리는 힘과 같이 사는 난도', kind: 'BOND_VS_STABILITY' },
  { a: 'OPPORTUNITY', b: 'OUTCOME', frame: '기회가 오는 것과 그것을 잡아서 남는 것', kind: 'OPPORTUNITY_VS_OUTCOME' },
  { a: 'CAREER', b: 'MONEY_RETENTION', frame: '자리가 열리는 것과 실속이 남는 것', kind: 'DIFFERENT_DOMAIN' },
];

/**
 * Is this opposed pair a COMPOUND TRUTH ("둘 다 사실이라 나누어 말씀드립니다") rather than two unrelated
 * statements? Structural conditions only:
 *   · they are about DIFFERENT structures (guaranteed by the caller's relation),
 *   · their two AXES are two consequences of ONE matter (`axesShareOneMatter` — the semantic ontology that
 *     replaced V4B's fixed axis-pair table), or they are the same axis read at two different seats,
 *   · at least one of them answers the axis that was actually asked,
 *   · and EACH half actually STATES something — it stands on named premises, at least one of which is more
 *     than background context. A half resting only on "이 명식은 전반적으로 …" is not half of a truth, it is
 *     filler, and pairing it with a real finding manufactures a compound out of one finding.
 *
 * Note the deliberate difference from halfIsAsserted(): a compound does not hand either half OWNERSHIP OF THE
 * DIRECTION (it reports both), so it does not need each half to be independently decisive — only real.
 */
const compoundEligible = (
  a: ReasonedProposition, b: ReasonedProposition, askedAxis: JudgmentDomain,
  premises: Map<string, DivinationPremise>,
): boolean => {
  if (a.questionAxis !== askedAxis && b.questionAxis !== askedAxis) return false;
  // The ontology decides WHETHER a compound exists; the frames table below only NAMES it. Without this,
  // removing the table made every opposed pair a "compound truth" and a money answer acquired a sentence
  // about 같이 사는 난도 — two unrelated statements presented as two halves of one.
  if (a.questionAxis !== b.questionAxis && !axesShareOneMatter(a.questionAxis, b.questionAxis)) return false;
  const stated = (p: ReasonedProposition) => p.supportingPremiseIds.length > 0
    && p.supportingPremiseIds.some((id) => premises.get(id)?.applicability !== 'BACKGROUND');
  return stated(a) && stated(b);
};

const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const axisLabel = (d: JudgmentDomain) => AXIS_LABEL[d] ?? '이 축';
// User-visible Korean: the topic particle must agree with the preceding 받침 ('…것' → 은, '…난도' → 는).
const topic = (w: string): string => {
  const ch = w.charCodeAt(w.length - 1);
  const closed = ch >= 0xac00 && ch <= 0xd7a3 ? (ch - 0xac00) % 28 !== 0 : false;
  return `${w}${closed ? '은' : '는'}`;
};

const crossId = (rule: string, parts: ReasonedProposition[]): string =>
  `x:${rule}:${parts.map((p) => p.id).sort().join('+')}`;

function crossProp(
  rule: string, ctx: DerivationContext,
  spec: {
    axis: JudgmentDomain; temporalScope: TemporalScope; target: SemanticTarget; assertion: string;
    conclusionType: ReasonedProposition['conclusionType']; direction: ReasonedProposition['direction'];
    restriction?: ReasonedProposition['restriction'];
    /** Parents whose material BACKS the new assertion. */
    from: ReasonedProposition[];
    /** Parents whose material ARGUES WITH the new assertion (the demoted side of a resolved contradiction). */
    against?: ReasonedProposition[];
  },
  premises: Map<string, DivinationPremise>,
): ReasonedProposition {
  // V4C §12 — SIDES ARE RELATIVE TO THE NEW ASSERTION, NOT INHERITED FROM THE PARENTS.
  //
  // V4B blind-unioned every parent's supporting ids into the child's supporting ids and every parent's
  // opposing ids into its opposing ids. For a RESOLVED CONTRADICTION that is exactly backwards on one half:
  // the demoted parent's supporting premises are the evidence AGAINST the conclusion being drawn, yet they
  // were counted as backing it — so supportAdequacy ROSE because a rival disagreed, which is the disguised
  // score PropositionAdequacy was split apart to eliminate. A parent listed in "against" is therefore
  // re-sided: what supported IT opposes the new claim, and what opposed it supports the new claim.
  // V4D §7/§8 — parents are ordered by their own IDs, not by the order the pair loop happened to reach them.
  // Candidate merging appends parents, so without this the id (content-addressed on the parent set),
  // `derivedFromPropositionIds` and the premise-id ordering would all vary with input order.
  const byIdAsc = (x: ReasonedProposition, y: ReasonedProposition) => x.id.localeCompare(y.id);
  const from = [...spec.from].sort(byIdAsc);
  const against = [...(spec.against ?? [])].sort(byIdAsc);
  const parents = [...from, ...against];
  const supportIds = [...new Set([
    ...from.flatMap((p) => p.supportingPremiseIds),
    ...against.flatMap((p) => p.opposingPremiseIds),
  ])];
  const opposeIds = [...new Set([
    ...from.flatMap((p) => p.opposingPremiseIds),
    ...against.flatMap((p) => p.supportingPremiseIds),
  ])].filter((id) => !supportIds.includes(id));
  const pick = (ids: string[]) => ids.map((id) => premises.get(id)).filter((p): p is DivinationPremise => !!p);
  return {
    id: crossId(rule, parents),
    discipline: 'CROSS',
    subject: ctx.subject,
    target: spec.target,
    questionIntent: ctx.questionIntent,
    questionAxis: spec.axis,
    temporalScope: spec.temporalScope,
    assertion: spec.assertion,
    conclusionType: spec.conclusionType,
    direction: spec.direction,
    ...(spec.restriction ? { restriction: spec.restriction } : {}),
    supportingPremiseIds: supportIds,
    opposingPremiseIds: opposeIds,
    derivedFromPropositionIds: parents.map((p) => p.id),
    unresolvedPremiseIds: [],
    doctrineReferences: [...new Set(parents.flatMap((p) => p.doctrineReferences))],
    derivationRule: rule,
    adequacy: computeAdequacy(pick(supportIds), pick(opposeIds), { dataComplete: ctx.dataComplete, doctrine: 'ADOPTED' }),
  };
}

export type CrossDerivation = {
  proposition: ReasonedProposition;
  relation: CrossRelation;
  dominant?: ReasonedProposition;
  counter?: ReasonedProposition;
  /** EVERY relational reason that applied. Unanimous by construction (see subordinate()). */
  subordinationReasons?: SubordinationReason[];
  /** For a compound truth, WHICH named decomposition it is. */
  compoundKind?: ContradictionResolutionKind;
  /** True when the relationship could not subordinate either side — no winner was invented (§14). */
  standoff?: boolean;
};

/**
 * Derive cross conclusions from RELATED PAIRS.
 *
 * Every branch below is reached only through classifyPair(), which settles identity (subject → target → axis →
 * claim kind) BEFORE time. A timing decomposition is therefore unreachable unless both halves are about the
 * same subject, the same target and the same axis — which is what removes C7 as a class rather than as a case.
 */
export function deriveCross(
  props: ReasonedProposition[],
  premises: DivinationPremise[],
  ctx: DerivationContext & { asksTiming?: boolean },
): CrossDerivation[] {
  const byId = new Map(premises.map((p) => [p.id, p]));
  const subCtx: SubordinationContext = { askedAxis: ctx.askedAxis, asksTiming: ctx.asksTiming ?? false };

  /**
   * V4D §6/§7 — THE FULL SEMANTIC IDENTITY OF A CROSS CANDIDATE.
   *
   * V4C hand-wrote each key at its `add()` call site, and every one of them omitted most of the semantics:
   *
   *   CROSS_REINFORCEMENT:<target>:<direction>          — no axis, no scope, no claim type, no restriction
   *   CROSS_STANDOFF:<target>                           — no axis, no scope, no parties
   *   CROSS_CONTRADICTION_RESOLVED:<dominant target>    — no axis, no scope, no demoted side
   *   CROSS_TIMING_SPLIT:<target>:<structuralOpens>     — NO NEAR SCOPE
   *   CROSS_AXIS_COMPOUND:<kind>:<targets>              — no axis, no scope, no direction
   *
   * So two semantically DIFFERENT conclusions collided, and `add()` then kept the FIRST candidate's
   * specification while appending the second's parents. A 세운 timing split and a 월운 timing split on the
   * same seat became ONE conclusion whose scope was whichever pair the loop reached first — the exact scope
   * collapse §5 names — and a resolution that demoted 자미 merged with one that demoted 기문, keeping only
   * the first `counter`.
   *
   * The key is now DERIVED from the specification mechanically, so it cannot drift from what it identifies,
   * and it is renderer-independent: no Korean, no assertion text.
   *
   * `parties` is the identity of the specific claims the conclusion is ABOUT. It is empty only where the
   * relation is genuinely transitive over one claim (agreement): three disciplines agreeing about one seat at
   * one moment is ONE conclusion that three readings support. Wherever the conclusion NAMES the other side —
   * a resolution that demotes a rival, a standoff between two claims, a split between two halves — the other
   * side is part of what is being asserted, so it belongs in the identity and those candidates never merge.
   */
  const candidateIdentity = (
    rule: string,
    spec: Omit<Parameters<typeof crossProp>[2], 'from' | 'against'>,
    parties: ReasonedProposition[],
  ): string => [
    rule,
    ctx.subject,
    ctx.questionIntent,
    ctx.askedAxis,
    spec.axis,
    spec.target.kind,
    spec.target.key,
    spec.conclusionType,
    spec.direction,
    spec.temporalScope,
    spec.restriction ?? '-',
    parties
      .map((p) => [p.discipline, p.target.key, p.questionAxis, p.temporalScope, p.direction].join('~'))
      .sort()
      .join('+'),
  ].join('|');

  type Candidate = {
    key: string; rule: string; relation: CrossRelation;
    spec: Omit<Parameters<typeof crossProp>[2], 'from' | 'against'>;
    from: ReasonedProposition[];
    against?: ReasonedProposition[];
    dominant?: ReasonedProposition; counter?: ReasonedProposition;
    subordinationReasons?: SubordinationReason[]; compoundKind?: ContradictionResolutionKind; standoff?: boolean;
  };
  const candidates = new Map<string, Candidate>();
  const add = (c: Candidate) => {
    const existing = candidates.get(c.key);
    if (!existing) { candidates.set(c.key, c); return; }
    // §7 — NEVER RETAIN "FIRST SPECIFICATION". Reaching here means the two candidates are identical in every
    // semantic field (the key is derived from all of them), so there is no specification to choose between:
    // only PROVENANCE is merged, and `existing.spec` is not touched. Two candidates that differ in any
    // semantic field have different keys and stay two candidates.
    for (const p of c.from) if (!existing.from.some((x) => x.id === p.id)) existing.from.push(p);
    for (const p of c.against ?? []) {
      existing.against = existing.against ?? [];
      if (!existing.against.some((x) => x.id === p.id)) existing.against.push(p);
    }
    for (const r of c.subordinationReasons ?? []) {
      existing.subordinationReasons = existing.subordinationReasons ?? [];
      if (!existing.subordinationReasons.includes(r)) existing.subordinationReasons.push(r);
    }
  };

  /**
   * Emit a candidate whose key is DERIVED from its specification.
   *
   * Every V4C call site hand-wrote its own key, and every one of them left semantics out. Deriving the key
   * here means a rule cannot forget a field: adding a new spec field automatically widens every identity.
   */
  const emit = (
    rule: string,
    relation: CrossRelation,
    spec: Omit<Parameters<typeof crossProp>[2], 'from' | 'against'>,
    parties: ReasonedProposition[],
    rest: Omit<Candidate, 'key' | 'rule' | 'relation' | 'spec'>,
  ) => add({ key: candidateIdentity(rule, spec, parties), rule, relation, spec, ...rest });

  for (let i = 0; i < props.length; i += 1) {
    for (let k = i + 1; k < props.length; k += 1) {
      const a = props[i];
      const b = props[k];
      const relation = classifyPair(a, b);

      if (relation === 'REINFORCING' || relation === 'RIVAL_AGREEMENT') {
        // Reinforcement is meaningful ONLY across disciplines — two propositions from the same engine agreeing
        // is one reading, not two independent ones.
        if (a.discipline === b.discipline) continue;
        // V4C §4 — a RIVAL agreement is two DIFFERENT structures reaching the same answer, so the conclusion
        // is about the PAIR, not about one seat. Keying it to a.target (as V4B did, having called the pair
        // REINFORCING) claimed both disciplines had read the same 자리.
        // §28 — the two structures are named in the SAME order the identity is keyed in, so the sentence the
        // user reads does not change when the propositions arrive in a different order.
        const rivalPair = [a, b].sort((x, y) => x.target.key.localeCompare(y.target.key));
        const agreementTarget = relation === 'RIVAL_AGREEMENT'
          ? target('COMPOSITE', 'RIVAL:' + rivalPair.map((p) => p.target.key).join('|'),
            rivalPair.map((p) => p.target.label).join('·'))
          : a.target;
        emit('CROSS_REINFORCEMENT', relation, {
            axis: a.questionAxis,
            temporalScope: a.temporalScope,
            target: agreementTarget,
            // "두 학문이 일치합니다" tells the reader that we agree — not what we agree ABOUT. A reinforcement
            // must carry the direction it reinforces, or it is a directional verdict whose own headline states
            // no direction.
            assertion: (relation === 'RIVAL_AGREEMENT'
              ? '서로 다른 자리(' + rivalPair.map((p) => p.target.label).join(' / ') + ')를 본 두 학문이 각각의 근거로 같은 결론에 이릅니다: '
              : a.target.label + '에 대해 서로 다른 학문이 각각의 근거로 같은 결론에 이릅니다: ')
              + (a.direction === 'FAVORABLE' ? '이 축은 열려 있습니다.'
                : a.direction === 'UNFAVORABLE' ? '이 축은 막혀 있습니다.'
                  : '범위를 좁혀야 하는 자리입니다.')
              + ' 한쪽만 보고 내린 결론이 아니라는 뜻입니다.',
          conclusionType: a.conclusionType === 'COMPOUND' || b.conclusionType === 'COMPOUND' ? 'COMPOUND' : 'DIRECTIONAL',
          direction: a.direction,
          ...(a.restriction ? { restriction: a.restriction } : {}),
        },
        // Agreement is TRANSITIVE over one claim: 명리+자미 and 명리+기문 agreeing about the same seat at the
        // same moment is ONE conclusion three readings support, not three conclusions. This is the only
        // relation whose candidates may merge, and merging adds parents without touching the specification.
        [],
        { from: [a, b] });
        continue;
      }

      if (relation === 'CONTRADICTORY' || relation === 'RIVAL_CONFLICT') {
        const decided = subordinate(a, b, byId, subCtx);
        if (!decided) {
          // §14 — the relationship does not settle it. Both truths are preserved; no winner is manufactured.
          const standoffPair = [a, b].sort((x, y) => x.target.key.localeCompare(y.target.key));
          const standoffTarget = relation === 'RIVAL_CONFLICT'
            ? target('COMPOSITE', 'RIVAL:' + standoffPair.map((p) => p.target.key).join('|'),
              standoffPair.map((p) => p.target.label).join('·'))
            : a.target;
          emit('CROSS_STANDOFF', relation, {
            axis: a.questionAxis,
            temporalScope: a.temporalScope,
            target: standoffTarget,
            assertion: standoffTarget.label + '에 대해서는 반대되는 근거가 대등하게 맞서 있고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다.',
            conclusionType: 'STRUCTURAL',
            direction: 'NONE',
          },
          // A standoff NAMES the two claims it declines to choose between, so a standoff between 명리 and 자미
          // is not the same statement as one between 명리 and 기문. They never merge.
          [a, b],
          { standoff: true, from: [a, b] });
          continue;
        }
        emit('CROSS_CONTRADICTION_RESOLVED', relation, {
          axis: a.questionAxis,
          temporalScope: decided.dominant.temporalScope,
          target: decided.dominant.target,
          assertion: decided.dominant.assertion + ' 반대 근거도 있으나, '
            + decided.reasons.map((r) => SUBORDINATION_TEXT[r]).join('; ') + '.',
          conclusionType: 'DIRECTIONAL',
          direction: decided.dominant.direction,
          ...(decided.dominant.restriction ? { restriction: decided.dominant.restriction } : {}),
        },
        // The DEMOTED side is part of what this conclusion asserts ("반대 근거도 있으나 …"), so a resolution
        // that set aside 자미 is a different statement from one that set aside 기문. V4C keyed only the
        // dominant's target, merged the two, and kept the first `counter` — the reader was then told about
        // one rival and never learned the other existed.
        [decided.dominant, decided.subordinate],
        {
          // §12 — the demoted parent is the side that ARGUES WITH this conclusion, and is declared as such
          // so its evidence is re-sided rather than counted as backing the very claim it opposed.
          from: [decided.dominant], against: [decided.subordinate],
          dominant: decided.dominant, counter: decided.subordinate, subordinationReasons: decided.reasons,
        });
        continue;
      }

      // DIFFERENT_TIME_SCALE deliberately produces NOTHING. Two independent time-scoped truths at the same
      // distance are both reported as they are; relating them would need a higher-order synthesis this kernel
      // does not have, and inventing one here is how the year claim used to swallow the month claim.
      if (relation === 'DIFFERENT_TIME_BAND' && opposed(a, b)) {
        // Reachable ONLY after subject, target, axis and claim-kind have all matched. Both halves must also be
        // independently grounded — "방향은 맞지만 지금은 아니다" asserts two things, so a side resting on
        // nothing must not get to own the direction through the timing door.
        // V4C §9 — "grounded" used to mean "cites at least one premise id", which a single BACKGROUND premise
        // from an approximate birth time satisfies. Owning the DIRECTION of a compound requires that the half
        // stand on its own, so both sides must be adequately supported or no split is stated.
        if (!halfIsAsserted(a) || !halfIsAsserted(b)) continue;
        const structural = band(a.temporalScope) === 'STRUCTURAL' ? a : b;
        const near = structural === a ? b : a;
        const structuralOpens = structural.direction === 'FAVORABLE';
        emit('CROSS_TIMING_SPLIT', relation, {
            axis: a.questionAxis,
            temporalScope: near.temporalScope,
            target: a.target,
            assertion: structuralOpens
              ? a.target.label + '은(는) 큰 흐름에서 열려 있는데 가까운 시기가 바로 그 자리를 누르고 있습니다. 방향과 시점을 나눠서 봐야 합니다.'
              : a.target.label + '은(는) 가까운 시기에 움직일 여지가 보이지만 큰 흐름이 바로 그 자리를 받쳐주지 않습니다. 지금의 여지만 보고 크게 벌일 자리는 아닙니다.',
            conclusionType: 'COMPOUND',
            direction: 'RESTRICTED',
            restriction: structuralOpens ? 'TIMING' : 'SCOPE',
          },
          // Both halves are named. V4C keyed this WITHOUT the near scope, so a 세운 split and a 월운 split on
          // the same seat collided and the first one's scope survived — §5's exact-scope collapse.
          [structural, near],
          {
            from: [structural, near],
            compoundKind: near.temporalScope === 'PRESENT_MOMENT' ? 'ACTION_VS_TIMING' : 'DIFFERENT_TIMESCALE',
          });
        continue;
      }

      // A COMPOUND TRUTH is by definition about two DIFFERENT things, so it is reached from DIFFERENT_TARGET or
      // DIFFERENT_AXIS — but only when the product recognises the two axes as a named pair. Two unrelated
      // targets disagreeing is not a compound truth; it is simply two unrelated statements.
      // RIVAL_CONFLICT is deliberately NOT reachable here: it was already handled above as a conflict between
      // two rival ANSWERS to the asked question, which is settled or declared a standoff — never re-framed as
      // "both are true about different matters", since both are about the matter that was asked.
      if ((relation === 'DIFFERENT_AXIS' || relation === 'DIFFERENT_TARGET') && opposed(a, b)) {
        if (!compoundEligible(a, b, ctx.askedAxis, byId)) continue;
        const named = COMPOUND_FRAMES.find((p) =>
          (p.a === a.questionAxis && p.b === b.questionAxis) || (p.a === b.questionAxis && p.b === a.questionAxis));
        // Unnamed pairs are still compounds — they are simply described by their two axis labels.
        const frame = named ?? {
          frame: axisLabel(a.questionAxis) + '과 ' + axisLabel(b.questionAxis),
          kind: 'DIFFERENT_DOMAIN' as CompoundKind,
        };
        const asked = a.questionAxis === ctx.askedAxis ? a : b;
        const other = asked === a ? b : a;
        const way = (p: ReasonedProposition) =>
          p.direction === 'FAVORABLE' ? '열립니다'
            : p.direction === 'UNFAVORABLE' ? '막힙니다'
              : '범위를 좁혀야 합니다';
        emit('CROSS_AXIS_COMPOUND', relation, {
            axis: asked.questionAxis,
            temporalScope: asked.temporalScope,
            // V4C §2 — keyed by the compound's CANONICAL kind AND the two structures it spans, never by its
            // Korean sentence. Two different compounds of the same kind are different claims.
            target: target('COMPOSITE',
              frame.kind + ':' + [a.target.key, b.target.key].sort().join('|'), frame.frame),
            assertion: topic(frame.frame) + ' 다르게 봅니다. ' + axisLabel(asked.questionAxis) + '은 ' + way(asked)
              + ', ' + axisLabel(other.questionAxis) + '은 ' + way(other) + '. 둘 다 사실이라 나누어 말씀드립니다.',
            conclusionType: 'COMPOUND',
            direction: asked.direction,
            ...(asked.restriction ? { restriction: asked.restriction } : {}),
          },
          // The compound NAMES both axes and how each one goes, so a 유입-vs-보유 compound is not the same
          // statement as a 유입-vs-자리 one even when the frame kind happens to match.
          [a, b],
          { from: [a, b], compoundKind: frame.kind });
      }
    }
  }

  return [...candidates.values()].map((c) => ({
    proposition: crossProp(c.rule, ctx, { ...c.spec, from: c.from, ...(c.against ? { against: c.against } : {}) }, byId),
    relation: c.relation,
    ...(c.dominant ? { dominant: c.dominant } : {}),
    ...(c.counter ? { counter: c.counter } : {}),
    ...(c.subordinationReasons ? { subordinationReasons: c.subordinationReasons } : {}),
    ...(c.compoundKind ? { compoundKind: c.compoundKind } : {}),
    ...(c.standoff ? { standoff: c.standoff } : {}),
  }));
}
