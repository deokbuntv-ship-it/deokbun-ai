// DIVINATION_ENGINE_V1 — CROSS DIVINATION JUDGE (§9–§14). THE CORE OF THE SPRINT.
//
// THE ONE RULE: CONTRADICTION ≠ NEUTRAL. When the disciplines disagree, this judge RESOLVES the
// disagreement; it never averages it away. "명리는 좋고 자미는 나쁘니 반반입니다" is not an output this module
// can produce — `MIXED` is not in the Stance union at all.
//
// RESOLUTION ORDER (§10). Each step tries to DISSOLVE the apparent conflict before any step tries to win it:
//   1. DOMAIN            (§10-C/E/F/G) — 돈이 들어오는 것 vs 남는 것, 인연 vs 결혼생활, 기회 vs 결과.
//                                        Opposite-looking judgments about DIFFERENT axes are BOTH true.
//   2. TEMPORAL          (§10-D/H)     — 방향은 맞고 시점이 아니다 → FOR_BUT_LATER / AGAINST_FOR_NOW.
//   3. DIRECTNESS        (§10-B)       — question-specific evidence outranks a generic signal.
//   4. RELIABILITY       (§10-A)       — an exact-input judgment outranks a degraded-input one.
//   5. FORCED CHOICE                   — confidence + directness. Still a DIRECTION, never a shrug.
//
// EXPLICITLY NOT DONE:
//   · No majority voting (§12) — three vague positives never out-vote one direct negative; count is not used.
//   · No numeric theory scores (§13) — ordering is qualitative and named, never "명리 +3 / 자미 −2".
//   · Qimen is never an automatic tie-breaker (§7/§12) — its PRESENT_MOMENT authority is applied to the
//     timing component, and a non-timing question cannot be decided by it.
//   · INSUFFICIENT_DATA only when NO discipline could speak (§14) — disagreement is never an escape hatch.
import {
  DIVINATION_VERDICT_VERSION,
  isDirectional,
  stanceValence,
  type ContradictionResolution,
  type CrossDivinationVerdict,
  type Discipline,
  type DisciplineContribution,
  type DivinationJudgment,
  type JudgmentConfidence,
  type JudgmentDomain,
  type JudgmentEvidence,
  type Stance,
} from './contracts';

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MYUNGRI: '명리',
  ZIWEI: '자미두수',
  QIMEN: '기문둔갑',
};

// These labels land in USER-VISIBLE evidence lines, so the Korean particle must agree with the preceding
// syllable's final consonant (받침). "명리이/자미두수과" reads as broken Korean to a paying user.
const hasFinalConsonant = (word: string): boolean => {
  const ch = word.charCodeAt(word.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) return false; // non-Hangul → treat as open syllable
  return (ch - 0xac00) % 28 !== 0;
};
/** 은/는 · 이/가 · 과/와 · 을/를 chosen by 받침. */
function withParticle(word: string, pair: '은는' | '이가' | '과와' | '을를'): string {
  const closed = hasFinalConsonant(word);
  const table: Record<typeof pair, [string, string]> = {
    은는: ['은', '는'], 이가: ['이', '가'], 과와: ['과', '와'], 을를: ['을', '를'],
  } as Record<typeof pair, [string, string]>;
  const [withBatchim, withoutBatchim] = table[pair];
  return `${word}${closed ? withBatchim : withoutBatchim}`;
}
const disc = (d: Discipline) => DISCIPLINE_LABEL[d];
const discSubject = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '은는');
const discNominative = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '이가');
const discAnd = (d: Discipline) => withParticle(DISCIPLINE_LABEL[d], '과와');

