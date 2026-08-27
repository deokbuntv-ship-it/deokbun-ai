// V4D §31/§32 — VERDICT HEADLINE PROSE. Deliberately NOT in `axisOntology.ts`.
//
// The axis ontology may declare RELATIONSHIPS between axes — same matter, different aspect, orthogonal. It may
// NOT contain the sentence that states an OUTCOME. V4C put these two functions in that file, and they write
// "열려 있는 자리로 보셔도 됩니다" and "지금 크게 벌일 자리는 아닙니다": conclusions and recommendations, sitting
// in the same module a derivation rule consults to decide whether a compound is even possible. §31 is explicit
// that the relationship ontology and the conclusion rule must be separate things, and a reader of
// `axisOntology.ts` should never have to ask which of the two they are looking at. `claimOntology.ts` is the
// standard to match: relationships only, zero Korean verdict prose.
//
// NEITHER FUNCTION DECIDES ANYTHING. `resolveAnswer` (kernel.ts) settles whether a set resolves at all, and
// `agreedStance` settles the firmness; these only put an already-settled result into Korean.
import { axisLabel } from '../axisOntology';
import type { JudgmentDomain } from '../contracts';

/**
 * The headline a set of AGREED conclusions licenses.
 *
 * They all point the same way but none accounts for the others, so there is no single conclusion to promote.
 * V4C's first cut concatenated the members' assertions, which produced a run-on paragraph of raw premise
 * restatements ("올해 흐름이 원국 일주 천간충를 정면으로 흔든다 그리고 …") — the engine's internal vocabulary
 * leaking out as the professional answer, which the paid-reading quality guard rightly refuses. The members
 * still reach the reader in full, as the EVIDENCE for the answer; what the headline states is what they agree
 * on, which is the direction and the fact that several independent readings reached it.
 */
export const agreedHeadline = (
  axis: JudgmentDomain, direction: 'FAVORABLE' | 'UNFAVORABLE' | 'RESTRICTED' | 'NONE', count: number,
): string => {
  const lead = `${axisLabel(axis, '전반')}에 대해서는 서로 다른 근거 ${count}가지가 모두 같은 쪽을 가리킵니다. `;
  switch (direction) {
    case 'FAVORABLE': return `${lead}열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.`;
    case 'UNFAVORABLE': return `${lead}지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.`;
    case 'RESTRICTED': return `${lead}해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.`;
    default: return `${lead}다만 방향까지 정할 만한 신호는 아닙니다.`;
  }
};

/** The headline an UNRESOLVED set licenses: the fact that it does not settle, stated plainly. */
export const unresolvedHeadline = (axis: JudgmentDomain): string =>
  `${axisLabel(axis, '전반')}에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.`;

/**
 * G6 FINAL — the fixed no-signal headline `extendGraph` (graphExtension.ts) states when a REFINEMENT's
 * re-derivation genuinely produces no candidate on the new axis. Named here, not inlined there, so a
 * persisted-graph validator can recognise this exact legitimate shape without re-deriving graphExtension's
 * logic — same "new export, not a refactor of the live call site" reasoning as `selectAnswerCandidates`.
 */
export const extensionNoSignalHeadline = (axis: JudgmentDomain): string =>
  `${axisLabel(axis, '전반')}에 대해서는 앞선 판정의 근거만으로 방향을 정할 수 없습니다. 없는 이야기를 지어내지는 않겠습니다.`;

/**
 * G6 FINAL — the fixed decline `refinementFailure` (graphExtension.ts) states when `extendGraph` itself
 * throws. A restored verdict may legitimately carry this exact text over an otherwise-untouched prior graph.
 */
export const refinementFailureHeadline = (axis: JudgmentDomain): string =>
  `${axisLabel(axis, '전반')}에 대해서는 앞선 판정을 이어서 더 좁혀 드리기 어렵습니다. 앞서 드린 판정이 그대로 유효하며, 새로 보시려면 "지금 다시 보면?"이라고 물어봐 주세요.`;

/** The fixed headline `reasonCross` states for a DESCRIPTIVE/CAUSE_WHY question with no structural candidate. */
export const NON_DECISION_NO_SIGNAL_HEADLINE =
  '지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.';

/** The headline a set of unresolved CROSS_STANDOFF propositions on the asked axis licenses, joined in order. */
export const standoffHeadline = (standoffAssertions: string[]): string => standoffAssertions.join(' ');

/** The default no-signal headline `reasonCross` states when nothing above applies, with its coverage note. */
export const defaultNoSignalHeadline = (axis: JudgmentDomain, coverageNote: string): string =>
  `${axisLabel(axis, '전반')}에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.${coverageNote}`;
