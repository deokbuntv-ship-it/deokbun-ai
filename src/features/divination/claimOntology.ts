// V4D §12 — CLAIM ONTOLOGY. WHAT KIND OF CLAIM a proposition is making.
//
// V4C compared claims with one boolean — `decisional()`, i.e. "is the conclusionType STRUCTURAL or CAUSAL?".
// Everything else fell into a single bucket, so an obstruction, an opening, a timing window and a two-axis
// compound were all "the same kind of claim" as far as supersession was concerned. That is far too coarse to
// support the one question supersession actually asks: *is B a later account of the SAME claim A made?*
// Under a binary test, a COMPOUND about direction-vs-execution counted as the same kind of claim as the plain
// DIRECTIONAL obstruction it was built from, so it could silently delete it.
//
// THIS IS SOFTWARE SEMANTICS, NOT DOCTRINE (§32). A claim kind says what SHAPE a statement has — "this names
// an obstruction", "this names a window in time", "this explains a cause". It never says whether the news is
// good, how strong anything is, or what the chart means. Nothing here decides a conclusion; it only lets two
// finished conclusions be compared for sameness of kind.
//
// It is DERIVED, not stored: every input (conclusionType, direction, restriction) is already on the
// proposition and already validated by the graph parser. A new persisted field would have to be validated,
// reconstructed and version-migrated for no added information.
import type { ReasonedProposition } from './reasoning/kernel';

/**
 * The shapes a finished conclusion can have.
 *
 * Deliberately finer than `ConclusionType`: the type says how a statement was FORMED (structural / causal /
 * directional / compound), the claim kind says what it ASSERTS. Two conclusions of the same type can assert
 * quite different kinds of thing — an opening and an obstruction are both DIRECTIONAL — and supersession must
 * not treat those as interchangeable.
 */
export type ClaimKind =
  /** 구조가 이러하다 — describes what is the case, asserts no direction. */
  | 'STATE'
  /** 이 구조 때문에 이런 일이 생긴다 — explains a mechanism. Never a recommendation. */
  | 'CAUSE'
  /** 이 자리는 열려 있다 — the matter is open on this axis. */
  | 'OPENING'
  /** 이 자리는 막혀 있다 — the matter is obstructed on this axis. */
  | 'OBSTRUCTION'
  /** 방향은 맞으나 지금은 아니다 — the direction holds, the moment does not. */
  | 'TIMING_WINDOW'
  /** 해도 되지만 범위를 좁혀야 한다 — permitted, but bounded in extent. */
  | 'SCOPE_LIMIT'
  /** 감당할 수 있는 크기가 제한된다 — permitted, but bounded by what can be carried. */
  | 'CAPACITY_LIMIT'
  /** 방향과 실행 시점이 갈린다 — one matter whose direction and timing come apart. */
  | 'DIRECTION_VS_EXECUTION'
  /** 두 축이 동시에 참이다 — two consequences of one matter, both true, reported separately. */
  | 'COMPOUND_TRUTH';

/**
 * The claim kind of a finished proposition.
 *
 * Total by construction — every combination of the three inputs lands somewhere, so no proposition can be
 * silently unclassified and slip past a same-kind check by comparing `undefined` with `undefined`.
 */
export function claimKind(p: ReasonedProposition): ClaimKind {
  if (p.conclusionType === 'CAUSAL') return 'CAUSE';
  if (p.conclusionType === 'STRUCTURAL') return 'STATE';

  if (p.conclusionType === 'COMPOUND') {
    // A compound asserts two things at once; WHICH two is what distinguishes them. A direction/execution
    // split is one matter coming apart in time; a scope split is two consequences of one matter.
    if (p.restriction === 'TIMING') return 'DIRECTION_VS_EXECUTION';
    return 'COMPOUND_TRUTH';
  }

  // DIRECTIONAL and TEMPORAL.
  if (p.conclusionType === 'TEMPORAL') return 'TIMING_WINDOW';
  switch (p.direction) {
    case 'FAVORABLE': return 'OPENING';
    case 'UNFAVORABLE': return 'OBSTRUCTION';
    case 'RESTRICTED':
      return p.restriction === 'TIMING' ? 'TIMING_WINDOW'
        : p.restriction === 'CAPACITY' ? 'CAPACITY_LIMIT'
          : 'SCOPE_LIMIT';
    default:
      // A directional statement that names no direction is describing a state, whatever its type says.
      return 'STATE';
  }
}

/**
 * Do these two conclusions make the SAME KIND of claim?
 *
 * The only question supersession may ask about claim shape. Deliberately NOT a hierarchy: there is no
 * "stronger kind" here, because a ranking of claim kinds would be a priority ladder — exactly the arbitration
 * this kernel exists to remove. Kinds are either the same or they are not.
 */
export const sameClaimKind = (a: ReasonedProposition, b: ReasonedProposition): boolean =>
  claimKind(a) === claimKind(b);
