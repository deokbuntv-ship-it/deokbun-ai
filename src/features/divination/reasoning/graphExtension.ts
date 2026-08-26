// V4D §19/§20/§21 — A REFINEMENT EXTENDS THE STANDING GRAPH. IT DOES NOT BUILD A SECOND ONE.
//
// THE FAILURE THIS REPLACES, traced through the real production path:
//
//   Q1 "사업을 확장할까?" at T1 → `buildConsultationGrounding` runs the engines, `judgeCross` builds G1, and
//   G1 is persisted whole inside `decision_meta`.
//   Q2 "돈은?"          → the server LOADS G1 … and then calls `buildConsultationGrounding` again, which
//   re-runs every engine and `judgeCross` again to build **G2, a complete second graph containing ZERO nodes
//   of G1**. G1 survived only as prompt PROSE (`priorAxisContextFor`), and G2 was persisted over it, so
//   nothing recorded that Q2 continued Q1 at all.
//
// V4C fixed the CLOCK (Q2 re-grounds at T1, not at the current instant) and added the prose continuity, which
// is why the two turns stopped contradicting each other about timing. But a second graph built from the same
// inputs is still a second reading: it can reach a different conclusion about the same seat and present it as
// though the first answer had never happened.
//
// WHAT EXTENSION MEANS HERE, precisely: the SAME premises, the SAME evaluation instant, the SAME discipline
// judgments — re-derived across a DIFFERENT ASKED AXIS. That produces conclusions which did not and could not
// exist in G1, because the asked axis is a real input to cross derivation (`subordinate` refuses to compare
// claims off the asked axis, `compoundEligible` requires one half to be on it, and the compound's direction is
// read from the asked half). Every new conclusion cites G1 nodes as its parents, so the result is one graph
// that grew, not two graphs that disagree.
//
// TWO HONEST CEILINGS, stated so nobody "fixes" them by re-deriving premises:
//
//   1. `answersAsked` is baked into each proposition against G1's asked axis. Under the new axis it is stale,
//      so a cross-discipline pair G1 recorded as `answersAsked: false` classifies as DIFFERENT_TARGET rather
//      than RIVAL_*. An extension therefore finds LESS than a fresh run would. That is the precision-over-
//      coverage trade this sprint requires; recomputing it would mean re-deriving the premise layer, which is
//      exactly the second reading being removed.
//   2. Ziwei and Qimen contribute only the sub-judgments the adapter already emitted for G1. An axis no
//      discipline spoke to stays empty, and the honest signal for that already exists.
import { NO_SIGNAL, type CrossDivinationVerdict, type JudgmentDomain, type QuestionIntent } from '../contracts';
import { agreedHeadline, unresolvedHeadline } from './headlineProse';
import { axisLabel } from '../axisOntology';
import { deriveCross } from './crossRules';
import { agreedStance, stanceOf } from './crossReasoner';
import {
  resolveAnswer, standingPropositions,
  type DerivationContext, type ReasonedProposition,
} from './kernel';

/**
 * A hard ceiling on graph growth. The persisted graph lives in a JSONB column with no size limit of its own,
 * and a long conversation extends it on every refinement.
 *
 * ponytail: a flat cap, not a compaction strategy. Raise it if a real session ever reaches it.
 */
const MAX_PROPOSITIONS = 400;

/**
 * V4E §5 — THE CONTROLLED REFINEMENT FAILURE.
 *
 * What a REFINE_EXISTING turn becomes when `extendGraph` itself throws: the ORIGINAL graph, at the ORIGINAL
 * instant, with an honest decline on the asked axis — and nothing else. Every node, premise, judgment and the
 * evaluation instant come through untouched; only the headline states that this refinement could not be made.
 *
 * It exists because the alternative — falling back to the freshly built primary graph — silently RECASTS the
 * consultation: the user asked a follow-up about the reading they already received and would get an unrelated
 * second reading presented as its continuation. A worse answer from the same graph is acceptable; a different
 * reading wearing the first one's clothes is not.
 */