// Domain pairs that look opposite but describe DIFFERENT axes (§10-C/E/F/G).
const DECOMPOSABLE: { a: JudgmentDomain; b: JudgmentDomain; kind: ContradictionResolution['kind']; frame: string }[] = [
  { a: 'MONEY_INFLOW', b: 'MONEY_RETENTION', kind: 'INFLOW_VS_RETENTION', frame: '돈이 들어오는 것과 남는 것은 다르게 봅니다.' },
  { a: 'RELATION_BOND', b: 'RELATION_STABILITY', kind: 'BOND_VS_STABILITY', frame: '끌리는 힘과 같이 사는 난도는 다르게 봅니다.' },
  { a: 'OPPORTUNITY', b: 'OUTCOME', kind: 'OPPORTUNITY_VS_OUTCOME', frame: '기회가 오는 것과 그것을 잡아서 남는 것은 다르게 봅니다.' },
  { a: 'CAREER', b: 'MONEY_RETENTION', kind: 'DIFFERENT_DOMAIN', frame: '자리가 열리는 것과 실속이 남는 것은 다르게 봅니다.' },
  { a: 'MOVEMENT', b: 'OUTCOME', kind: 'DIFFERENT_DOMAIN', frame: '움직임이 생기는 것과 그 결과가 좋은 것은 다르게 봅니다.' },
];

const NEAR_SCOPES = new Set(['PRESENT_MOMENT', 'WOLWOON', 'SEWOON']);
const STRUCTURAL_SCOPES = new Set(['NATAL', 'DAEWOON']);

const RELIABILITY_RANK = { EXACT: 3, REDUCED: 2, MINIMAL: 1, UNUSABLE: 0 } as const;
const DIRECTNESS_RANK = { DIRECT: 3, ADJACENT: 2, GENERAL: 1 } as const;
const CONFIDENCE_RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

export type CrossJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  judgments: DivinationJudgment[];
  /** true when the user asked about acting now / a specific period. */
  asksTiming: boolean;
  natalBaseline?: string | null;
  currentFlow?: string | null;
};

/** Pick the stronger of two judgments on a named axis, or null when they tie on it. */
function strongerBy(
  a: DivinationJudgment,
  b: DivinationJudgment,
  axis: 'directness' | 'reliability' | 'confidence',
): DivinationJudgment | null {
  const rank = (j: DivinationJudgment) =>
    axis === 'directness'
      ? DIRECTNESS_RANK[j.questionDirectness]
      : axis === 'reliability'
        ? RELIABILITY_RANK[j.dataReliability]
        : CONFIDENCE_RANK[j.confidence];
  const ra = rank(a);
  const rb = rank(b);
  if (ra === rb) return null;
  return ra > rb ? a : b;
}

/** The verdict direction when a structural side and a timing side disagree (§10-D/H). */
function timedDirection(structuralFor: boolean): Stance {
  return structuralFor ? 'FOR_BUT_LATER' : 'AGAINST_FOR_NOW';
}

function insufficient(input: CrossJudgeInput, judgments: DivinationJudgment[]): CrossDivinationVerdict {
  return {
    question: input.question,
    questionDomain: input.questionDomain,
    primaryConclusion: '지금 확인할 수 있는 근거로는 이 질문에 방향을 잡아 드리기 어렵습니다.',
    direction: 'INSUFFICIENT_DATA',
    dominantBasis: '판단에 쓸 수 있는 근거 없음',
    disciplineJudgments: judgments,
    contributions: judgments.map((j) => ({
      discipline: j.discipline,
      applied: j.applicable,
      stance: j.stance,
      contribution: j.applicabilityReason ?? '이 질문에 답할 근거가 부족했습니다.',
    })),
    agreementPoints: [],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: input.natalBaseline ?? null,
    currentFlow: input.currentFlow ?? null,
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [],
    actionableInterpretation: '필요한 정보(예: 정확한 출생시간)가 확인되면 다시 봐 드릴 수 있습니다.',
    confidence: 'LOW',
    confidenceReason: '적용 가능한 학문이 없었습니다.',
    evidenceReferences: [],
    verdictVersion: DIVINATION_VERDICT_VERSION,
  };
}

/**
 * Fuse the independent judgments into ONE decisive verdict. Pure + deterministic; no LLM, no I/O.
 */
