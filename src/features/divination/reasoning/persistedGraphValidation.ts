// G6 PERSISTENCE BOUNDARY — PATCH 2. Shared, pure, software-semantic validators for a RESTORED graph.
//
// decisionMeta.ts's whitelist parser is a strict FAIL-CLOSED gate, but until this patch its semantic checks
// were either count-only (ancestry >= N) or scoped to one construction path (Myungri-native PRIMITIVE only,
// skipping the discipline adapter's ZIWEI/QIMEN/pair-MYUNGRI primitives entirely). Both gaps let a persisted
// row assert a shape no reasoner in this kernel could have produced — an adapter OPPOSES premise "supporting"
// a persisted FAVORABLE primitive, or a known rule name paired with an unrelated parent set.
//
// Everything here is REUSE, not a second doctrine table: the relation/direction tables mirror
// disciplineAdapter.ts's and myungriRules.ts's own construction code exactly (cited inline), and the CROSS
// validators call the SAME classifyPair/subordinate/opposed/halfIsAsserted/compoundEligible functions the
// live reasoner uses to decide whether a pair may produce a given rule — imported, not re-implemented.
import { classifyPair, crossCompoundFrame, halfIsAsserted, opposed } from './crossRules';
import { axesShareOneMatter } from '../axisOntology';
import {
  resolveAnswer, standingPropositions, temporalBand,
  type ConclusionDirection, type ConclusionType, type DivinationPremise, type ReasonedProposition,
} from './kernel';
import { agreedStance, selectAnswerCandidates, stanceOf } from './crossReasoner';
import { NO_SIGNAL, type JudgmentDomain, type QuestionIntent, type Stance } from '../contracts';
import {
  contestedShareChild,
  convergentSeatPressureChild,
  crossAxisCompoundChild,
  crossChildEvidence,
  crossContradictionResolvedChild,
  crossReinforcementChild,
  crossStandoffChild,
  crossTimingSplitChild,
  derivedChildSemanticsMatch,
  directionVsExecutionChild,
  inflowVsRetentionChild,
  recurringFrictionChild,
  type DerivedChildSemantics,
} from './derivedChildPostconditions';

const resolveIds = (ids: string[], byId: Map<string, DivinationPremise>): DivinationPremise[] | null => {
  const out: DivinationPremise[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) return null; // referential integrity is also checked elsewhere; this call site fails closed too
    out.push(p);
  }
  return out;
};

// ══ ITEM 1 — ONE SHARED PRIMITIVE VALIDATOR, NATIVE + ADAPTER ALIKE ═══════════════════════════════
//
// A PRIMITIVE restates exactly one ASSERTING/DESCRIBING premise. Two constructors mint one:
//   · myungriRules.ts's primitivePropositions() — one ASSERTS-role premise, never a counter-premise.
//   · disciplineAdapter.ts's adaptJudgment() (ZIWEI/QIMEN/pair-MYUNGRI) — one premise whose role is
//     ASSERTS/DESCRIBES depending on isDirectional(stance), optionally paired with a QUALIFIES-role
//     counter-premise when the sub-judgment carried evidence on both sides.
//
// Both constructors reduce to the SAME relation -> {conclusionType, direction} table below (verified against
// both source files, not asserted): myungriRules.ts's own table for the 296 premises it can promote, and
// disciplineAdapter.ts's relationFor()+DIRECTION_OF+isDirectional() for the (disjoint) relation set an
// adapter primitive can ever carry. No relation is claimed by both with a DIFFERENT shape.
const PRIMITIVE_RELATION_SHAPE: Partial<Record<
  DivinationPremise['semanticRelation'], { conclusionType: ConclusionType; direction: ConclusionDirection }
