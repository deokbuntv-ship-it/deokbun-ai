// DECISION CROSS SYNTHESIS V1 — WHAT THREE INDEPENDENT JUDGMENTS OF ONE PROPOSITION ADD UP TO.
//
// Decision Judgment V1 made Myungri, Ziwei and Qimen each judge the SAME DecisionPropositionV1. The census
// that followed found the remaining bottleneck is no longer question understanding or judge targeting: it is
// that Cross had no way to say what genuine independent disagreement MEANS. Everything that was not a clean
// unanimous direction became "정하지 않겠습니다".
//
// Measured on the 18 remaining conflicts, that verdict was frequently not even true:
//
//   · 6 of them contain NO UNFAVORABLE reading at all — only FAVORABLE beside RESTRICTED. "Yes" beside "yes,
//     but narrower" is a qualification, not a contradiction, and declining it answers a question nobody asked.
//   · Several are one discipline's own internal spread, not a cross-discipline conflict.
//   · Several oppose only because a BOUNDED DOMAIN SUMMARY — an aggregate over a whole life domain — was
//     weighed as an equal counter-vote against a DIRECT reading of the asked axis.
//
// CONTRADICTION != NEUTRAL, and CONTRADICTION != FORCED WINNER. This module separates the cases where opposite
// polarity has a STRUCTURAL explanation (authority, role, time, outcome) from the case where two comparable
// direct judgments genuinely disagree — which stays unresolved, with both sides preserved.
//
// WHAT IT MAY NEVER DO:
//   1. Count. No 2-vs-1 majority, no "two disciplines agree so they win".
//   2. Rank schools. There is no Myungri > Ziwei > Qimen anywhere in this file, and no discipline identity is
//      read at all except to name who said what.
//   3. Invent a scale. No weights, no confidence*reliability products. The only orderings used are the two
//      the product already declares in `contracts.ts` — QuestionDirectness and DataReliability — and they are
//      used only to recognise strict dominance, never to compute a score.
//   4. Invent a fact, a relation or a period. Every truth reported here is a statement a discipline already
//      made, carried with its own evidence ids.
import { axesShareOneMatter } from './axisOntology';
import type {
  DataReliability, Discipline, JudgmentDomain, QuestionDirectness,
} from './contracts';
import type {
  AxisRole, DecisionAssessment, DecisionJudgmentV1, JudgedProposition, RequestedOutcome,
} from './decisionJudgment';
import { propositionDirectionOf, propositionRestrictionOf } from './reasoning/disciplineAdapter';
import { temporalBand, type ReasonedProposition } from './reasoning/kernel';

export const DECISION_CROSS_SYNTHESIS_V1_METHOD = 'deokbunai.decision-cross-synthesis.v1' as const;

/**
 * HOW DIRECTLY a judgment addresses THIS proposition. Not a discipline property and not a quality score — a
 * statement about what the judgment is ABOUT.
 *
 *   DIRECT_PROPOSITION      — the discipline read the asked axis itself and stated a direction on it.
 *   BOUNDED_DOMAIN_SUMMARY  — a bounded aggregate over the whole life domain, bound to the axis because the
 *                             discipline had no direct reading of it (or the ask was whole-domain).
 *   INDIRECT_QUALIFIER      — no reading of the asked axis, but authoritative material that limits or
 *                             explains the decision.
 *   CONTEXT_ONLY            — explanatory only. Zero decision authority, by construction.
 */
export type AuthorityClass =
  | 'DIRECT_PROPOSITION' | 'BOUNDED_DOMAIN_SUMMARY' | 'INDIRECT_QUALIFIER' | 'CONTEXT_ONLY';

/** How the participating judgments actually relate. Only TRUE_STANDOFF is an unresolved disagreement. */
export type CrossResolutionKind =
  | 'AGREED'            // independent judgments genuinely point the same way
  | 'QUALIFIED'         // a direction stands, and another authoritative judgment materially limits it
  | 'COMPOUND_MIXED'    // several truths hold at once; the answer is compound, not a winner
  | 'TEMPORAL_SPLIT'    // opposite-looking readings apply to different temporal scopes
  | 'OUTCOME_SPLIT'     // the action is supported and its downstream result is limited (or the reverse)
  | 'TRUE_STANDOFF'     // same proposition, same role, same band, comparable authority, genuinely opposite
  /**
   * Exactly ONE judgment decided, and nothing contradicts it. Distinct from AGREED on purpose: AGREED claims
   * independent corroboration, and claiming it from a single reading is the "three systems agree" fabrication
   * the verdict's own null-contributor guard already refuses elsewhere.
   */
  | 'SINGLE_AUTHORITY'
  | 'NON_DIRECTIONAL'   // the request was never for a direction (cause / description / conduct / period)
  | 'NO_APPLICABLE_JUDGMENT'; // nothing with decision authority spoke to this proposition

