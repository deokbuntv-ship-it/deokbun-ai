// V4A §16–§18/§21 — CROSS SYNTHESIS. Propositions in, verdict out. Never the reverse.
//
// The verdict is assembled LAST, from propositions that already exist. Nothing in this file picks a direction
// and then looks for propositions to justify it — `standingPropositions()` decides what survives, `project()`
// translates, and if you deleted `project()` the reasoning would be unchanged.
import {
  DIVINATION_VERDICT_VERSION, NO_SIGNAL, isDirectional,
  type ContradictionResolution, type ContradictionResolutionKind, type CrossDivinationVerdict,
  type Discipline, type DisciplineContribution, type DivinationJudgment, type JudgmentConfidence,
  type JudgmentDomain, type JudgmentEvidence, type QuestionIntent, type Stance,
} from '../contracts';
import { adaptJudgment } from './disciplineAdapter';
import { deriveCross, DOMINANCE_TEXT, type CrossDerivation } from './crossRules';
import {
  countRealSynthesis, standingPropositions,
  type DerivationContext, type DivinationPremise, type ReasonedProposition,
} from './kernel';

const DISCIPLINE_LABEL: Record<Discipline, string> = { MYUNGRI: '명리', ZIWEI: '자미두수', QIMEN: '기문둔갑' };
const disc = (d: Discipline) => DISCIPLINE_LABEL[d];
// User-visible Korean: the particle must agree with the preceding 받침.
const hasFinalConsonant = (w: string): boolean => {
  const ch = w.charCodeAt(w.length - 1);
  return ch >= 0xac00 && ch <= 0xd7a3 ? (ch - 0xac00) % 28 !== 0 : false;
};
const discSubject = (d: Discipline) => `${DISCIPLINE_LABEL[d]}${hasFinalConsonant(DISCIPLINE_LABEL[d]) ? '은' : '는'}`;

const AXIS_LABEL: Partial<Record<JudgmentDomain, string>> = {
  MONEY_INFLOW: '돈이 들어오는 쪽', MONEY_RETENTION: '돈이 남는 쪽', OPPORTUNITY: '기회가 오는 쪽',
  OUTCOME: '잡았을 때 남는 쪽', CAREER: '자리·직업', MOVEMENT: '이동', RELATION_BOND: '끌리는 힘',
  RELATION_STABILITY: '같이 사는 난도', CONFLICT: '부딪힘', INFLUENCE: '서로 미치는 영향',
  TIMING: '지금 시점', HEALTH_ENERGY: '몸·기운', DECISION: '결정', GENERAL: '전반',
};
const axisLabel = (d: JudgmentDomain) => AXIS_LABEL[d] ?? '전반';

const RESOLUTION_KIND: Record<string, ContradictionResolutionKind> = {
  CROSS_CONTRADICTION_RESOLVED: 'DIRECTNESS',
  CROSS_TIMING_SPLIT: 'DIFFERENT_TIMESCALE',
  CROSS_AXIS_COMPOUND: 'DIFFERENT_DOMAIN',
  // A standoff IS a resolution — the resolution is "we are not resolving this" — and it must be reported with
  // the same structure as any other so the reader sees both sides and why neither won.
  CROSS_STANDOFF: 'DIRECTNESS',
};

export type CrossReasonInput = {
  question: string;
  questionDomain: JudgmentDomain;
  questionIntent?: QuestionIntent;
  judgments: DivinationJudgment[];
  asksTiming: boolean;
  /** Server evaluation instant, preserved so a follow-up restores the same temporal frame (§21). */
  evaluatedAtEpochSeconds?: number | null;
  /** Premises/propositions from a discipline that IS on the graph (Myungri). */
  premises?: DivinationPremise[];
  propositions?: ReasonedProposition[];
  natalBaseline?: string | null;
  currentFlow?: string | null;
};

export type CrossReasoning = {
  premises: DivinationPremise[];
  propositions: ReasonedProposition[];
  standing: ReasonedProposition[];
  derivations: CrossDerivation[];
  verdict: CrossDivinationVerdict;
};

/** PROJECTION — semantic conclusion → legacy stance enum. Declared by the proposition, not looked up. */
function stanceOf(p: ReasonedProposition): Stance {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') return 'STRUCTURAL_ANSWER';
  switch (p.direction) {
    case 'FAVORABLE': return p.adequacy.supportAdequacy === 'ADEQUATE' ? 'FOR' : 'CONDITIONAL_FOR';
    case 'UNFAVORABLE': return p.adequacy.counterAdequacy === 'ADEQUATE' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    case 'RESTRICTED': return p.restriction === 'TIMING' ? 'FOR_BUT_LATER' : 'CONDITIONAL_AGAINST';
    default: return NO_SIGNAL;
  }
}

