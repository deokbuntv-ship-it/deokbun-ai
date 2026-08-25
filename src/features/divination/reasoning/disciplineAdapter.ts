// V4A §19 — ZIWEI / QIMEN ADAPTERS.
//
// These two disciplines are NOT migrated to a premise graph in this sprint (§2 freezes their doctrine). What
// they can honestly supply today is a set of DIRECT premises: "이 궁에 이 화가 들어와 있다", "값사가 이 문에
// 앉아 있다". So that is exactly what is emitted — and the propositions built from them are marked PRIMITIVE,
// which means `classifySynthesis` files every one of them as STATIC_RULE_OUTPUT.
//
// That is the point. Labelling a single-fact reading `ZIWEI_STRUCTURAL_SYNTHESIS` is how the previous counts got
// to 108 while the real count was 0. Under-claiming here keeps the synthesis census meaningful, and it makes the
// remaining doctrine gap visible instead of hidden behind a healthy-looking number.
import type { DivinationJudgment, JudgmentDomain, QuestionIntent } from '../contracts';
import { isDirectional } from '../contracts';
import {
  computeAdequacy, nextId, PRIMITIVE_RULE, target,
  type DivinationPremise, type ReasonedProposition, type SemanticRelation,
} from './kernel';

/** Map a legacy sub-judgment stance onto a premise relation. A projection of what the judge already said. */
function relationFor(stance: string): SemanticRelation {
  if (stance === 'STRONGLY_FOR' || stance === 'FOR') return 'ENABLES';
  if (stance === 'CONDITIONAL_FOR') return 'SUPPORTS';
  if (stance === 'FOR_BUT_LATER' || stance === 'AGAINST_FOR_NOW') return 'DELAYS';
  if (stance === 'CONDITIONAL_AGAINST') return 'CONSTRAINS';
  if (stance === 'AGAINST' || stance === 'STRONGLY_AGAINST') return 'OPPOSES';
  return 'ABSENT';
}

const DIRECTION_OF: Record<SemanticRelation, ReasonedProposition['direction']> = {
  ENABLES: 'FAVORABLE', SUPPORTS: 'FAVORABLE', ACTIVATES: 'FAVORABLE', CONNECTS: 'FAVORABLE',
  ACCELERATES: 'FAVORABLE', STABILIZES: 'FAVORABLE',
  OPPOSES: 'UNFAVORABLE', DESTABILIZES: 'UNFAVORABLE', WEAKENS: 'UNFAVORABLE', SEPARATES: 'UNFAVORABLE',
  CONSTRAINS: 'RESTRICTED', DELAYS: 'RESTRICTED',
  ABSENT: 'NONE',
};

/** Stances that leave the door open rather than commit. */
const QUALIFIED_STANCES = new Set<string>(['CONDITIONAL_FOR', 'CONDITIONAL_AGAINST', 'FOR_BUT_LATER', 'AGAINST_FOR_NOW']);

export type AdapterOutput = { premises: DivinationPremise[]; propositions: ReasonedProposition[] };

/**
 * Turn one discipline's finished judgment into DIRECT premises plus PRIMITIVE propositions.
 * Sub-judgments with no directional signal produce an ABSENT premise — silence stays silence (never a soft yes).
 */
