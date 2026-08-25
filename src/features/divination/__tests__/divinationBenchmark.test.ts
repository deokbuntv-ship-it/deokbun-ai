// DIVINATION_ENGINE_V1 — PAID DIVINATION BENCHMARK (§28/§29).
//
// 20 scenarios across the paid surface + 6 head-on contradiction cases. The PASS bar is not "an answer was
// produced" — it is:
//   · a DIRECTIONAL verdict (terminal MIXED is impossible; INSUFFICIENT_DATA only when nothing could speak),
//   · contradictions RESOLVED (decomposed or won on a named axis), never flattened to "반반",
//   · the losing side acknowledged with a reason (§11),
//   · every applied discipline carrying a stated contribution (§24).
import {
  isDirectional,
  judgeCross,
  stanceValence,
  type DivinationJudgment,
  type JudgmentDomain,
  type Stance,
  type TemporalScope,
} from '@/features/divination';

// ── builders ─────────────────────────────────────────────────────────────────────────────────────
type J = Partial<DivinationJudgment> & { discipline: DivinationJudgment['discipline'] };
const mk = (j: J): DivinationJudgment => ({
  applicable: true,
  dataReliability: 'EXACT',
  questionDomain: 'GENERAL',
  temporalScope: 'NATAL',
  stance: 'FOR',
  dominantConclusion: '기본 결론',
  dominantFactor: '기본 근거',
  directEvidence: [{ fact: 'f', meaning: 'm', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'DIRECT' }],
  counterEvidence: [],
  internalContradictions: [],
  timingSignals: [],
  domainSubJudgments: [],
  confidence: 'MEDIUM',
  questionDirectness: 'DIRECT',
  ...j,
});

const myungri = (stance: Stance, domain: JudgmentDomain, over: J = { discipline: 'MYUNGRI' }) =>
  mk({ ...over, discipline: 'MYUNGRI', stance, questionDomain: domain, temporalScope: over.temporalScope ?? 'DAEWOON' });
const ziwei = (stance: Stance, domain: JudgmentDomain, over: J = { discipline: 'ZIWEI' }) =>
  mk({ ...over, discipline: 'ZIWEI', stance, questionDomain: domain, temporalScope: 'NATAL' });
const qimen = (stance: Stance, over: J = { discipline: 'QIMEN' }) =>
  mk({ ...over, discipline: 'QIMEN', stance, questionDomain: 'TIMING', temporalScope: 'PRESENT_MOMENT',
      timingSignals: [{ fact: '값사 死門', meaning: '지금은 막히는 문', domain: 'TIMING', temporalScope: 'PRESENT_MOMENT', directness: 'DIRECT' }],
      domainSubJudgments: [{ domain: 'TIMING', stance, conclusion: '지금 시점 판단' }] });
const notApplicable = (discipline: DivinationJudgment['discipline'], reason: string) =>
  mk({ discipline, applicable: false, stance: 'NOT_APPLICABLE', applicabilityReason: reason,
       directEvidence: [], confidence: 'LOW', questionDirectness: 'GENERAL' });

const run = (question: string, questionDomain: JudgmentDomain, judgments: DivinationJudgment[], asksTiming = false) =>
  judgeCross({ question, questionDomain, judgments, asksTiming });

/** Every paid verdict must satisfy these, in every scenario. */
function expectPaidQuality(v: ReturnType<typeof judgeCross>) {
  // 1. terminal MIXED cannot exist, and a shrug is not a verdict
  expect(v.direction).not.toBe('MIXED' as unknown as Stance);
  expect(isDirectional(v.direction)).toBe(true);
  // 2. a real conclusion sentence
  expect(v.primaryConclusion.trim().length).toBeGreaterThan(0);
  // 3. subject-specific evidence is cited
  expect(v.evidenceReferences.some((r) => r.lines.length > 0)).toBe(true);
  // 4. every APPLIED discipline states its contribution (§24)
  for (const c of v.contributions) {
    expect(c.contribution.trim().length).toBeGreaterThan(0);
    if (c.applied && c.discipline !== v.contributions.find((x) => x.applied)?.discipline) {
      // a non-dominant applied discipline must say why it didn't dominate OR why it reinforces
      expect(c.contribution.length + (c.whyItDidNotDominate?.length ?? 0)).toBeGreaterThan(0);
    }
  }
  // 5. a resolved contradiction is never re-flattened
  expect(v.primaryConclusion).not.toMatch(/반반|경우에\s*따라\s*다릅/);
}

