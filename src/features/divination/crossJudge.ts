// DIVINATION_ENGINE_V1 — CROSS DIVINATION JUDGE. REBUILT (audit: CROSS_JUDGE_DEPTH = LOW,
// C7_FINAL_VERDICT_IS_STRUCTURALLY_JUSTIFIED = NO, NO_NEUTRALIZATION_OVER_DECISIVENESS_RISK = HIGH).
//
// WHAT THE AUDIT FOUND, AND WHAT CHANGED — a rebuild of the reasoning, NOT a C7 special case:
//   1. Decomposition was FIXTURE-ONLY. Production handed all three judges the same `questionDomain`, so the
//      "different axes" test could never fire on the real path. → The judge now reasons over SUB-JUDGMENTS,
//      each carrying its own axis, which the rebuilt discipline judges genuinely produce.
//   2. Temporal split ran BEFORE strength/directness, so whichever side happened to be labelled "structural"
//      owned the direction regardless of evidence. That is exactly how a LOW-confidence, no-signal Ziwei
//      overturned a HIGH-confidence direct Myungri negative (C7). → Temporal split now requires BOTH sides to
//      be genuinely supported; otherwise the better-evidenced side simply wins.
//   3. Only the FIRST positive and FIRST negative were compared; a third contrary judgment was dropped and an
//      exact tie silently favoured the positive. → Every claim on an axis is weighed together.
//   4. Direction could be manufactured from absent evidence. → Claims with NONE strength cast no vote, and an
//      axis with no adequately-evidenced claim resolves to INSUFFICIENT_EVIDENCE.
//
// CONSTITUTION: CONTRADICTION ≠ NEUTRAL **and** CONTRADICTION ≠ FORCED_DECISION (§12).
import {
  DIVINATION_VERDICT_VERSION,
  evidenceAdequacy,
  isDirectional,
  stanceValence,
  type ContradictionResolution,
  type CrossDivinationVerdict,
  type Discipline,
  type DisciplineContribution,
  type DivinationJudgment,
  type DivinationProposition,
  type InferenceDerivation,
  type DomainSubJudgment,
  type EvidenceStrength,
  type JudgmentConfidence,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
  type QuestionIntent,
  NON_DECISION_INTENTS,
} from './contracts';

const DISCIPLINE_LABEL: Record<Discipline, string> = { MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑' };

// User-visible Korean: the particle must agree with the preceding 받침.
const hasFinalConsonant = (w: string): boolean => {
  const ch = w.charCodeAt(w.length - 1);
  return ch >= 0xac00 && ch <= 0xd7a3 ? (ch - 0xac00) % 28 !== 0 : false;
};
const withParticle = (w: string, closed: string, open: string) => `${w}${hasFinalConsonant(w) ? closed : open}`;
const disc = (d: Discipline) => DISCIPLINE_LABEL[d];
const discSubject = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '은', '는');
const discNominative = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '이', '가');
const discAnd = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '과', '와');

const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const axisLabel = (d: JudgmentDomain) => AXIS_LABEL[d] ?? '전반';

/** Axis pairs whose opposite-looking verdicts are BOTH true (compound truth, §13). */
const COMPOUND_FRAME: { a: JudgmentDomain; b: JudgmentDomain; kind: ContradictionResolution['kind']; frame: string }[] = [
  { a: 'MONEY_INFLOW', b: 'MONEY_RETENTION', kind: 'INFLOW_VS_RETENTION', frame: '돈이 들어오는 것과 남는 것은 다르게 봅니다.' },
  { a: 'RELATION_BOND', b: 'RELATION_STABILITY', kind: 'BOND_VS_STABILITY', frame: '끌리는 힘과 같이 사는 난도는 다르게 봅니다.' },
  { a: 'OPPORTUNITY', b: 'OUTCOME', kind: 'OPPORTUNITY_VS_OUTCOME', frame: '기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다.' },
  { a: 'CAREER', b: 'MONEY_RETENTION', kind: 'DIFFERENT_DOMAIN', frame: '자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.' },
];

const NEAR_SCOPES = new Set(['PRESENT_MOMENT', 'WOLWOON', 'SEWOON']);
const STRUCTURAL_SCOPES = new Set(['NATAL', 'DAEWOON']);