export type FinalStance =
  | 'FOR' | 'AGAINST' | 'QUALIFIED_FOR' | 'QUALIFIED_AGAINST' | 'COMPOUND' | 'UNRESOLVED';

/** One judgment's place in the synthesis. `derivedFromAxes` is what makes a bounded aggregate's sources visible. */
export type SynthesisParticipant = {
  readonly discipline: Discipline;
  readonly authority: AuthorityClass;
  readonly axis: JudgmentDomain | null;
  readonly role: AxisRole | null;
  readonly direction: ReasonedProposition['direction'];
  /**
   * WHICH kind of restriction a `RESTRICTED` direction carries — `null` for every other direction.
   *
   * `RESTRICTED` conflates two opposite leanings: a SCOPE restriction is a conditional negative
   * (CONDITIONAL_AGAINST — "범위를 줄이는 쪽"), while a TIMING one is a delayed positive (FOR_BUT_LATER).
   * Without this the polarity resolver below cannot tell them apart, and every conditional negative was
   * delivered as a positive direction.
   */
  readonly restriction: ReasonedProposition['restriction'] | null;
  readonly statement: string;
  readonly directness: QuestionDirectness;
  readonly reliability: DataReliability;
  readonly temporalBand: ReturnType<typeof temporalBand> | null;
  readonly evidenceIds: readonly string[];
  /**
   * For a BOUNDED_DOMAIN_SUMMARY: the axes its own aggregate was built over. Present so a reader (and the
   * double-count guard) can see that the summary and its sources are one contribution, not several.
   */
  readonly derivedFromAxes: readonly JudgmentDomain[];
};

/** A statement one discipline made, carried verbatim with its provenance. Never composed here. */
export type SynthesisTruth = {
  readonly discipline: Discipline;
  readonly axis: JudgmentDomain;
  readonly role: AxisRole;
  /** Which way this truth points, in the graph's own vocabulary. `NONE` ⇒ it asserts no direction. */
  readonly direction: ReasonedProposition['direction'];
  readonly temporalBand: ReturnType<typeof temporalBand>;
  readonly statement: string;
  readonly evidenceIds: readonly string[];
};

/** Two deciding judgments that point opposite ways, and what the synthesis did about it. */
export type ConflictPair = {
  readonly a: Discipline;
  readonly b: Discipline;
  readonly axis: JudgmentDomain;
  readonly directions: readonly [ReasonedProposition['direction'], ReasonedProposition['direction']];
  /** Why it is not a standoff — or `null` when it genuinely is one. */
  readonly reconciledBy:
    | 'AUTHORITY_DIRECTNESS'   // one reads the asked axis directly, the other summarises a whole domain
    | 'STRICT_DOMINANCE'       // one is at least as direct AND at least as reliable, and strictly better
    | 'TEMPORAL_SCOPE'         // they describe different time bands
    | 'QUALIFICATION'          // one narrows the other rather than denying it
    | null;
};

export type DecisionCrossSynthesisV1 = {
  readonly propositionId: string;
  readonly requestedOutcome: RequestedOutcome;
  readonly participatingJudgments: readonly SynthesisParticipant[];
  /** The participants that may decide the direction. */
  readonly primaryJudgments: readonly SynthesisParticipant[];
  /** Authoritative, but qualifying only — bounded summaries stood aside from, and indirect material. */
  readonly qualifiers: readonly SynthesisParticipant[];
  readonly resolutionKind: CrossResolutionKind;
  readonly finalStance: FinalStance;
  readonly supportingTruths: readonly SynthesisTruth[];
  readonly limitingTruths: readonly SynthesisTruth[];
  readonly temporalQualifications: readonly SynthesisTruth[];
  readonly outcomeQualifications: readonly SynthesisTruth[];
  readonly conflictPairs: readonly ConflictPair[];
  /** Present only for TRUE_STANDOFF / NO_APPLICABLE_JUDGMENT — why, in the product's own terms. */
  readonly unresolvedReason?: string;
  readonly provenance: readonly [typeof DECISION_CROSS_SYNTHESIS_V1_METHOD];
};

