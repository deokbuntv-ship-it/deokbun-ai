// V4B §16–§20 / V4C §15–§20 — INDEPENDENT SYNTHESIS CERTIFICATION. TEST-ONLY; nothing in `src` may import this.
//
// The runtime is allowed to NOMINATE (`screenSynthesis` → CANDIDATE_SYNTHESIS) and nothing more. V4A let the
// engine award itself `REAL_SYNTHETIC_INFERENCE` from object shape and then counted its own labels, which is
// how 2 real inferences were reported as 117. Certification therefore lives here, outside the thing being
// measured, and is decided by OBSERVED BEHAVIOUR: remove, reverse, retarget, rescope or re-direct an exact
// input, re-derive, and see whether THAT conclusion actually changed — in the way that input's removal is
// SUPPOSED to change it.
//
// WHAT V4C CHANGED, and why each change was necessary:
//
//   §15  ONE POPULATION. The QA pack and this harness used to build their candidate lists independently
//        (`standing.filter(rule !== PRIMITIVE)` here, `screenAll` totals there) and compare COUNTS. Equal
//        totals cannot detect a conclusion present in one list and absent from the other. Both now enumerate
//        through the runtime's own `candidatePropositions()`, and a test asserts SET equality.
//   §16  COMPLETE IDENTITY. `rule|axis|target` omitted the subject and the claim kind, so a re-derivation could
//        match a DIFFERENT conclusion to the one under test and report "unchanged".
//   §17  NO "ANY MUTATION MOVED". V4B accepted a candidate if ANY mutation changed ANYTHING. A cross conclusion
//        could therefore be certified because re-scoping a parent altered its wording while removing that same
//        parent left it untouched. Every mutation now declares WHAT it must change, and the required ones must
//        all hold.
//   §18  PARENT DIRECTION. A cross conclusion that survives its parent pointing the OTHER WAY is not reading
//        its parents. V4B never ran that attack.
//   §19  NO NO-OPS. A mutation that leaves the input set identical (reversing a relation to itself, removing an
//        id that is not there) proves nothing and is discarded rather than counted as evidence either way.
//   §20  STRICT REDUNDANCY on the SAME SIDE. V4B looked for peers in `supportingPremiseIds` even when the
//        premise under test was an OPPOSING one, so a support premise could "explain" why removing a counter
//        premise changed nothing.
import {
  MYUNGRI_RULES, PRIMITIVE_RULE, candidatePropositions, deriveCross, primitivePropositions, runDerivations,
  natalSeatPairTarget, screenSynthesis, standingPropositions, temporalBand,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticRelation,
  type SynthesisClass,
} from '@/features/divination';

/**
 * §16 — SEMANTIC IDENTITY of a conclusion: everything that says WHAT IT IS ABOUT, and nothing that says what
 * it CLAIMS. Stable across re-derivation (derived ids are content-addressed on premise ids, so they change),
 * renderer-independent, and complete enough that no other conclusion can be mistaken for this one.
 *
 * V4D §16 — WHAT IS IN, AND THE TWO THINGS DELIBERATELY LEFT OUT.
 *
 * ADDED: `discipline` (a 명리 and a CROSS conclusion about one seat are two conclusions) and
 * `questionIntent` (the same rule answering a DECISION and a CAUSE_WHY question states different things).
 *
 * NOT ADDED — `direction` and `restriction`. §16 lists them, and including them would be a MEASURABLE
 * WEAKENING, not a tightening. The harness re-finds a conclusion by this key and then reports which component
 * moved; a mutation that changed only the direction would fail the key lookup and be reported ABSENT, i.e.
 * "the conclusion is gone". That reading is wrong on its face, and it is actively harmful for the mutations
 * whose REQUIRED expectation is ABSENT (re-targeting a parent must DELETE the conclusion): a conclusion that
 * merely flipped direction would satisfy that expectation without having gone anywhere. Direction and
 * restriction are therefore OBSERVED components, and §17's per-component expectations are what make them
 * load-bearing — see `Expectation`.
 *
 * NOT ADDED — the ASKED TARGET. It is a property of the RUN, constant across every conclusion in the
 * population being certified, so it cannot discriminate between any two of them. Adding it would lengthen
 * every key and separate nothing.
 *
 * The TEMPORAL SCOPE is in, because §21 makes it identity: a year-level claim and a month-level claim about
 * the same seat are two conclusions, not one conclusion with a field.
 */