const STRENGTH_RANK: Record<EvidenceStrength, number> = { STRONG: 3, MODERATE: 2, WEAK: 1, NONE: 0 };
/** A claim is SUPPORTED when a named fact actually backs it — WEAK/NONE means it rests on nothing usable. */
const isSupported = (s: EvidenceStrength) => s === 'STRONG' || s === 'MODERATE';
const RELIABILITY_RANK = { EXACT: 3, REDUCED: 2, MINIMAL: 1, UNUSABLE: 0 } as const;
const DIRECTNESS_RANK = { DIRECT: 3, ADJACENT: 2, GENERAL: 1 } as const;
export type CrossJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  judgments: DivinationJudgment[];
  asksTiming: boolean;
  /** V3 §8 — what SHAPE of answer the question wants. Absent → treated as OUTCOME (legacy behaviour). */
  questionIntent?: QuestionIntent;
  natalBaseline?: string | null;
  currentFlow?: string | null;
};

/** One discipline's claim about ONE axis — the unit the cross judge reasons over. */
type Claim = {
  discipline: Discipline;
  sub: DomainSubJudgment;
  parent: DivinationJudgment;
  strength: EvidenceStrength;
};

/**
 * Evidence adequacy for THIS claim (not the parent's overall stance). Shared with every discipline judge so
 * one definition governs — and so it reads support QUALITY (a named DIRECT fact on exact input) rather than
 * counting bullets, which three adjacent hints could otherwise use to outrank one 충 on the asked palace.
 * Defensive by construction: a judge that omits its evidence arrays degrades to WEAK, never crashes a paid answer.
 */
const claimStrength = (sub: DomainSubJudgment): EvidenceStrength => evidenceAdequacy(sub);

/**
 * V3 §5/§27 — NO SCORE-FIRST SELECTION. The previous build multiplied ranks (strength×100 + directness×10 +
 * reliability×3) and let the arithmetic pick the winner, which is exactly the architecture the audit
 * rejected: the number, not the reasoning, decided the verdict.
 *
 * Dominance is now decided by ORDERED, NAMED comparisons, and each comparison returns the REASON it settled
 * the matter, so a verdict can always state *why* one side prevailed rather than "it scored higher".
 * Returns null when no criterion distinguishes them — the caller must then keep both truths or declare
 * insufficiency rather than invent a winner.
 */
type DominanceReason =
  | 'DIRECT_VS_INDIRECT_EVIDENCE'
  | 'RELEVANT_VS_GENERIC_STRUCTURE'
  | 'EXACT_VS_BROAD_TEMPORAL_SCOPE'
  | 'RELIABLE_VS_UNCERTAIN_DATA'
  | 'STRUCTURAL_SUPPORT_VS_INCIDENTAL_SIGNAL'
  | 'NAMED_OBSTRUCTION_VS_UNOPPOSED_HEDGE'
  | 'DEFINITE_VS_QUALIFIED_CLAIM';

const REASON_TEXT: Record<DominanceReason, string> = {
  DIRECT_VS_INDIRECT_EVIDENCE: '한쪽 근거가 이 질문에 직접 닿아 있고 다른 쪽은 한 단계 건너뛴 근거입니다',
  RELEVANT_VS_GENERIC_STRUCTURE: '한쪽은 질문이 묻는 구조를 직접 짚고 다른 쪽은 일반적인 신호에 그칩니다',
  EXACT_VS_BROAD_TEMPORAL_SCOPE: '한쪽은 질문이 묻는 시점을 정확히 다루고 다른 쪽은 넓은 시기를 말합니다',
  RELIABLE_VS_UNCERTAIN_DATA: '한쪽 자료가 확정적이고 다른 쪽은 불확실한 입력에 기대고 있습니다',
  STRUCTURAL_SUPPORT_VS_INCIDENTAL_SIGNAL: '한쪽은 구조적으로 뒷받침되고 다른 쪽은 우연한 단발 신호입니다',
  NAMED_OBSTRUCTION_VS_UNOPPOSED_HEDGE: '한쪽은 막는 자리를 이름까지 짚어내고 다른 쪽은 걸림돌을 짚지 못한 채 조건부로만 열려 있습니다',
  DEFINITE_VS_QUALIFIED_CLAIM: '한쪽은 분명한 판단이고 다른 쪽은 조건이 붙은 판단입니다',
};