export function refinementFailure(v: CrossDivinationVerdict, axis: JudgmentDomain): CrossDivinationVerdict {
  return {
    ...v,
    questionDomain: axis,
    primaryConclusion: `${axisLabel(axis, '전반')}에 대해서는 앞선 판정을 이어서 더 좁혀 드리기 어렵습니다. 앞서 드린 판정이 그대로 유효하며, 새로 보시려면 "지금 다시 보면?"이라고 물어봐 주세요.`,
    headlinePropositionIds: [],
    direction: NO_SIGNAL,
  };
}

/**
 * Re-derive the standing graph across a NEW asked axis and append what that produces.
 *
 * Returns the verdict UNCHANGED when there is nothing to add — never a fabricated one. The fields an extension
 * may not touch are the definition of the word: `question`, `evaluatedAtEpochSeconds`, `premises`,
 * `disciplineJudgments` and `verdictVersion` all come through untouched.
 */
export function extendGraph(
  v: CrossDivinationVerdict,
  axis: JudgmentDomain,
  intent: QuestionIntent,
  asksTiming: boolean,
): CrossDivinationVerdict {
  const subject = v.propositions[0]?.subject;
  if (!subject) return v;

  const applicable = v.disciplineJudgments.filter((j) => j.applicable);
  const ctx: DerivationContext = {
    subject,
    questionIntent: intent,
    askedAxis: axis,
    dataComplete: applicable.every((j) => j.dataReliability === 'EXACT'),
  };

  const base = standingPropositions(v.propositions);
  const known = new Set(v.propositions.map((p) => p.id));
  const fresh = deriveCross(base, v.premises, { ...ctx, asksTiming })
    .map((d) => d.proposition)
    .filter((p) => !known.has(p.id));

  if (v.propositions.length + fresh.length > MAX_PROPOSITIONS) return v;

  const all = fresh.length > 0 ? [...v.propositions, ...fresh] : v.propositions;
  const standing = standingPropositions(all);

  // The candidate predicates are the ones `reasonCross` uses, so an extension answers a question the same way
  // a first turn does — including the §12 hard gate that a descriptive question is never answered FOR/AGAINST.
  const nonDecision = intent === 'DESCRIPTIVE' || intent === 'CAUSE_WHY';
  const describesChart = (p: ReasonedProposition) =>
    p.conclusionType === 'STRUCTURAL' && p.derivationRule !== 'PRIMITIVE' && p.derivationRule !== 'CROSS_STANDOFF';
  const onAskedAxis = (p: ReasonedProposition) => axis === 'GENERAL' || p.questionAxis === axis;
  const candidates = nonDecision
    ? standing.filter((p) => onAskedAxis(p)
      && ((intent === 'CAUSE_WHY' && p.conclusionType === 'CAUSAL') || describesChart(p)))
    : standing.filter((p) => p.questionAxis === axis && p.direction !== 'NONE');

  const resolution = resolveAnswer(candidates);
  const primary = resolution.kind === 'SINGLE' ? resolution.primary : null;

  const primaryConclusion = primary
    ? primary.assertion
    : resolution.kind === 'AGREED'
      ? agreedHeadline(axis, resolution.direction, resolution.members.length)
      : resolution.kind === 'UNRESOLVED'
        ? unresolvedHeadline(axis)
        // An honest decline. The standing graph genuinely says nothing about this axis, and inventing a
        // conclusion — or silently falling back to the axis the first question asked — is the failure mode.
        : `${axisLabel(axis, '전반')}에 대해서는 앞선 판정의 근거만으로 방향을 정할 수 없습니다. 없는 이야기를 지어내지는 않겠습니다.`;

  return {
    ...v,
    questionDomain: axis,
    questionIntent: intent,
    asksTiming,
    propositions: all,
    primaryConclusion,
    headlinePropositionIds: primary ? [primary.id] : resolution.members.map((p) => p.id),
    // The direction is read off the NEW axis's resolution, never inherited from the axis the first question
    // asked. Same projection the first turn uses, so a refinement and a first answer speak one vocabulary.
    direction: primary
      ? stanceOf(primary)
      : resolution.kind === 'AGREED' ? agreedStance(resolution.members, resolution.direction) : NO_SIGNAL,
  };
}
