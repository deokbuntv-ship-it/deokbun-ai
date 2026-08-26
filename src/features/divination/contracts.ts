// DIVINATION_ENGINE_V1 — the canonical JUDGMENT contracts (§8/§15).
//
// WHY THIS LAYER EXISTS. The engines (명리/자미두수/기문둔갑) are correct and CONSERVATIVE: they produce
// verified facts and nothing else. Everything downstream then had to guess, so the product drifted into
// generic advice ("신중하게 결정하세요"). This layer sits BETWEEN verified facts and prose and does the one
// thing neither of them may do: it JUDGES.
//
//   DETERMINISTIC FACTS (frozen engines)  →  [ per-discipline JUDGE ]  →  [ CROSS JUDGE ]  →  prose(LLM)
//
// THREE RULES THAT DEFINE THIS LAYER:
//   1. FACT layer stays conservative — a judge may NEVER invent a star/palace/relation/timing. It reads
//      only what the frozen engines actually computed.
//   2. JUDGMENT layer is DECISIVE — mixed evidence is resolved, not averaged. `MIXED` is deliberately NOT
//      a stance; internal disagreement is expressed as counterEvidence + a resolved dominant conclusion.
//   3. PROSE layer may explain but never reverse/weaken the verdict (enforced by the quality guard).
//
// NOTHING HERE ACTIVATES DEFERRED THEORY: no 신강/신약, 용신, 희신, 기신, 격국, 종격, 12운성, 12신살, and no
// invented element weighting. The quarantined strength candidate stays quarantined.

/** The three disciplines. A judgment is always attributed to exactly one (or to the cross judge). */
export type Discipline = 'MYUNGRI' | 'ZIWEI' | 'QIMEN';

/**
 * WHAT KIND OF ANSWER THE QUESTION ACTUALLY WANTS (V3 §8).
 *
 * A major V2 failure was forcing decision-style FOR/AGAINST onto questions that were never decisions:
 * "제 성격이 어떤가요?" came back as an action-like negative verdict, and "왜 자꾸 부딪히나요?" was converted
 * into a timing stance. A description is not a recommendation and a cause is not a verdict.
 */
export type QuestionIntent =
  | 'DESCRIPTIVE'  // 어떤 사람인가 / 어떤 구조인가 — describe, never recommend
  | 'CAUSE_WHY'    // 왜 이런 일이 생기나 — explain the mechanism
  | 'DECISION'     // 해도 될까 — for/against is appropriate
  | 'TIMING'       // 지금인가 / 언제인가
  | 'OUTCOME'      // 어떻게 될까 — result-shaped
  | 'PROBABILITY'; // 가능성이 있나

/** Intents for which a FOR/AGAINST verdict is a category error. */
export const NON_DECISION_INTENTS: readonly QuestionIntent[] = ['DESCRIPTIVE', 'CAUSE_WHY'] as const;

/**
 * DIRECTIONAL stance. There is deliberately NO `MIXED`: a judge that sees conflicting evidence must resolve
 * it (domain / temporal / directness decomposition) and pick a direction, or — only when genuinely provable —
 * declare INSUFFICIENT_DATA. `NOT_APPLICABLE` means the discipline does not speak to this question at all
 * (e.g. Qimen on a natal-personality question) and is NOT a weak "no".
 */
export type Stance =
  | 'STRONGLY_FOR'
  | 'FOR'
  | 'CONDITIONAL_FOR'
  | 'FOR_BUT_LATER'
  | 'AGAINST_FOR_NOW'
  | 'CONDITIONAL_AGAINST'
  | 'AGAINST'
  | 'STRONGLY_AGAINST'
  /** Nothing could be computed (no chart, no layer, unusable input). */
  | 'INSUFFICIENT_DATA'
  /**
   * Facts WERE computed but carry no directional signal for this question — the honest middle the previous
   * build lacked. CONTRADICTION ≠ NEUTRAL, but also CONTRADICTION ≠ FORCED_DECISION (DEPTH REBUILD §12):
   * a verdict must not be manufactured out of weak/absent evidence.
   */
  | 'INSUFFICIENT_EVIDENCE'
  /**
   * V4A §12 — the question was answered, but it was never a decision. "제 성격이 어떤가요?" and "왜 자꾸
   * 부딪히나요?" have real, well-grounded answers that are STRUCTURAL or CAUSAL; forcing them through the
   * FOR/AGAINST pipeline was a category error, and calling them INSUFFICIENT would be a lie — the engine has
   * plenty to say. Not directional, so direction guards correctly skip it.
   */
  | 'STRUCTURAL_ANSWER'
  | 'NOT_APPLICABLE';