/** A stance that hedges ("조건이 갖춰지면") asserts less than a definite one. */
const QUALIFIED_STANCES = new Set<Stance>(['CONDITIONAL_FOR', 'CONDITIONAL_AGAINST', 'FOR_BUT_LATER', 'AGAINST_FOR_NOW']);

function decideDominance(a: Claim, b: Claim): { winner: Claim; loser: Claim; reason: DominanceReason } | null {
  // 1) real evidence beats thin evidence — a claim resting on nothing never wins.
  const evidenceOf = (c: Claim) => (c.sub.evidence?.length ?? 0) + (c.sub.counterEvidence?.length ?? 0);
  if (evidenceOf(a) > 0 && evidenceOf(b) === 0) return { winner: a, loser: b, reason: 'STRUCTURAL_SUPPORT_VS_INCIDENTAL_SIGNAL' };
  if (evidenceOf(b) > 0 && evidenceOf(a) === 0) return { winner: b, loser: a, reason: 'STRUCTURAL_SUPPORT_VS_INCIDENTAL_SIGNAL' };

  // 2) evidence that speaks DIRECTLY to the question outranks adjacent/generic evidence.
  if (a.sub.directness !== b.sub.directness) {
    const [w, l] = DIRECTNESS_RANK[a.sub.directness] > DIRECTNESS_RANK[b.sub.directness] ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: w.sub.directness === 'DIRECT' ? 'DIRECT_VS_INDIRECT_EVIDENCE' : 'RELEVANT_VS_GENERIC_STRUCTURE' };
  }

  // 3) a well-supported claim outranks a barely-supported one of the same directness.
  if (STRENGTH_RANK[a.strength] !== STRENGTH_RANK[b.strength]) {
    const [w, l] = STRENGTH_RANK[a.strength] > STRENGTH_RANK[b.strength] ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'STRUCTURAL_SUPPORT_VS_INCIDENTAL_SIGNAL' };
  }

  // 4) better input quality (exact birth time vs degraded) settles an otherwise even match.
  if (RELIABILITY_RANK[a.sub.reliability] !== RELIABILITY_RANK[b.sub.reliability]) {
    const [w, l] = RELIABILITY_RANK[a.sub.reliability] > RELIABILITY_RANK[b.sub.reliability] ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'RELIABLE_VS_UNCERTAIN_DATA' };
  }

  // 5) a side that NAMES an obstruction on this very axis outweighs one that found no blocker and is only
  //    conditionally open. (재백궁 화기 is a located blockage; "조건이 갖춰지면 열린다" is not its equal.)
  const namesObstruction = (c: Claim) => (c.sub.counterEvidence?.length ?? 0) > 0;
  if (namesObstruction(a) !== namesObstruction(b)) {
    const [w, l] = namesObstruction(a) ? [a, b] : [b, a];
    return { winner: w, loser: l, reason: 'NAMED_OBSTRUCTION_VS_UNOPPOSED_HEDGE' };
  }

  // 6) a definite claim outweighs a hedged one — an explainable professional distinction, not a score.
  const qualified = (c: Claim) => QUALIFIED_STANCES.has(c.sub.stance);
  if (qualified(a) !== qualified(b)) {
    const [w, l] = qualified(a) ? [b, a] : [a, b];
    return { winner: w, loser: l, reason: 'DEFINITE_VS_QUALIFIED_CLAIM' };
  }

  return null; // genuinely indistinguishable — the caller must NOT fabricate a winner
}