describe('BENCHMARK — 20 paid scenarios all produce a decisive, evidence-backed verdict', () => {
  const cases: { n: number; label: string; run: () => ReturnType<typeof judgeCross> }[] = [
    { n: 1, label: '사업 확장', run: () => run('사업 확장해도 될까요?', 'OPPORTUNITY', [myungri('FOR', 'OPPORTUNITY'), ziwei('FOR', 'CAREER')]) },
    { n: 2, label: '이직', run: () => run('이직해도 될까요?', 'MOVEMENT', [myungri('FOR', 'MOVEMENT'), ziwei('CONDITIONAL_FOR', 'CAREER')]) },
    { n: 3, label: '돈이 들어오는가', run: () => run('올해 돈 벌 수 있을까요?', 'MONEY_INFLOW', [myungri('FOR', 'MONEY_INFLOW'), ziwei('FOR', 'MONEY_INFLOW')]) },
    { n: 4, label: '돈이 남는가', run: () => run('돈이 모일까요?', 'MONEY_RETENTION', [myungri('AGAINST', 'MONEY_RETENTION'), ziwei('AGAINST', 'MONEY_RETENTION')]) },
    { n: 5, label: '계약 시점', run: () => run('지금 계약해도 될까요?', 'TIMING', [myungri('FOR', 'DECISION'), qimen('FOR')], true) },
    { n: 6, label: '이사', run: () => run('이사해도 괜찮을까요?', 'MOVEMENT', [myungri('CONDITIONAL_FOR', 'MOVEMENT'), qimen('FOR')], true) },
    { n: 7, label: '새 인연', run: () => run('새로운 인연이 올까요?', 'RELATION_BOND', [myungri('FOR', 'RELATION_BOND'), ziwei('FOR', 'RELATION_STABILITY')]) },
    { n: 8, label: '현재 관계', run: () => run('이 관계 계속 가도 될까요?', 'RELATION_STABILITY', [myungri('CONDITIONAL_FOR', 'RELATION_STABILITY'), ziwei('AGAINST', 'RELATION_STABILITY')]) },
    { n: 9, label: '결혼', run: () => run('결혼해도 될까요?', 'RELATION_STABILITY', [myungri('FOR', 'RELATION_BOND'), ziwei('AGAINST', 'RELATION_STABILITY')]) },
    { n: 10, label: '관계 갈등', run: () => run('왜 자꾸 싸울까요?', 'CONFLICT', [myungri('AGAINST', 'CONFLICT'), ziwei('CONDITIONAL_AGAINST', 'RELATION_STABILITY')]) },
    { n: 11, label: '궁합 끌림', run: () => run('둘이 잘 맞나요?', 'RELATION_BOND', [myungri('STRONGLY_FOR', 'RELATION_BOND')]) },
    { n: 12, label: '궁합 결혼생활', run: () => run('결혼하면 어떨까요?', 'RELATION_STABILITY', [myungri('FOR', 'RELATION_BOND'), ziwei('AGAINST', 'RELATION_STABILITY')]) },
    { n: 13, label: '궁합 돈 충돌', run: () => run('돈 문제로 부딪힐까요?', 'MONEY_RETENTION', [myungri('FOR', 'MONEY_INFLOW'), ziwei('AGAINST', 'MONEY_RETENTION')]) },
    { n: 14, label: '재회', run: () => run('재회 가능성이 있을까요?', 'RELATION_BOND', [myungri('AGAINST', 'RELATION_BOND'), ziwei('CONDITIONAL_AGAINST', 'RELATION_STABILITY')]) },
    { n: 15, label: '커리어 기회', run: () => run('좋은 기회가 올까요?', 'OPPORTUNITY', [myungri('FOR', 'OPPORTUNITY'), ziwei('CONDITIONAL_FOR', 'CAREER')]) },
    { n: 16, label: '불리한 시점', run: () => run('지금 시작해도 될까요?', 'TIMING', [myungri('CONDITIONAL_FOR', 'DECISION'), qimen('AGAINST_FOR_NOW')], true) },
    { n: 17, label: '방향은 맞으나 시점이 아님', run: () => run('지금 창업해도 될까요?', 'DECISION', [myungri('FOR', 'OPPORTUNITY', { discipline: 'MYUNGRI', temporalScope: 'DAEWOON' }), qimen('AGAINST_FOR_NOW')], true) },
    { n: 18, label: '명리 vs 자미 정면 충돌', run: () => run('2027년에 이직해도 될까요?', 'MOVEMENT', [myungri('FOR', 'MOVEMENT', { discipline: 'MYUNGRI', questionDirectness: 'ADJACENT' }), ziwei('AGAINST', 'CAREER', { discipline: 'ZIWEI', questionDirectness: 'DIRECT' })]) },
    { n: 19, label: '명리·자미 일치 + 기문 반대', run: () => run('지금 계약할까요?', 'DECISION', [myungri('FOR', 'DECISION', { discipline: 'MYUNGRI', temporalScope: 'DAEWOON' }), ziwei('FOR', 'CAREER'), qimen('AGAINST_FOR_NOW')], true) },
    { n: 20, label: '출생시간 미상', run: () => run('사업 방향이 맞을까요?', 'OPPORTUNITY', [myungri('FOR', 'OPPORTUNITY', { discipline: 'MYUNGRI', dataReliability: 'REDUCED' }), notApplicable('ZIWEI', '출생시간이 확정되지 않아 명반을 세울 수 없습니다.')]) },
  ];

  it.each(cases)('case $n — $label', ({ run: r }) => {
    expectPaidQuality(r());
  });

  it('covers at least 20 scenarios', () => {
    expect(cases.length).toBeGreaterThanOrEqual(20);
  });
});