export const conclusionKey = (p: ReasonedProposition): string => [
  p.derivationRule, p.discipline, p.subject, p.questionIntent, p.questionAxis,
  p.target.key, p.conclusionType, p.temporalScope,
].join('|');

/** WHICH component of the conclusion moved. Ordered from strongest evidence of dependence to weakest. */
export type Delta = 'ABSENT' | 'DIRECTION' | 'RESTRICTION' | 'ASSERTION' | 'NONE';

function observe(before: ReasonedProposition, after: ReasonedProposition[]): Delta {
  const match = after.find((p) => conclusionKey(p) === conclusionKey(before));
  if (!match) return 'ABSENT';
  if (match.direction !== before.direction) return 'DIRECTION';
  if (match.restriction !== before.restriction) return 'RESTRICTION';
  if (match.assertion !== before.assertion) return 'ASSERTION';
  return 'NONE';
}

/**
 * What a mutation is REQUIRED to produce — V4D §17, which asks that an expectation name the COMPONENT rather
 * than settle for "something moved".
 *
 *   ABSENT     the conclusion must be GONE. Nothing weaker counts.
 *   DIRECTION  the conclusion's DIRECTION (or its restriction, which is a direction's shape) must move. A
 *              re-worded assertion does NOT satisfy this: a cross conclusion that survives its parent pointing
 *              the other way with only a sentence change is reading that the parent EXISTS, not what it says.
 *   SEMANTIC   the CLAIM changed — absent, re-directed, re-restricted or re-stated.
 *   ANY        informational; any observable movement counts.
 */
export type Expectation = 'ABSENT' | 'DIRECTION' | 'SEMANTIC' | 'ANY';
const satisfies = (expect: Expectation, observed: Delta): boolean => {
  if (expect === 'ABSENT') return observed === 'ABSENT';
  if (expect === 'DIRECTION') {
    return observed === 'ABSENT' || observed === 'DIRECTION' || observed === 'RESTRICTION';
  }
  // SEMANTIC = the CLAIM changed, not merely its wording drifted with a re-rendered label.
  if (expect === 'SEMANTIC') return observed === 'ABSENT' || observed === 'DIRECTION' || observed === 'RESTRICTION' || observed === 'ASSERTION';
  return observed !== 'NONE';
};

export type MutationKind =
  | 'REMOVE_PREMISE' | 'REVERSE_PREMISE'
  | 'REMOVE_PARENT' | 'RETARGET_PARENT' | 'RESCOPE_PARENT' | 'REDIRECT_PARENT';

export type MutationResult = {
  premiseId: string;
  label: string;
  kind: MutationKind;
  expect: Expectation;
  observed: Delta;
  /** Did the mutation produce the change it was supposed to produce? */
  changed: boolean;
  /** §17 — a REQUIRED mutation must hold for the conclusion to be certified REAL. */
  required: boolean;
  /** §19 — the mutation left the inputs identical, so it demonstrates nothing in either direction. */
  noop?: boolean;
};

export type Certification = {
  key: string;
  rule: string;
  assertion: string;
  klass: SynthesisClass;
  /** Why it landed in that class, in one line — printed into the QA pack. */
  because: string;
  removals: MutationResult[];
  reversals: MutationResult[];
  /** Extra mutations for cross conclusions (parent removal / target / temporal scope / direction). */
  structural: MutationResult[];
};

export type Rederive = (premises: DivinationPremise[]) => ReasonedProposition[];

/** The reversal that makes a premise mean the opposite thing, or null when it has no meaningful opposite. */
const OPPOSITE: Partial<Record<SemanticRelation, SemanticRelation>> = {
  SUPPORTS: 'OPPOSES', OPPOSES: 'SUPPORTS',
  ENABLES: 'CONSTRAINS', CONSTRAINS: 'ENABLES',
  STABILIZES: 'WEAKENS', WEAKENS: 'STABILIZES',
  CONNECTS: 'SEPARATES', SEPARATES: 'CONNECTS',
  ACTIVATES: 'ABSENT',
  DESTABILIZES: 'CONNECTS',
};

/**
 * Certify ONE conclusion by mutating its OWN inputs and re-running the given derivation.
 *
 * REAL requires ALL of:
 *   · the runtime screened it as a candidate;
 *   · the UNMUTATED derivation actually produces it;
 *   · every REQUIRED mutation produced the change it was supposed to produce (§17/§18);
 *   · at least one premise removal changed it — the conclusion needs its evidence;
 *   · and, where any premise has a meaningful opposite, at least one reversal changed it — the conclusion
 *     reads what the evidence SAYS, not merely that some evidence is present.
 * No-op mutations (§19) are discarded before any of that is decided.
 */