function insufficient(input: CrossJudgeInput, judgments: DivinationJudgment[], proven: boolean): CrossDivinationVerdict {
  return {
    question: input.question,
    questionDomain: input.questionDomain,
    primaryConclusion: proven
      ? '지금 확인할 수 있는 근거로는 이 질문에 방향을 잡아 드리기 어렵습니다.'
      : '이 질문에 대해서는 방향을 정할 만한 신호가 명식에서 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.',
    direction: proven ? 'INSUFFICIENT_DATA' : 'INSUFFICIENT_EVIDENCE',
    dominantBasis: proven ? '판단에 쓸 수 있는 근거 없음' : '방향을 정할 만한 신호 없음',
    disciplineJudgments: judgments,
    contributions: judgments.map((j) => ({
      discipline: j.discipline, applied: j.applicable, stance: j.stance,
      contribution: j.applicable
        ? `${j.dominantConclusion} (방향을 정할 만큼의 근거는 아닙니다.)`
        : j.applicabilityReason ?? '이 질문에 답할 근거가 부족했습니다.',
    })),
    axisVerdicts: [],
    propositions: [],
    agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
    natalBaseline: input.natalBaseline ?? null,
    currentFlow: input.currentFlow ?? null,
    timingConclusion: null,
    favorableFactors: [], riskFactors: [],
    actionableInterpretation: proven
      ? '필요한 정보(예: 정확한 출생시간)가 확인되면 다시 봐 드릴 수 있습니다.'
      : '지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.',
    confidence: 'LOW',
    confidenceReason: proven ? '적용 가능한 학문이 없었습니다.' : '적용은 됐지만 방향을 정할 신호가 약합니다.',
    evidenceReferences: judgments
      .filter((j) => j.applicable)
      .map((j) => ({ discipline: j.discipline, lines: [j.dominantConclusion] })),
    verdictVersion: DIVINATION_VERDICT_VERSION,
  };
}

type AxisResolution = {
  domain: JudgmentDomain;
  stance: Stance;
  conclusion: string;
  winner: Claim;
  contested: boolean;
  resolution: ContradictionResolution | null;
};

/**
 * §6/§7 — classify HOW each axis conclusion was reached, and from what. A claim that rests on exactly one
 * engine fact is a restatement, not an inference, and saying so is the point: it is the only way a reader
 * (or an audit) can tell real synthesis from reworded engine output.
 */
function propositionFor(r: AxisResolution, claimsOnAxis: Claim[]): DivinationProposition {
  const facts = [...(r.winner.sub.evidence ?? []), ...(r.winner.sub.counterEvidence ?? [])].map((e) => e.fact);
  const disciplines = [...new Set(claimsOnAxis.filter((c) => c.strength !== 'NONE').map((c) => c.discipline))];
  const derivation: InferenceDerivation =
    r.contested && disciplines.length > 1
      ? 'CROSS_DISCIPLINE_SYNTHESIS'
      : facts.length === 0
        // No named fact backs this — the conclusion came from what the chart LACKS (원국에 재성 없음 etc.).
        ? 'STRUCTURAL_ABSENCE'
        : facts.length > 1
          ? 'MULTI_FACT_WITHIN_DISCIPLINE'
          : 'SINGLE_FACT_RESTATEMENT';
  return {
    claim: r.conclusion,
    derivation,
    fromDisciplines: derivation === 'CROSS_DISCIPLINE_SYNTHESIS' ? disciplines : [r.winner.discipline],
    fromFacts: facts,
  };
}