// ── ORDERED METADATA THE PRODUCT ALREADY DECLARES ─────────────────────────────────────────────────────
//
// Both scales are stated as ordered in `contracts.ts`: QuestionDirectness ("a generic 'good year' is weaker
// than a fact on the exact axis asked about") and DataReliability ("the cross judge must not weigh an
// approximate-input judgment equally against an exact-input one"). They are used ONLY to recognise that one
// judgment strictly dominates another — never multiplied, summed, or turned into a score.
const DIRECTNESS_RANK: Record<QuestionDirectness, number> = { DIRECT: 2, ADJACENT: 1, GENERAL: 0 };
const RELIABILITY_RANK: Record<DataReliability, number> = { EXACT: 3, REDUCED: 2, MINIMAL: 1, UNUSABLE: 0 };

// ── POLARITY — ONE RESOLVER, USED EVERYWHERE A DIRECTION IS NAMED ─────────────────────────────────────
//
// V7.1. Three branches below independently asked `dominantDirection === 'UNFAVORABLE' ? negative : positive`,
// so every value that was not literally UNFAVORABLE fell into the positive arm — including `RESTRICTED`,
// which is what a CONDITIONAL_AGAINST projects to. The measured consequence: 5 of 77 consultations whose
// deciding judgments were ALL negative were delivered as PROCEED, 3 of them while the graph verdict itself
// said CONDITIONAL_AGAINST.
//
// The distinction is not new doctrine — it is the product's own, read back from `stanceOf`: a RESTRICTED
// conclusion restores as `FOR_BUT_LATER` when its restriction is TIMING and as `CONDITIONAL_AGAINST`
// otherwise. This resolver states exactly that, once, so no branch can drift positive again.
export type SynthesisPolarity = 'POSITIVE' | 'NEGATIVE' | 'NONE';

export const polarityOf = (p: Pick<SynthesisParticipant, 'direction' | 'restriction'>): SynthesisPolarity => {
  if (p.direction === 'FAVORABLE') return 'POSITIVE';
  if (p.direction === 'UNFAVORABLE') return 'NEGATIVE';
  // A delayed positive stays positive; a scope-limited one is the conditional negative it came from.
  if (p.direction === 'RESTRICTED') return p.restriction === 'TIMING' ? 'POSITIVE' : 'NEGATIVE';
  return 'NONE';
};

/** The one place a polarity becomes a customer-facing stance. Qualified and firm forms share the mapping. */
const stanceForPolarity = (polarity: SynthesisPolarity, qualified: boolean): FinalStance => {
  if (polarity === 'NEGATIVE') return qualified ? 'QUALIFIED_AGAINST' : 'AGAINST';
  if (polarity === 'POSITIVE') return qualified ? 'QUALIFIED_FOR' : 'FOR';
  return 'UNRESOLVED';
};

/** A is strictly dominant when it is no worse on EITHER declared scale and strictly better on at least one. */
const strictlyDominates = (a: SynthesisParticipant, b: SynthesisParticipant): boolean => {
  const dA = DIRECTNESS_RANK[a.directness]; const dB = DIRECTNESS_RANK[b.directness];
  const rA = RELIABILITY_RANK[a.reliability]; const rB = RELIABILITY_RANK[b.reliability];
  return dA >= dB && rA >= rB && (dA > dB || rA > rB);
};

// ── PARTICIPANTS ──────────────────────────────────────────────────────────────────────────────────────

const authorityOf = (j: DecisionJudgmentV1): AuthorityClass => {
  if (!j.applicable) return 'CONTEXT_ONLY';
  if (j.primaryAssessment) {
    // A bounded aggregate over a whole life domain is not a reading of the asked axis. It is authoritative —
    // and it is about something wider than the question.
    return j.primaryAssessment.basis === 'DOMAIN_JUDGE' ? 'BOUNDED_DOMAIN_SUMMARY' : 'DIRECT_PROPOSITION';
  }
  const material = j.limitingAssessments.length + j.supportingAssessments.length + j.timingAssessments.length;
  return material > 0 ? 'INDIRECT_QUALIFIER' : 'CONTEXT_ONLY';
};