describe('CONTRADICTION BENCHMARK (§29) — conflicts are resolved, never neutralized', () => {
  it('C1 · 인연 vs 결혼생활 → bond/stability decomposition, both kept true', () => {
    const v = run('결혼해도 될까요?', 'RELATION_STABILITY', [
      myungri('STRONGLY_FOR', 'RELATION_BOND'),
      ziwei('AGAINST', 'RELATION_STABILITY'),
    ]);
    expect(v.contradictionResolutions.length).toBeGreaterThan(0);
    expect(v.contradictionResolutions[0].kind).toBe('BOND_VS_STABILITY');
    // the verdict follows the ASKED axis (결혼생활), the other becomes a qualifier — not a coin flip
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expect(v.contradictionResolutions[0].whyOtherDidNotDominate.length).toBeGreaterThan(0);
    expectPaidQuality(v);
  });

  it('C2 · 돈은 들어오지만 남지 않는다 → inflow/retention decomposition', () => {
    const v = run('돈이 모일까요?', 'MONEY_RETENTION', [
      myungri('FOR', 'MONEY_INFLOW'),
      ziwei('AGAINST', 'MONEY_RETENTION'),
    ]);
    expect(v.contradictionResolutions[0].kind).toBe('INFLOW_VS_RETENTION');
    expect(stanceValence(v.direction)).toBe('AGAINST'); // the asked axis is retention
    expect(v.primaryConclusion).toMatch(/다르게 봅니다/);
    expectPaidQuality(v);
  });

  it('C3 · 방향은 맞지만 지금은 아니다 → action/timing decomposition (기문은 자동 승자가 아님)', () => {
    const v = run('지금 창업해도 될까요?', 'DECISION', [
      myungri('FOR', 'OPPORTUNITY', { discipline: 'MYUNGRI', temporalScope: 'DAEWOON' }),
      qimen('AGAINST_FOR_NOW'),
    ], true);
    expect(v.direction).toBe('FOR_BUT_LATER'); // direction preserved, timing deferred
    expect(v.contradictionResolutions[0].kind).toBe('ACTION_VS_TIMING');
    expect(v.contradictionResolutions[0].dominant).toBe('MYUNGRI'); // structure owns the direction
    expect(v.timingConclusion).toBeTruthy();
    expectPaidQuality(v);
  });

  it('C4 · 정면 충돌 → the more question-DIRECT evidence wins, loser explained (no majority vote)', () => {
    const v = run('2027년에 이직해도 될까요?', 'CAREER', [
      myungri('FOR', 'CAREER', { discipline: 'MYUNGRI', questionDirectness: 'ADJACENT' }),
      ziwei('AGAINST', 'CAREER', { discipline: 'ZIWEI', questionDirectness: 'DIRECT' }),
    ]);
    expect(v.contradictionResolutions[0].kind).toBe('DIRECTNESS');
    expect(v.contradictionResolutions[0].dominant).toBe('ZIWEI');
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expect(v.contradictionResolutions[0].whyOtherDidNotDominate).toMatch(/명리/);
    expectPaidQuality(v);
  });

  it('C5 · 신뢰도 차이 → the better-grounded input wins when directness ties (§10-A)', () => {
    const v = run('올해 사업 어떨까요?', 'CAREER', [
      myungri('FOR', 'CAREER', { discipline: 'MYUNGRI', dataReliability: 'REDUCED', questionDirectness: 'DIRECT' }),
      ziwei('AGAINST', 'CAREER', { discipline: 'ZIWEI', dataReliability: 'EXACT', questionDirectness: 'DIRECT' }),
    ]);
    expect(v.contradictionResolutions[0].kind).toBe('RELIABILITY');
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expectPaidQuality(v);
  });

  it('C6 · 2 대 1 이어도 다수결로 이기지 않는다 (§12)', () => {
    // Two GENERAL-directness positives vs one DIRECT negative → the direct one must win.
    const v = run('이 제안 받아도 될까요?', 'OUTCOME', [
      myungri('FOR', 'GENERAL', { discipline: 'MYUNGRI', questionDirectness: 'GENERAL' }),
      ziwei('AGAINST', 'OUTCOME', { discipline: 'ZIWEI', questionDirectness: 'DIRECT' }),
      qimen('FOR', { discipline: 'QIMEN', questionDirectness: 'GENERAL' }),
    ]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expectPaidQuality(v);
  });

  it('C7 · SAME-domain conflict is NOT decomposed — a HIGH/DIRECT judgment beats a LOW one (QA-pack regression)', () => {
    // Found by the Founder QA pack: a LOW-confidence "no signal" Ziwei reading was beating a HIGH-confidence
    // DIRECT Myungri negative, because the domain-decomposition path fired even though BOTH judged the SAME
    // axis and then picked a side arbitrarily. Decomposition now requires genuinely different axes.
    const v = run('사업을 더 키워도 될까요?', 'OPPORTUNITY', [
      myungri('STRONGLY_AGAINST', 'OPPORTUNITY', { discipline: 'MYUNGRI', confidence: 'HIGH', questionDirectness: 'DIRECT' }),
      ziwei('CONDITIONAL_FOR', 'OPPORTUNITY', { discipline: 'ZIWEI', confidence: 'LOW', questionDirectness: 'DIRECT' }),
    ]);
    expect(stanceValence(v.direction)).toBe('AGAINST');
    expect(v.contradictionResolutions[0].dominant).toBe('MYUNGRI');
    expect(v.contradictionResolutions[0].kind).not.toBe('INFLOW_VS_RETENTION');
    expectPaidQuality(v);
  });

  it('user-visible Korean uses correct particles (명리가 / 자미두수와), never 명리이 / 자미두수과', () => {
    const v = run('결혼?', 'RELATION_STABILITY', [
      myungri('FOR', 'RELATION_BOND'),
      ziwei('AGAINST', 'RELATION_STABILITY'),
    ]);
    const text = [
      ...v.contradictionResolutions.flatMap((r) => [r.conflict, r.resolution, r.whyOtherDidNotDominate]),
      ...v.agreementPoints,
      ...v.contributions.map((c) => `${c.contribution} ${c.whyItDidNotDominate ?? ''}`),
    ].join(' ');
    expect(text).not.toMatch(/명리이|자미두수과|기문둔갑가/);
  });

  it('never emits a neutralizing conclusion in ANY contradiction case', () => {
    const all = [
      run('결혼?', 'RELATION_STABILITY', [myungri('FOR', 'RELATION_BOND'), ziwei('AGAINST', 'RELATION_STABILITY')]),
      run('돈?', 'MONEY_RETENTION', [myungri('FOR', 'MONEY_INFLOW'), ziwei('AGAINST', 'MONEY_RETENTION')]),
      run('지금?', 'DECISION', [myungri('FOR', 'OPPORTUNITY'), qimen('AGAINST_FOR_NOW')], true),
    ];
    for (const v of all) {
      expect(v.primaryConclusion).not.toMatch(/반반|좋은\s*점도|경우에\s*따라/);
      expect(isDirectional(v.direction)).toBe(true);
    }
  });
});

describe('INSUFFICIENT_DATA is rare and proven (§14)', () => {
  it('disagreement NEVER produces INSUFFICIENT_DATA', () => {
    const v = run('사업?', 'OPPORTUNITY', [myungri('FOR', 'OPPORTUNITY'), ziwei('AGAINST', 'CAREER')]);
    expect(v.direction).not.toBe('INSUFFICIENT_DATA');
  });
  it('only when NO discipline could speak at all', () => {
    const v = run('사업?', 'OPPORTUNITY', [
      notApplicable('MYUNGRI', '시기 흐름이 계산되지 않았습니다.'),
      notApplicable('ZIWEI', '출생시간 미상'),
      notApplicable('QIMEN', '시점 질문이 아님'),
    ]);
    expect(v.direction).toBe('INSUFFICIENT_DATA');
    // even then, each discipline states WHY (never a silent blank)
    for (const c of v.contributions) expect(c.contribution.length).toBeGreaterThan(0);
  });
});

describe('applicability — a non-applicable discipline never fabricates a judgment (§7/§34)', () => {
  it('QIMEN absent on a natal question does not affect the verdict and is declared, not claimed', () => {
    const v = run('제 성격이 어떤가요?', 'GENERAL', [
      myungri('FOR', 'GENERAL'),
      notApplicable('QIMEN', '지금 시점의 움직임을 묻는 질문이 아니라, 기문둔갑은 적용하지 않았습니다.'),
    ]);
    const q = v.contributions.find((c) => c.discipline === 'QIMEN')!;
    expect(q.applied).toBe(false);
    expect(q.contribution).toMatch(/적용하지 않았습니다/);
    expect(v.evidenceReferences.some((r) => r.discipline === 'QIMEN')).toBe(false);
  });
});