/** Resolve ONE axis where several disciplines spoke. Same proposition ⇒ compare; never average. */
function resolveAxis(domain: JudgmentDomain, claims: Claim[]): AxisResolution | null {
  const voting = claims.filter((c) => c.strength !== 'NONE');
  if (voting.length === 0) return null; // silence casts no vote (E1 fix)

  const forSide = voting.filter((c) => stanceValence(c.sub.stance) === 'FOR');
  const againstSide = voting.filter((c) => stanceValence(c.sub.stance) === 'AGAINST');
  // "Best" = survives pairwise REASONED comparison, not a numeric sort (§5).
  const best = (pool: Claim[]): Claim =>
    pool.reduce((champion, challenger) => decideDominance(champion, challenger)?.winner ?? champion);

  if (forSide.length === 0 || againstSide.length === 0) {
    const winner = best(voting);
    return { domain, stance: winner.sub.stance, conclusion: winner.sub.conclusion, winner, contested: false, resolution: null };
  }

  // ── genuine same-axis conflict ────────────────────────────────────────────────────────────────
  const bestFor = best(forSide);
  const bestAgainst = best(againstSide);

  // TEMPORAL split — allowed ONLY when BOTH sides are genuinely supported (audit fix #2). Otherwise a weak
  // signal must never re-label a strong one as "merely timing"; the better-evidenced side simply wins.
  const structural = [bestFor, bestAgainst].find((c) => STRUCTURAL_SCOPES.has(c.sub.temporalScope));
  const near = [bestFor, bestAgainst].find((c) => NEAR_SCOPES.has(c.sub.temporalScope));
  const bothSupported = isSupported(bestFor.strength) && isSupported(bestAgainst.strength);
  if (structural && near && structural !== near && bothSupported) {
    const structuralFor = stanceValence(structural.sub.stance) === 'FOR';
    return {
      domain,
      stance: structuralFor ? 'FOR_BUT_LATER' : 'AGAINST_FOR_NOW',
      conclusion: structuralFor
        ? '방향은 맞습니다. 다만 지금 시점은 아닙니다.'
        : '지금 움직일 여지는 있지만, 큰 방향이 받쳐주지 않습니다.',
      winner: structural,
      contested: true,
      resolution: {
        kind: near.sub.temporalScope === 'PRESENT_MOMENT' ? 'ACTION_VS_TIMING' : 'DIFFERENT_TIMESCALE',
        between: [structural.discipline, near.discipline],
        conflict: `${discSubject(structural.discipline)} 방향을, ${discSubject(near.discipline)} 시점을 다르게 봅니다.`,
        resolution: structuralFor
          ? '가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.'
          : '지금 당장은 열려 있어도, 큰 방향이 받쳐주지 않습니다.',
        dominant: structural.discipline,
        whyOtherDidNotDominate: `${discSubject(near.discipline)} 지금 시점의 신호라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.`,
      },
    };
  }

  // ── SAME-PROPOSITION conflict → decide by NAMED reason, or refuse to decide (§27/§28) ───────────
  const decided = decideDominance(bestFor, bestAgainst);
  if (!decided) {
    // Genuinely indistinguishable. Forcing a winner here is the "forced decision" failure; averaging them is
    // the "neutralization" failure. Report the standoff honestly and let the axis carry no direction.
    return {
      domain,
      stance: 'INSUFFICIENT_EVIDENCE',
      conclusion: `${axisLabel(domain)}에 대해서는 서로 반대되는 근거의 무게가 같아, 어느 쪽으로도 방향을 정하지 않습니다.`,
      winner: bestFor,
      contested: true,
      resolution: {
        kind: 'DIRECTNESS',
        between: [bestFor.discipline, bestAgainst.discipline],
        conflict: `${discAnd(bestFor.discipline)} ${discNominative(bestAgainst.discipline)} ${axisLabel(domain)}을 반대로 봅니다.`,
        resolution: '양쪽 근거의 직접성·뒷받침·자료 품질이 모두 대등해, 한쪽을 우세하다고 볼 근거가 없습니다.',
        dominant: bestFor.discipline,
        whyOtherDidNotDominate: '어느 쪽도 우세하지 않아, 억지로 승자를 만들지 않았습니다.',
      },
    };
  }
  const { winner: win, loser: lose, reason } = decided;
  return {
    domain,
    stance: win.sub.stance,
    conclusion: win.sub.conclusion,
    winner: win,
    contested: true,
    resolution: {
      kind: reason === 'RELIABLE_VS_UNCERTAIN_DATA' ? 'RELIABILITY' : 'DIRECTNESS',
      between: [bestFor.discipline, bestAgainst.discipline],
      conflict: `${discAnd(bestFor.discipline)} ${discNominative(bestAgainst.discipline)} ${axisLabel(domain)}을 반대로 봅니다.`,
      resolution: `${REASON_TEXT[reason]}. 그래서 ${disc(win.discipline)} 쪽을 따릅니다.`,
      dominant: win.discipline,
      whyOtherDidNotDominate: `${discNominative(lose.discipline)} 본 ${lose.sub.evidence?.[0]?.fact ?? lose.sub.counterEvidence?.[0]?.fact ?? '신호'}도 사실이지만, ${REASON_TEXT[reason]}.`,
    },
  };
}