const participantOf = (j: DecisionJudgmentV1, authority: AuthorityClass): SynthesisParticipant => {
  const a = j.primaryAssessment;
  return {
    discipline: j.discipline,
    authority,
    axis: a?.axis ?? null,
    role: a?.role ?? null,
    direction: a ? propositionDirectionOf(a.stance) : 'NONE',
    restriction: a ? propositionRestrictionOf(a.stance) : null,
    statement: a?.statement ?? '',
    directness: a?.directness ?? j.questionDirectness,
    reliability: j.dataReliability,
    temporalBand: a ? temporalBand(a.temporalScope) : null,
    evidenceIds: j.evidenceIds,
    // A bounded summary is ONE contribution. Naming the axes it aggregates is what makes it visible that its
    // sources are inside it, so nothing downstream counts the summary and its material as two voices.
    derivedFromAxes: authority === 'BOUNDED_DOMAIN_SUMMARY' && a
      ? [...new Set([a.axis, ...j.supportingAssessments.map((s) => s.axis), ...j.limitingAssessments.map((s) => s.axis)])]
      : [],
  };
};

const truthsFrom = (j: DecisionJudgmentV1, assessments: readonly DecisionAssessment[]): SynthesisTruth[] =>
  assessments.map((a) => ({
    discipline: j.discipline, axis: a.axis, role: a.role, statement: a.statement,
    direction: propositionDirectionOf(a.stance),
    temporalBand: temporalBand(a.temporalScope),
    evidenceIds: [...a.evidence, ...a.counterEvidence].filter((e) => e.coverageGap !== true).map((e) => e.fact),
  }));

// ── SYNTHESIS ─────────────────────────────────────────────────────────────────────────────────────────

export type DecisionCrossSynthesisInput = {
  readonly proposition: JudgedProposition;
  readonly propositionId: string;
  readonly judgments: readonly DecisionJudgmentV1[];
};

/**
 * Synthesize one proposition's independent judgments. Pure and deterministic: same judgments in, same object
 * out, no I/O, no provider call, no engine call.
 */