export function certify(
  proposition: ReasonedProposition,
  premises: DivinationPremise[],
  rederive: Rederive,
  extraMutations: MutationResult[] = [],
): Certification {
  const byId = new Map(premises.map((p) => [p.id, p]));
  const screened = screenSynthesis(proposition, byId);
  const structural = extraMutations.filter((m) => !m.noop);
  const base = {
    key: conclusionKey(proposition),
    rule: proposition.derivationRule,
    assertion: proposition.assertion,
    removals: [] as MutationResult[],
    reversals: [] as MutationResult[],
    structural,
  };

  if (screened !== 'CANDIDATE_SYNTHESIS') {
    return {
      ...base,
      klass: screened satisfies Exclude<typeof screened, 'CANDIDATE_SYNTHESIS'> as SynthesisClass,
      because: screened === 'STATIC_RULE_OUTPUT' ? '단일 전제 재진술 — 추론이 아님'
        : screened === 'MULTI_FACT_SUMMARY' ? '전제를 나열·반복했을 뿐, 새 진술이 없음'
          : '근거가 전혀 없음',
    };
  }

  // A conclusion that the UNMUTATED derivation does not even produce is not a product of this reasoning, and
  // every mutation would trivially "change" it (it is absent either way). V4A-style self-labelling could have
  // slipped through exactly here, so presence is checked before anything else.
  if (!rederive(premises).some((p) => conclusionKey(p) === conclusionKey(proposition))) {
    return { ...base, klass: 'UNSUPPORTED_INFERENCE', because: '이 추론 경로가 실제로 만들어 내지 않는 결론' };
  }

  const inputIds = [...new Set([...proposition.supportingPremiseIds, ...proposition.opposingPremiseIds])];
  const inputs = inputIds.map((id) => byId.get(id)).filter((p): p is DivinationPremise => !!p);

  const removals: MutationResult[] = inputs.map((p) => {
    const observed = observe(proposition, rederive(premises.filter((x) => x.id !== p.id)));
    return {
      premiseId: p.id,
      label: `remove ${p.semanticRelation}·${p.target.label}`,
      kind: 'REMOVE_PREMISE' as const,
      expect: 'SEMANTIC' as const,
      observed,
      changed: satisfies('SEMANTIC', observed),
      // Over-determination is real: a conclusion may legitimately survive losing ONE of several supports.
      // So no single removal is required — but at least one must bite (checked below).
      required: false,
    };
  });

  const reversals: MutationResult[] = inputs
    .filter((p) => OPPOSITE[p.semanticRelation] && OPPOSITE[p.semanticRelation] !== p.semanticRelation)
    .map((p) => {
      const flipped = OPPOSITE[p.semanticRelation]!;
      const observed = observe(
        proposition,
        rederive(premises.map((x) => (x.id === p.id ? { ...x, semanticRelation: flipped } : x))),
      );
      return {
        premiseId: p.id,
        label: `reverse ${p.semanticRelation}→${flipped}·${p.target.label}`,
        kind: 'REVERSE_PREMISE' as const,
        expect: 'SEMANTIC' as const,
        observed,
        changed: satisfies('SEMANTIC', observed),
        required: false,
      };
    });

  // §17 — the per-input expectations that MUST hold.
  const requiredFailures = structural.filter((m) => m.required && !m.changed);
  // §15 — a declared group is a STRONGER and more honest statement than "one removal moved something", so
  // when a rule declares its groups they replace the fallback rather than being added to it. Group failures
  // are already required mutations, so they land in `requiredFailures` above.
  const declaresGroups = (proposition.supportGroups ?? []).length > 0;
  const anyRemovalBites = declaresGroups || removals.some((m) => m.changed);
  const reversalsNeeded = reversals.length > 0;
  const anyReversalBites = reversals.some((m) => m.changed);

  // WHERE THE EVIDENCE COMES FROM depends on what the conclusion actually reasons over.
  //
  // A Myungri conclusion is derived from PREMISES, so mutating premises is the attack. A CROSS conclusion is
  // derived from PROPOSITIONS — `crossRederive` varies the premise set but rebuilds from the same parents, so
  // a premise removal cannot move it and demanding one would fail every cross conclusion for the wrong reason.
  // Its evidence is the parent attack set instead, every member of which is REQUIRED (§17/§18): removing a
  // parent must change the claim, making the halves about different things must delete it, and a parent
  // pointing the other way must change it.
  //
  // V4D — THIS IS NOW STATED DIRECTLY. V4C inferred it from "some structural mutation is required", which was
  // true only while CROSS conclusions were the only ones with parent attacks. `parentMutations` gives Myungri
  // conclusions required parent attacks too, and under the old predicate every Myungri conclusion with a
  // derived parent would have been silently exempted from the premise attack it must still pass.
  const parentDriven = proposition.discipline === 'CROSS';
  const real = requiredFailures.length === 0
    && (parentDriven
      ? true // every required parent attack held — checked by `requiredFailures` above
      : anyRemovalBites && (!reversalsNeeded || anyReversalBites));

  return {
    ...base,
    removals,
    reversals,
    klass: real ? 'REAL_SYNTHETIC_INFERENCE' : 'MULTI_FACT_SUMMARY',
    because: real
      ? `필수 변형이 모두 이 결론을 바꿨고(${structural.filter((m) => m.required).length}건), 전제 삭제·역전에도 반응함`
      : requiredFailures.length > 0
        ? `필수 변형이 결론을 바꾸지 못함: ${requiredFailures.map((m) => `${m.label}(기대 ${m.expect}, 실제 ${m.observed})`).join('; ')}`
        : !anyRemovalBites
          ? '어떤 전제를 지워도 결론이 그대로 — 과다결정이거나 장식적 근거'
          : '전제를 뒤집어도 결론이 그대로 — 근거의 존재만 읽고 내용은 읽지 않음',
  };
}

