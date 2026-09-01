// DECISION JUDGMENT V1 — WHAT EACH DISCIPLINE CAN LEGITIMATELY SAY ABOUT THE ASKED PROPOSITION.
//
// WHY THIS LAYER EXISTS. Decision Semantics V1 gave the pipeline a DecisionPropositionV1 — what the person
// actually asked the system to judge — and role-tagged the axes that bear on it. What it could not change is
// that the discipline judges answer over a FIXED AXIS PANEL. They say "이 축은 이렇습니다"; they never say
// "이 제안에 대해서는 이렇습니다". The V6.1 census measured the consequence: 11 of the 34 remaining declines
// (D1) had abundant directional judgment somewhere in the discipline and none of it on the axis the
// proposition was actually about.
//
// The material to answer those was ALREADY BEING COMPUTED and then dropped on the floor:
//
//   · All three disciplines run a 7-domain Consultation Judge V1 (`myungriConsultationJudge.ts`,
//     `ziweiConsultationJudge.ts`, `qimenConsultationJudge.ts`) on every paid turn. Each returns a
//     FAVORABLE/CAUTION/MIXED/UNRESOLVED reading of the asked DOMAIN with named, engine-traceable evidence.
//   · Ziwei/Qimen fold theirs in as ADDITIONAL EVIDENCE only — it never becomes an axis stance.
//   · Myungri's becomes a premise with `role: 'QUALIFIES'`, and `primitivePropositions` keeps only
//     `role: 'ASSERTS'`. No derivation rule reads `concept: 'CONSULTATION_JUDGMENT'` either. It is a
//     dead-end premise: computed, persisted, and structurally incapable of reaching Cross.
//
// So this module invents NO metaphysics. It reads what each discipline ALREADY judged about the proposition's
// domain and states it as a judgment OF THE PROPOSITION, role-aware, in the existing stance vocabulary.
//
//   deterministic engine facts → discipline judge + consultation-domain judge → DecisionJudgmentV1 → Cross
//
// THREE THINGS IT MAY NEVER DO:
//   1. Invent a rule, a relation, a timing or an option winner. Every assessment names the discipline
//      judgment it came from (`basis`) and carries that judgment's own evidence.
//   2. Let a non-PRIMARY role decide. CONTEXT explains, TIMING dates, OUTCOME/CONSTRAINT qualify — the
//      direction is PRIMARY's alone, exactly as `decisionProposition.ts` declares.
//   3. Override a discipline's own structural stance. Within one discipline the axis panel outranks the
//      domain judge (the product's existing doctrine: the consultation judge is additional evidence, never
//      an override) — the domain judge speaks only where the panel is silent.
import {
  isDirectional, NO_SIGNAL,
  type DataReliability, type Discipline, type DivinationJudgment, type DomainSubJudgment,
  type EvidenceStrength, type JudgmentConfidence, type JudgmentDomain, type JudgmentEvidence,
  type QuestionDirectness, type Stance, type TemporalScope,
} from './contracts';
import type { DomainJudgeStatus } from './consultationJudgeTypes';
import { domainJudgmentHeadline } from './reasoning/headlineProse';

export const DECISION_JUDGMENT_V1_METHOD = 'deokbunai.decision-judgment.v1' as const;

// ── PROPOSITION SHAPE (declared here so BOTH layers share one definition) ─────────────────────────────
//
// `chat/server/decisionProposition.ts` builds the proposition from Korean text — that classification belongs
// to the server layer and stays there. The TYPES live here because the divination layer has to judge against
// them, and a second copy on the other side of the boundary is a drift waiting to happen.

