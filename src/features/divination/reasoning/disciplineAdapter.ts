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
  adaptedReadingTarget, computeAdequacy, nextId, PRIMITIVE_RULE, qimenBoardTarget, target, ziweiPalaceTarget,
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

/**
 * The CONCLUSION DIRECTION a stance carries — the product's existing stance→direction semantics, in one
 * callable place.
 *
 * This is exactly what the two tables above already compute for every adapted sub-judgment; it is exported
 * because DECISION CROSS SYNTHESIS V1 has to read the same distinction the graph reads, and in particular the
 * one the flat FOR/AGAINST split loses: `CONDITIONAL_AGAINST`/`AGAINST_FOR_NOW` are RESTRICTED ("do it, but
 * narrower / not yet"), not UNFAVORABLE ("do not"). Re-deriving that mapping in the synthesis module would be
 * a second copy of a semantics that must not drift.
 */
export const propositionDirectionOf = (stance: string): ReasonedProposition['direction'] =>
  DIRECTION_OF[relationFor(stance)];

/**
 * WHICH KIND of restriction a stance carries, when it carries one.
 *
 * Exactly what `adaptJudgment` already writes onto every restricted proposition below — `DELAYS` is a TIMING
 * restriction, `CONSTRAINS` is a SCOPE one — lifted out so the synthesis can read the same distinction
 * instead of collapsing both into a bare `RESTRICTED`. That collapse is what let a CONDITIONAL_AGAINST be
 * delivered as a positive direction: the graph's own `stanceOf` restores RESTRICTED as `FOR_BUT_LATER` for
 * TIMING and `CONDITIONAL_AGAINST` for everything else, and the synthesis had no way to tell them apart.
 */
export const propositionRestrictionOf = (stance: string): ReasonedProposition['restriction'] | null => {
  const relation = relationFor(stance);
  if (relation === 'DELAYS') return 'TIMING';
  return relation === 'CONSTRAINS' ? 'SCOPE' : null;
};

/** Stances that leave the door open rather than commit. */
const QUALIFIED_STANCES = new Set<string>(['CONDITIONAL_FOR', 'CONDITIONAL_AGAINST', 'FOR_BUT_LATER', 'AGAINST_FOR_NOW']);

/**
 * The structure this discipline reads for an axis. Falls back to a DOCTRINE_GAP identity when the discipline
 * has no mapped structure for the axis — an honest "we have no place to look" rather than a fabricated one.
 */
function disciplineTarget(discipline: 'ZIWEI' | 'QIMEN' | 'MYUNGRI', axis: JudgmentDomain) {
  if (discipline === 'QIMEN') return qimenBoardTarget();
  if (discipline === 'ZIWEI') {
    return ziweiPalaceTarget(axis) ?? target('DOCTRINE_GAP', `AXIS:${axis}`, `${axis} 대응 자리 없음`);
  }
  // MYUNGRI arriving HERE means its premise graph was not supplied — the paid 궁합 pair path, where
  // `judgePairMyungri` produces a finished judgment with no seat information. V4B handed it
  // `ziweiPalaceTarget(axis)`, giving a 명리 reading a 자미 palace identity that would compare EQUAL to the
  // real Ziwei reading of the same axis, so two independent disciplines looked like one structure.
  return adaptedReadingTarget('MYUNGRI', axis, `명리 ${axis} 판단`);
}