/**
 * §20 — STRICT REDUNDANCY, ON THE SAME SIDE. A premise is REDUNDANT only when it alone changes nothing,
 * ANOTHER premise ON THE SAME SIDE OF THE SAME CLAIM substitutes for it, and removing that whole side DOES
 * change the conclusion. Anything else is INERT.
 *
 * V4B looked for peers in `supportingPremiseIds` regardless of which side the premise under test was on, so a
 * counter premise could be excused as "redundant" by supporting premises that argue the other way — which is
 * not substitution at all. Redundancy is a positive claim and must be demonstrated as one.
 */
export function classifyPremiseMateriality(
  proposition: ReasonedProposition,
  premise: DivinationPremise,
  premises: DivinationPremise[],
  rederive: Rederive,
): 'MATERIAL' | 'REDUNDANT' | 'INERT' {
  if (satisfies('SEMANTIC', observe(proposition, rederive(premises.filter((x) => x.id !== premise.id))))) {
    return 'MATERIAL';
  }
  // A premise the conclusion never cited cannot be REDUNDANT *for that conclusion* — there is no support set it
  // belongs to. It is simply inert here, and calling it redundant would be the catch-all §20 forbids.
  const supporting = new Set(proposition.supportingPremiseIds);
  const opposing = new Set(proposition.opposingPremiseIds);
  const side = supporting.has(premise.id) ? supporting : opposing.has(premise.id) ? opposing : null;
  if (!side) return 'INERT';
  const peers = premises.filter((p) => p.id !== premise.id && side.has(p.id));
  if (peers.length === 0) return 'INERT'; // nothing else backs the claim on this side, yet removing it did nothing
  const withoutSide = premises.filter((p) => p.id !== premise.id && !peers.some((q) => q.id === p.id));
  return satisfies('SEMANTIC', observe(proposition, rederive(withoutSide))) ? 'REDUNDANT' : 'INERT';
}

/** Re-derive Myungri's graph from a premise set — the mutation target for Myungri certification. */
export const myungriRederive = (ctx: DerivationContext): Rederive => (ps) =>
  standingPropositions(runDerivations(MYUNGRI_RULES, ps, primitivePropositions(ps, ctx), ctx))
    .filter((p) => p.derivationRule !== PRIMITIVE_RULE);

/**
 * §19 — Re-derive the CROSS layer. V4A's metamorphic tests never mutated cross reasoning at all, so no cross
 * conclusion had ever been shown to depend on anything.
 */
export const crossRederive = (
  props: ReasonedProposition[],
  ctx: DerivationContext & { asksTiming?: boolean },
): Rederive => (ps) => deriveCross(props, ps, ctx).map((d) => d.proposition);

/**
 * §15 — THE candidate population, taken from the runtime's own enumerator so a test can never certify a
 * different set than the engine nominated.
 */
export const candidatesOf = (
  props: ReasonedProposition[], premises: DivinationPremise[],
): ReasonedProposition[] => candidatePropositions(props, premises);