export function judgeCross(input: CrossJudgeInput): CrossDivinationVerdict {
  const all = input.judgments;
  const speaking = all.filter((j) => j.applicable && isDirectional(j.stance));

  // §14 — the ONLY allowed abstention: nothing could speak at all.
  if (speaking.length === 0) return insufficient(input, all);

  const forSide = speaking.filter((j) => stanceValence(j.stance) === 'FOR');
  const againstSide = speaking.filter((j) => stanceValence(j.stance) === 'AGAINST');

  const agreementPoints: string[] = [];
  const contradictionPoints: string[] = [];
  const resolutions: ContradictionResolution[] = [];

  let direction: Stance;
  let dominant: DivinationJudgment;
  let primaryConclusion: string;

  if (forSide.length === 0 || againstSide.length === 0) {
    // ── UNANIMOUS DIRECTION ────────────────────────────────────────────────────────────────────────
    const side = forSide.length > 0 ? forSide : againstSide;
    // The most question-specific, best-grounded judgment carries the verdict (not a count).
    dominant = [...side].sort(
      (a, b) =>
        DIRECTNESS_RANK[b.questionDirectness] - DIRECTNESS_RANK[a.questionDirectness] ||
        RELIABILITY_RANK[b.dataReliability] - RELIABILITY_RANK[a.dataReliability] ||
        CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence],
    )[0];
    direction = dominant.stance;
    if (side.length > 1) {
      agreementPoints.push(
        `${side.map((j) => DISCIPLINE_LABEL[j.discipline]).join("·")}${discNominative(side[side.length - 1].discipline).slice(-1)} 같은 방향을 가리킵니다.`,
      );
    }
    primaryConclusion = dominant.dominantConclusion;
  } else {
    // ── DISAGREEMENT → RESOLVE (never neutralize) ─────────────────────────────────────────────────
    const a = forSide[0];
    const b = againstSide[0];
    contradictionPoints.push(
      `${discSubject(a.discipline)} 되는 쪽, ${discSubject(b.discipline)} 아닌 쪽으로 봅니다.`,
    );

    // 1) DOMAIN — are they actually talking about different axes? Then BOTH are true (§10-C/E/F/G).
    //    STRICT: this requires the two sides to genuinely sit on DIFFERENT axes. When both judge the SAME
    //    axis they are really contradicting each other, and decomposing there would silently let an
    //    arbitrary side win — so same-domain conflicts fall through to the directness/reliability tests.
    const pair =
      a.questionDomain !== b.questionDomain
        ? DECOMPOSABLE.find(
            (d) =>
              (a.questionDomain === d.a && b.questionDomain === d.b) ||
              (a.questionDomain === d.b && b.questionDomain === d.a),
          )
        : undefined;
    // (A looser sub-judgment match was tried and removed: Myungri emits inflow/retention sub-judgments on
    // nearly every wealth chart, which made unrelated head-on conflicts look decomposable and let the wrong
    // side win. Decomposition must be driven by the axes the disciplines actually judged.)

    // 2) TEMPORAL — structural vs present-moment (§10-D/H).
    const structural = speaking.find((j) => STRUCTURAL_SCOPES.has(j.temporalScope));
    const near = speaking.find((j) => NEAR_SCOPES.has(j.temporalScope));
    const temporalSplit =
      structural && near && stanceValence(structural.stance) !== stanceValence(near.stance);

    if (pair) {
      const d = pair;
      // The verdict follows whichever side matches the ASKED domain; the other becomes the qualifier.
      const askedSide = [a, b].find((j) => j.questionDomain === input.questionDomain) ?? a;
      const otherSide = askedSide === a ? b : a;
      direction = askedSide.stance;
      dominant = askedSide;
      resolutions.push({
        kind: d.kind,
        between: [a.discipline, b.discipline],
        conflict: `${discAnd(a.discipline)} ${discNominative(b.discipline)} 반대로 보이는 지점이 있습니다.`,
        resolution: `${d.frame} 서로 다른 축을 말하고 있어 둘 다 사실입니다.`,
        dominant: askedSide.discipline,
        whyOtherDidNotDominate: `${discNominative(otherSide.discipline)} 짚은 부분은 질문의 축과 다른 축이라, 결론을 뒤집지는 않고 조건으로 붙습니다.`,
      });
      primaryConclusion = `${askedSide.dominantConclusion} 다만 ${d.frame}`;
    } else if (temporalSplit && structural && near) {
      const structuralFor = stanceValence(structural.stance) === 'FOR';
      direction = timedDirection(structuralFor);
      dominant = structural;
      resolutions.push({
        kind: near.temporalScope === 'PRESENT_MOMENT' ? 'ACTION_VS_TIMING' : 'DIFFERENT_TIMESCALE',
        between: [structural.discipline, near.discipline],
        conflict: `${discSubject(structural.discipline)} 방향을, ${discSubject(near.discipline)} 시점을 다르게 봅니다.`,
        resolution: structuralFor
          ? '가는 방향 자체는 맞지만, 지금 이 시점은 아닙니다.'
          : '지금 당장은 열려 있어도, 큰 방향이 받쳐주지 않습니다.',
        dominant: structural.discipline,
        whyOtherDidNotDominate: `${discSubject(near.discipline)} 지금 시점의 판이라, 방향 자체를 뒤집는 근거로는 쓰지 않습니다.`,
      });
      primaryConclusion = structuralFor
        ? '방향은 맞습니다. 다만 지금 시점은 아닙니다.'
        : '지금 움직일 여지는 있지만, 크게 가는 선택은 아닙니다.';
    } else {
      // 3) DIRECTNESS → 4) RELIABILITY → 5) forced choice. Always a direction (§35).
      const byDirect = strongerBy(a, b, 'directness');
      const byReliable = byDirect ? null : strongerBy(a, b, 'reliability');
      const byConfidence = byDirect || byReliable ? null : strongerBy(a, b, 'confidence');
      const winner = byDirect ?? byReliable ?? byConfidence ?? a;
      const loser = winner === a ? b : a;
      const kind = byDirect ? 'DIRECTNESS' : byReliable ? 'RELIABILITY' : 'DIRECTNESS';
      direction = winner.stance;
      dominant = winner;
      resolutions.push({
        kind,
        between: [a.discipline, b.discipline],
        conflict: `${discAnd(a.discipline)} ${discNominative(b.discipline)} 정면으로 다른 방향을 가리킵니다.`,
        resolution: byDirect
          ? `${disc(winner.discipline)}의 근거가 이 질문에 더 직접 닿아 있어 그쪽을 따릅니다.`
          : byReliable
            ? `${disc(winner.discipline)} 쪽 자료가 더 확실해 그쪽을 따릅니다.`
            : `${disc(winner.discipline)} 쪽 근거가 더 분명해 그쪽을 따릅니다.`,
        dominant: winner.discipline,
        whyOtherDidNotDominate: `${discNominative(loser.discipline)} 본 ${loser.dominantFactor}도 사실이지만, 이 질문에 대해서는 근거의 결이 한 단계 멀어 결론을 가져가지 못했습니다.`,
      });
      primaryConclusion = winner.dominantConclusion;
    }
  }

  // ── timing (only when a timing layer actually spoke) ───────────────────────────────────────────
  const timingJudgment = speaking.find((j) => j.timingSignals.length > 0 && NEAR_SCOPES.has(j.temporalScope));
  const timingConclusion =
    timingJudgment && input.asksTiming
      ? timingJudgment.domainSubJudgments.find((s) => s.domain === 'TIMING')?.conclusion ??
        timingJudgment.dominantConclusion
      : direction === 'FOR_BUT_LATER'
        ? '지금보다 흐름이 풀린 뒤가 낫습니다.'
        : direction === 'AGAINST_FOR_NOW'
          ? '지금 시점은 아닙니다.'
          : null;

  // ── contributions: EVERY applied discipline declares its role, or why it lost (§24) ────────────
  const contributions: DisciplineContribution[] = all.map((j) => {
    if (!j.applicable) {
      return {
        discipline: j.discipline,
        applied: false,
        stance: j.stance,
        contribution: j.applicabilityReason ?? '이 질문에는 적용하지 않았습니다.',
      };
    }
    const isDominant = j.discipline === dominant.discipline;
    return {
      discipline: j.discipline,
      applied: true,
      stance: j.stance,
      contribution: isDominant
        ? `이번 결론의 중심 근거입니다 — ${j.dominantFactor}.`
        : `${j.dominantFactor}로 결론을 보강합니다.`,
      ...(isDominant
        ? {}
        : {
            whyItDidNotDominate:
              resolutions.find((r) => r.between.includes(j.discipline))?.whyOtherDidNotDominate ??
              '같은 방향이라 결론을 바꾸지는 않고 근거를 더합니다.',
          }),
    };
  });

  const favorableFactors: JudgmentEvidence[] = speaking.flatMap((j) =>
    stanceValence(j.stance) === 'FOR' ? j.directEvidence : j.counterEvidence.length ? [] : j.directEvidence,
  );
  const riskFactors: JudgmentEvidence[] = speaking.flatMap((j) => j.counterEvidence);

  const confidence: JudgmentConfidence =
    resolutions.length === 0 && speaking.length >= 2
      ? 'HIGH'
      : dominant.confidence === 'HIGH' && dominant.questionDirectness === 'DIRECT'
        ? 'HIGH'
        : dominant.confidence === 'LOW'
          ? 'LOW'
          : 'MEDIUM';
  const confidenceReason =
    resolutions.length === 0
      ? speaking.length >= 2
        ? '적용된 학문이 같은 방향을 가리킵니다.'
        : '한 학문의 근거로 판단했습니다.'
      : `학문 사이의 차이를 ${resolutions[0].kind === 'DIRECTNESS' || resolutions[0].kind === 'RELIABILITY' ? '근거의 직접성' : '축과 시점'} 기준으로 정리했습니다.`;

  const evidenceReferences = [
    ...speaking.map((j) => ({
      discipline: j.discipline,
      lines: [
        j.dominantConclusion,
        ...j.directEvidence.map((e) => `${e.fact} — ${e.meaning}`),
        ...j.counterEvidence.map((e) => `${e.fact} — ${e.meaning}`),
      ],
    })),
    ...(resolutions.length
      ? [{
          discipline: 'CROSS' as const,
          lines: resolutions.map((r) => `${r.conflict} → ${r.resolution} (${r.whyOtherDidNotDominate})`),
        }]
      : agreementPoints.length
        ? [{ discipline: 'CROSS' as const, lines: agreementPoints }]
        : []),
  ];

  return {
    question: input.question,
    questionDomain: input.questionDomain,
    primaryConclusion,
    direction,
    dominantBasis: `${disc(dominant.discipline)} · ${dominant.dominantFactor}`,
    disciplineJudgments: all,
    contributions,
    agreementPoints,
    contradictionPoints,
    contradictionResolutions: resolutions,
    natalBaseline: input.natalBaseline ?? null,
    currentFlow: input.currentFlow ?? null,
    timingConclusion,
    favorableFactors,
    riskFactors,
    actionableInterpretation: buildActionable(direction),
    confidence,
    confidenceReason,
    evidenceReferences,
    verdictVersion: DIVINATION_VERDICT_VERSION,
  };
}

/** Practical direction DERIVED from the verdict — secondary to it, never a substitute (§1/§17). */
function buildActionable(direction: Stance): string {
  switch (direction) {
    case 'STRONGLY_FOR':
      return '망설이기보다 지금 잡고 가는 쪽으로 움직이시면 됩니다.';
    case 'FOR':
      return '방향은 맞으니, 준비된 것부터 실제로 진행하십시오.';
    case 'CONDITIONAL_FOR':
      return '조건을 하나 정리한 뒤 진행하시면 무리가 없습니다.';
    case 'FOR_BUT_LATER':
      return '지금은 준비만 해두고, 흐름이 풀리는 구간에 실행하십시오.';
    case 'AGAINST_FOR_NOW':
      return '지금 벌이기보다 이미 가진 것을 정리하며 시점을 넘기십시오.';
    case 'CONDITIONAL_AGAINST':
      return '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.';
    case 'AGAINST':
      return '이번 건은 접고, 다음 흐름을 기다리는 쪽이 낫습니다.';
    case 'STRONGLY_AGAINST':
      return '지금 밀어붙이지 마십시오. 손을 떼는 것이 이득입니다.';
    default:
      return '확인되는 근거가 늘면 다시 봐 드리겠습니다.';
  }
}
