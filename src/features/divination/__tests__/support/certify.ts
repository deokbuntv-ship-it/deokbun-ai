// V4B §16–§20 — INDEPENDENT SYNTHESIS CERTIFICATION. TEST-ONLY; nothing in `src` may import this.
//
// The runtime is allowed to NOMINATE (`screenSynthesis` → CANDIDATE_SYNTHESIS) and nothing more. V4A let the
// engine award itself `REAL_SYNTHETIC_INFERENCE` from object shape and then counted its own labels, which is
// how 2 real inferences were reported as 117. Certification therefore lives here, outside the thing being
// measured, and is decided by OBSERVED BEHAVIOUR: remove or reverse an exact premise, re-derive, and see
// whether THAT proposition actually changed.
//
// Two details that V4A got wrong and this harness gets right:
//   · **Proposition-specific.** V4A removed every premise sharing a `semanticRelation` and accepted a change
//     ANYWHERE in the graph as proof. A conclusion elsewhere moving says nothing about this conclusion.
//   · **Semantic identity.** Derived ids are content-addressed on premise ids, so removing a premise changes
//     the id. The same conclusion is therefore re-found by (rule, target, axis), not by id.
import {
  MYUNGRI_RULES, PRIMITIVE_RULE, deriveCross, primitivePropositions, runDerivations, screenSynthesis,
  standingPropositions,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticRelation,
  type SynthesisClass,
} from '@/features/divination';

/** Semantic identity of a conclusion — stable across re-derivation, unlike the content-addressed id. */
export const conclusionKey = (p: ReasonedProposition): string =>
  `${p.derivationRule}|${p.questionAxis}|${p.target.key}`;

/** Did THIS conclusion change? Absent, re-worded, or re-directed all count. */
function changedAgainst(before: ReasonedProposition, after: ReasonedProposition[]): boolean {
  const match = after.find((p) => conclusionKey(p) === conclusionKey(before));
  if (!match) return true;
  return match.assertion !== before.assertion
    || match.direction !== before.direction
    || match.restriction !== before.restriction;
}

/** The reversal that makes a premise mean the opposite thing, or null when it has no meaningful opposite. */
const OPPOSITE: Partial<Record<SemanticRelation, SemanticRelation>> = {
  SUPPORTS: 'OPPOSES', OPPOSES: 'SUPPORTS',
  ENABLES: 'CONSTRAINS', CONSTRAINS: 'ENABLES',
  STABILIZES: 'WEAKENS', WEAKENS: 'STABILIZES',
  CONNECTS: 'SEPARATES', SEPARATES: 'CONNECTS',
  ACTIVATES: 'ABSENT',
  DESTABILIZES: 'CONNECTS',
};

export type MutationResult = { premiseId: string; label: string; changed: boolean };

export type Certification = {
  key: string;
  rule: string;
  assertion: string;
  klass: SynthesisClass;
  /** Why it landed in that class, in one line — printed into the QA pack. */
  because: string;
  removals: MutationResult[];
  reversals: MutationResult[];
  /** Extra mutations for cross conclusions (target / temporal scope). */
  structural: MutationResult[];
};

export type Rederive = (premises: DivinationPremise[]) => ReasonedProposition[];

/**
 * Certify ONE conclusion by mutating its OWN premises and re-running the given derivation.
 *
 * REAL requires all of: the runtime screened it as a candidate; it stands on ≥2 distinct grounded inputs; and
 * at least one exact removal or reversal of one of THOSE inputs demonstrably changes THIS conclusion.
 */