export function adaptJudgment(
  j: DivinationJudgment,
  opts: { subject: string; questionIntent: QuestionIntent; askedAxis: JudgmentDomain },
): AdapterOutput {
  if (!j.applicable) return { premises: [], propositions: [] };

  const premises: DivinationPremise[] = [];
  const propositions: ReasonedProposition[] = [];

  for (const sub of j.domainSubJudgments) {
    const relation = relationFor(sub.stance);
    const direction = DIRECTION_OF[relation];
    // WHICH array backs this claim depends on WHAT the claim is: for an AGAINST reading it is the
    // counter-evidence that establishes the obstruction, and the supporting evidence is what stands against it.
    // Collapsing both into one bag (the first cut of this adapter did) destroyed the "one side names a
    // blockage, the other does not" distinction — which is precisely the reason cross can explain a winner
    // instead of declaring every same-axis disagreement an unresolvable standoff.
    const backing = direction === 'UNFAVORABLE' || direction === 'RESTRICTED'
      ? (sub.counterEvidence ?? [])
      : (sub.evidence ?? []);
    const against = direction === 'UNFAVORABLE' || direction === 'RESTRICTED'
      ? (sub.evidence ?? [])
      : (sub.counterEvidence ?? []);
    const facts = [...backing, ...against].map((e) => e.fact);
    // A stance with NO named fact behind it is not a premise — it is an opinion the engine cannot support.
    // This is the audit's E1 finding in its general form: the previous build let an evidence-free
    // CONDITIONAL_FOR enter the graph, and once inside it could pair with a well-evidenced near-term negative
    // and convert it into "방향은 맞지만 지금은 아니다" — the C7 failure, reached through a different door.
    if (facts.length === 0) continue;
    const premise: DivinationPremise = {
      id: nextId(j.discipline === 'ZIWEI' ? 'zp' : 'qp'),
      discipline: j.discipline,
      sourceFactIds: backing.length ? backing.map((e) => e.fact) : facts,
      subject: opts.subject,
      // Structured identity: a palace/board seat is the THING this discipline is talking about. Two claims
      // about different palaces must not be treated as one claim just because both land on CAREER.
      target: target(j.discipline === 'ZIWEI' ? 'PALACE' : 'BOARD_SEAT',
        `${j.discipline}:${sub.domain}:${(backing[0] ?? against[0])?.fact ?? ''}`,
        (backing[0] ?? against[0])?.fact ?? sub.domain),
      questionIntent: opts.questionIntent,
      questionAxis: sub.domain,
      temporalScope: sub.temporalScope,
      semanticRelation: relation,
      concept: 'ADAPTED',
      assertion: sub.conclusion,
      role: isDirectional(sub.stance) ? 'ASSERTS' : 'DESCRIBES',
      reliability: sub.reliability,
      // Directness is the judge's OWN statement of how squarely this evidence hits the question, and it is the
      // signal that lets cross explain why one side prevailed. Deriving applicability from axis equality alone
      // threw it away and turned every same-axis disagreement into an unresolvable standoff.
      applicability: sub.domain === opts.askedAxis && sub.directness === 'DIRECT'
        ? 'DIRECT'
        : sub.directness === 'GENERAL' ? 'BACKGROUND' : 'CONTEXTUAL',
      doctrineReference: j.discipline === 'ZIWEI'
        ? '자미두수 궁위·사화·삼방사정 (V3 채택 doctrine, 미이관)'
        : '기문둔갑 값부·값사·문/성/신 (V3 채택 doctrine, 미이관)',
    };
    premises.push(premise);

    // The contrary material becomes its OWN premise, so `opposingPremiseIds` is real and a proposition that
    // names a blockage is distinguishable from one that found none.
    const counterPremise: DivinationPremise | null = against.length
      ? {
        ...premise,
        id: nextId(j.discipline === 'ZIWEI' ? 'zc' : 'qc'),
        sourceFactIds: against.map((e) => e.fact),
        target: target(j.discipline === 'ZIWEI' ? 'PALACE' : 'BOARD_SEAT',
          `${j.discipline}:${sub.domain}:counter:${against[0].fact}`, against[0].fact),
        semanticRelation: direction === 'UNFAVORABLE' || direction === 'RESTRICTED' ? 'SUPPORTS' : 'OPPOSES',
        assertion: against.map((e) => e.meaning).join(' '),
        role: 'QUALIFIES',
      }
      : null;
    if (counterPremise) premises.push(counterPremise);

    propositions.push({
      id: `p:${premise.id}`,
      discipline: j.discipline,
      subject: premise.subject,
      target: premise.target,
      questionIntent: opts.questionIntent,
      questionAxis: sub.domain,
      temporalScope: sub.temporalScope,
      assertion: sub.conclusion,
      conclusionType: isDirectional(sub.stance) ? 'DIRECTIONAL' : 'STRUCTURAL',
      direction: DIRECTION_OF[relation],
      // This discipline is answering the ASKED question — enough to disagree with another discipline doing the
      // same, even though the two are reading different structures. Note it is NOT gated on `directness`:
      // how squarely a claim hits the question is what RESOLVES a disagreement (see
      // DIRECT_ASSERTION_VS_BACKGROUND_CONTEXT), so using it as a gate on whether one can exist would silence
      // exactly the conflicts that are resolvable.
      answersAsked: sub.domain === opts.askedAxis,
      ...(QUALIFIED_STANCES.has(sub.stance) ? { qualified: true } : {}),
      ...(relation === 'CONSTRAINS' || relation === 'DELAYS'
        ? { restriction: (relation === 'DELAYS' ? 'TIMING' : 'SCOPE') as ReasonedProposition['restriction'] }
        : {}),
      supportingPremiseIds: [premise.id],
      opposingPremiseIds: counterPremise ? [counterPremise.id] : [],
      derivedFromPropositionIds: [],
      unresolvedPremiseIds: [],
      doctrineReferences: [premise.doctrineReference],
      // PRIMITIVE — not synthesis, and deliberately not dressed up as any.
      derivationRule: PRIMITIVE_RULE,
      adequacy: computeAdequacy([premise], counterPremise ? [counterPremise] : [], {
        dataComplete: sub.reliability === 'EXACT',
        doctrine: 'PARTIAL', // the doctrine is adopted, but this discipline is not on the premise graph yet
      }),
    });
  }

  return { premises, propositions };
}