/** What SHAPE of thing the person asked. Read from the ask, never from the narration. */
export type PropositionKind =
  | 'SHOULD_I_DO_X'    // a single action, weighed against not doing it
  | 'A_VS_B'           // two or more named alternatives
  | 'WILL_X_HAPPEN'    // an occurrence, not a choice
  | 'WHEN_X'           // the period itself is the requested answer
  | 'WHY_X'            // a cause is requested
  | 'WHAT_AM_I'        // a description of the person, not a decision
  /**
   * DECISION JUDGMENT V1 — "무엇을 조심해야 하나요", "어떻게 처신하는 게 좋을까요", "뭘 신경 쓰면 좋을까요".
   *
   * A conduct/caution ask is NOT a decision, and answering it with a declined direction is the same category
   * error V4A §12 fixed for 성격/원인 questions. The person is asking WHAT TO WATCH, and the grounded
   * constraints, counter-evidence and timing the disciplines already produced are the answer.
   */
  | 'HOW_SHOULD_I_ACT';

/** What a satisfying answer has to deliver. */
export type RequestedOutcome = 'DIRECTION' | 'OCCURRENCE' | 'PERIOD' | 'CAUSE' | 'DESCRIPTION' | 'CONDUCT';

/**
 * WHY an axis is bound to this proposition — and therefore how much authority it may carry. Membership in
 * `bearingAxes` is NOT a vote; the ROLE is.
 *
 *   PRIMARY    — directly answers the proposition. The ONLY role that may decide the direction.
 *   OUTCOME    — a result materially caused by the proposition; may colour what the direction MEANS.
 *   CONSTRAINT — materially limits or qualifies it; may produce compound truth, never replace the answer.
 *   TIMING     — temporal bearing only.
 *   CONTEXT    — explanatory only. May never make OPEN/BLOCKED/proceed/hold for the user's decision.
 */
export type AxisRole = 'PRIMARY' | 'OUTCOME' | 'CONSTRAINT' | 'TIMING' | 'CONTEXT';
export type BearingAxis = { readonly axis: JudgmentDomain; readonly role: AxisRole };

/**
 * Whether the named options are actually comparable by the judged proposition.
 *
 * STATUS_QUO_INVERSE — "옮길지 남을지", "계속할지 정리할지": the second option is the negation of the first,
 * so a direction ON THE ACTION already answers the comparison and the product may say so explicitly.
 * DISTINCT_OPTIONS — "A 회사 vs B 회사": two independent objects. The current Judge contract evaluates axes,
 * not options, so there is NO winner to be had and none is invented (that needs option-level doctrine).
 */
export type OptionComparability = 'NOT_A_COMPARISON' | 'STATUS_QUO_INVERSE' | 'DISTINCT_OPTIONS';

/** The proposition fields a discipline needs in order to judge it. Supplied by `buildDecisionProposition`. */
export type JudgedProposition = {
  readonly kind: PropositionKind;
  readonly requestedOutcome: RequestedOutcome;
  readonly bearingAxes: readonly BearingAxis[];
  /**
   * The ask names the DOMAIN and no sub-aspect of it ("제 연애운 좀 봐주세요", "돈 걱정 없이 살 수 있나요").
   * There is no WHOLE_DOMAIN axis in the ontology and this batch does not invent one — instead the
   * discipline's own whole-domain judgment (which is exactly what a Consultation Judge domain result IS)
   * answers it, and the single-aspect panel reading steps aside.
   */
  readonly wholeDomain: boolean;
  readonly options: readonly string[];
  readonly optionComparability: OptionComparability;
  readonly askedDomain: string | null;
};

// ── THE DISCIPLINE'S OWN DOMAIN JUDGMENT ──────────────────────────────────────────────────────────────
/**
 * The minimum shape all three Consultation Judge V1 results already satisfy (`DomainJudgeResult` for
 * Myungri/Ziwei, `QimenDomainJudgeResult` for Qimen). Structural, so no discipline's result type has to
 * change and none of them becomes a dependency of this module.
 */
export type DomainJudgeSummary = {
  readonly domain: string;
  readonly status: DomainJudgeStatus;
  readonly conclusion: string;
  readonly supportingEvidence: readonly JudgmentEvidence[];
  readonly counterEvidence: readonly JudgmentEvidence[];
  readonly uncertaintyReasons: readonly string[];
  readonly provenance?: readonly string[];
};