export function certify(
  proposition: ReasonedProposition,
  premises: DivinationPremise[],
  rederive: Rederive,
  extraMutations: MutationResult[] = [],
): Certification {
  const byId = new Map(premises.map((p) => [p.id, p]));
  const screened = screenSynthesis(proposition, byId);
  const base = {
    key: conclusionKey(proposition),
    rule: proposition.derivationRule,
    assertion: proposition.assertion,
    removals: [] as MutationResult[],
    reversals: [] as MutationResult[],
    structural: extraMutations,
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

  const removals: MutationResult[] = inputs.map((p) => ({
    premiseId: p.id,
    label: `${p.semanticRelation}·${p.target.label}`,
    changed: changedAgainst(proposition, rederive(premises.filter((x) => x.id !== p.id))),
  }));

  const reversals: MutationResult[] = inputs
    .filter((p) => OPPOSITE[p.semanticRelation])
    .map((p) => ({
      premiseId: p.id,
      label: `${p.semanticRelation}→${OPPOSITE[p.semanticRelation]}·${p.target.label}`,
      changed: changedAgainst(
        proposition,
        rederive(premises.map((x) => (x.id === p.id ? { ...x, semanticRelation: OPPOSITE[p.semanticRelation]! } : x))),
      ),
    }));

  const moved = [...removals, ...reversals, ...extraMutations].some((m) => m.changed);
  return {
    ...base,
    removals,
    reversals,
    klass: moved ? 'REAL_SYNTHETIC_INFERENCE' : 'MULTI_FACT_SUMMARY',
    because: moved
      ? `전제 변형이 이 결론을 실제로 바꿈 (${[...removals, ...reversals, ...extraMutations].filter((m) => m.changed).length}건)`
      : '단일 전제를 지우거나 뒤집어도 결론이 그대로 — 과다결정(여러 경로가 같은 결론을 낳음)이거나 장식적 근거. 어느 쪽이든 이 결론 하나만으로는 인과적 필연성이 증명되지 않음',
  };
}

/**
 * §20 — STRICT REDUNDANCY. A premise is REDUNDANT only when it alone changes nothing, ANOTHER premise supports
 * the same conclusion, and removing that whole support set DOES change it. Anything else is INERT.
 *
 * V4A used redundancy as a catch-all for "no output change", which made it an alibi. It is checked here as a
 * positive claim that must itself be demonstrated.
 */
export function classifyPremiseMateriality(
  proposition: ReasonedProposition,
  premise: DivinationPremise,
  premises: DivinationPremise[],
  rederive: Rederive,
): 'MATERIAL' | 'REDUNDANT' | 'INERT' {
  if (changedAgainst(proposition, rederive(premises.filter((x) => x.id !== premise.id)))) return 'MATERIAL';
  // A premise the conclusion never cited cannot be REDUNDANT *for that conclusion* — there is no support set it
  // belongs to. It is simply inert here, and calling it redundant would be the catch-all §20 forbids.
  const cited = new Set([...proposition.supportingPremiseIds, ...proposition.opposingPremiseIds]);
  if (!cited.has(premise.id)) return 'INERT';
  const supportIds = new Set(proposition.supportingPremiseIds);
  const peers = premises.filter((p) => p.id !== premise.id && supportIds.has(p.id));
  if (peers.length === 0) return 'INERT'; // nothing else backs the claim, yet removing this changed nothing
  const withoutSet = premises.filter((p) => p.id !== premise.id && !peers.some((q) => q.id === p.id));
  return changedAgainst(proposition, rederive(withoutSet)) ? 'REDUNDANT' : 'INERT';
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

/** Mutate the PROPOSITIONS cross reasons over (rather than premises) — removal, re-targeting, re-scoping. */
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

  for (const parent of parents) {
    out.push({
      premiseId: parent.id,
      label: `remove ${parent.discipline}:${parent.target.label}`,
      changed: changedAgainst(conclusion, rerun(props.filter((p) => p.id !== parent.id))),
    });
    // TARGET MUTATION — a compound about the same thing must NOT survive the two halves becoming different
    // things. This is the attack that V4A's classifier could not have failed, because it never ran it.
    out.push({
      premiseId: parent.id,
      label: `retarget ${parent.discipline}:${parent.target.label}`,
      changed: changedAgainst(conclusion, rerun(props.map((p) => (p.id === parent.id
        ? { ...p, target: { ...p.target, key: `${p.target.key}::MUTATED` } }
        : p)))),
    });
    // TEMPORAL MUTATION — a timing split must not survive both halves landing in the same band.
    out.push({
      premiseId: parent.id,
      label: `rescope ${parent.discipline}:${parent.temporalScope}→NATAL`,
      changed: changedAgainst(conclusion, rerun(props.map((p) => (p.id === parent.id
        ? { ...p, temporalScope: 'NATAL' as const }
        : p)))),
    });
  }
  return out;
}