/** Stances that assert a positive/negative direction (used by guards + the cross judge). */
export const FOR_STANCES: readonly Stance[] = ['STRONGLY_FOR', 'FOR', 'CONDITIONAL_FOR', 'FOR_BUT_LATER'] as const;
export const AGAINST_STANCES: readonly Stance[] = ['AGAINST_FOR_NOW', 'CONDITIONAL_AGAINST', 'AGAINST', 'STRONGLY_AGAINST'] as const;
/**
 * V4D §27 — THE UNIONS, AS RUNTIME VALUES.
 *
 * The graph parser validates a restored payload against these. A TS union is erased at build time, so a
 * parser has no way to see it; V4C therefore hand-wrote some sets, checked others with `typeof === 'string'`,
 * and left several unchecked entirely. Declaring them beside their types is what keeps the two in step.
 */
export const ALL_STANCES: readonly Stance[] = [
  ...FOR_STANCES, ...AGAINST_STANCES,
  'INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE', 'STRUCTURAL_ANSWER', 'NOT_APPLICABLE',
] as const;

/** A stance that actually answers the question (neither abstention nor non-applicability). */
export function isDirectional(s: Stance): boolean {
  return FOR_STANCES.includes(s) || AGAINST_STANCES.includes(s);
}
export function stanceValence(s: Stance): 'FOR' | 'AGAINST' | 'NONE' {
  if (FOR_STANCES.includes(s)) return 'FOR';
  if (AGAINST_STANCES.includes(s)) return 'AGAINST';
  return 'NONE';
}

/**
 * The life-domain a judgment speaks to. Two judgments that LOOK contradictory often describe DIFFERENT
 * domains (§10-C: "기회는 커지지만 돈이 남기 어렵다") — the cross judge uses this to decompose instead of
 * neutralize. OPPORTUNITY vs OUTCOME and BOND vs STABILITY are separate on purpose (§10-E/§10-F).
 */
export type JudgmentDomain =
  | 'OPPORTUNITY'      // does the chance/offer appear?
  | 'OUTCOME'          // is TAKING it beneficial? (never equated with OPPORTUNITY)
  | 'MONEY_INFLOW'     // money entering
  | 'MONEY_RETENTION'  // money staying (§10-G)
  | 'CAREER'
  | 'MOVEMENT'         // job change / relocation / travel
  | 'RELATION_BOND'    // attraction / closeness (§10-F)
  | 'RELATION_STABILITY' // living together / marriage difficulty (§10-F)
  | 'CONFLICT'
  | 'INFLUENCE'        // who exerts what kind of pull on whom
  | 'HEALTH_ENERGY'
  | 'DECISION'         // should I act at all
  | 'TIMING'           // is NOW the moment (§10-H)
  | 'GENERAL';

/** WHICH time layer a judgment describes. A natal "yes" and a this-week "no" are not a contradiction (§10-D). */
export type TemporalScope =
  | 'NATAL'        // structural, lifelong baseline
  | 'DAEWOON'      // current 10-year cycle
  | 'SEWOON'       // current/target year
  | 'WOLWOON'      // month
  | 'PRESENT_MOMENT' // question-time tactical (Qimen)
  | 'UNSCOPED';

/**
 * How trustworthy the INPUT was for this discipline (§10-A). Not a confidence in the reasoning — a statement
 * about the data. Ziwei/Qimen degrade hard without an exact birth time / question instant, and the cross judge
 * must not weigh an approximate-input judgment equally against an exact-input one.
 */
export type DataReliability = 'EXACT' | 'REDUCED' | 'MINIMAL' | 'UNUSABLE';

/**
 * How DIRECTLY the evidence speaks to the asked question (§10-B). A generic "good year" is weaker than a fact
 * on the exact axis asked about. This is what stops three vague positives from out-voting one direct negative
 * (§12 — no mechanical majority voting).
 */