/** Where an assessment came from. Every assessment names one — there is no unattributed reading. */
export type AssessmentBasis =
  | 'AXIS_SUB_JUDGMENT'    // the discipline's own per-axis panel entry
  | 'DISCIPLINE_HEADLINE'  // the discipline's top-level stance, when it is on this very axis
  | 'DOMAIN_JUDGE';        // the discipline's Consultation Judge V1 reading of the asked domain

export type DecisionAssessment = {
  readonly axis: JudgmentDomain;
  readonly role: AxisRole;
  /** Existing stance vocabulary only — this module never mints a new scale. `NO_SIGNAL` ⇒ no direction. */
  readonly stance: Stance;
  /** The discipline's own sentence. Never composed here beyond joining what it already said. */
  readonly statement: string;
  readonly evidence: readonly JudgmentEvidence[];
  readonly counterEvidence: readonly JudgmentEvidence[];
  readonly temporalScope: TemporalScope;
  readonly directness: QuestionDirectness;
  readonly reliability: DataReliability;
  readonly basis: AssessmentBasis;
};

/**
 * What the discipline says about the PROPOSITION — shaped by what was actually requested.
 *
 * FOR/AGAINST/MIXED are directional readings; ADVISORY, PERIOD and DESCRIPTIVE are answers that are
 * deliberately NOT directions, because the question was not a decision. UNRESOLVED means the discipline was
 * applicable and still has nothing to say about THIS proposition — an honest silence, never a soft no.
 */
export type DecisionStance =
  | 'FOR' | 'AGAINST' | 'MIXED'
  | 'ADVISORY' | 'PERIOD' | 'DESCRIPTIVE'
  | 'UNRESOLVED' | 'NOT_APPLICABLE';

export type DecisionJudgmentV1 = {
  readonly discipline: Discipline;
  /** Identical across disciplines for one turn — that is what makes "same proposition" checkable. */
  readonly propositionId: string;
  readonly propositionKind: PropositionKind;
  readonly requestedOutcome: RequestedOutcome;
  readonly applicable: boolean;
  readonly dataReliability: DataReliability;
  readonly decisionStance: DecisionStance;
  /** The PRIMARY-role reading. The only assessment that may set a direction. */
  readonly primaryAssessment: DecisionAssessment | null;
  /** OUTCOME-role readings — what follows from the proposed direction. */
  readonly supportingAssessments: readonly DecisionAssessment[];
  /** CONSTRAINT-role readings — what limits it. Also the authoritative material for a conduct/caution ask. */
  readonly limitingAssessments: readonly DecisionAssessment[];
  readonly timingAssessments: readonly DecisionAssessment[];
  readonly unresolvedReasons: readonly string[];
  /** Engine-traceable fact ids behind every assessment above. Provenance, never prose. */
  readonly evidenceIds: readonly string[];
  readonly confidence: JudgmentConfidence;
  readonly questionDirectness: QuestionDirectness;
  readonly evidenceStrength: EvidenceStrength;
  readonly optionComparability: OptionComparability;
  readonly provenance: readonly [typeof DECISION_JUDGMENT_V1_METHOD];
};

// ── IDENTITY ──────────────────────────────────────────────────────────────────────────────────────────
/**
 * One turn's proposition, as a stable key. Deterministic and discipline-free BY CONSTRUCTION: every field is
 * a property of the ASK, so three disciplines judging the same turn cannot end up with different ids, and a
 * discipline that silently answered a different proposition cannot end up with the same one.
 */
export function propositionIdOf(p: JudgedProposition): string {
  const primary = p.bearingAxes.filter((b) => b.role === 'PRIMARY').map((b) => b.axis).sort();
  return [
    p.kind, p.requestedOutcome, p.askedDomain ?? 'NONE',
    primary.join('+') || 'NONE', p.wholeDomain ? 'WHOLE' : 'ASPECT',
  ].join('|');
}

// ── ASSESSMENT ────────────────────────────────────────────────────────────────────────────────────────