/** Every premise a conclusion stands on, INCLUDING those reachable only through a derived parent. */
function premiseClosure(
  p: ReasonedProposition, props: ReasonedProposition[], seen = new Set<string>(),
): Set<string> {
  const out = new Set([...p.supportingPremiseIds, ...p.opposingPremiseIds]);
  for (const id of p.derivedFromPropositionIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const parent = props.find((q) => q.id === id);
    if (parent) for (const x of premiseClosure(parent, props, seen)) out.add(x);
  }
  return out;
}

/**
 * V4D §13/§14 — ATTACK THE DERIVED PARENTS A PREMISE-BUILT CONCLUSION STANDS ON.
 *
 * `certify` mutates only the premises a conclusion cites DIRECTLY. INFLOW_VS_RETENTION stands on a derived
 * CONTESTED_SHARE whose premises it does not cite, so the entire retention half of its claim sat outside the
 * attack surface: the pack certified it REAL after mutating exactly one premise, and the independent audit
 * counted that as one of two false REALs.
 *
 * A derived parent is removed the only way it CAN be — by removing the premises that produce it — and that
 * removal is REQUIRED (§17): a parent a conclusion declares but does not depend on is not a parent.
 *
 * PRIMITIVE parents (`p:<premiseId>`) are skipped: their premise is already in the conclusion's own removal
 * set, so attacking them again is the same mutation counted twice (§19).
 */
export function parentMutations(
  conclusion: ReasonedProposition,
  props: ReasonedProposition[],
  premises: DivinationPremise[],
  rederive: Rederive,
): MutationResult[] {
  const own = new Set([...conclusion.supportingPremiseIds, ...conclusion.opposingPremiseIds]);
  const out: MutationResult[] = [];
  for (const id of conclusion.derivedFromPropositionIds) {
    const parent = props.find((q) => q.id === id);
    if (!parent || parent.derivationRule === PRIMITIVE_RULE) continue;
    const group = [...premiseClosure(parent, props)].filter((x) => !own.has(x));
    if (group.length === 0) continue;                       // §19 — nothing to remove is not an attack
    const observed = observe(conclusion, rederive(premises.filter((x) => !group.includes(x.id))));
    out.push({
      premiseId: parent.id,
      label: `remove parent ${parent.derivationRule}·${parent.target.label} (전제 ${group.length}건)`,
      kind: 'REMOVE_PARENT',
      expect: 'SEMANTIC',
      observed,
      changed: satisfies('SEMANTIC', observed),
      required: true,
    });
  }
  return out;
}

/**
 * V4D §15 — OVERDETERMINATION, TESTED HONESTLY.
 *
 * `anyRemovalBites` accepts a conclusion when ONE of its premises moves it, which cannot separate an honestly
 * overdetermined conclusion (several interchangeable supports) from a decorated one (one premise doing all the
 * work while three ride along). RECURRING_FRICTION_CAUSE passes today with two of four removals observing
 * NONE. A rule that knows its inputs are interchangeable says so, and the group is attacked AS A GROUP: every
 * member removed at once must move the conclusion, and no single member has to.
 */
export function groupMutations(
  conclusion: ReasonedProposition,
  premises: DivinationPremise[],
  rederive: Rederive,
): MutationResult[] {
  const out: MutationResult[] = [];
  for (const g of conclusion.supportGroups ?? []) {
    const present = g.ids.filter((id) => premises.some((p) => p.id === id));
    if (present.length === 0) continue;                                  // §19 — no-op
    const sets = g.role === 'REQUIRED' ? present.map((id) => [id]) : [present];
    for (const set of sets) {
      const observed = observe(conclusion, rederive(premises.filter((p) => !set.includes(p.id))));
      out.push({
        premiseId: set.join('+'),
        label: `${g.role === 'REQUIRED' ? 'remove required' : 'remove ALL of'} ${g.label} (${set.length}건)`,
        kind: 'REMOVE_PREMISE',
        expect: 'SEMANTIC',
        observed,
        changed: satisfies('SEMANTIC', observed),
        required: true,
      });
    }
  }
  return out;
}

/**
 * Mutate the PROPOSITIONS a cross conclusion reasons over — removal, re-targeting, re-scoping, re-direction.
 *
 * Each mutation states WHAT it must change (§17). Removing a parent must change the claim; making the two
 * halves about different things, or (for a timing split) putting them in the same temporal band, must remove
 * the conclusion entirely; and a parent pointing the other way must change the claim (§18).
 */
