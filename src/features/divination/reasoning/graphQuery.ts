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
 * Walk the graph from ONE conclusion down to the premises it stands on. `seen` breaks any cycle defensively —
 * the parser rejects cyclic graphs, but a traversal that could hang on malformed input is not worth shipping.
 */
export function explainProposition(
  v: CrossDivinationVerdict,
  propositionId: string,
  seen: Set<string> = new Set(),
): DerivationChain | null {
  if (seen.has(propositionId)) return null;
  seen.add(propositionId);
  const props = propositionIndex(v);
  const premises = premiseIndex(v);
  const p = props.get(propositionId);
  if (!p) return null;
  const pick = (ids: string[]) => ids.map((id) => premises.get(id)).filter((x): x is DivinationPremise => !!x);
  return {
    conclusion: p,
    supporting: pick(p.supportingPremiseIds),
    opposing: pick(p.opposingPremiseIds),
    from: p.derivedFromPropositionIds
      .map((id) => explainProposition(v, id, seen))
      .filter((c): c is DerivationChain => c !== null),
  };
}

/** The chain behind the verdict's own headline — what a "왜?" turn has to explain. */
export function explainHeadline(v: CrossDivinationVerdict): DerivationChain | null {
  const headline = standingPropositions(v.propositions).find((p) => p.assertion === v.primaryConclusion)
    ?? standingPropositions(v.propositions).find((p) => v.primaryConclusion.startsWith(p.assertion));
  return headline ? explainProposition(v, headline.id) : null;
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