/**
 * FAVORABLE/CAUTION → a QUALIFIED direction, never a firm one.
 *
 * The domain judge states a bounded categorical reading of a whole life domain; the axis panel states a
 * structural reading of one axis. Promoting the former to `FOR`/`AGAINST` would let a domain summary outrank
 * a direct structural finding, so it enters as `CONDITIONAL_*` — which the adapter maps to SUPPORTS/CONSTRAINS
 * and Cross's own directness resolution then ranks below any DIRECT panel reading. MIXED asserts NO direction:
 * a grounded opportunity AND a grounded risk both exist, and picking one would be the fake winner this batch
 * is forbidden to create.
 */
function stanceForStatus(status: DomainJudgeStatus): Stance {
  switch (status) {
    case 'FAVORABLE': return 'CONDITIONAL_FOR';
    case 'CAUTION': return 'CONDITIONAL_AGAINST';
    case 'MIXED': return NO_SIGNAL;
    case 'UNRESOLVED': return NO_SIGNAL;
  }
}

const factIds = (es: readonly JudgmentEvidence[]) => es.filter((e) => e.coverageGap !== true).map((e) => e.fact);
const real = (es: readonly JudgmentEvidence[] | undefined) => (es ?? []).filter((e) => e.coverageGap !== true);

function fromSubJudgment(sub: DomainSubJudgment, role: AxisRole): DecisionAssessment {
  return {
    axis: sub.domain, role, stance: sub.stance, statement: sub.conclusion,
    evidence: real(sub.evidence), counterEvidence: real(sub.counterEvidence),
    temporalScope: sub.temporalScope, directness: sub.directness, reliability: sub.reliability,
    basis: 'AXIS_SUB_JUDGMENT',
  };
}

function fromHeadline(j: DivinationJudgment, axis: JudgmentDomain, role: AxisRole): DecisionAssessment {
  return {
    axis, role, stance: j.stance, statement: j.dominantConclusion,
    evidence: real(j.directEvidence), counterEvidence: real(j.counterEvidence),
    temporalScope: j.temporalScope, directness: j.questionDirectness, reliability: j.dataReliability,
    basis: 'DISCIPLINE_HEADLINE',
  };
}

function fromDomainJudge(
  d: DomainJudgeSummary, j: DivinationJudgment, axis: JudgmentDomain, role: AxisRole,
): DecisionAssessment {
  const stance = stanceForStatus(d.status);
  return {
    axis, role, stance,
    // The domain judge's own sentence is REASONING, not a verdict statement, and this slot can become the
    // verdict headline. Directional statuses are therefore restated on the bound axis in the verdict layer's
    // own register; the discipline's sentence still travels in full as the evidence behind it. A
    // non-directional status keeps its own words, because nothing is being stated about a direction.
    statement: isDirectional(stance)
      ? domainJudgmentHeadline(axis, d.status === 'FAVORABLE')
      : d.conclusion,
    evidence: real(d.supportingEvidence), counterEvidence: real(d.counterEvidence),
    temporalScope: j.temporalScope,
    // ADJACENT on purpose: the domain judge reads the DOMAIN, not the exact axis. Claiming DIRECT would let
    // it tie with — and under `resolveAnswer` therefore block — a genuinely direct panel reading.
    directness: 'ADJACENT',
    reliability: j.dataReliability,
    basis: 'DOMAIN_JUDGE',
  };
}

/**
 * The discipline's reading of ONE bearing axis, from its own material only.
 *
 * Source order is the authority order. The panel is the discipline's structural reading of that exact axis and
 * outranks everything; its own headline comes next when it is on this axis; the domain judge speaks last,
 * where the two above are silent. A WHOLE-DOMAIN ask inverts the first two, because there the panel's
 * single-aspect entry is answering a narrower question than the one that was asked.
 */
