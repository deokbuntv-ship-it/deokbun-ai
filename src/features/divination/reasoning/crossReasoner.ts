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
import { agreedHeadline, axisLabel as sharedAxisLabel, unresolvedHeadline } from '../axisOntology';
import { adaptJudgment } from './disciplineAdapter';
import { deriveCross, SUBORDINATION_TEXT, type CrossDerivation } from './crossRules';
import {
  resolveAnswer, screenAll, standingPropositions,
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

const axisLabel = (d: JudgmentDomain) => sharedAxisLabel(d, '전반');

/** How immediate a layer is. A fixed property of the layers — never of the order they were emitted in. */
const SCOPE_NARROWNESS: Record<string, number> = {
  PRESENT_MOMENT: 0, WOLWOON: 1, SEWOON: 2, DAEWOON: 3, NATAL: 4, UNSCOPED: 5,
};

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
  /**
   * V4C §6 — the migrated discipline's FULL proposition graph, ancestry included.
   *
   * `propositions` carries only that discipline's STANDING leaves, which is what cross should pair over: a
   * superseded reading is not an independent claim for another discipline to agree or disagree with. But a
   * derived conclusion now declares the primitive readings it was built from, and the persisted graph must be
   * CLOSED under that relation or a restored verdict has dangling derivation links and fails integrity. The
   * ancestry therefore rides along for storage and for WHY traversal — never into the pairing loop, and never
   * into the standing set the answer is read from.
   */
  propositionGraph?: ReasonedProposition[];
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

/**
 * PROJECTION — semantic conclusion → legacy stance enum.
 *
 * V4B §11: the firmness of a claim is read from the premises that SUPPORT THAT CLAIM, whatever its real-world
 * valence. V4A read `counterAdequacy` for an UNFAVORABLE conclusion — i.e. it judged how firmly to say "안
 * 됩니다" from the material ARGUING AGAINST that very conclusion. The sides are about the proposition, not
 * about whether the news is good.
 */
function stanceOf(p: ReasonedProposition): Stance {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') return 'STRUCTURAL_ANSWER';
  switch (p.direction) {
    case 'FAVORABLE': return p.adequacy.supportAdequacy === 'ADEQUATE' ? 'FOR' : 'CONDITIONAL_FOR';
    case 'UNFAVORABLE': return p.adequacy.supportAdequacy === 'ADEQUATE' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    case 'RESTRICTED': return p.restriction === 'TIMING' ? 'FOR_BUT_LATER' : 'CONDITIONAL_AGAINST';
    default: return NO_SIGNAL;
  }
}

/**
 * The stance an AGREED set actually supports.
 *
 * When every member projects to the SAME stance, that stance IS the answer — softening it would understate a
 * unanimous reading. When they share a direction but differ in firmness (FOR beside CONDITIONAL_FOR), the
 * verdict asserts only the weaker claim, because that is the most all of them back. Neither branch picks a
 * member: the first reads a unanimous value, the second falls back to what the shared direction alone licenses.
 */
const agreedStance = (
  members: ReasonedProposition[], shared: ReasonedProposition['direction'],
): Stance => {
  const stances = new Set(members.map(stanceOf));
  if (stances.size === 1) return [...stances][0];
  return shared === 'FAVORABLE' ? 'CONDITIONAL_FOR'
    : shared === 'UNFAVORABLE' || shared === 'RESTRICTED' ? 'CONDITIONAL_AGAINST' : NO_SIGNAL;
};

const evidenceFrom = (
  premises: Map<string, DivinationPremise>, ids: string[], axis: JudgmentDomain,
): JudgmentEvidence[] =>
  ids.map((id) => premises.get(id)).filter((p): p is DivinationPremise => !!p).map((p) => ({
    fact: p.sourceFactIds[0] ?? p.target.label,
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
  const derivations = deriveCross(propositions, premises, { ...ctx, asksTiming: input.asksTiming });
  const reasoned = [...propositions, ...derivations.map((d) => d.proposition)];
  const standing = standingPropositions(reasoned);
  // Ancestry is persisted but never reasoned over again — see `propositionGraph`.
  const ancestry = (input.propositionGraph ?? []).filter((p) => !reasoned.some((r) => r.id === p.id));
  const all = [...reasoned, ...ancestry];
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
  // V4C §7 — NO FIRST-MATCH SELECTION.
  //
  // V4B chained `.find()` calls — a causal hit, else a chart description, else any CROSS conclusion, else any
  // agreeing one — and took whichever matched first. That is arbitration by array order: two equally standing
  // cross conclusions produced a headline decided by iteration, and the loser was never mentioned. The
  // candidate set is stated explicitly and resolved AS A SET; `resolveAnswer` awards the answer only to a
  // conclusion that ACCOUNTS FOR the others through the derivation graph — which a CROSS conclusion does, by
  // construction, for the pieces it reconciles.
  //
  // §12 HARD GATE is preserved: a descriptive or causal question draws only from STRUCTURAL/CAUSAL candidates
  // and otherwise answers honestly — never falling through to FOR/AGAINST.
  const candidates = nonDecision
    ? standing.filter((p) => onAskedAxis(p)
      && ((intent === 'CAUSE_WHY' && p.conclusionType === 'CAUSAL') || describesChart(p)))
    : onAsked.filter((p) => p.direction !== 'NONE');
  const resolution = resolveAnswer(candidates);
  const primary = resolution.kind === 'SINGLE' ? resolution.primary : null;

  const standoffs = derivations.filter((d) => d.standoff && d.proposition.questionAxis === asked);
  const examined = new Set(propositions.filter((p) => p.questionAxis === asked).map((p) => p.discipline));
  const blind = applicable.map((j) => j.discipline).filter((d) => !examined.has(d));

  // ── 4. PROJECT to the verdict shape ─────────────────────────────────────────────────────────────
  /** Disciplines that fed one derivation — used to name who disagreed, including in a standoff. */
  const contributingTo = (d: CrossDerivation): Discipline[] => [
    // §28 — sorted. This list names WHO disagreed, and for a standoff it also supplies the reported
    // "dominant" discipline; leaving it in graph order made a user-visible attribution depend on iteration.
    ...new Set(d.proposition.derivedFromPropositionIds
      .map((id) => all.find((p) => p.id === id)?.discipline)
      .filter((x): x is Discipline => !!x && x !== 'CROSS')),
  ].sort();

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
        // §14 — the honest reason, stated as such. Not "they cancelled out"; the relationship did not settle it.
        ? '어느 쪽이 더 직접적이라고 볼 구조적 근거가 없어, 억지로 승자를 만들지 않았습니다.'
        : d.subordinationReasons?.length
          // EVERY applicable reason is reported, not just the first one a ladder happened to hit.
          ? `${d.subordinationReasons.map((r) => SUBORDINATION_TEXT[r]).join('; ')} (밀려난 쪽: ${d.counter ? disc(d.counter.discipline as Discipline) : '반대 근거'})`
          : '서로 다른 축이라 결론을 뒤집지 않고 조건으로 붙습니다.',
    }));

  // An AGREED set shares a direction without any one conclusion owning it, so the verdict states the direction
  // CONDITIONALLY — it is a real answer, but not one a single reading is accountable for.
  const direction: Stance = primary
    ? stanceOf(primary)
    : resolution.kind === 'AGREED' ? agreedStance(resolution.members, resolution.direction) : NO_SIGNAL;
  const coverageNote = !primary && blind.length > 0
    ? ` (${blind.map(disc).join('·')}에는 이 축을 직접 보는 자리가 없습니다.)`
    : '';
  const primaryConclusion = primary
    ? primary.assertion
    // §7 — several conclusions stand and all point the same way: the direction is answerable, but no single
    // conclusion owns it, so every one is stated instead of the first being promoted.
    : resolution.kind === 'AGREED'
      ? agreedHeadline(asked, resolution.direction, resolution.members.length)
      : resolution.kind === 'UNRESOLVED'
        // The members are already reported as axis verdicts and as contradiction points; concatenating their
        // assertions here would make the engine's internal wording the professional answer.
        ? unresolvedHeadline(asked)
        : nonDecision
          ? '지금 확인할 수 있는 구조만으로는 이 부분을 설명해 드리기 어렵습니다. 없는 이야기를 지어내지는 않겠습니다.'
          : standoffs.length > 0
            // §28 — EVERY unresolved standoff is stated. Taking `standoffs[0]` meant the user was shown one
            // of them and never told the others existed, chosen by array position.
            ? standoffs
              .map((d) => d.proposition)
              .sort((x, y) => x.target.key.localeCompare(y.target.key))
              .map((p) => p.assertion)
              .join(' ')
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
      // §28 — sorted on content, so the same graph always reports the same contribution line.
      contribution: [...mine].sort((x, y) => x.assertion.localeCompare(y.assertion))[0].assertion,
      ...(feeding ? {} : { whyItDidNotDominate: '물어보신 축을 직접 짚는 근거가 아니어서 결론을 이끌지는 않았습니다.' }),
    };
  });

  const favorableFactors = standing
    .filter((p) => p.direction === 'FAVORABLE')
    .flatMap((p) => evidenceFrom(byId, p.supportingPremiseIds, p.questionAxis));
  const riskFactors = standing
    .flatMap((p) => evidenceFrom(byId, p.opposingPremiseIds, p.questionAxis));

  // V4C §28 — NOT A FIRST MATCH. `timingConclusion` is user-visible, and §21 now derives one timing claim per
  // near layer, so `standing.find(...)` would have reported whichever layer the array yielded first and
  // silently dropped the other. Every timing claim is reported, ordered by the LAYERS themselves (narrowest
  // first) and tie-broken on content — never by array position.
  const timingProps = standing
    .filter((p) => p.restriction === 'TIMING')
    .sort((a, b) => (SCOPE_NARROWNESS[a.temporalScope] - SCOPE_NARROWNESS[b.temporalScope])
      || a.assertion.localeCompare(b.assertion));
  const confidence: JudgmentConfidence = !primary
    ? 'LOW'
    : primary.adequacy.dataCompleteness === 'COMPLETE'
      && primary.adequacy.supportAdequacy === 'ADEQUATE'
      && primary.derivationRule !== 'PRIMITIVE'
      ? 'HIGH'
      : primary.derivationRule === 'PRIMITIVE' ? 'LOW' : 'MEDIUM';

  const verdict: CrossDivinationVerdict = {
    question: input.question,
    questionDomain: asked,
    questionIntent: intent,
    evaluatedAtEpochSeconds: input.evaluatedAtEpochSeconds ?? null,
    asksTiming: input.asksTiming,
    premises,
    primaryConclusion,
    // The conclusions the headline actually stands on: one when the set settled, all of them when it did not.
    headlinePropositionIds: primary ? [primary.id] : resolution.members.map((p) => p.id),
    direction,
    dominantBasis: primary
      ? `${primary.derivationRule === 'PRIMITIVE' ? '단일 근거' : primary.derivationRule} · ${primary.target.label}`
      : resolution.kind === 'AGREED' ? `같은 방향으로 함께 서는 결론 ${resolution.members.length}건`
        : resolution.kind === 'UNRESOLVED' ? `서로 다른 방향으로 함께 서는 결론 ${resolution.members.length}건 (미확정)`
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
    timingConclusion: timingProps.length > 0 && (input.asksTiming || direction === 'FOR_BUT_LATER')
      ? timingProps.map((p) => p.assertion).join(' ')
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
  return screenAll(r.propositions, r.premises);
}

export { isDirectional };