>> = {
  ABSENT: { conclusionType: 'STRUCTURAL', direction: 'NONE' },
  ACTIVATES: { conclusionType: 'STRUCTURAL', direction: 'NONE' }, // myungri-native only
  ENABLES: { conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE' },
  CONNECTS: { conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE' }, // myungri-native only
  SUPPORTS: { conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE' }, // adapter only
  DESTABILIZES: { conclusionType: 'DIRECTIONAL', direction: 'UNFAVORABLE' }, // myungri-native only
  OPPOSES: { conclusionType: 'DIRECTIONAL', direction: 'UNFAVORABLE' },
  CONSTRAINS: { conclusionType: 'DIRECTIONAL', direction: 'RESTRICTED' },
  DELAYS: { conclusionType: 'DIRECTIONAL', direction: 'RESTRICTED' }, // adapter only
};

// The target kinds ONLY myungriPremises.ts mints (targets.ts's registry) — disjoint from the adapter's
// PALACE / BOARD_SEAT / ADAPTED_READING / DOCTRINE_GAP. A native primitive never carries a counter-premise
// (myungriRules.ts's primitivePropositions() never sets one); an adapter primitive sometimes does.
const MYUNGRI_NATIVE_TARGET_KINDS = new Set([
  'NATAL_SEAT', 'NATAL_SEAT_PAIR', 'TEN_GOD_FAMILY', 'LUCK_LAYER', 'DAY_MASTER_FOOTING',
]);

export function validatePersistedPrimitive(
  prop: Pick<ReasonedProposition, 'target' | 'questionAxis' | 'temporalScope' | 'subject'
    | 'supportingPremiseIds' | 'opposingPremiseIds' | 'conclusionType' | 'direction'>,
  premiseById: Map<string, DivinationPremise>,
): boolean {
  if (prop.supportingPremiseIds.length !== 1) return false;
  if (prop.opposingPremiseIds.length > 1) return false;
  const src = premiseById.get(prop.supportingPremiseIds[0]);
  if (!src) return false;
  const shape = PRIMITIVE_RELATION_SHAPE[src.semanticRelation];
  if (!shape) return false; // a relation no PRIMITIVE constructor ever promotes
  const expectedRole = src.semanticRelation === 'ABSENT' ? 'DESCRIBES' : 'ASSERTS';
  if (src.role !== expectedRole) return false;
  if (src.target.key !== prop.target.key) return false;
  if (src.questionAxis !== prop.questionAxis || src.temporalScope !== prop.temporalScope) return false;
  if (src.subject !== prop.subject) return false;
  if (prop.conclusionType !== shape.conclusionType) return false;
  if (prop.direction !== shape.direction) return false;

  if (prop.opposingPremiseIds.length === 1) {
    // Only the adapter ever mints a counter-premise. disciplineAdapter.ts:128-140: role is unconditionally
    // QUALIFIES, target is disciplineTarget() called again (same kind as the main premise), and
    // semanticRelation is fixed by the WINNING direction: SUPPORTS when direction is UNFAVORABLE/RESTRICTED,
    // else OPPOSES — copied verbatim from that condition, not re-derived.
    if (MYUNGRI_NATIVE_TARGET_KINDS.has(prop.target.kind)) return false;
    const counter = premiseById.get(prop.opposingPremiseIds[0]);
    if (!counter) return false;
    if (counter.role !== 'QUALIFIES') return false;
    if (counter.target.key !== prop.target.key) return false;
    const expectedCounterRelation = prop.direction === 'UNFAVORABLE' || prop.direction === 'RESTRICTED'
      ? 'SUPPORTS' : 'OPPOSES';
    if (counter.semanticRelation !== expectedCounterRelation) return false;
  }
  return true;
}

// ══ ITEM 2 — RULE-AWARE DERIVATION VALIDATION ═══════════════════════════════════════════════════
//
// Replaces count-only ancestry authority ("this rule needs >= N parents") with the actual semantic parent
// contract each rule's apply()/emit() body requires, read off the ACTUAL cited premises/parent propositions
// rather than merely counted. "Known rule name + an unrelated parent set" is rejected because the parents no
// longer satisfy the rule's real precondition, not because a total is too low.

const STRUCTURAL_SCOPES = new Set(['NATAL', 'DAEWOON']);
const NEAR_SCOPES = new Set(['SEWOON', 'WOLWOON', 'PRESENT_MOMENT']);

/** Every premise a proposition cites (support ∪ oppose) must be classifiable into a known bucket for its
 *  rule — an id that fits none of them is exactly "an unrelated parent set" wearing a known rule's name. */
const allClassified = (premises: DivinationPremise[], ...buckets: Set<string>[]): boolean =>
  premises.every((p) => buckets.some((b) => b.has(p.id)));

/** ancestry (derivedFromPropositionIds) must equal exactly the ASSERTS-role subset of the cited premises,
 *  each as `p:<id>` — mirrors myungriRules.ts's shared make() helper's own construction precisely. */
const ancestryMatchesAssertsOnly = (
  ancestry: string[], premises: DivinationPremise[], extraPropositionParents: string[] = [],
): boolean => {
  const expected = new Set([
    ...extraPropositionParents,
    ...premises.filter((p) => p.role === 'ASSERTS').map((p) => `p:${p.id}`),
  ]);
  return ancestry.length === expected.size && ancestry.every((id) => expected.has(id));
};

const sameMembers = (actual: string[], expected: string[]): boolean => {
  const a = new Set(actual); const e = new Set(expected);
  return actual.length === a.size && expected.length === e.size
    && a.size === e.size && [...a].every((id) => e.has(id));
};

type PersistedDerivedChild = DerivedChildSemantics & Pick<ReasonedProposition,
  'derivationRule' | 'supportingPremiseIds' | 'opposingPremiseIds' | 'derivedFromPropositionIds'
  | 'unresolvedPremiseIds' | 'doctrineReferences'>;

const myungriEvidenceMatches = (
  prop: PersistedDerivedChild, supporting: DivinationPremise[], opposing: DivinationPremise[],
): boolean => prop.unresolvedPremiseIds.length === 0
  && sameMembers(prop.doctrineReferences,
    [...new Set([...supporting, ...opposing].map((p) => p.doctrineReference))]);

function validateContestedShare(
  prop: PersistedDerivedChild, supporting: DivinationPremise[], opposing: DivinationPremise[],
): boolean {
  if (opposing.length !== 0) return false;
  const rivalItems = supporting.filter((p) => p.concept === 'RIVAL_CLAIM');
  const wealthItems = supporting.filter((p) =>
    p.concept === 'NATAL_FAMILY' && p.questionAxis === 'MONEY_INFLOW' && p.semanticRelation === 'SUPPORTS');
  const rivals = new Set(rivalItems.map((p) => p.id));
  const wealth = new Set(wealthItems.map((p) => p.id));
  if (rivals.size === 0 || wealth.size === 0 || !allClassified(supporting, rivals, wealth)) return false;
  return derivedChildSemanticsMatch(prop, contestedShareChild(rivalItems, wealthItems))
    && ancestryMatchesAssertsOnly(prop.derivedFromPropositionIds, supporting);
}

function validateDirectionVsExecution(
  prop: PersistedDerivedChild, supporting: DivinationPremise[], opposing: DivinationPremise[],
): boolean {
  if (opposing.length !== 0) return false;
  const opens = supporting.filter((p) => STRUCTURAL_SCOPES.has(p.temporalScope)
    && (p.semanticRelation === 'ENABLES' || p.semanticRelation === 'ACTIVATES' || p.semanticRelation === 'CONNECTS'));
  if (opens.length !== 1) return false;
  const open = opens[0];
  const strikes = supporting.filter((p) => p.id !== open.id);
  if (strikes.length === 0) return false;
  if (!strikes.every((p) => NEAR_SCOPES.has(p.temporalScope) && p.target.key === open.target.key
    && p.subject === open.subject && p.questionAxis === open.questionAxis
    && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'))) return false;
  if (!strikes.every((p) => p.temporalScope === strikes[0].temporalScope)) return false; // one layer per node
  return derivedChildSemanticsMatch(prop, directionVsExecutionChild(open, strikes[0].temporalScope))
    && ancestryMatchesAssertsOnly(prop.derivedFromPropositionIds, supporting);
}

function validateConvergentSeatPressure(
  prop: PersistedDerivedChild, supporting: DivinationPremise[], opposing: DivinationPremise[],
): boolean {
  if (opposing.length !== 0) return false;
  if (supporting.length < 2) return false;
  if (!supporting.every((p) => p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS')) {
    return false;
  }
  if (!supporting.every((p) => p.target.key === supporting[0].target.key)) return false;
  if (new Set(supporting.map((p) => p.temporalScope)).size < 2) return false; // real convergence, not one hit
  return derivedChildSemanticsMatch(prop, convergentSeatPressureChild(supporting))
    && ancestryMatchesAssertsOnly(prop.derivedFromPropositionIds, supporting);
}

function validateRecurringFrictionCause(
  prop: PersistedDerivedChild, supporting: DivinationPremise[], opposing: DivinationPremise[],
): boolean {
  if (opposing.length !== 0) return false;
  const weaks = supporting.filter((p) => p.temporalScope === 'NATAL' && p.semanticRelation === 'DESTABILIZES');
  if (weaks.length !== 1) return false;
  const weak = weaks[0];
  const again = supporting.filter((p) => p.id !== weak.id);
  if (again.length === 0) return false;
  if (!again.every((p) => p.temporalScope !== 'NATAL' && p.target.key === weak.target.key
    && p.subject === weak.subject
    && (p.semanticRelation === 'DESTABILIZES' || p.semanticRelation === 'CONSTRAINS'))) return false;
  return derivedChildSemanticsMatch(prop, recurringFrictionChild(weak, again))
    && ancestryMatchesAssertsOnly(prop.derivedFromPropositionIds, supporting);
}

function validateInflowVsRetention(
  prop: PersistedDerivedChild,
  supporting: DivinationPremise[],
  opposing: DivinationPremise[],
  contestedParents: ReasonedProposition[],
): boolean {
  if (opposing.length !== 0) return false;
  const inflowItems = supporting.filter((p) =>
    p.questionAxis === 'MONEY_INFLOW' && p.semanticRelation === 'ACTIVATES');
  const retentionItems = supporting.filter((p) => p.questionAxis === 'MONEY_RETENTION'
    && (p.semanticRelation === 'OPPOSES' || p.semanticRelation === 'WEAKENS' || p.semanticRelation === 'DESTABILIZES'));
  const inflow = new Set(inflowItems.map((p) => p.id));
  const retentionRisk = new Set(retentionItems.map((p) => p.id));
  if (inflow.size === 0) return false;
  if (retentionRisk.size === 0 && contestedParents.length === 0) return false;
  if (!allClassified(supporting, inflow, retentionRisk)) return false;
  const expected = inflowVsRetentionChild(
    inflowItems, [...retentionItems.map((p) => p.target), ...contestedParents.map((p) => p.target)],
  );
  return derivedChildSemanticsMatch(prop, expected)
    && ancestryMatchesAssertsOnly(
      prop.derivedFromPropositionIds, supporting, contestedParents.map((p) => p.id),
    );
}

/**
 * Dispatches a Myungri-native derived proposition to its rule's own validator. `propositionById` supplies
 * INFLOW_VS_RETENTION's optional CONTESTED_SHARE proposition-parents (cited via derivedFromPropositionIds,
 * never supportingPremiseIds — myungriRules.ts's make() keeps them out of `support` deliberately).
 */
export function validateMyungriDerivation(
  prop: PersistedDerivedChild,
  premiseById: Map<string, DivinationPremise>,
  propositionById: Map<string, ReasonedProposition>,
): boolean {
  const supporting = resolveIds(prop.supportingPremiseIds, premiseById);
  const opposing = resolveIds(prop.opposingPremiseIds, premiseById);
  if (!supporting || !opposing) return false;
  if (!myungriEvidenceMatches(prop, supporting, opposing)) return false;
  switch (prop.derivationRule) {
    case 'CONTESTED_SHARE':
      return validateContestedShare(prop, supporting, opposing);
    case 'DIRECTION_VS_EXECUTION':
      return validateDirectionVsExecution(prop, supporting, opposing);
    case 'CONVERGENT_SEAT_PRESSURE':
      return validateConvergentSeatPressure(prop, supporting, opposing);
    case 'RECURRING_FRICTION_CAUSE':
      return validateRecurringFrictionCause(prop, supporting, opposing);
    case 'INFLOW_VS_RETENTION': {
      const contestedParents = prop.derivedFromPropositionIds.flatMap((id) => {
        const parent = propositionById.get(id);
        return parent?.derivationRule === 'CONTESTED_SHARE' ? [parent] : [];
      });
      return validateInflowVsRetention(prop, supporting, opposing, contestedParents);
    }
    default:
      return false; // an unknown rule id never reaches here — the enum whitelist rejects it earlier
  }
}

// ── CROSS rules — reuse classifyPair/subordinate/opposed/halfIsAsserted/compoundEligible directly ────

export type CrossValidationCtx = {
  premiseById: Map<string, DivinationPremise>;
};

const crossEvidenceMatches = (
  prop: PersistedDerivedChild,
  from: ReasonedProposition[],
  against: ReasonedProposition[] = [],
): boolean => {
  if (prop.unresolvedPremiseIds.length !== 0) return false;
  const expected = crossChildEvidence(from, against);
  return sameMembers(prop.supportingPremiseIds, expected.supportingPremiseIds)
    && sameMembers(prop.opposingPremiseIds, expected.opposingPremiseIds)
    && sameMembers(prop.doctrineReferences, expected.doctrineReferences);
};

/**
 * Validates a persisted CROSS proposition against its ACTUAL cited parent proposition(s), using the SAME
 * relation classifier and subordination logic the live reasoner uses to decide whether a pair may produce a
 * given rule at all — not a re-implementation, an import.
 */
export function validateCrossDerivation(
  prop: PersistedDerivedChild,
  propositionById: Map<string, ReasonedProposition>,
  ctx: CrossValidationCtx,
): boolean {
  const parents = prop.derivedFromPropositionIds.map((id) => propositionById.get(id));
  if (parents.some((p) => !p)) return false;
  const resolved = parents as ReasonedProposition[];

  switch (prop.derivationRule) {
    case 'CROSS_REINFORCEMENT': {
      // The one rule whose candidates may MERGE (crossRules.ts's empty-`parties` key), so >2 parents is legal
      // — every parent must join at least one constructor-valid reinforcement edge. Same-discipline duplicate
      // claims may coexist in a real 3+ merge even though their direct pair was skipped by the runtime loop.
      if (resolved.length < 2) return false;
      const qualifies = (a: ReasonedProposition, b: ReasonedProposition): boolean => {
        if (a.discipline === b.discipline) return false;
        const relation = classifyPair(a, b);
        if (relation !== 'REINFORCING' && relation !== 'RIVAL_AGREEMENT') return false;
        // crossReinforcementChild's questionAxis/temporalScope/direction/restriction come from its FIRST
        // argument, so the pair only matches the child under whichever construction order was actually used —
        // try both, rather than requiring both (a,b) and (b,a) to independently pass.
        return derivedChildSemanticsMatch(prop, crossReinforcementChild(a, b, relation))
          || derivedChildSemanticsMatch(prop, crossReinforcementChild(b, a, relation));
      };
      return resolved.every((p, i) => resolved.some((q, k) => k !== i && qualifies(p, q)))
        && crossEvidenceMatches(prop, resolved);
    }
    case 'CROSS_STANDOFF': {
      // Like the other unparty-keyed rules, this can merge (measured on a real graph). And unlike
      // classifyPair/opposed (pure functions of the PERSISTED proposition fields, safe to re-run),
      // subordinate()'s TESTS read `ctx.asksTiming`/`ctx.askedAxis` — properties of the CURRENT turn, not
      // frozen at derivation time. Re-running subordinate() with THIS turn's context against a node derived
      // under a DIFFERENT turn's context can disagree with the original outcome in either direction (measured:
      // a real standoff, valid when derived, was rejected here because the current turn's asksTiming activated
      // a test that abstained originally). The context-INDEPENDENT invariant — every parent is pairwise
      // CONTRADICTORY/RIVAL_CONFLICT with at least one other parent — is what is actually checked; whether a
      // real subordination test settled it is not re-verifiable across turns and is not attempted.
      if (resolved.length < 2) return false;
      const qualifies = (x: ReasonedProposition, y: ReasonedProposition): boolean => {
        const relation = classifyPair(x, y);
        if (relation !== 'CONTRADICTORY' && relation !== 'RIVAL_CONFLICT') return false;
        // Same order-sensitivity as CROSS_REINFORCEMENT above — try both construction orders for this pair.
        return derivedChildSemanticsMatch(prop, crossStandoffChild(x, y, relation))
          || derivedChildSemanticsMatch(prop, crossStandoffChild(y, x, relation));
      };
      return resolved.every((p, i) => resolved.some((q, k) => k !== i && qualifies(p, q)))
        && crossEvidenceMatches(prop, resolved);
    }
    case 'CROSS_CONTRADICTION_RESOLVED': {
      // Same cross-turn caveat as CROSS_STANDOFF above — subordinate()'s outcome is not re-verifiable with
      // the current turn's context, so it is not re-run. And the SAME coincidental-key-collision merge this
      // module already found for CROSS_REINFORCEMENT/CROSS_TIMING_SPLIT/CROSS_AXIS_COMPOUND turns out to
      // reach this rule too (measured: a real graph produced a 3-parent CROSS_CONTRADICTION_RESOLVED), so the
      // "index 0 is always dominant" assumption — sound for exactly 2 — does not generalise to N>2 parents.
      // What remains context-independently checkable: every parent pairwise CONTRADICTORY/RIVAL_CONFLICT +
      // opposed with at least one other parent, and the child's direction/target/restriction is copied from
      // an ACTUAL parent (the dominant one, whichever that was — not provably identifiable across turns).
      if (resolved.length < 2) return false;
      const qualifies = (x: ReasonedProposition, y: ReasonedProposition): boolean => {
        const relation = classifyPair(x, y);
        return (relation === 'CONTRADICTORY' || relation === 'RIVAL_CONFLICT') && opposed(x, y);
      };
      if (!resolved.every((p, i) => resolved.some((q, k) => k !== i && qualifies(p, q)))) return false;
      // Historical subordination context is intentionally not replayed. The dominant side is nevertheless
      // reconstructable as the parent(s) whose constructor-copied semantics exactly match the child.
      const dominant = resolved.filter((p) =>
        derivedChildSemanticsMatch(prop, crossContradictionResolvedChild(p, p.questionAxis)));
      const against = resolved.filter((p) => !dominant.includes(p));
      if (dominant.length === 0 || against.length === 0) return false;
      if (!dominant.every((p) => against.some((q) => qualifies(p, q)))) return false;
      if (!against.every((p) => dominant.some((q) => qualifies(p, q)))) return false;
      return crossEvidenceMatches(prop, dominant, against);
    }
    case 'CROSS_TIMING_SPLIT': {
      // The candidate KEY does not bake in full party identity the way CROSS_CONTRADICTION_RESOLVED's does
      // (candidateIdentity's `parties` component is {discipline,target.key,axis,temporalScope,direction} per
      // party, not the id) — two DIFFERENT premises sharing that tuple coincide and merge into one candidate
      // exactly like CROSS_REINFORCEMENT does by design. This applies on EITHER side of the split: two
      // near-band premises on the same seat/axis/near-scope merge (as already measured), and — since
      // crossTimingSplitChild(structural, near)'s spec is keyed off `structural` alone — two duplicate-shaped
      // STRUCTURAL premises (same discipline/target/axis/scope/direction, different provenance) merge too
      // (measured: a real graph produced a 3-parent CROSS_TIMING_SPLIT with TWO structural parents + one near
      // parent this way). Requiring exactly one structural parent rejected this legitimate runtime shape.
      // What is actually checkable without replaying turn-local context: every parent must qualify with SOME
      // parent on the opposite band — the child it would construct must match the persisted child under the
      // rule's real precondition — a bipartite star, not a fixed "one structural" assumption.
      if (resolved.length < 2) return false;
      const structuralParents = resolved.filter((p) => temporalBand(p.temporalScope) === 'STRUCTURAL');
      const nearParents = resolved.filter((p) => temporalBand(p.temporalScope) === 'NEAR');
      if (structuralParents.length === 0 || nearParents.length === 0) return false;
      const qualifies = (structural: ReasonedProposition, near: ReasonedProposition): boolean =>
        classifyPair(structural, near) === 'DIFFERENT_TIME_BAND'
        && opposed(structural, near)
        && halfIsAsserted(structural) && halfIsAsserted(near)
        && derivedChildSemanticsMatch(prop, crossTimingSplitChild(structural, near));
      if (!structuralParents.every((s) => nearParents.some((n) => qualifies(s, n)))) return false;
      if (!nearParents.every((n) => structuralParents.some((s) => qualifies(s, n)))) return false;
      return crossEvidenceMatches(prop, resolved);
    }
    case 'CROSS_AXIS_COMPOUND': {
      // Like CROSS_TIMING_SPLIT, the candidate key is not party-identity-unique (candidateIdentity's `parties`
      // component hashes each party's {discipline,target.key,axis,temporalScope,direction}, not its id, and
      // spec.target is a FRESH composite built from the pair) — two DIFFERENT pairs sharing one operand can
      // coincide on that tuple and merge (measured: a real graph produced a 3-parent CROSS_AXIS_COMPOUND this
      // way). At least 2 parents, and the parent set's classifyPair/opposed/axesShareOneMatter/stated
      // relation must form a CONNECTED graph — every parent qualifies with AT LEAST ONE other parent, which
      // is what a star-shaped merge (many operands sharing one common anchor) actually produces; it is not
      // required that every PAIR among N>2 parents relate to each other directly.
      if (resolved.length < 2) return false;
      const stated = (p: ReasonedProposition) => p.supportingPremiseIds.length > 0
        && p.supportingPremiseIds.some((id) => ctx.premiseById.get(id)?.applicability !== 'BACKGROUND');
      if (!resolved.every(stated)) return false;
      const qualifies = (x: ReasonedProposition, y: ReasonedProposition): boolean => {
        const relation = classifyPair(x, y);
        if ((relation !== 'DIFFERENT_AXIS' && relation !== 'DIFFERENT_TARGET')
          || !opposed(x, y) || !axesShareOneMatter(x.questionAxis, y.questionAxis)) return false;
        const frame = crossCompoundFrame(x.questionAxis, y.questionAxis);
        // Which parent was historically asked is not replayed. The child itself must match one of the two
        // constructor outputs that could result from this pair, and every merged parent must join such an edge.
        return derivedChildSemanticsMatch(
          prop, crossAxisCompoundChild(x, y, x.questionAxis, frame.kind, frame.frame),
        ) || derivedChildSemanticsMatch(
          prop, crossAxisCompoundChild(x, y, y.questionAxis, frame.kind, frame.frame),
        );
      };
      if (!resolved.every((p, i) => resolved.some((q, k) => k !== i && qualifies(p, q)))) return false;
      return crossEvidenceMatches(prop, resolved);
    }
    default:
      return false;
  }
}

// ══ ITEM 3/4 — THE GRAPH IS THE SOLE VERDICT AUTHORITY ═════════════════════════════════════════
//
// Recomputes the SAME `direction`/`headlinePropositionIds` the live pipeline would have produced from this
// exact (already-validated) graph, by calling the exported pieces of the real projection pipeline
// (standingPropositions -> selectAnswerCandidates -> resolveAnswer -> stanceOf/agreedStance) — not a second
// resolution algorithm. A persisted verdict whose direction/headlines disagree with this projection is
// rejected outright; there is no partial trust of the persisted copy.
export function projectVerdictFromGraph(
  propositions: ReasonedProposition[], askedAxis: JudgmentDomain, intent: QuestionIntent,
  // DECISION JUDGMENT V1 — the verdict's own persisted deciding axes. The projection has to select over the
  // SAME candidate set the live pipeline did, and since Decision Semantics V1 that set is the PRIMARY-role
  // axes rather than `[askedAxis]`. Absent ⇒ `[askedAxis]`, i.e. every pre-V6.1 row is projected exactly as
  // before. Omitting this argument (as the pre-V6.1 code necessarily did) silently re-projects a
  // widened-axis verdict against the wrong candidate set and rejects the row as corrupt.
  deciding?: readonly JudgmentDomain[],
): { direction: Stance; headlinePropositionIds: string[] } {
  const standing = standingPropositions(propositions);
  const candidates = selectAnswerCandidates(standing, askedAxis, intent, deciding);
  const resolution = resolveAnswer(candidates);
  const primary = resolution.kind === 'SINGLE' ? resolution.primary : null;
  const direction: Stance = primary
    ? stanceOf(primary)
    : resolution.kind === 'AGREED' ? agreedStance(resolution.members, resolution.direction) : NO_SIGNAL;
  const headlinePropositionIds = primary ? [primary.id] : resolution.members.map((p) => p.id);
  return { direction, headlinePropositionIds };
}