function assessAxis(
  j: DivinationJudgment, axis: JudgmentDomain, role: AxisRole,
  domainResult: DomainJudgeSummary | null, wholeDomain: boolean,
): DecisionAssessment | null {
  const sub = j.domainSubJudgments.find((s) => s.domain === axis) ?? null;
  const headline = j.questionDomain === axis && isDirectional(j.stance) ? fromHeadline(j, axis, role) : null;
  const domain = role === 'PRIMARY' && domainResult && domainResult.status !== 'UNRESOLVED'
    ? fromDomainJudge(domainResult, j, axis, role)
    : null;

  const panel = sub && isDirectional(sub.stance) ? fromSubJudgment(sub, role) : null;
  const ordered = wholeDomain
    ? [domain, panel, headline, sub ? fromSubJudgment(sub, role) : null]
    : [panel, headline, domain, sub ? fromSubJudgment(sub, role) : null];
  return ordered.find((a): a is DecisionAssessment => a !== null) ?? null;
}

// ── TIMING ────────────────────────────────────────────────────────────────────────────────────────────
/**
 * The discipline's temporal material for this proposition — its own `timingSignals` plus any TIMING-role
 * axis it actually judged. Nothing is derived: a period the discipline did not state does not appear.
 */
function timingFor(j: DivinationJudgment, bearing: readonly BearingAxis[]): DecisionAssessment[] {
  const out: DecisionAssessment[] = [];
  const signals = real(j.timingSignals);
  if (signals.length > 0) {
    out.push({
      axis: 'TIMING', role: 'TIMING', stance: NO_SIGNAL,
      statement: signals.map((e) => e.meaning).join(' '),
      evidence: signals, counterEvidence: [],
      temporalScope: j.temporalScope, directness: 'ADJACENT', reliability: j.dataReliability,
      basis: 'DISCIPLINE_HEADLINE',
    });
  }
  for (const b of bearing) {
    if (b.role !== 'TIMING') continue;
    const sub = j.domainSubJudgments.find((s) => s.domain === b.axis);
    if (sub) out.push(fromSubJudgment(sub, 'TIMING'));
  }
  return out;
}

// ── THE JUDGMENT ──────────────────────────────────────────────────────────────────────────────────────

export type DecisionJudgeInput = {
  readonly judgment: DivinationJudgment;
  readonly proposition: JudgedProposition;
  /** This discipline's OWN Consultation Judge V1 result for the proposition's domain, when it produced one. */
  readonly domainResult?: DomainJudgeSummary | null;
};

/**
 * What THIS discipline can legitimately say about THIS proposition. Pure and offline: no provider call, no
 * engine call, no new fact — every field traces to `input.judgment` or `input.domainResult`.
 */