/**
 * A canonical target that is not any structure the rules read, used to make a parent be "about something
 * else" without leaving the closed-world registry.
 */
const MUTATED_TARGET = natalSeatPairTarget('YEAR', 'YEAR');

export function crossMutations(
  conclusion: ReasonedProposition,
  props: ReasonedProposition[],
  premises: DivinationPremise[],
  ctx: DerivationContext & { asksTiming?: boolean },
): MutationResult[] {
  const parents = conclusion.derivedFromPropositionIds
    .map((id) => props.find((p) => p.id === id))
    .filter((p): p is ReasonedProposition => !!p);
  const rerun = (mutated: ReasonedProposition[]) =>
    deriveCross(mutated, premises, ctx).map((d) => d.proposition);
  const out: MutationResult[] = [];
  // A timing split is the one rule whose meaning depends on the two halves sitting in DIFFERENT bands, so it
  // is the one rule for which re-scoping must be fatal. Requiring it everywhere would fail conclusions that
  // legitimately do not care about the band.
  const scopeIsLoadBearing = conclusion.derivationRule === 'CROSS_TIMING_SPLIT';

  const record = (
    parent: ReasonedProposition, kind: MutationKind, label: string, expect: Expectation,
    mutated: ReasonedProposition[], required: boolean,
  ): MutationResult => {
    // §19 — if the mutation produced an identical population it demonstrates nothing.
    const noop = mutated.length === props.length
      && mutated.every((p, i) => p === props[i]);
    const observed = observe(conclusion, rerun(mutated));
    return {
      premiseId: parent.id, kind, label, expect, observed,
      changed: satisfies(expect, observed),
      required: required && !noop,
      ...(noop ? { noop: true } : {}),
    };
  };

  const OPPOSITE_DIRECTION: Record<ReasonedProposition['direction'], ReasonedProposition['direction']> = {
    FAVORABLE: 'UNFAVORABLE', UNFAVORABLE: 'FAVORABLE', RESTRICTED: 'FAVORABLE', NONE: 'NONE',
  };

  for (const parent of parents) {
    out.push(record(parent, 'REMOVE_PARENT', `remove ${parent.discipline}:${parent.target.label}`,
      'SEMANTIC', props.filter((p) => p.id !== parent.id), true));

    // TARGET MUTATION — a conclusion about the same thing must NOT survive the two halves becoming different
    // things. This is the attack V4A's classifier could not have failed, because it never ran it.
    //
    // V4D — the replacement must be a CANONICAL target, not a corrupted key. V4C appended '::MUTATED', which
    // the closed-world registry now rejects; a rule that then tries to mint a composite over it THROWS, so
    // the attack crashed the derivation instead of observing it produce nothing.
    out.push(record(parent, 'RETARGET_PARENT', `retarget ${parent.discipline}:${parent.target.label}`,
      'ABSENT', props.map((p) => (p.id === parent.id ? { ...p, target: MUTATED_TARGET } : p)), true));

    // Rescoping to NATAL is only a real attack on a NEAR parent: it is what collapses the two halves into one
    // band. Moving a parent that is ALREADY structural (DAEWOON→NATAL) leaves the band relationship exactly as
    // it was, so requiring the conclusion to vanish would fail it for a mutation that changed nothing relevant.
    const bandChanging = temporalBand(parent.temporalScope) === 'NEAR';
    out.push(record(parent, 'RESCOPE_PARENT', `rescope ${parent.discipline}:${parent.temporalScope}→NATAL`,
      scopeIsLoadBearing && bandChanging ? 'ABSENT' : 'ANY',
      props.map((p) => (p.id === parent.id ? { ...p, temporalScope: 'NATAL' as const } : p)),
      scopeIsLoadBearing && bandChanging));

    // §18 — DIRECTION MUTATION. A cross conclusion that survives its parent asserting the OPPOSITE is not
    // reading that parent; it is reading that the parent EXISTS.
    const flipped = OPPOSITE_DIRECTION[parent.direction];
    // §17 — the EXPECTED COMPONENT is the DIRECTION. V4C accepted SEMANTIC here, which a re-worded assertion
    // satisfies: a conclusion could "pass" the direction attack while its own direction never moved.
    out.push(record(parent, 'REDIRECT_PARENT', `redirect ${parent.discipline}:${parent.direction}→${flipped}`,
      'DIRECTION',
      flipped === parent.direction
        ? props
        : props.map((p) => (p.id === parent.id ? { ...p, direction: flipped } : p)),
      flipped !== parent.direction));
  }
  return out;
}
