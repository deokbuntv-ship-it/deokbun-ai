// V4B §24/§25 — READING THE STORED GRAPH.
//
// A follow-up must reason over the graph the first answer was built from, not start again. Two failures this
// module exists to prevent, both confirmed by the independent audit:
//
//   · **WHY rendered projected leaves.** It printed the conclusions and their evidence lines, which reads like
//     an explanation but is not one: it never showed that THIS conclusion came from THOSE premises through a
//     named rule. Explanation is traversal, not a second listing.
//   · **"돈은?" silently started a fresh reading.** The money axis was recomputed from scratch, so the answer
//     could contradict the expansion judgment it was supposedly refining, and the user got two unrelated
//     readings instead of one that developed.
//
// Nothing here invents astrology. It walks links that already exist.
import type { CrossDivinationVerdict, JudgmentDomain } from '../contracts';
import type { DivinationPremise, ReasonedProposition } from './kernel';
import { standingPropositions } from './kernel';

/** One node of the derivation chain: a conclusion, what it rests on, and what it was built from. */
export type DerivationChain = {
  conclusion: ReasonedProposition;
  supporting: DivinationPremise[];
  opposing: DivinationPremise[];
  /** Upstream conclusions this one was derived FROM — recursively expanded. */
  from: DerivationChain[];
};

const premiseIndex = (v: CrossDivinationVerdict) => new Map(v.premises.map((p) => [p.id, p]));
const propositionIndex = (v: CrossDivinationVerdict) => new Map(v.propositions.map((p) => [p.id, p]));

/**
 * Walk the graph from ONE conclusion down to the premises it stands on.
 *
 * V4D §30 — THE GUARD IS THE ANCESTOR PATH, NOT A GLOBAL VISITED SET.
 *
 * The graph is a DAG, and shared parents are routine: DIRECTION_VS_EXECUTION emits one conclusion per near
 * layer from the SAME structural premise, and a cross conclusion then takes both of those plus their shared
 * primitives. V4C threaded ONE mutable `seen` set through every sibling branch, so whichever branch ran first
 * consumed the shared parent and the other branch was rendered as standing on NOTHING.
 *
 * Measured on a real 결혼 verdict (28 propositions, 9 headlines): three headlines lost derivation edges, and
 * on the timing-split headline BOTH DIRECTION_VS_EXECUTION nodes lost EVERY parent — WHY presented a derived
 * conclusion with nothing under it while the stored graph said it rested on three upstream conclusions.
 *
 * The path holds only THIS node's ancestors, which is all a cycle needs, and each branch is free to show the
 * parent it genuinely rests on. Rendering a shared parent under both children is not duplication: "this
 * conclusion stands on that one" is true under both, and a memo would print it under one arbitrary child —
 * decided by iteration order, which is the arbitration this kernel exists to remove.
 */
export function explainProposition(
  v: CrossDivinationVerdict,
  propositionId: string,
): DerivationChain | null {
  const props = propositionIndex(v);
  const premises = premiseIndex(v);
  const pick = (ids: string[]) => ids.map((id) => premises.get(id)).filter((x): x is DivinationPremise => !!x);
  const walk = (id: string, ancestors: ReadonlySet<string>): DerivationChain | null => {
    if (ancestors.has(id)) return null; // defensive only — the parser already rejects cyclic graphs
    const p = props.get(id);
    if (!p) return null;
    // Built ONCE per node and handed to every child, so sibling subtrees cannot pollute each other.
    const path = new Set(ancestors).add(id);
    return {
      conclusion: p,
      supporting: pick(p.supportingPremiseIds),
      opposing: pick(p.opposingPremiseIds),
      // Deduped: a parent listed twice is ONE link, and rendering it twice under the same child would claim
      // two grounds where the graph states one.
      from: [...new Set(p.derivedFromPropositionIds)]
        .map((parentId) => walk(parentId, path))
        .filter((c): c is DerivationChain => c !== null),
    };
  };
  return walk(propositionId, new Set());
}

/**
 * The chains behind the verdict's own headline — what a "왜?" turn has to explain.
 *
 * V4C §28 — the verdict NAMES them (`headlinePropositionIds`). V4B re-found the headline by matching its text
 * against proposition assertions, which worked only while the headline was a verbatim copy of one conclusion;
 * once several conclusions stand and the headline states what they agree on, the match finds nothing and WHY
 * goes silent. The text fallback is kept for rows persisted before the field existed.
 */