export function judgeDecision(input: DecisionJudgeInput): DecisionJudgmentV1 {
  const { judgment: j, proposition: p } = input;
  // THE DOMAIN JUDGMENT ONLY SPEAKS FOR THE DOMAIN IT IS ABOUT.
  //
  // Binding it to the proposition's PRIMARY axis is only legitimate when that axis IS this domain's axis. A
  // question that routed to no domain falls back to the previously resolved axis (often GENERAL), and Qimen
  // additionally falls back to its own generic EVENT_SUCCESS ("will this proceed") when no topic routed —
  // projecting either onto the asked axis would be exactly the off-axis contamination V6 closed, arriving
  // through a new door.
  const domainResult = p.askedDomain !== null && input.domainResult?.domain === p.askedDomain
    ? input.domainResult
    : null;
  const base = {
    discipline: j.discipline,
    propositionId: propositionIdOf(p),
    propositionKind: p.kind,
    requestedOutcome: p.requestedOutcome,
    dataReliability: j.dataReliability,
    optionComparability: p.optionComparability,
    provenance: [DECISION_JUDGMENT_V1_METHOD] as const,
  };
  if (!j.applicable) {
    return {
      ...base, applicable: false, decisionStance: 'NOT_APPLICABLE',
      primaryAssessment: null, supportingAssessments: [], limitingAssessments: [], timingAssessments: [],
      unresolvedReasons: j.applicabilityReason ? [j.applicabilityReason] : [],
      evidenceIds: [], confidence: 'LOW', questionDirectness: j.questionDirectness, evidenceStrength: 'NONE',
    };
  }

  const of = (role: AxisRole) => p.bearingAxes
    .filter((b) => b.role === role)
    .map((b) => assessAxis(j, b.axis, role, role === 'PRIMARY' ? domainResult : null, p.wholeDomain))
    .filter((a): a is DecisionAssessment => a !== null);

  const primaryAssessment = of('PRIMARY')[0] ?? null;
  const supportingAssessments = of('OUTCOME');
  const limitingAssessments = of('CONSTRAINT');
  const timingAssessments = timingFor(j, p.bearingAxes);
  // CONTEXT is read for nothing. It is bound so the proposition RECORDS why an axis is present, and this
  // module deliberately never assesses it — an explanatory axis that produced an assessment would be one
  // `find()` away from being a direction.

  const all = [primaryAssessment, ...supportingAssessments, ...limitingAssessments, ...timingAssessments]
    .filter((a): a is DecisionAssessment => a !== null);
  const evidenceIds = [...new Set(all.flatMap((a) => [...factIds(a.evidence), ...factIds(a.counterEvidence)]))];

  // A conduct/caution ask is answered by what LIMITS the person, wherever on the proposition the discipline
  // grounded it: counter-evidence on ANY bearing axis is a limit, and a CONSTRAINT axis is a limit by role
  // even when its own material reads positively. CONTEXT contributes nothing here for the same reason it
  // contributes nothing anywhere — it is never assessed at all.
  const cautionMaterial = [
    ...all.filter((a) => a.counterEvidence.length > 0),
    ...limitingAssessments.filter((a) => a.evidence.length > 0),
  ];

  const directional = primaryAssessment && isDirectional(primaryAssessment.stance)
    ? (primaryAssessment.stance.includes('FOR') ? 'FOR' as const : 'AGAINST' as const)
    : null;
  // A domain judge that found BOTH an opportunity and a risk is MIXED — first-class, never averaged and
  // never resolved into a winner here (`combineStatus`'s own discipline, preserved through this layer).
  const mixed = domainResult?.status === 'MIXED'
    || (primaryAssessment !== null && !isDirectional(primaryAssessment.stance)
      && primaryAssessment.evidence.length > 0 && primaryAssessment.counterEvidence.length > 0);

  const decisionStance: DecisionStance = (() => {
    switch (p.requestedOutcome) {
      // §12 — a description or a cause is not a decision, and declining a direction it never asked for
      // would be the category error, not the honest answer.
      case 'DESCRIPTION':
      case 'CAUSE':
        return all.length > 0 ? 'DESCRIPTIVE' : 'UNRESOLVED';
      case 'PERIOD':
        if (timingAssessments.length > 0) return 'PERIOD';
        return directional ?? (mixed ? 'MIXED' : 'UNRESOLVED');
      case 'CONDUCT':
        if (cautionMaterial.length > 0) return 'ADVISORY';
        return directional ?? (mixed ? 'MIXED' : 'UNRESOLVED');
      default:
        return directional ?? (mixed ? 'MIXED' : 'UNRESOLVED');
    }
  })();

  const unresolvedReasons = decisionStance === 'UNRESOLVED'
    ? [
      ...(domainResult?.uncertaintyReasons ?? []),
      ...(primaryAssessment ? [] : [`${axisNames(p)}에 대해 이 학문에서 세울 판단이 없습니다.`]),
    ]
    : [];

  return {
    ...base,
    applicable: true,
    decisionStance,
    primaryAssessment,
    supportingAssessments,
    limitingAssessments,
    timingAssessments,
    unresolvedReasons: [...new Set(unresolvedReasons)],
    evidenceIds,
    confidence: j.confidence,
    questionDirectness: primaryAssessment?.directness ?? j.questionDirectness,
    // The discipline's own strength stands when its own panel answered; a domain-judge-derived reading is
    // never STRONG, because it is a bounded domain summary rather than a direct structural finding.
    evidenceStrength: primaryAssessment?.basis === 'DOMAIN_JUDGE'
      ? (primaryAssessment.evidence.length + primaryAssessment.counterEvidence.length > 0 ? 'MODERATE' : 'NONE')
      : j.evidenceStrength,
  };
}