export type QuestionDirectness = 'DIRECT' | 'ADJACENT' | 'GENERAL';
export const ALL_DIRECTNESS: readonly QuestionDirectness[] = ['DIRECT', 'ADJACENT', 'GENERAL'] as const;

/** Confidence in the JUDGMENT (distinct from DataReliability, which is about the input). */
export type JudgmentConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export const ALL_CONFIDENCES: readonly JudgmentConfidence[] = ['HIGH', 'MEDIUM', 'LOW'] as const;

/**
 * One piece of named evidence. `fact` MUST be traceable to something the frozen engine actually computed —
 * a relation kind, a palace/star, a door/deity, a pillar. Never a paraphrase invented by a judge.
 */
export type JudgmentEvidence = {
  /** Engine-traceable fact, in the engine's own vocabulary (e.g. '일지 육합', '재성 관계', '傷門'). */
  fact: string;
  /** What it means for THIS question, in plain Korean. No 간지 hanja, no jargon-first phrasing. */
  meaning: string;
  domain: JudgmentDomain;
  temporalScope: TemporalScope;
  directness: QuestionDirectness;
};

/**
 * A per-AXIS sub-judgment. This is the unit the cross judge actually reasons over (DEPTH REBUILD §9).
 *
 * WHY IT CARRIES ITS OWN AXIS + SCOPE + STRENGTH. Previously every discipline was handed the SAME
 * `questionDomain` and returned it unchanged, so cross-discipline "domain decomposition" could only ever fire
 * in hand-built fixtures — never on the real path (independent audit §5). A judge must therefore surface the
 * distinct axes it actually found, each with the evidence and reliability that back THAT axis, so the cross
 * judge can tell "돈은 들어오지만 남지 않는다" (two axes, both true) from "명리와 자미가 같은 것을 반대로 본다".
 */
export type DomainSubJudgment = {
  domain: JudgmentDomain;
  stance: Stance;
  /** One decisive sentence in plain Korean. */
  conclusion: string;
  /** Which time layer THIS axis speaks to (a natal axis and a this-month axis are not in conflict). */
  temporalScope: TemporalScope;
  /** How directly this axis answers the asked question. */
  directness: QuestionDirectness;
  /** Input quality behind THIS axis (may differ from the discipline's overall reliability). */
  reliability: DataReliability;
  /** Named, engine-traceable support for this axis. */
  evidence: JudgmentEvidence[];
  /** Named, engine-traceable opposition for this axis. */
  counterEvidence: JudgmentEvidence[];
};

/**
 * How much real support a stance rests on. `NONE` means the discipline found NO directional signal — it must
 * NOT be laundered into a weak "conditional yes" (independent audit E1: an absent 四化 became a positive vote
 * and flipped a HIGH-confidence direct negative). Cross ignores NONE-strength support when choosing a winner.
 */
export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
export const ALL_EVIDENCE_STRENGTHS: readonly EvidenceStrength[] = ['STRONG', 'MODERATE', 'WEAK', 'NONE'] as const;

/**
 * DEPRECATED (V4A §11). Merged support and contradiction into ONE scale, so adding a counter-premise could make
 * a claim look BETTER supported — a disguised score, which the re-audit flagged. Superseded by
 * `computeAdequacy` in the reasoning kernel, which reports support and counter adequacy SEPARATELY and can
 * therefore never let opposition inflate confidence. Kept only until the last legacy caller is migrated.
 *
 * @deprecated use `computeAdequacy` from `reasoning/kernel`.
 */
export function evidenceAdequacy(sub: Pick<DomainSubJudgment, 'stance' | 'directness' | 'reliability'> & {
  evidence?: JudgmentEvidence[];
  counterEvidence?: JudgmentEvidence[];
}): EvidenceStrength {
  if (!isDirectional(sub.stance)) return 'NONE';
  const all = [...(sub.evidence ?? []), ...(sub.counterEvidence ?? [])];
  if (all.length === 0) return 'WEAK';
  const hasDirectFact = all.some((e) => e.directness === 'DIRECT');
  const exactInput = sub.reliability === 'EXACT';
  if (hasDirectFact && exactInput) return 'STRONG';
  if (hasDirectFact || exactInput) return 'MODERATE';
  return 'WEAK';
}

