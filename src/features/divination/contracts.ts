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
  | 'INSUFFICIENT_DATA'
  | 'NOT_APPLICABLE';

/** Stances that assert a positive/negative direction (used by guards + the cross judge). */
export const FOR_STANCES: readonly Stance[] = ['STRONGLY_FOR', 'FOR', 'CONDITIONAL_FOR', 'FOR_BUT_LATER'] as const;
export const AGAINST_STANCES: readonly Stance[] = ['AGAINST_FOR_NOW', 'CONDITIONAL_AGAINST', 'AGAINST', 'STRONGLY_AGAINST'] as const;
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

/** Confidence in the JUDGMENT (distinct from DataReliability, which is about the input). */
export type JudgmentConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

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

/** A per-domain sub-judgment, so one discipline can say FOR on money-inflow and AGAINST on retention. */
export type DomainSubJudgment = {
  domain: JudgmentDomain;
  stance: Stance;
  /** One decisive sentence in plain Korean. */
  conclusion: string;
};

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
};

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

  /** The decisive answer, one plain-Korean sentence. */
  primaryConclusion: string;
  /** The direction of that conclusion. Terminal MIXED is impossible by construction. */
  direction: Stance;

  /** What most drove it — a discipline, or a named cross-cutting fact. */
  dominantBasis: string;

  disciplineJudgments: DivinationJudgment[];
  contributions: DisciplineContribution[];

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
