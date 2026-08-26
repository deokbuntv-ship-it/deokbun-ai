// V4C §14 — AXIS ONTOLOGY. What each judgment axis is ABOUT, and which ASPECT of it the axis reads.
//
// A COMPOUND TRUTH ("돈은 들어오지만 남지 않습니다", "인연은 강하지만 같이 살기는 어렵습니다") is only meaningful
// when the two halves are different CONSEQUENCES OF ONE MATTER. V4B decided that with a hand-written table of
// four axis pairs in `crossRules.ts`, so a fixed lookup was the authority on whether two true statements could
// be reported as one compound — the pattern this kernel exists to remove. Deleting the table outright is worse:
// with nothing in its place, ANY opposed pair qualified, and a money answer picked up "같이 사는 난도과 돈이
// 들어오는 쪽은 다르게 봅니다", which is not a compound truth but two unrelated sentences stapled together.
//
// The relationship is declared here instead, ONCE, as a property of the axes themselves. `contracts.ts` already
// states it in prose — "MONEY_INFLOW // money entering", "MONEY_RETENTION // money staying (§10-G)" — and this
// file only makes that statement machine-readable. NO ASTROLOGY IS ADDED (§30): these are the product's own
// question axes, not a doctrine about charts.
import type { JudgmentDomain } from './contracts';

/** The matter a question is about. Two axes can only compound within one matter. */
export type AxisMatter = 'MONEY' | 'POSITION' | 'RELATIONSHIP' | 'BODY' | 'SELF' | 'MOMENT';

/**
 * WHICH consequence of that matter the axis reads.
 *
 * ARRIVAL and RETENTION are the classic split (돈이 들어오는 것 / 남는 것; 기회가 오는 것 / 잡아서 남는 것).
 * BOND and STABILITY are the relationship equivalent. WHOLE means the axis reads the matter undivided, so it
 * can compound with any aspect OF that matter but never with itself.
 */
export type AxisAspect = 'ARRIVAL' | 'RETENTION' | 'BOND' | 'STABILITY' | 'FRICTION' | 'ACTION' | 'WHOLE';

const ONTOLOGY: Record<JudgmentDomain, { matter: AxisMatter; aspect: AxisAspect }> = {
  MONEY_INFLOW: { matter: 'MONEY', aspect: 'ARRIVAL' },
  MONEY_RETENTION: { matter: 'MONEY', aspect: 'RETENTION' },
  OPPORTUNITY: { matter: 'POSITION', aspect: 'ARRIVAL' },
  OUTCOME: { matter: 'POSITION', aspect: 'RETENTION' },
  CAREER: { matter: 'POSITION', aspect: 'WHOLE' },
  MOVEMENT: { matter: 'POSITION', aspect: 'ACTION' },
  RELATION_BOND: { matter: 'RELATIONSHIP', aspect: 'BOND' },
  RELATION_STABILITY: { matter: 'RELATIONSHIP', aspect: 'STABILITY' },
  CONFLICT: { matter: 'RELATIONSHIP', aspect: 'FRICTION' },
  INFLUENCE: { matter: 'RELATIONSHIP', aspect: 'WHOLE' },
  HEALTH_ENERGY: { matter: 'BODY', aspect: 'WHOLE' },
  DECISION: { matter: 'SELF', aspect: 'ACTION' },
  GENERAL: { matter: 'SELF', aspect: 'WHOLE' },
  TIMING: { matter: 'MOMENT', aspect: 'ACTION' },
};


/** Display name of an axis. One copy — crossRules, crossReasoner and myungriRules each carried their own. */
const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
export const axisLabel = (d: JudgmentDomain, fallback = '이 축'): string => AXIS_LABEL[d] ?? fallback;

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
    case 'FAVORABLE': return lead + '열려 있는 자리로 보셔도 됩니다. 다만 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 서 있는 상태입니다.';
    case 'UNFAVORABLE': return lead + '지금 크게 벌일 자리는 아닙니다. 어느 한 가지가 결정적이라기보다, 여러 근거가 함께 막고 있는 상태입니다.';
    case 'RESTRICTED': return lead + '해도 되지만 범위를 좁히는 쪽이 낫습니다. 여러 근거가 같은 제한을 가리키고 있습니다.';
    default: return lead + '다만 방향까지 정할 만한 신호는 아닙니다.';
  }
};

/** The headline an UNRESOLVED set licenses: the fact that it does not settle, stated plainly. */
export const unresolvedHeadline = (axis: JudgmentDomain): string =>
  `${axisLabel(axis, '전반')}에 대해서는 서로 다른 결론이 함께 성립하고, 어느 쪽이 더 직접적이라고 볼 구조적 근거가 없습니다. 한쪽으로 정하지 않겠습니다. 아래에 양쪽 근거를 그대로 보여 드립니다.`;

export const axisMatter = (d: JudgmentDomain): AxisMatter => ONTOLOGY[d].matter;
export const axisAspect = (d: JudgmentDomain): AxisAspect => ONTOLOGY[d].aspect;

/**
 * Are these two axes two consequences of ONE matter?
 *
 * Same matter, different aspect. Same axis is not a compound with itself, and two axes about different matters
 * are two separate answers — the user is owed both, but not joined into a single "둘 다 사실입니다" sentence
 * that implies they are halves of one thing.
 */
export function axesShareOneMatter(a: JudgmentDomain, b: JudgmentDomain): boolean {
  if (a === b) return false;
  return ONTOLOGY[a].matter === ONTOLOGY[b].matter && ONTOLOGY[a].aspect !== ONTOLOGY[b].aspect;
}