/** A stance that asserts nothing: the discipline looked and found no directional signal. */
export const NO_SIGNAL: Stance = 'INSUFFICIENT_EVIDENCE';

/**
 * ONE DISCIPLINE'S INDEPENDENT JUDGMENT (§8). Produced WITHOUT seeing the other disciplines' judgments —
 * that isolation is what makes cross-discipline agreement meaningful (a contaminated judge would just echo).
 */
export type DivinationJudgment = {
  discipline: Discipline;
  /** false → this discipline does not speak to this question / could not be computed. */
  applicable: boolean;
  /** Why it is not applicable (or why reliability is degraded). Consumer-safe, no internal jargon. */
  applicabilityReason?: string;
  dataReliability: DataReliability;

  questionDomain: JudgmentDomain;
  temporalScope: TemporalScope;

  stance: Stance;
  /** THE decisive sentence for this discipline. Must not be a hedge. */
  dominantConclusion: string;
  /** The single fact that most drove the stance (named, engine-traceable). */
  dominantFactor: string;

  directEvidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
  /** Real disagreements INSIDE this discipline, already resolved into the stance (never left dangling). */
  internalContradictions: string[];

  timingSignals: JudgmentEvidence[];
  domainSubJudgments: DomainSubJudgment[];

  confidence: JudgmentConfidence;
  questionDirectness: QuestionDirectness;
  /**
   * How much real support the PRIMARY stance rests on. Required: the cross judge must be able to tell a
   * well-evidenced direction from a default one. `NONE` ⇒ this discipline casts no vote.
   */
  evidenceStrength: EvidenceStrength;
  /** Named major fact groups this judge actually CONSUMED for this question (depth-utilization reporting §20). */
  factGroupsUsed: string[];
};

/**
 * V4A — a claim the verdict makes, WITH THE GRAPH IT STANDS ON.
 *
 * The V3 shape (`{claim, derivation, fromDisciplines, fromFacts}`) was built AFTER the stance was chosen and
 * copied the already-selected conclusion, so `derivation: 'MULTI_FACT_WITHIN_DISCIPLINE'` meant only "the
 * evidence array had two entries". It is replaced by `ReasonedProposition`, which carries the premises it was
 * derived from and the NAMED rule that derived it — the two things that make synthesis checkable.
 */
import type { DivinationPremise, ReasonedProposition } from './reasoning/kernel';
export type { DivinationPremise, ReasonedProposition };

/** How a cross-discipline disagreement was resolved (§10). NEVER 'NEUTRALIZED' — that is not an option. */
export type ContradictionResolutionKind =
  | 'DIFFERENT_DOMAIN'      // §10-C — they describe different axes; both true
  | 'DIFFERENT_TIMESCALE'   // §10-D — direction right, timing wrong
  | 'OPPORTUNITY_VS_OUTCOME'// §10-E
  | 'BOND_VS_STABILITY'     // §10-F
  | 'INFLOW_VS_RETENTION'   // §10-G
  | 'ACTION_VS_TIMING'      // §10-H
  | 'DIRECTNESS'            // §10-B — the more question-specific evidence wins
  | 'RELIABILITY';          // §10-A — the better-grounded input wins

export const ALL_CONTRADICTION_KINDS: readonly ContradictionResolutionKind[] = [
  'DIFFERENT_DOMAIN', 'DIFFERENT_TIMESCALE', 'OPPORTUNITY_VS_OUTCOME', 'BOND_VS_STABILITY',
  'INFLOW_VS_RETENTION', 'ACTION_VS_TIMING', 'DIRECTNESS', 'RELIABILITY',
] as const;

export type ContradictionResolution = {
  kind: ContradictionResolutionKind;
  /** The disciplines that appeared to disagree. */
  between: Discipline[];
  /** Plain-Korean statement of the apparent conflict. */
  conflict: string;
  /** Plain-Korean resolution — what is actually true once decomposed. */
  resolution: string;
  /** Which side dominates the final direction, and WHY the other did not (§11 — never hidden). */
  dominant: Discipline;
  whyOtherDidNotDominate: string;
};

/** Every APPLIED discipline must declare its contribution — or why it lost (§24). */
export type DisciplineContribution = {
  discipline: Discipline;
  applied: boolean;
  stance: Stance;
  /** How it shaped the final verdict. */
  contribution: string;
  /** Present when it did NOT drive the verdict — the honest reason (§11/§24). */
  whyItDidNotDominate?: string;
};