export function explainHeadlines(v: CrossDivinationVerdict): DerivationChain[] {
  // V4D §30/§33 — NO TEXT FALLBACK. The verdict NAMES the conclusions its headline stands on. Re-finding one
  // by matching Korean prose was first-match arbitration over the standing set, and its `startsWith` branch
  // matched the WRONG node BY CONSTRUCTION: CROSS_CONTRADICTION_RESOLVED builds its assertion as
  // `dominant.assertion + ' 반대 근거도 있으나, …'`, so the prefix test always hit the DOMINANT PARENT and
  // presented that parent's chain as the headline's own.
  //
  // A row persisted before the field existed therefore gets NO derivation block rather than a wrong one —
  // `renderGroundingContext` already guards on a non-empty chain, so the turn simply omits it. Precision
  // before coverage (§18).
  return (v.headlinePropositionIds ?? [])
    .map((id) => explainProposition(v, id))
    .filter((c): c is DerivationChain => c !== null);
}

/** The single chain behind the headline — null when the headline stands on several, or on none. */
export function explainHeadline(v: CrossDivinationVerdict): DerivationChain | null {
  const chains = explainHeadlines(v);
  return chains.length === 1 ? chains[0] : null;
}

/**
 * §25 — what the stored graph ALREADY says about an axis, so a follow-up can refine rather than restart.
 *
 * `related` is the part that keeps the two turns one conversation: conclusions that touch BOTH the asked axis
 * and the original question's axis are the reason the first answer landed where it did, and they are what
 * makes "확장 기회는 있지만, 원래 판정에서 자금 보유가 약점이었던 이유는 …" possible at all.
 */
export type AxisRefinement = {
  axis: JudgmentDomain;
  /** The original question this graph was built for — never discarded. */
  originalQuestion: string;
  originalAxis: JudgmentDomain;
  /** Server instant the graph was evaluated at, so timing is not silently recast (§26). */
  evaluatedAtEpochSeconds: number | null;
  /** Conclusions already standing on the asked axis. */
  existing: DerivationChain[];
  /** Premises already gathered for that axis, whether or not a conclusion used them. */
  premises: DivinationPremise[];
  /** Conclusions linking the asked axis to the ORIGINAL axis — the continuity between the two turns. */
  related: DerivationChain[];
  /** True when the stored graph has nothing on this axis and genuinely new evaluation would be required. */
  needsNewEvaluation: boolean;
};

export function refineOnAxis(v: CrossDivinationVerdict, axis: JudgmentDomain): AxisRefinement {
  const standing = standingPropositions(v.propositions);
  const chainFor = (p: ReasonedProposition) => explainProposition(v, p.id);
  const existing = standing
    .filter((p) => p.questionAxis === axis)
    .map(chainFor)
    .filter((c): c is DerivationChain => c !== null);

  // A conclusion is RELATED when it spans both axes — either directly, or through a premise it shares with the
  // original axis. That link is what turns a second question into a continuation.
  const originalAxisPremises = new Set(
    v.premises.filter((p) => p.questionAxis === v.questionDomain).map((p) => p.id),
  );
  const related = standing
    .filter((p) => p.questionAxis !== axis)
    .filter((p) => [...p.supportingPremiseIds, ...p.opposingPremiseIds]
      .some((id) => v.premises.find((x) => x.id === id)?.questionAxis === axis)
      || (p.questionAxis === v.questionDomain
        && [...p.supportingPremiseIds, ...p.opposingPremiseIds].some((id) => originalAxisPremises.has(id))))
    .map(chainFor)
    .filter((c): c is DerivationChain => c !== null);

  return {
    axis,
    originalQuestion: v.question,
    originalAxis: v.questionDomain,
    evaluatedAtEpochSeconds: v.evaluatedAtEpochSeconds,
    existing,
    premises: v.premises.filter((p) => p.questionAxis === axis),
    related,
    needsNewEvaluation: existing.length === 0,
  };
}

/**
 * Render a chain as STRUCTURED derivation lines for the prompt. Not chain-of-thought: every line is a stored
 * node of the graph, and the arrows are stored links.
 */
export function renderChain(chain: DerivationChain, depth = 0): string[] {
  const pad = '  '.repeat(depth);
  const out = [`${pad}[${chain.conclusion.derivationRule}] ${chain.conclusion.assertion}`];
  for (const p of chain.supporting) out.push(`${pad}  ← 근거: ${p.sourceFactIds[0] ?? p.target.label} — ${p.assertion}`);
  for (const p of chain.opposing) out.push(`${pad}  ⟂ 반대 근거: ${p.sourceFactIds[0] ?? p.target.label} — ${p.assertion}`);
  for (const parent of chain.from) out.push(...renderChain(parent, depth + 1));
  return out;
}