/** Traceability must name the discipline that actually spoke — V4B stamped every adapter output as 기문. */
const ADAPTER_ID_PREFIX = { ZIWEI: 'zp', QIMEN: 'qp', MYUNGRI: 'mp' } as const;
const ADAPTER_COUNTER_PREFIX = { ZIWEI: 'zc', QIMEN: 'qc', MYUNGRI: 'mc' } as const;
const ADAPTER_DOCTRINE = {
  ZIWEI: '자미두수 궁위·사화·삼방사정 (V3 채택 doctrine, 미이관)',
  QIMEN: '기문둔갑 값부·값사·문/성/신 (V3 채택 doctrine, 미이관)',
  MYUNGRI: '명리 궁합 판정 (전제 그래프 미공급 경로)',
} as const;

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
      id: nextId(ADAPTER_ID_PREFIX[j.discipline]),
      discipline: j.discipline,
      sourceFactIds: backing.length ? backing.map((e) => e.fact) : facts,
      subject: opts.subject,
      // V4C §2 — identity comes from the ASKED AXIS, not from an evidence string. Keying a palace by its
      // first evidence sentence meant the same 궁 got a different identity whenever the evidence was reworded
      // or a different fact sorted first, so "the same target" silently stopped being the same target.
      target: disciplineTarget(j.discipline, sub.domain),
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
      doctrineReference: ADAPTER_DOCTRINE[j.discipline],
    };
    premises.push(premise);

    // The contrary material becomes its OWN premise, so `opposingPremiseIds` is real and a proposition that
    // names a blockage is distinguishable from one that found none.
    const counterPremise: DivinationPremise | null = against.length
      ? {
        ...premise,
        id: nextId(ADAPTER_COUNTER_PREFIX[j.discipline]),
        sourceFactIds: against.map((e) => e.fact),
        // The counter-premise is about the SAME structure — it is the contrary material found at that
        // palace/board, not a different object — so it shares the structure's identity.
        target: disciplineTarget(j.discipline, sub.domain),
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

  // DECISION SEMANTICS V1 §D2 — A TOP-LEVEL DIRECTIONAL STANCE MUST NOT VANISH.
  //
  // The loop above walks `domainSubJudgments` only. A discipline that answered the asked axis with its OWN
  // headline stance — `j.questionDomain` + `j.stance` + `j.directEvidence` — and emitted no sub-judgment for
  // that axis produced NO premise and NO proposition at all, so Cross saw "해당 축 근거 없음" while the judge
  // was holding a fully evidenced directional reading. The V6.1 census measured this on 2 of the 6 D2 declines
  // (Ziwei answering a TIMING question with CONDITIONAL_FOR and 4–6 direct evidence facts).
  //
  // This forwards exactly what the judge already said — no new inference, no new doctrine — and it is bound by
  // the SAME guards as a sub-judgment: it must be directional, it must not duplicate an axis a sub-judgment
  // already covered, and it must have named facts behind it. An evidence-free stance still never enters.
  const coveredAxes = new Set(j.domainSubJudgments.map((s) => s.domain));
  if (isDirectional(j.stance) && !coveredAxes.has(j.questionDomain)) {
    const relation = relationFor(j.stance);
    const direction = DIRECTION_OF[relation];
    const backing = direction === 'UNFAVORABLE' || direction === 'RESTRICTED'
      ? (j.counterEvidence ?? [])
      : (j.directEvidence ?? []);
    const against = direction === 'UNFAVORABLE' || direction === 'RESTRICTED'
      ? (j.directEvidence ?? [])
      : (j.counterEvidence ?? []);
    if (backing.length > 0 || against.length > 0) {
      const facts = [...backing, ...against];
      const premise: DivinationPremise = {
        id: nextId(ADAPTER_ID_PREFIX[j.discipline]),
        discipline: j.discipline,
        sourceFactIds: (backing.length ? backing : facts).map((e) => e.fact),
        subject: opts.subject,
        target: disciplineTarget(j.discipline, j.questionDomain),
        questionIntent: opts.questionIntent,
        questionAxis: j.questionDomain,
        temporalScope: j.temporalScope,
        semanticRelation: relation,
        concept: 'ADAPTED',
        assertion: j.dominantConclusion,
        role: 'ASSERTS',
        reliability: j.dataReliability,
        applicability: j.questionDomain === opts.askedAxis && j.questionDirectness === 'DIRECT'
          ? 'DIRECT'
          : j.questionDirectness === 'GENERAL' ? 'BACKGROUND' : 'CONTEXTUAL',
        doctrineReference: ADAPTER_DOCTRINE[j.discipline],
      };
      premises.push(premise);
      propositions.push({
        id: `p:${premise.id}`,
        discipline: j.discipline,
        subject: premise.subject,
        target: premise.target,
        questionIntent: opts.questionIntent,
        questionAxis: j.questionDomain,
        temporalScope: j.temporalScope,
        assertion: j.dominantConclusion,
        conclusionType: 'DIRECTIONAL',
        direction,
        answersAsked: j.questionDomain === opts.askedAxis,
        ...(QUALIFIED_STANCES.has(j.stance) ? { qualified: true } : {}),
        ...(relation === 'CONSTRAINS' || relation === 'DELAYS'
          ? { restriction: (relation === 'DELAYS' ? 'TIMING' : 'SCOPE') as ReasonedProposition['restriction'] }
          : {}),
        supportingPremiseIds: [premise.id],
        opposingPremiseIds: [],
        derivedFromPropositionIds: [],
        unresolvedPremiseIds: [],
        doctrineReferences: [premise.doctrineReference],
        derivationRule: PRIMITIVE_RULE,
        adequacy: computeAdequacy([premise], [], {
          dataComplete: j.dataReliability === 'EXACT',
          doctrine: 'PARTIAL',
        }),
      });
    }
  }

  return { premises, propositions };
}