const evidenceFrom = (
  premises: Map<string, DivinationPremise>, ids: string[], axis: JudgmentDomain,
): JudgmentEvidence[] =>
  ids.map((id) => premises.get(id)).filter((p): p is DivinationPremise => !!p).map((p) => ({
    fact: p.sourceFactIds[0] ?? p.target,
    meaning: p.assertion,
    domain: axis,
    temporalScope: p.temporalScope,
    directness: p.applicability === 'DIRECT' ? 'DIRECT' : p.applicability === 'BACKGROUND' ? 'GENERAL' : 'ADJACENT',
  }));

export function reasonCross(input: CrossReasonInput): CrossReasoning {
  const asked = input.questionDomain;
  const intent = input.questionIntent ?? 'OUTCOME';
  const subject = input.propositions?.[0]?.subject ?? '본인';
  const applicable = input.judgments.filter((j) => j.applicable);
  const ctx: DerivationContext = {
    subject, questionIntent: intent, askedAxis: asked,
    dataComplete: applicable.every((j) => j.dataReliability === 'EXACT'),
  };

  // ── 1. Gather premises + propositions from every discipline ────────────────────────────────────
  const premises: DivinationPremise[] = [...(input.premises ?? [])];
  const propositions: ReasonedProposition[] = [...(input.propositions ?? [])];
  for (const j of applicable) {
    if (j.discipline === 'MYUNGRI' && input.propositions?.some((p) => p.discipline === 'MYUNGRI')) continue;
    const adapted = adaptJudgment(j, { subject, questionIntent: intent, askedAxis: asked });
    premises.push(...adapted.premises);
    propositions.push(...adapted.propositions);
  }

  // ── 2. Derive cross conclusions from RELATED PAIRS ──────────────────────────────────────────────
  const derivations = deriveCross(propositions, premises, ctx);
  const all = [...propositions, ...derivations.map((d) => d.proposition)];
  const standing = standingPropositions(all);
  const byId = new Map(premises.map((p) => [p.id, p]));

  // ── 3. Pick the answer FROM the graph, on the ASKED axis only (§13 — no unrelated-axis fallback) ─
  const onAsked = standing.filter((p) => p.questionAxis === asked);
  const nonDecision = intent === 'DESCRIPTIVE' || intent === 'CAUSE_WHY';
  // A CROSS_STANDOFF is an ABSTENTION ("we cannot settle this"), not a description of the chart. It shares the
  // STRUCTURAL conclusion type because it asserts no direction, so it must be excluded explicitly here —
  // otherwise "제 성격이 어떤가요?" gets answered with "정하지 않겠습니다", which answers nothing.
  const describesChart = (p: ReasonedProposition) =>
    p.conclusionType === 'STRUCTURAL' && p.derivationRule !== 'PRIMITIVE' && p.derivationRule !== 'CROSS_STANDOFF';
  // §13 applies to descriptions too. A 건강 question answered with a whole-chart profile is a SUBSTITUTE-AXIS
  // answer wearing a structural hat, so the structural/causal conclusion must be ON the asked axis. A question
  // whose asked axis genuinely IS the whole chart (성격/전반 → GENERAL) matches by that same rule, not by an
  // exception.
  // GENERAL is the ABSENCE of an axis constraint ("왜 자꾸 부딪히나" names no domain), not a substitute axis —
  // so a causal answer about whichever seat is actually recurring is the honest answer to it. A question that
  // DOES name an axis (건강, 이동, 재물) constrains normally.
  const onAskedAxis = (p: ReasonedProposition) => asked === 'GENERAL' || p.questionAxis === asked;
  const structural = nonDecision
    ? standing.find((p) => intent === 'CAUSE_WHY' && p.conclusionType === 'CAUSAL' && onAskedAxis(p))
      ?? standing.find((p) => describesChart(p) && onAskedAxis(p))
    : undefined;
  // A CROSS conclusion was derived FROM the pieces it reconciles, so it accounts for more than any of them.
  const crossOnAsked = onAsked.find((p) => p.discipline === 'CROSS' && p.direction !== 'NONE');
  const agreedDirections = new Set(onAsked.filter((p) => p.direction !== 'NONE').map((p) => p.direction));
  const agreed = agreedDirections.size === 1
    ? onAsked.find((p) => p.direction !== 'NONE')
    : undefined;
  // §12 HARD GATE. A descriptive or causal question may be answered by a STRUCTURAL/CAUSAL proposition or by
  // an honest "we cannot describe this" — never by falling through to FOR/AGAINST. Answering "제 성격이
  // 어떤가요?" with "크게 벌일 자리는 아닙니다" is the exact category error V2 shipped, and a fallthrough is
  // how it comes back.
  const primary = nonDecision ? (structural ?? null) : (crossOnAsked ?? agreed ?? null);

  const standoffs = derivations.filter((d) => d.standoff && d.proposition.questionAxis === asked);
  const examined = new Set(propositions.filter((p) => p.questionAxis === asked).map((p) => p.discipline));
  const blind = applicable.map((j) => j.discipline).filter((d) => !examined.has(d));

  // ── 4. PROJECT to the verdict shape ─────────────────────────────────────────────────────────────
  /** Disciplines that fed one derivation — used to name who disagreed, including in a standoff. */
  const contributingTo = (d: CrossDerivation): Discipline[] => [
    ...new Set(d.proposition.derivedFromPropositionIds
      .map((id) => all.find((p) => p.id === id)?.discipline)
      .filter((x): x is Discipline => !!x && x !== 'CROSS')),
  ];

  const resolutions: ContradictionResolution[] = derivations
    // The rule that fired declares its OWN decomposition kind (인연 vs 결혼생활, 유입 vs 보유, 행동 vs 시점);
    // the table is only the fallback for rules that have exactly one kind.
    .filter((d) => d.compoundKind || RESOLUTION_KIND[d.proposition.derivationRule])
    .map((d) => ({
      kind: d.compoundKind ?? RESOLUTION_KIND[d.proposition.derivationRule],
      between: d.dominant && d.counter
        ? [...new Set([d.dominant.discipline, d.counter.discipline]
          .filter((x): x is Discipline => x !== 'CROSS'))]
        : contributingTo(d),
      conflict: d.dominant && d.counter
        ? `${discSubject(d.dominant.discipline as Discipline)} "${d.dominant.assertion}", ${disc(d.counter.discipline as Discipline)}는 "${d.counter.assertion}"`
        : `${axisLabel(d.proposition.questionAxis)}에서 서로 다른 신호가 함께 잡힙니다.`,
      resolution: d.proposition.assertion,
      dominant: (d.dominant?.discipline === 'CROSS' ? 'MYUNGRI' : d.dominant?.discipline) as Discipline
        ?? (contributingTo(d)[0] ?? applicable[0]?.discipline ?? 'MYUNGRI'),
      whyOtherDidNotDominate: d.standoff
        // §17 — the honest reason, stated as such. Not "they cancelled out"; nothing distinguished them.
        ? '어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.'
        : d.dominanceReason
          ? `${DOMINANCE_TEXT[d.dominanceReason]} (밀려난 쪽: ${d.counter ? disc(d.counter.discipline as Discipline) : '반대 근거'})`
          : '서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.',
    }));

  const direction: Stance = primary ? stanceOf(primary) : NO_SIGNAL;
  const coverageNote = !primary && blind.length > 0
    ? ` (${blind.map(disc).join('·')}에는 이 축을 직접 보는 자리가 없습니다.)`
    : '';
  const primaryConclusion = primary
    ? primary.assertion
    : nonDecision
      ? '지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.'
    : standoffs.length > 0
      ? standoffs[0].proposition.assertion
      : `${axisLabel(asked)}에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다. 억지로 좋다·나쁘다를 말씀드리지 않겠습니다.${coverageNote}`;

  const contributions: DisciplineContribution[] = input.judgments.map((j) => {
    if (!j.applicable) {
      return { discipline: j.discipline, applied: false, stance: j.stance, contribution: j.applicabilityReason ?? '이 질문에는 적용하지 않았습니다.' };
    }
    const mine = standing.filter((p) => p.discipline === j.discipline);
    const feeding = primary
      ? [...primary.derivedFromPropositionIds, primary.id]
        .some((id) => all.find((p) => p.id === id)?.discipline === j.discipline)
      : false;
    if (mine.length === 0) {
      return {
        discipline: j.discipline, applied: true, stance: j.stance,
        contribution: '계산은 됐지만 근거로 세울 신호가 없어, 이 결론에 기여하지 않았습니다.',
        whyItDidNotDominate: '신호가 없는 상태는 찬성도 반대도 아닙니다.',
      };
    }
    return {
      discipline: j.discipline, applied: true, stance: j.stance,
      contribution: mine[0].assertion,
      ...(feeding ? {} : { whyItDidNotDominate: '물어보신 축을 직접 짚는 근거가 아니어서 결론을 이끌지는 않았습니다.' }),
    };
  });

  const favorableFactors = standing
    .filter((p) => p.direction === 'FAVORABLE')
    .flatMap((p) => evidenceFrom(byId, p.supportingPremiseIds, p.questionAxis));
  const riskFactors = standing
    .flatMap((p) => evidenceFrom(byId, p.opposingPremiseIds, p.questionAxis));

  const timingProp = standing.find((p) => p.restriction === 'TIMING');
  const confidence: JudgmentConfidence = !primary
    ? 'LOW'
    : primary.adequacy.dataCompleteness === 'COMPLETE'
      && (primary.adequacy.supportAdequacy === 'ADEQUATE' || primary.adequacy.counterAdequacy === 'ADEQUATE')
      && primary.derivationRule !== 'PRIMITIVE'
      ? 'HIGH'
      : primary.derivationRule === 'PRIMITIVE' ? 'LOW' : 'MEDIUM';

  const verdict: CrossDivinationVerdict = {
    question: input.question,
    questionDomain: asked,
    questionIntent: intent,
    evaluatedAtEpochSeconds: input.evaluatedAtEpochSeconds ?? null,
    premises,
    primaryConclusion,
    direction,
    dominantBasis: primary
      ? `${primary.derivationRule === 'PRIMITIVE' ? '단일 근거' : primary.derivationRule} · ${primary.target}`
      : standoffs.length > 0 ? '반대 근거가 대등하게 맞섬' : '해당 축 근거 없음',
    disciplineJudgments: input.judgments,
    contributions,
    axisVerdicts: standing
      .filter((p) => p.direction !== 'NONE' || p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL')
      .map((p) => ({
        domain: p.questionAxis,
        stance: stanceOf(p),
        conclusion: p.assertion,
        dominantDiscipline: (p.discipline === 'CROSS' ? 'MYUNGRI' : p.discipline) as Discipline,
        contested: p.discipline === 'CROSS',
      })),
    // THE WHOLE GRAPH, not just its leaves. A derived proposition cites the propositions it was built from, so
    // persisting only `standing` left those links dangling and a restored follow-up could not re-examine how a
    // conclusion was reached (§21/§22). Consumers that want just the leaves call `standingPropositions()`,
    // which is pure and therefore gives the same answer after a round trip.
    propositions: all,
    agreementPoints: derivations
      .filter((d) => d.proposition.derivationRule === 'CROSS_REINFORCEMENT')
      .map((d) => d.proposition.assertion),
    contradictionPoints: resolutions.map((r) => r.conflict),
    contradictionResolutions: resolutions,
    natalBaseline: input.natalBaseline ?? null,
    currentFlow: input.currentFlow ?? null,
    timingConclusion: timingProp && (input.asksTiming || direction === 'FOR_BUT_LATER')
      ? timingProp.assertion
      : null,
    favorableFactors,
    riskFactors,
    actionableInterpretation: !primary
      ? '지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.'
      : primary.conclusionType === 'STRUCTURAL' || primary.conclusionType === 'CAUSAL'
        ? '이 구조를 알고 계시는 것 자체가 다음 판단의 기준이 됩니다.'
        : primary.direction === 'FAVORABLE'
          ? '지금 흐름을 그대로 밀고 가셔도 됩니다.'
          : primary.restriction === 'TIMING'
            ? '방향은 유지하시되, 큰 실행은 흐름이 풀린 뒤로 미루십시오.'
            : '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.',
    confidence,
    confidenceReason: !primary
      ? blind.length > 0
        ? `${blind.map(disc).join('·')}에 이 축을 직접 보는 자리가 정의되어 있지 않습니다(엔진 커버리지 공백).`
        : '적용은 됐지만 방향을 정할 신호가 약합니다.'
      : primary.derivationRule === 'PRIMITIVE'
        ? '단일 근거에 기대고 있어 확신을 높게 두지 않습니다.'
        : `${primary.derivationRule} 규칙으로 여러 근거가 맞물려 도출되었습니다.`,
    evidenceReferences: [
      ...applicable.map((j) => ({
        discipline: j.discipline as Discipline | 'CROSS',
        lines: [j.dominantConclusion, ...j.directEvidence.map((e) => `${e.fact} — ${e.meaning}`)].filter(Boolean),
      })),
      ...(derivations.length
        ? [{ discipline: 'CROSS' as const, lines: derivations.map((d) => d.proposition.assertion) }]
        : []),
    ],
    verdictVersion: DIVINATION_VERDICT_VERSION,
  };

  return { premises, propositions: all, standing, derivations, verdict };
}

/** Synthesis census for the whole cross run — used by the QA pack and the §7 gate. */
export function crossSynthesisCensus(r: CrossReasoning) {
  return countRealSynthesis(r.propositions, r.premises);
}

export { isDirectional };