export function synthesizeDecisionCross(input: DecisionCrossSynthesisInput): DecisionCrossSynthesisV1 {
  const { propositionId, proposition } = input;
  // SAME-PROPOSITION IDENTITY. A judgment of a sibling proposition may not enter this synthesis at all — not
  // as a decider and not as a conflict party — however well its broad domain matches.
  const judgments = input.judgments.filter((j) => j.propositionId === propositionId);

  const participants = judgments.map((j) => participantOf(j, authorityOf(j)));
  const base = {
    propositionId,
    requestedOutcome: proposition.requestedOutcome,
    participatingJudgments: participants,
    provenance: [DECISION_CROSS_SYNTHESIS_V1_METHOD] as const,
  };

  // Truths are collected from every APPLICABLE judgment regardless of authority — a limit is worth reporting
  // even when the discipline that found it does not decide the direction. CONTEXT is never a truth here: a
  // CONTEXT-role assessment is never produced in the first place (`decisionJudgment.ts`).
  const withJ = judgments.map((j, i) => ({ j, p: participants[i] }));
  const supportingTruths = withJ.flatMap(({ j }) => truthsFrom(j, j.supportingAssessments));
  const limitingTruths = withJ.flatMap(({ j }) => truthsFrom(j, j.limitingAssessments));
  const temporalQualifications = withJ.flatMap(({ j }) => truthsFrom(j, j.timingAssessments));
  const outcomeQualifications = supportingTruths.filter((t) => t.role === 'OUTCOME');
  const truths = { supportingTruths, limitingTruths, temporalQualifications, outcomeQualifications };

  // A request that was never for a direction is not run through directional conflict resolution at all —
  // `requestedOutcome` stays authoritative, exactly as it is in `decisionJudgment.ts`.
  if (proposition.requestedOutcome === 'CAUSE' || proposition.requestedOutcome === 'DESCRIPTION') {
    return {
      ...base, primaryJudgments: [], qualifiers: participants.filter((p) => p.authority !== 'CONTEXT_ONLY'),
      resolutionKind: 'NON_DIRECTIONAL', finalStance: 'UNRESOLVED', ...truths, conflictPairs: [],
    };
  }

  // ── AUTHORITY. A bounded domain summary does not stand as an equal opposite vote against a direct reading
  // of the asked axis. It is not discarded — it becomes a qualifier, which is what it always was.
  const directional = participants.filter((p) => p.direction !== 'NONE');
  const direct = directional.filter((p) => p.authority === 'DIRECT_PROPOSITION');
  const bounded = directional.filter((p) => p.authority === 'BOUNDED_DOMAIN_SUMMARY');
  const deciders = direct.length > 0 ? direct : bounded;
  const qualifiers = participants.filter((p) => p.authority !== 'CONTEXT_ONLY' && !deciders.includes(p));

  if (deciders.length === 0) {
    // WHAT COUNTS AS ANSWERED DEPENDS ON WHAT WAS ASKED. A conduct/caution ask is answered by material about
    // conduct — limits and supports — and a lone temporal signal does not answer "what should I watch"; a
    // period ask, conversely, is answered by exactly that temporal material. Accepting either for both would
    // record a case as answered on evidence that does not address the question.
    const answerable = proposition.requestedOutcome === 'CONDUCT'
      ? limitingTruths.length > 0 || supportingTruths.length > 0
      : proposition.requestedOutcome === 'PERIOD' && temporalQualifications.length > 0;
    return {
      ...base, primaryJudgments: [], qualifiers,
      resolutionKind: answerable ? 'NON_DIRECTIONAL' : 'NO_APPLICABLE_JUDGMENT',
      finalStance: 'UNRESOLVED', ...truths, conflictPairs: [],
      unresolvedReason: answerable
        ? undefined
        : '이 물음에 대해 방향을 세울 수 있는 판단이 어느 학문에서도 나오지 않았습니다.',
    };
  }

  // ── OPPOSITION. Only FAVORABLE-vs-UNFAVORABLE is opposition. RESTRICTED is a narrowing of a direction, not
  // its denial — that is the product's own `CONDITIONAL_AGAINST` semantics ("범위를 줄이는 쪽"), and treating
  // it as a contradiction is what turned six qualified answers into declines.
  const favorable = deciders.filter((p) => p.direction === 'FAVORABLE');
  const unfavorable = deciders.filter((p) => p.direction === 'UNFAVORABLE');
  const restricted = deciders.filter((p) => p.direction === 'RESTRICTED');

  const conflictPairs: ConflictPair[] = [];
  const setAside = new Set<SynthesisParticipant>();
  for (const a of favorable) {
    for (const b of unfavorable) {
      // The relational explanations, in order of how specific they are. None of them counts anything.
      const reconciledBy: ConflictPair['reconciledBy'] =
        a.temporalBand !== b.temporalBand ? 'TEMPORAL_SCOPE'
          : strictlyDominates(a, b) || strictlyDominates(b, a) ? 'STRICT_DOMINANCE'
            : null;
      if (reconciledBy === 'STRICT_DOMINANCE') setAside.add(strictlyDominates(a, b) ? b : a);
      conflictPairs.push({
        a: a.discipline, b: b.discipline, axis: a.axis ?? b.axis!,
        directions: [a.direction, b.direction], reconciledBy,
      });
    }
  }
  // OPPOSITION IS WHAT REMAINS UNEXPLAINED. A pair that a relational reason already accounts for — different
  // time bands, or one judgment strictly dominating the other on the declared scales — is not an unresolved
  // disagreement, and counting it as one made the TEMPORAL_SPLIT branch below unreachable.
  const opposed = conflictPairs.some((c) => c.reconciledBy === null);
  const standingFor = favorable.filter((p) => !setAside.has(p));
  const standingAgainst = unfavorable.filter((p) => !setAside.has(p));

  // A judgment that found a grounded opportunity AND a grounded risk is MIXED and stays MIXED — never
  // averaged, never resolved into a winner here (`combineStatus`'s own discipline, carried through).
  const anyMixed = judgments.some((j) => j.decisionStance === 'MIXED'
    && deciders.some((p) => p.discipline === j.discipline));

  const dominantDirection: ReasonedProposition['direction'] =
    standingFor.length > 0 ? 'FAVORABLE' : standingAgainst.length > 0 ? 'UNFAVORABLE' : 'RESTRICTED';

  // V7.1 — the POLARITY the answer actually carries, which is not the same question as which raw direction
  // dominates. Precedence is unchanged (a surviving positive decider still leads a qualified answer); what
  // changes is that a scope-restricted decider is now counted on the negative side instead of falling
  // through to a positive default when it is the only thing standing.
  const standingDeciders = deciders.filter((p) => !setAside.has(p));
  const dominantPolarity: SynthesisPolarity =
    standingDeciders.some((p) => polarityOf(p) === 'POSITIVE') ? 'POSITIVE'
      : standingDeciders.some((p) => polarityOf(p) === 'NEGATIVE') ? 'NEGATIVE'
        : 'NONE';

  // THE ROLE-BEARING MATERIAL LIVES IN THE TRUTHS, NOT IN THE PARTICIPANTS.
  //
  // A participant carries its discipline's PRIMARY assessment, so its role is always PRIMARY and its axis is
  // always a deciding axis. Testing role or axis on a participant is therefore always false, which silently
  // made OUTCOME_SPLIT, TEMPORAL_SPLIT-by-qualifier and COMPOUND_MIXED-by-axis unreachable. The OUTCOME,
  // CONSTRAINT and TIMING readings are exactly what `supportingTruths`/`limitingTruths`/
  // `temporalQualifications` hold, and that is what these predicates read.
  const opposes = (t: SynthesisTruth, dir: ReasonedProposition['direction']) =>
    t.direction !== 'NONE' && t.direction !== dir;
  const decidingBands = new Set(deciders.map((p) => p.temporalBand));
  /** The action is supported and its downstream result is limited (or the reverse) — a compound, not a clash. */
  const outcomeOpposes = (dir: ReasonedProposition['direction']) =>
    outcomeQualifications.some((t) => opposes(t, dir));
  /** A temporal reading that points the other way from a DIFFERENT time band is a period split, not a denial. */
  const temporalOpposes = (dir: ReasonedProposition['direction']) =>
    temporalQualifications.some((t) => opposes(t, dir) && !decidingBands.has(t.temporalBand));
  /** A CONSTRAINT (or a stood-aside bounded summary) that narrows the answer without denying it. */
  const qualifierNarrows = (dir: ReasonedProposition['direction']) =>
    limitingTruths.some((t) => opposes(t, dir)) || qualifiers.some((q) => q.direction !== 'NONE' && q.direction !== dir);
  /** Two axes of ONE matter pointing different ways: 들어오는 쪽 vs 남는 쪽, 끌리는 힘 vs 같이 사는 난도. */
  const oneMatterSplit = (dir: ReasonedProposition['direction']) =>
    [...supportingTruths, ...limitingTruths].some((t) => opposes(t, dir)
      && deciders.some((d) => d.axis && axesShareOneMatter(d.axis, t.axis)));

  let resolutionKind: CrossResolutionKind;
  let finalStance: FinalStance;
  let unresolvedReason: string | undefined;

  // ORDER IS "MOST SPECIFIC STRUCTURAL EXPLANATION FIRST". Each branch answers a different question about
  // WHY the polarities differ; none of them counts disciplines or consults a discipline's identity.
  if (opposed) {
    // Every relational explanation has been tried and none applied — this is the real thing.
    resolutionKind = 'TRUE_STANDOFF';
    finalStance = 'UNRESOLVED';
    unresolvedReason = '같은 물음을 같은 자격으로 직접 판단한 결론들이 서로 반대 방향을 가리키고, 어느 쪽이 더 직접적이라고 볼 근거가 없습니다.';
  } else if (conflictPairs.some((c) => c.reconciledBy === 'TEMPORAL_SCOPE') || temporalOpposes(dominantDirection)) {
    resolutionKind = 'TEMPORAL_SPLIT';
    finalStance = 'COMPOUND';
  } else if (anyMixed) {
    resolutionKind = 'COMPOUND_MIXED';
    finalStance = 'COMPOUND';
  } else if (outcomeOpposes(dominantDirection)) {
    resolutionKind = 'OUTCOME_SPLIT';
    finalStance = 'COMPOUND';
  } else if (oneMatterSplit(dominantDirection)) {
    resolutionKind = 'COMPOUND_MIXED';
    finalStance = 'COMPOUND';
  } else if (restricted.length > 0 || qualifierNarrows(dominantDirection)) {
    resolutionKind = 'QUALIFIED';
    finalStance = stanceForPolarity(dominantPolarity, true);
  } else if (deciders.length === 1) {
    // ONE judgment decided and nothing contradicts it. Reporting that as AGREED would claim independent
    // corroboration that does not exist — the same fabrication the multi-system-synthesis guard exists to
    // stop. The answer is just as usable; it simply rests on one system, and says so.
    resolutionKind = 'SINGLE_AUTHORITY';
    // A restricted decider is caught by the QUALIFIED branch above, so this is only ever reached with a firm
    // direction — it goes through the shared resolver anyway, so the asymmetry cannot grow back here.
    finalStance = stanceForPolarity(dominantPolarity, dominantDirection === 'RESTRICTED');
  } else {
    resolutionKind = 'AGREED';
    finalStance = stanceForPolarity(dominantPolarity, dominantDirection === 'RESTRICTED');
  }

  return {
    ...base,
    primaryJudgments: deciders,
    qualifiers,
    resolutionKind,
    finalStance,
    ...truths,
    conflictPairs,
    ...(unresolvedReason ? { unresolvedReason } : {}),
  };
}