/**
 * THE FINAL CROSS-DISCIPLINE VERDICT (§15). This — not the raw facts, and not the LLM's mood — is the paid
 * answer's conclusion. The prose layer consumes THIS and may not reverse it (§16).
 */
export type CrossDivinationVerdict = {
  question: string;
  questionDomain: JudgmentDomain;
  /**
   * V4A §21 — everything a FOLLOW-UP needs to reason over the SAME graph rather than start again. The V2
   * verdict kept only a polarity snapshot, so "왜?" recomputed from scratch and could contradict the answer it
   * was explaining.
   */
  questionIntent: QuestionIntent;
  /** Server evaluation instant, so a follow-up restores the same temporal frame. */
  evaluatedAtEpochSeconds: number | null;
  /**
   * Whether the QUESTION was about a moment. Part of the evaluation context, not a derived value: time only
   * subordinates a rival claim when the user actually asked about timing (§12), so a follow-up or an audit
   * that re-derives without it reaches a different — and wrong — resolution.
   */
  asksTiming: boolean;
  /** The grounded premises the propositions stand on — without these a proposition cannot be re-examined. */
  premises: DivinationPremise[];

  /** The decisive answer, one plain-Korean sentence. */
  primaryConclusion: string;
  /**
   * V4C §28 — WHICH conclusions the headline stands on, by ID.
   *
   * A "왜?" turn used to re-find the headline by matching `primaryConclusion` against every proposition's
   * assertion. That is display text acting as identity: the moment the headline is composed rather than copied
   * — which it must be whenever several conclusions stand and none owns the answer — the match fails and the
   * explanation silently has nothing to walk. Empty means the verdict declined; it never means "look it up".
   */
  headlinePropositionIds: string[];
  /** The direction of that conclusion. Terminal MIXED is impossible by construction. */
  direction: Stance;

  /** What most drove it — a discipline, or a named cross-cutting fact. */
  dominantBasis: string;

  disciplineJudgments: DivinationJudgment[];
  contributions: DisciplineContribution[];

  /**
   * COMPOUND TRUTH (DEPTH REBUILD §13). A professional reading is often multi-dimensional — "인연은 강하지만
   * 결혼생활은 어렵다", "돈은 들어오지만 남기 어렵다". Collapsing those into one scalar ± was a depth failure,
   * so each axis keeps its own resolved verdict alongside the primary direction.
   */
  axisVerdicts: {
    domain: JudgmentDomain;
    stance: Stance;
    conclusion: string;
    dominantDiscipline: Discipline;
    /** true when disciplines disagreed on THIS axis and the conflict was resolved here. */
    contested: boolean;
  }[];

  /**
   * §6/§7 — every claim this verdict makes, with HOW it was derived. This is what makes the depth claim
   * checkable instead of asserted: a verdict whose propositions are all SINGLE_FACT_RESTATEMENT performed no
   * inference at all, it just reworded the engines' output, and §7 fails such a verdict outright.
   */
  /**
   * The FULL proposition graph — leaves and the propositions they were derived from. Call
   * `standingPropositions()` for just the conclusions that survived supersession.
   */
  propositions: ReasonedProposition[];

  agreementPoints: string[];
  contradictionPoints: string[];
  contradictionResolutions: ContradictionResolution[];

  natalBaseline: string | null;
  currentFlow: string | null;
  /** Only when a timing layer was actually grounded — otherwise null (never invented). */
  timingConclusion: string | null;

  favorableFactors: JudgmentEvidence[];
  riskFactors: JudgmentEvidence[];

  /** Practical direction DERIVED from the verdict — secondary, never the product itself (§1/§17). */
  actionableInterpretation: string;

  confidence: JudgmentConfidence;
  confidenceReason: string;

  /** Source-attributed evidence for the "왜 이렇게 보나요?" layer (§22). */
  evidenceReferences: { discipline: Discipline | 'CROSS'; lines: string[] }[];

  verdictVersion: string;
};

/** Bumped when the JUDGMENT semantics change (distinct from prompt/engine versions). */
export const DIVINATION_VERDICT_VERSION = 'divination-verdict@1.0.0';