const axisNames = (p: JudgedProposition) =>
  p.bearingAxes.filter((b) => b.role === 'PRIMARY').map((b) => b.axis).join('·') || '이 질문';

// ── PROJECTION INTO THE EXISTING CROSS INPUT ──────────────────────────────────────────────────────────
/**
 * Make the proposition-level reading VISIBLE to Cross, without changing how Cross resolves anything.
 *
 * The projection is deliberately the narrowest possible: one `DomainSubJudgment` on the PRIMARY axis, and
 * only where that discipline had no directional reading of it. `disciplineAdapter.adaptJudgment` then turns
 * it into premises and a PRIMITIVE proposition exactly as it does for every other sub-judgment, so no new
 * adapter, no new premise concept and no new resolution rule enters the system. Cross's winner/conflict
 * doctrine is untouched: what changes is that a discipline which HAD judged the asked domain is no longer
 * silent on the axis the question was about.
 *
 * Every guard here exists to keep an existing invariant:
 *   · AXIS_SUB_JUDGMENT / DISCIPLINE_HEADLINE bases are skipped — the panel and the adapter's own D2
 *     forwarding already carry those, and injecting would double-count one reading as two premises.
 *   · a non-directional assessment is never injected — MIXED must not become a winner.
 *   · an axis this discipline already answered directionally is never touched — the consultation judge
 *     stays ADDITIONAL evidence and never overrides the discipline's own structural stance.
 *   · an assessment with no named fact is dropped — the adapter would refuse it anyway (audit E1).
 */
export function projectDecisionJudgments(
  judgments: readonly DivinationJudgment[], decisions: readonly DecisionJudgmentV1[],
): DivinationJudgment[] {
  return judgments.map((j) => {
    const d = decisions.find((x) => x.discipline === j.discipline);
    const a = d?.primaryAssessment;
    if (!a || a.basis !== 'DOMAIN_JUDGE') return j;
    if (!isDirectional(a.stance)) return j;
    if (a.evidence.length === 0 && a.counterEvidence.length === 0) return j;
    if (j.domainSubJudgments.some((s) => s.domain === a.axis && isDirectional(s.stance))) return j;
    const injected: DomainSubJudgment = {
      domain: a.axis, stance: a.stance, conclusion: a.statement,
      temporalScope: a.temporalScope, directness: a.directness, reliability: a.reliability,
      evidence: [...a.evidence], counterEvidence: [...a.counterEvidence],
      source: 'DECISION_JUDGMENT_V1',
    };
    return { ...j, domainSubJudgments: [...j.domainSubJudgments, injected] };
  });
}

/**
 * The projected readings ALONE, as a judgment the adapter can consume.
 *
 * A discipline that supplies its own premise graph (Myungri today) is deliberately NOT adapted from its
 * finished judgment — `reasonCross` skips it, because its graph is already the richer source. That skip also
 * skipped the projection, so a Myungri domain judgment bound to the asked axis reached Cross as nothing at
 * all: the replay measured two declines with the injected reading sitting right there and the verdict still
 * reporting "해당 축 근거 없음". This is the narrow re-entry for exactly those readings.
 *
 * `stance` is blanked on purpose. `adaptJudgment` also forwards a top-level directional stance when no
 * sub-judgment covers it (the D2 repair), and for a graph-supplied discipline that headline is ALREADY in the
 * graph — forwarding it here would enter the same reading twice, as two premises that could then pair with
 * each other. Only the projected sub-judgments may come through this door.
 */
export function decisionProjectionOnly(j: DivinationJudgment): DivinationJudgment | null {
  const projected = j.domainSubJudgments.filter((s) => s.source === 'DECISION_JUDGMENT_V1');
  if (projected.length === 0) return null;
  return { ...j, stance: NO_SIGNAL, domainSubJudgments: projected };
}