export function judgeCross(input: CrossJudgeInput): CrossDivinationVerdict {
  const all = input.judgments;
  const applicable = all.filter((j) => j.applicable);
  if (applicable.length === 0) return insufficient(input, all, true);

  // Flatten every discipline's SUB-JUDGMENTS into per-axis claims. This is what makes decomposition work on
  // the REAL path — previously all three judges reported one identical domain.
  const claims: Claim[] = [];
  for (const j of applicable) {
    const subs: DomainSubJudgment[] = j.domainSubJudgments.length
      ? j.domainSubJudgments
      : [{
          domain: j.questionDomain, stance: j.stance, conclusion: j.dominantConclusion,
          temporalScope: j.temporalScope, directness: j.questionDirectness, reliability: j.dataReliability,
          evidence: j.directEvidence, counterEvidence: j.counterEvidence,
        }];
    for (const sub of subs) claims.push({ discipline: j.discipline, sub, parent: j, strength: claimStrength(sub) });
  }

  const axes = [...new Set(claims.map((c) => c.sub.domain))];
  const resolutions: AxisResolution[] = axes
    .map((axis) => resolveAxis(axis, claims.filter((c) => c.sub.domain === axis)))
    .filter((r): r is AxisResolution => r !== null);

  // §6/§7 — one proposition per resolved axis, each declaring how it was derived.
  const propositions: DivinationProposition[] = resolutions.map((r) =>
    propositionFor(r, claims.filter((c) => c.sub.domain === r.domain)));

  // Everything was computed, but nothing carries a direction → say so (§12: no forced decision).
  if (resolutions.length === 0) return insufficient(input, all, false);

  // ── §9 ASKED-AXIS STRICTNESS — no unrelated-axis fallback, ever ─────────────────────────────────
  // V2 headlined whatever axis happened to be best-supported when the asked one had no evidence, so a
  // 건강 question could be answered with a CAREER verdict and "돈이 들어올까?" could headline MONEY_RETENTION.
  // The asked axis either answers, or we declare insufficiency on the asked axis — never a substitute.
  const primary = resolutions.find((r) => r.domain === input.questionDomain) ?? null;
  if (!primary || primary.stance === 'INSUFFICIENT_EVIDENCE') {
    const askedInsufficient = insufficient(input, all, false);
    // §27 — the losing/standoff evidence must survive even when we decline to pick a direction.
    const askedResolutions = resolutions
      .filter((r) => r.domain === input.questionDomain)
      .map((r) => r.resolution)
      .filter((r): r is ContradictionResolution => r !== null);
    const standoff = primary?.stance === 'INSUFFICIENT_EVIDENCE' && askedResolutions.length > 0;

    // §9/§13 — "we looked and found nothing" and "we have no way to look here" are DIFFERENT failures, and
    // conflating them hides an engine gap behind an honest-sounding sentence. A discipline that produced no
    // claim on the asked axis at all never examined it; say which, so the gap is visible instead of implied.
    const examined = new Set(claims.filter((c) => c.sub.domain === input.questionDomain).map((c) => c.discipline));
    const didNotExamine = applicable.map((j) => j.discipline).filter((d) => !examined.has(d));
    const coverageNote = didNotExamine.length > 0
      ? ` (${didNotExamine.map(disc).join('·')}에는 이 축을 직접 보는 자리가 없어, 이 질문은 나머지 근거만으로 판단했습니다.)`
      : '';

    return {
      ...askedInsufficient,
      primaryConclusion: standoff
        ? `${axisLabel(input.questionDomain)}에 대해서는 반대되는 근거의 무게가 같아, 어느 쪽으로도 방향을 정하지 않습니다.`
        : `${axisLabel(input.questionDomain)}에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 다른 부분의 신호로 대신 답하지는 않겠습니다.${coverageNote}`,
      confidenceReason: didNotExamine.length > 0
        ? `${didNotExamine.map(disc).join('·')}에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).`
        : askedInsufficient.confidenceReason,
      contradictionPoints: askedResolutions.map((r) => r.conflict),
      contradictionResolutions: askedResolutions,
      // The other axes DID produce readings — surface them as context, never as the answer.
      axisVerdicts: resolutions.map((r) => ({
        domain: r.domain, stance: r.stance, conclusion: r.conclusion,
        dominantDiscipline: r.winner.discipline, contested: r.contested,
      })),
      propositions,
    };
  }

  const contradictionResolutions = resolutions
    .map((r) => r.resolution)
    .filter((r): r is ContradictionResolution => r !== null);

  // COMPOUND TRUTH — name the axes that genuinely diverge from the headline (§13).
  const compound: string[] = [];
  for (const frame of COMPOUND_FRAME) {
    const a = resolutions.find((r) => r.domain === frame.a);
    const b = resolutions.find((r) => r.domain === frame.b);
    if (!a || !b) continue;
    const va = stanceValence(a.stance);
    const vb = stanceValence(b.stance);
    if (va !== 'NONE' && vb !== 'NONE' && va !== vb) {
      compound.push(frame.frame);
      if (!contradictionResolutions.some((r) => r.kind === frame.kind)) {
        contradictionResolutions.push({
          kind: frame.kind,
          between: [a.winner.discipline, b.winner.discipline],
          conflict: `${axisLabel(frame.a)}과 ${axisLabel(frame.b)}이 서로 다르게 나옵니다.`,
          resolution: `${frame.frame} 서로 다른 축이라 둘 다 사실입니다.`,
          dominant: (a.domain === input.questionDomain ? a : b).winner.discipline,
          whyOtherDidNotDominate: '질문의 축과 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.',
        });
      }
    }
  }

  // ── §8 INTENT SHAPE — a description is not a recommendation, a cause is not a verdict ────────────
  // V2 answered "제 성격이 어떤가요?" with an action-like negative and turned "왜 자꾸 부딪히나요?" into a
  // timing stance. For those intents the same structural findings are reported as a STRUCTURE/CAUSE reading
  // instead of being bent into FOR/AGAINST.
  const intent = input.questionIntent ?? 'OUTCOME';
  const isNonDecision = NON_DECISION_INTENTS.includes(intent);
  const structuralSummary = () => {
    const named = resolutions
      .filter((r) => r.stance !== 'INSUFFICIENT_EVIDENCE')
      .map((r) => `${axisLabel(r.domain)}: ${r.conclusion}`);
    return named.length ? named.join(' ') : primary.conclusion;
  };

  const primaryConclusion = isNonDecision
    ? intent === 'CAUSE_WHY'
      ? `부딪히는 지점은 이렇게 봅니다. ${structuralSummary()}`
      : `구조는 이렇게 봅니다. ${structuralSummary()}`
    : compound.length
      ? `${primary.conclusion} 다만 ${compound[0]}`
      : primary.conclusion;

  const agreementPoints: string[] = [];
  for (const r of resolutions) {
    const disciplines = [...new Set(claims.filter((c) => c.sub.domain === r.domain && c.strength !== 'NONE').map((c) => c.discipline))];
    if (!r.contested && disciplines.length > 1) {
      const last = disc(disciplines[disciplines.length - 1]);
      agreementPoints.push(`${disciplines.map(disc).join('·')}${hasFinalConsonant(last) ? '이' : '가'} ${axisLabel(r.domain)}에서 같은 방향을 가리킵니다.`);
    }
  }

  const timingAxis = resolutions.find((r) => r.domain === 'TIMING');
  const timingConclusion =
    timingAxis?.conclusion ??
    (primary.stance === 'FOR_BUT_LATER'
      ? '지금보다 흐름이 풀린 뒤가 낫습니다.'
      : primary.stance === 'AGAINST_FOR_NOW'
        ? '지금 시점은 아닙니다.'
        : null);

  // ── contributions: every applied discipline declares its role (§24) ──────────────────────────────
  const dominantDiscipline = primary.winner.discipline;
  const contributions: DisciplineContribution[] = all.map((j) => {
    if (!j.applicable) {
      return { discipline: j.discipline, applied: false, stance: j.stance, contribution: j.applicabilityReason ?? '이 질문에는 적용하지 않았습니다.' };
    }
    const speaking = claims.filter((c) => c.discipline === j.discipline && c.strength !== 'NONE');
    if (speaking.length === 0) {
      return {
        discipline: j.discipline, applied: true, stance: j.stance,
        contribution: '계산은 됐지만 방향을 정할 만한 신호가 없어, 이 결론에 근거를 대지 못했습니다.',
        whyItDidNotDominate: '신호가 없는 상태는 찬성도 반대도 아닙니다.',
      };
    }
    const own = resolutions.filter((r) => r.winner.discipline === j.discipline);
    const isDominant = j.discipline === dominantDiscipline;
    return {
      discipline: j.discipline, applied: true, stance: j.stance,
      contribution: isDominant
        ? `이번 결론의 중심 근거입니다 — ${primary.winner.sub.evidence?.[0]?.fact ?? primary.winner.sub.counterEvidence?.[0]?.fact ?? j.dominantFactor}.`
        : own.length
          ? `${own.map((r) => axisLabel(r.domain)).join('·')} 축을 맡았습니다.`
          : `${j.dominantFactor}로 결론을 보강합니다.`,
      ...(isDominant
        ? {}
        : {
            whyItDidNotDominate:
              contradictionResolutions.find((r) => r.between.includes(j.discipline))?.whyOtherDidNotDominate ??
              '같은 방향이라 결론을 바꾸지는 않고 근거를 더합니다.',
          }),
    };
  });

  const favorableFactors: JudgmentEvidence[] = resolutions
    .filter((r) => stanceValence(r.stance) === 'FOR')
    .flatMap((r) => r.winner.sub.evidence ?? []);
  const riskFactors: JudgmentEvidence[] = resolutions.flatMap((r) => r.winner.sub.counterEvidence ?? []);

  const confidence: JudgmentConfidence =
    primary.winner.strength === 'STRONG' && primary.winner.sub.directness === 'DIRECT'
      ? 'HIGH'
      : isSupported(primary.winner.strength)
        ? 'MEDIUM'
        : 'LOW';

  const evidenceReferences = [
    ...applicable.map((j) => ({
      discipline: j.discipline,
      lines: [
        j.dominantConclusion,
        ...j.directEvidence.map((e) => `${e.fact} — ${e.meaning}`),
        ...j.counterEvidence.map((e) => `${e.fact} — ${e.meaning}`),
      ],
    })),
    ...(contradictionResolutions.length
      ? [{ discipline: 'CROSS' as const, lines: contradictionResolutions.map((r) => `${r.conflict} → ${r.resolution} (${r.whyOtherDidNotDominate})`) }]
      : agreementPoints.length
        ? [{ discipline: 'CROSS' as const, lines: agreementPoints }]
        : []),
  ];

  return {
    question: input.question,
    questionDomain: input.questionDomain,
    primaryConclusion,
    direction: primary.stance,
    dominantBasis: `${disc(dominantDiscipline)} · ${primary.winner.sub.evidence?.[0]?.fact ?? primary.winner.sub.counterEvidence?.[0]?.fact ?? primary.winner.parent.dominantFactor}`,
    disciplineJudgments: all,
    contributions,
    axisVerdicts: resolutions.map((r) => ({
      domain: r.domain, stance: r.stance, conclusion: r.conclusion,
      dominantDiscipline: r.winner.discipline, contested: r.contested,
    })),
    propositions,
    agreementPoints,
    contradictionPoints: contradictionResolutions.map((r) => r.conflict),
    contradictionResolutions,
    natalBaseline: input.natalBaseline ?? null,
    currentFlow: input.currentFlow ?? null,
    timingConclusion,
    favorableFactors,
    riskFactors,
    actionableInterpretation: buildActionable(primary.stance),
    confidence,
    confidenceReason: contradictionResolutions.length
      ? '학문 사이의 차이를 근거의 직접성과 축·시점 기준으로 정리했습니다.'
      : resolutions.length > 1
        ? '여러 축의 신호가 같은 방향으로 모입니다.'
        : '한 축의 근거로 판단했습니다.',
    evidenceReferences,
    verdictVersion: DIVINATION_VERDICT_VERSION,
  };
}

function buildActionable(direction: Stance): string {
  switch (direction) {
    case 'STRONGLY_FOR': return '망설이기보다 지금 잡고 가는 쪽으로 움직이시면 됩니다.';
    case 'FOR': return '방향은 맞으니, 준비된 것부터 실제로 진행하십시오.';
    case 'CONDITIONAL_FOR': return '조건을 하나 정리한 뒤 진행하시면 무리가 없습니다.';
    case 'FOR_BUT_LATER': return '지금은 준비만 해두고, 흐름이 풀리는 구간에 실행하십시오.';
    case 'AGAINST_FOR_NOW': return '지금 벌이기보다 이미 가진 것을 정리하며 시점을 넘기십시오.';
    case 'CONDITIONAL_AGAINST': return '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.';
    case 'AGAINST': return '이번 건은 접고, 다음 흐름을 기다리는 쪽이 낫습니다.';
    case 'STRONGLY_AGAINST': return '지금 밀어붙이지 마십시오. 손을 떼는 것이 이득입니다.';
    case 'INSUFFICIENT_EVIDENCE': return '지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.';
    default: return '확인되는 근거가 늘면 다시 봐 드리겠습니다.';
  }
}
