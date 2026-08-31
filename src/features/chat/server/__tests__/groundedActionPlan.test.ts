// V5 ROOT CAUSE 2 + RESIDUAL SYNTHESIS — structural tests for the grounded action source and the
// material-contributor synthesis mode. The properties asserted here are the ones that make the action
// section safe to ship: it introduces no fact, every line traces to a claim id, and the shape of the
// guidance follows the question that was asked rather than a decision template.
import {
  actionDirectionOf, buildGroundedNarrativePlan, untraceableFacts,
  type GroundedNarrativePlan, type NarrativeIntent,
} from '@/features/chat/server/groundedNarrative';
import {
  buildGroundedActionPlan, renderGroundedActionLines, renderGroundedActionSection,
} from '@/features/chat/server/groundedActionPlan';
import { buildConsultationContentPlan } from '@/features/chat/server/consultationContentPlan';
import { buildUserVisibleAnswer, orderDetailSections } from '@/features/chat/presentation/userVisibleAnswer';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence,
} from '@/features/divination/contracts';

function ev(o: Partial<JudgmentEvidence>): JudgmentEvidence {
  return { fact: '천이궁 화록', meaning: '움직이는 자리에 실익이 붙습니다', domain: 'OPPORTUNITY', temporalScope: 'NATAL', directness: 'DIRECT', ...o };
}

function mkJudgment(o: Partial<DivinationJudgment>): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'OPPORTUNITY', temporalScope: 'NATAL', stance: 'FOR',
    dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [],
    timingSignals: [], domainSubJudgments: [],
    confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG', factGroupsUsed: [],
    ...o,
  };
}

const contribution = (o: Partial<DisciplineContribution>): DisciplineContribution => ({
  discipline: 'MYUNGRI', applied: true, stance: 'FOR', contribution: '테스트 기여', ...o,
});

const REAL_MYUNGRI = mkJudgment({
  discipline: 'MYUNGRI',
  directEvidence: [ev({ fact: '식상생재', meaning: '실행이 결과로 이어지는 결이 있습니다' })],
  counterEvidence: [ev({ fact: '편관 혼잡', meaning: '외부 압박이 함께 들어옵니다', directness: 'DIRECT' })],
});
const REAL_ZIWEI = mkJudgment({
  discipline: 'ZIWEI',
  directEvidence: [ev({ fact: '천이궁 화록', meaning: '움직이는 자리에 실익이 붙습니다' })],
});
const NULL_QIMEN = mkJudgment({
  discipline: 'QIMEN', stance: 'INSUFFICIENT_EVIDENCE', evidenceStrength: 'NONE',
  dominantConclusion: '기문둔갑에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.',
  directEvidence: [ev({ fact: '질문 축', meaning: '이 축을 직접 보는 경로가 아직 채택되어 있지 않다.', coverageGap: true })],
});

function mkVerdict(o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  const judgments = o.disciplineJudgments ?? [REAL_MYUNGRI, REAL_ZIWEI, NULL_QIMEN];
  return {
    question: '지금 이 사업 시작해도 될까?',
    questionDomain: 'OPPORTUNITY', questionIntent: 'DECISION', evaluatedAtEpochSeconds: null, asksTiming: false,
    premises: [], primaryConclusion: '지금 구조에서는 규모를 줄여 시작하시는 편이 낫습니다.',
    headlinePropositionIds: [], direction: 'CONDITIONAL_FOR', dominantBasis: '명리',
    disciplineJudgments: judgments,
    contributions: judgments.map((j) => contribution({ discipline: j.discipline, stance: j.stance })),
    axisVerdicts: [], propositions: [], agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
    natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [],
    actionableInterpretation: '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.',
    confidence: 'MEDIUM', confidenceReason: '테스트', evidenceReferences: [],
    verdictVersion: 'test',
    ...o,
  } as CrossDivinationVerdict;
}

type Axis = CrossDivinationVerdict['axisVerdicts'][number];
const axis = (o: Partial<Axis>): Axis => ({
  domain: 'MONEY_INFLOW', stance: 'FOR', conclusion: '들어오는 쪽은 열려 있습니다',
  dominantDiscipline: 'MYUNGRI', contested: false, ...o,
} as Axis);

// A verdict carrying REAL directional stances. Only `axisVerdicts` polarity is stance-derived, so this is
// the only fixture shape in which 진행/보류 buckets can exist at all (V5.2 §1).
const BOTH_SIDES = mkVerdict({
  axisVerdicts: [
    axis({ domain: 'MONEY_INFLOW', stance: 'FOR', conclusion: '들어오는 쪽은 열려 있습니다' }),
    axis({ domain: 'CONFLICT', stance: 'AGAINST', conclusion: '주변과 부딪히는 자리가 함께 섭니다', dominantDiscipline: 'ZIWEI' }),
    axis({ domain: 'MOVEMENT', stance: 'AGAINST', conclusion: '옮기는 쪽은 아직 막혀 있습니다', dominantDiscipline: 'ZIWEI' }),
  ],
});

function planFor(intent: NarrativeIntent, v: CrossDivinationVerdict = mkVerdict()): GroundedNarrativePlan {
  return buildGroundedNarrativePlan(v, buildConsultationContentPlan(v), intent);
}

describe('GroundedActionPlan — no new facts, every line traceable', () => {
  const INTENTS: NarrativeIntent[] = ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'];

  it('introduces zero facts the grounded corpus did not already supply, for every intent', () => {
    for (const intent of INTENTS) {
      const plan = planFor(intent);
      const section = renderGroundedActionSection(buildGroundedActionPlan(plan));
      expect(section).not.toBeNull();
      expect(untraceableFacts(section!.body, plan)).toEqual([]);
    }
  });

  it('every action item names the claim ids it stands on, and those ids exist in the catalog', () => {
    for (const intent of INTENTS) {
      const plan = planFor(intent);
      const action = buildGroundedActionPlan(plan);
      const known = new Set(plan.claims.map((c) => c.id));
      const items = [
        ...action.verifyItems, ...action.supportConditions, ...action.cautionConditions,
        action.proceedCondition, action.holdCondition, action.timingCheckpoint,
      ].filter((x): x is NonNullable<typeof x> => !!x);
      expect(items.length).toBeGreaterThan(0);
      for (const i of items) {
        expect(i.sourceClaimIds.length).toBeGreaterThan(0);
        for (const id of i.sourceClaimIds) expect(known.has(id)).toBe(true);
      }
      // The plan's own roll-up is the union of the items', never a superset invented at the end.
      expect([...action.sourceClaimIds].sort())
        .toEqual([...new Set(items.flatMap((i) => i.sourceClaimIds))].sort());
    }
  });

  it('one claim is spent in exactly one item — the section never says the same thing twice', () => {
    for (const intent of INTENTS) {
      const action = buildGroundedActionPlan(planFor(intent));
      const ids = [
        ...action.verifyItems, ...action.supportConditions, ...action.cautionConditions,
        action.proceedCondition, action.holdCondition, action.timingCheckpoint,
      ].filter((x): x is NonNullable<typeof x> => !!x).flatMap((i) => i.sourceClaimIds);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('is deterministic — same plan in, byte-identical section out', () => {
    const plan = planFor('DECISION');
    expect(renderGroundedActionSection(buildGroundedActionPlan(plan)))
      .toEqual(renderGroundedActionSection(buildGroundedActionPlan(plan)));
  });
});

describe('GroundedActionPlan — the guidance follows the question that was asked', () => {
  it('DECISION gets reason-bound procedural guidance, not a bare boundary sentence', () => {
    const action = buildGroundedActionPlan(planFor('DECISION', BOTH_SIDES));
    expect(action.verifyItems.length).toBeGreaterThan(0);
    // "What to verify" is bound to a real claim, so it can never read as a generic "알아보세요".
    expect(action.verifyItems[0].text.length).toBeGreaterThan('이 부분이 실제로 어떤지 먼저 확인하십시오.'.length);
    expect(action.proceedCondition ?? action.holdCondition).toBeDefined();
  });

  it('EXPLANATION does NOT get decision boilerplate', () => {
    const action = buildGroundedActionPlan(planFor('EXPLANATION'));
    expect(action.proceedCondition).toBeUndefined();
    expect(action.holdCondition).toBeUndefined();
    const body = renderGroundedActionSection(action)!.body;
    expect(body).not.toContain('진행하셔도 됩니다');
    expect(body).not.toContain('확정은 미루십시오');
  });

  it('TRAIT does not get decision boilerplate either', () => {
    const action = buildGroundedActionPlan(planFor('TRAIT'));
    expect(action.proceedCondition).toBeUndefined();
    expect(action.holdCondition).toBeUndefined();
  });

  it('TIMING cannot invent a checkpoint when the verdict supplied no temporal claim', () => {
    const noTiming = buildGroundedActionPlan(planFor('TIMING', mkVerdict({ timingConclusion: null })));
    expect(noTiming.timingCheckpoint).toBeUndefined();

    const withTiming = buildGroundedActionPlan(
      planFor('TIMING', mkVerdict({ timingConclusion: '올해 하반기로 갈수록 압박이 옅어집니다.', asksTiming: true })),
    );
    expect(withTiming.timingCheckpoint).toBeDefined();
    expect(withTiming.timingCheckpoint!.text).toContain('올해 하반기로 갈수록 압박이 옅어집니다');
  });

  it('COMPARISON preserves an unresolved state instead of turning it into a pick', () => {
    const declined = mkVerdict({
      direction: 'INSUFFICIENT_EVIDENCE',
      primaryConclusion: '어느 쪽인지 방향을 정할 만한 신호가 잡히지 않습니다.',
      confidence: 'LOW',
    });
    const action = buildGroundedActionPlan(planFor('COMPARISON', declined));
    expect(action.proceedCondition).toBeUndefined();
    expect(action.holdCondition?.text).toContain('한쪽으로 확정하지 마십시오');
  });
});

describe('V5 §2 — multi-system synthesis is decided by MATERIAL contribution', () => {
  it('two or more material contributors ⇒ COMBINED, and the null system is a coverage gap', () => {
    const plan = planFor('DECISION');
    expect(plan.materialContributors.sort()).toEqual(['MYUNGRI', 'ZIWEI']);
    expect(plan.synthesisMode).toBe('COMBINED');
    expect(plan.coverageGaps).toEqual(['QIMEN']);
  });

  it('exactly one material contributor ⇒ SINGLE_SYSTEM, and no fake synthesis is manufactured', () => {
    const v = mkVerdict({
      disciplineJudgments: [
        REAL_MYUNGRI,
        mkJudgment({ ...NULL_QIMEN, discipline: 'ZIWEI' }),
        NULL_QIMEN,
      ],
    });
    const plan = planFor('DECISION', v);
    expect(plan.materialContributors).toEqual(['MYUNGRI']);
    expect(plan.synthesisMode).toBe('SINGLE_SYSTEM');
    expect(plan.coverageGaps.sort()).toEqual(['QIMEN', 'ZIWEI']);
    // Honest coverage, never "these systems agree": the scope sentence names who had a seat and who did not.
    const scope = plan.claims.find((c) => c.provenance === 'CROSS:contributions');
    expect(scope?.authoritativeMeaning).toContain('명리');
    expect(scope?.authoritativeMeaning).toContain('판단에 넣지 않았습니다');
    expect(plan.claims.some((c) => c.role === 'SYNTHESIS' && /일치|함께 가리/.test(c.authoritativeMeaning)))
      .toBe(false);
  });
});

describe('COMPLETE-PRODUCT contract — what the reader actually receives', () => {
  const vm = (o: Partial<StructuredConsultationViewModel> = {}): StructuredConsultationViewModel => ({
    coreSummary: '규모를 줄여 시작하시는 편이 낫습니다.',
    coreInterpretation: '실행이 결과로 이어지는 결은 있지만 외부 압박이 함께 들어옵니다.',
    strengths: ['움직이는 자리에 실익이 붙습니다'],
    cautions: ['한 번에 규모를 키우면 되돌리기 어렵습니다'],
    domainInterpretation: [{ title: '이렇게 움직이시면 됩니다', body: '되돌릴 수 있는 범위에서만 벌리십시오.' }],
    verifiedEvidence: [
      { title: '왜 이렇게 보나요', body: '두 체계가 같은 자리를 가리킵니다.' },
      { title: '전문근거 · 명리 (E1)', body: '실행이 결과로 이어지는 결이 있습니다 (근거: 식상생재)' },
    ],
    followUps: ['가장 크게 걸리는 근거 하나만 더 봐주세요.'],
    assessment: {} as StructuredConsultationViewModel['assessment'],
    grounding: {} as StructuredConsultationViewModel['grounding'],
    ...o,
  });

  it('the user-visible answer includes the action section AND 전문근거, in delivery order', () => {
    const answer = buildUserVisibleAnswer(vm());
    const titles = answer.sections.map((s) => s.title);
    expect(titles).toEqual([
      '결론', '쉬운 설명', '좋은 흐름', '조심할 점',
      '이렇게 움직이시면 됩니다', '왜 이렇게 보나요', '전문근거 · 명리 (E1)', '후속질문',
    ]);
    expect(answer.text).toContain('식상생재');
  });

  it('the technical citations always close, whatever order the server emitted them in', () => {
    const ordered = orderDetailSections([
      { title: '전문근거 · 명리 (E1)', body: 'a' },
      { title: '한마디', body: 'b' },
      { title: '이렇게 움직이시면 됩니다', body: 'c' },
      { title: '모델이 쓴 섹션', body: 'd' },
    ]);
    expect(ordered.map((s) => s.title))
      .toEqual(['모델이 쓴 섹션', '이렇게 움직이시면 됩니다', '한마디', '전문근거 · 명리 (E1)']);
  });

  it('carries NO internal reference material — grounded facts and decision meta never become visible content', () => {
    const answer = buildUserVisibleAnswer(vm({
      decisionMeta: { internalOnly: '원국 년주 천간충' } as unknown as StructuredConsultationViewModel['decisionMeta'],
    }));
    expect(answer.text).not.toContain('원국 년주 천간충');
    expect(answer.text).not.toContain('decisionMeta');
  });

  it('omits sections with no content instead of padding them', () => {
    const answer = buildUserVisibleAnswer(vm({
      strengths: undefined, cautions: undefined, verifiedEvidence: undefined, followUps: undefined,
    }));
    expect(answer.sections.map((s) => s.title))
      .toEqual(['결론', '쉬운 설명', '이렇게 움직이시면 됩니다']);
  });
});

// ── V5.1 ACTION RENDERING ─────────────────────────────────────────────────────────────────────────────
//
// The V5 run named two manifestations of one RENDERING defect: proceed- and hold-framed lines joined into a
// single unlabelled paragraph (correct conditional advice reading as a contradiction), and every bucket
// flattened into that paragraph so the section met the reader with raw claim text. Both are fixed in
// presentation only — which claims the plan selected, and their ids, are unchanged.
describe('V5.1 — action renders as explicit, labelled buckets', () => {
  const LABELS = { verify: '확인할 것', proceed: '진행해도 되는 조건', hold: '보류해야 하는 조건', timing: '시기 체크' };


  it('A — proceedCondition and holdCondition render under DISTINCT labels', () => {
    const plan = planFor('DECISION', BOTH_SIDES);
    const action = buildGroundedActionPlan(plan);
    expect(action.proceedCondition).toBeDefined();
    expect(action.holdCondition).toBeDefined();
    const lines = renderGroundedActionLines(action);
    const labels = lines.map((l) => l.label);
    expect(labels).toContain(LABELS.proceed);
    expect(labels).toContain(LABELS.hold);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('B — a plan carrying both does not read as an unconditional contradiction', () => {
    const body = renderGroundedActionSection(buildGroundedActionPlan(planFor('DECISION', BOTH_SIDES)))!.body;
    // Each condition is its OWN labelled line: no single line asserts both "밀고 가셔도" and "미루십시오".
    for (const line of body.split('\n')) {
      const proceeds = /진행하셔도 됩니다|밀고 가셔도 됩니다/.test(line);
      const holds = /확정은 미루십시오|크게 벌리지 마십시오/.test(line);
      expect(proceeds && holds).toBe(false);
    }
    // And the reader is told which is which before either sentence.
    for (const line of body.split('\n')) expect(line).toMatch(/^[^—]+ — /);
  });

  it('C — among a bucket own candidates, the least jargon-dense one is what the reader sees', () => {
    // Two direction-bearing FOR stances on the same axis: one plain, one carrying technical identifiers the
    // 전문근거 section already prints with their 근거 attached.
    const v = mkVerdict({
      axisVerdicts: [
        axis({ domain: 'MONEY_INFLOW', conclusion: '지금의 큰 흐름이 원국 일주 천간합과 맞물려 풀립니다' }),
        axis({ domain: 'MONEY_INFLOW', conclusion: '활동이 결과로 이어지는 통로가 열려 있습니다' }),
      ],
    });
    const body = renderGroundedActionSection(buildGroundedActionPlan(planFor('DECISION', v)))!.body;
    const proceedLine = body.split('\n').find((l) => l.startsWith(LABELS.proceed))!;
    expect(proceedLine).toContain('활동이 결과로 이어지는 통로가 열려 있습니다');
    expect(proceedLine).not.toContain('원국 일주 천간합');
  });
  it('D — sourceClaimIds are unchanged, and every rendered line traces into them', () => {
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as NarrativeIntent[]) {
      const plan = planFor(intent);
      const action = buildGroundedActionPlan(plan);
      const items = [
        ...action.verifyItems, ...action.supportConditions, ...action.cautionConditions,
        action.proceedCondition, action.holdCondition, action.timingCheckpoint,
      ].filter((x): x is NonNullable<typeof x> => !!x);
      // Still exactly the union of the items the plan selected — rendering did not widen or narrow it.
      expect([...action.sourceClaimIds].sort())
        .toEqual([...new Set(items.flatMap((i) => i.sourceClaimIds))].sort());
      for (const line of renderGroundedActionLines(action)) {
        for (const id of line.sourceClaimIds) expect(action.sourceClaimIds).toContain(id);
      }
    }
  });

  it('E — the rendered section still introduces zero new facts, every intent', () => {
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as NarrativeIntent[]) {
      const plan = planFor(intent);
      const body = renderGroundedActionSection(buildGroundedActionPlan(plan))!.body;
      // The bucket labels are fixed text, so they can never register as a product fact either.
      expect(untraceableFacts(body, plan)).toEqual([]);
    }
  });

  it('F — no 시기 체크 bucket without an authoritative temporal claim', () => {
    const noTiming = renderGroundedActionLines(buildGroundedActionPlan(planFor('TIMING', mkVerdict({ timingConclusion: null }))));
    expect(noTiming.map((l) => l.label)).not.toContain(LABELS.timing);

    const withTiming = renderGroundedActionLines(buildGroundedActionPlan(
      planFor('TIMING', mkVerdict({ timingConclusion: '올해 하반기로 갈수록 압박이 옅어집니다.', asksTiming: true })),
    ));
    const timing = withTiming.find((l) => l.label === LABELS.timing);
    expect(timing?.text).toContain('올해 하반기로 갈수록 압박이 옅어집니다');
  });

  it('G — a bucket with no grounded content is omitted, never padded', () => {
    // A TIMING plan with no authoritative temporal claim simply has no 시기 체크 line.
    const labels = renderGroundedActionLines(buildGroundedActionPlan(planFor('TIMING', mkVerdict({ timingConclusion: null }))))
      .map((l) => l.label);
    expect(labels).not.toContain(LABELS.timing);
    expect(labels.length).toBeGreaterThan(0);
    // And a plan with no claims at all renders no section rather than an empty shell.
    const bare = mkVerdict({ disciplineJudgments: [NULL_QIMEN], contributions: [] });
    expect(renderGroundedActionLines(buildGroundedActionPlan(planFor('DECISION', bare)))).toEqual([]);
    expect(renderGroundedActionSection(buildGroundedActionPlan(planFor('DECISION', bare)))).toBeNull();
  });

  it('EXPLANATION is not labelled with decision framing — its buckets are observational', () => {
    const labels = renderGroundedActionLines(buildGroundedActionPlan(planFor('EXPLANATION'))).map((l) => l.label);
    expect(labels).not.toContain(LABELS.proceed);
    expect(labels).not.toContain(LABELS.hold);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('H — one grounded meaning is not repeated across buckets', () => {
    for (const intent of ['DECISION', 'COMPARISON'] as NarrativeIntent[]) {
      const lines = renderGroundedActionLines(buildGroundedActionPlan(planFor(intent)));
      const ids = lines.flatMap((l) => l.sourceClaimIds);
      expect(new Set(ids).size).toBe(ids.length);
      const texts = lines.map((l) => l.text);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });

  it('is deterministic — the same plan renders byte-identical lines', () => {
    const plan = planFor('DECISION');
    expect(renderGroundedActionLines(buildGroundedActionPlan(plan)))
      .toEqual(renderGroundedActionLines(buildGroundedActionPlan(plan)));
  });
});

// ── V5.2 ACTION MAPPING ───────────────────────────────────────────────────────────────────────────────
//
// `polarity` answers "does this SUPPORT or LIMIT the authoritative conclusion", which is NOT "is this
// favourable or unfavourable for acting". The V5.1 run put a favourable sentence under 보류해야 하는 조건 in
// 6 of 40 cases because the renderer treated the two as the same question. Only the axisVerdicts loop
// derives polarity from a real stance; everything else is observational.
describe('V5.2 — action direction comes from a stance, never from polarity alone', () => {
  const LABELS = { verify: '확인할 것', proceed: '진행해도 되는 조건', hold: '보류해야 하는 조건' };
  const lineFor = (planIn: GroundedNarrativePlan, label: string) =>
    renderGroundedActionLines(buildGroundedActionPlan(planIn)).find((l) => l.label === label);

  it('A — SUPPORT polarity alone does not become a proceed condition', () => {
    const v = mkVerdict({
      disciplineJudgments: [mkJudgment({
        discipline: 'MYUNGRI',
        directEvidence: [ev({ fact: '월주 파', meaning: '이 자리에 마찰이 일어나 일이 막히기 쉽습니다' })],
      })],
    });
    const plan = planFor('DECISION', v);
    const supportPolarity = plan.claims.filter((c) => c.polarity === 'SUPPORT');
    expect(supportPolarity.length).toBeGreaterThan(0);
    expect(actionDirectionOf(supportPolarity[0])).toBeNull();
    expect(lineFor(plan, LABELS.proceed)).toBeUndefined();
  });

  it('B — LIMIT polarity alone does not become a hold condition', () => {
    const v = mkVerdict({
      riskFactors: [ev({ fact: '부처 화록', meaning: '대궁에 흐름이 열리고 들어오는 힘이 들어옵니다' })],
    });
    const plan = planFor('DECISION', v);
    const risk = plan.claims.find((c) => c.provenance === 'CROSS:riskFactors')!;
    expect(risk.polarity).toBe('LIMIT');
    expect(actionDirectionOf(risk)).toBeNull();
    expect(lineFor(plan, LABELS.hold)).toBeUndefined();
  });

  it('C — an adverse claim backing an adverse conclusion never reads as a proceed condition', () => {
    const plan = planFor('DECISION', mkVerdict({
      axisVerdicts: [axis({ stance: 'AGAINST', conclusion: '이 자리는 막혀 있어 지금 밀어붙이기 어렵습니다' })],
    }));
    expect(lineFor(plan, LABELS.proceed)).toBeUndefined();
    expect(lineFor(plan, LABELS.hold)?.text).toContain('막혀 있어');
  });

  it('D — a favourable claim never lands under hold just because of its evidenceRole', () => {
    const plan = planFor('DECISION', mkVerdict({
      riskFactors: [ev({ fact: '부처 화록', meaning: '대궁에 흐름이 열리고 들어오는 힘이 들어옵니다' })],
      axisVerdicts: [axis({ stance: 'AGAINST', conclusion: '옮기는 쪽은 아직 막혀 있습니다', domain: 'MOVEMENT' })],
    }));
    const hold = lineFor(plan, LABELS.hold);
    expect(hold?.text).toContain('막혀 있습니다');
    expect(hold?.text).not.toContain('흐름이 열리고');
    expect(lineFor(plan, LABELS.verify)?.text).toContain('흐름이 열리고');
  });

  // `buildGroundedNarrativePlan`'s compound-truth loop deliberately SKIPS the asked axis (it is already the
  // headline), so a direction-bearing claim is off-axis by construction. Axis preference therefore binds
  // where candidates actually carry the asked domain: the observational pool that feeds 확인할 것.
  it('E — an on-axis candidate outranks an unrelated one when both already exist', () => {
    const plan = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      riskFactors: [
        ev({ domain: 'RELATION_STABILITY', fact: '일지 충', meaning: '타고난 배우자 자리가 흔들립니다' }),
        ev({ domain: 'CAREER', fact: '관록 화기', meaning: '사회·직업 자리가 이 흐름에 직접 흔들립니다' }),
      ],
    }));
    expect(lineFor(plan, LABELS.verify)?.text).toContain('사회·직업 자리');
    expect(lineFor(plan, LABELS.verify)?.text).not.toContain('배우자');
  });
  it('F — when nothing matches the asked axis, no on-axis claim is invented', () => {
    const plan = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      riskFactors: [ev({ domain: 'RELATION_STABILITY', fact: '일지 충', meaning: '타고난 배우자 자리가 흔들립니다' })],
    }));
    // The off-axis claim is used as it stands; nothing is fabricated to fill the axis.
    expect(lineFor(plan, LABELS.verify)?.text).toContain('배우자');
    expect(untraceableFacts(renderGroundedActionSection(buildGroundedActionPlan(plan))!.body, plan)).toEqual([]);
  });
  it('G/H — a raw CONTRADICTION claim and its engine scaffold never render as action', () => {
    const plan = planFor('DECISION', mkVerdict({
      contradictionResolutions: [{
        kind: 'DIFFERENT_DOMAIN',
        between: ['MYUNGRI', 'ZIWEI'],
        conflict: '같이 사는 난도에서 서로 다른 신호가 함께 잡힙니다',
        resolution: '원국 일지(배우자·자기 자리)은(는) 가까운 시기에 움직일 여지가 보입니다',
        dominant: 'MYUNGRI',
        whyOtherDidNotDominate: '테스트',
      }] as CrossDivinationVerdict['contradictionResolutions'],
      axisVerdicts: [axis({ stance: 'AGAINST', conclusion: '옮기는 쪽은 아직 막혀 있습니다', domain: 'MOVEMENT' })],
    }));
    const body = renderGroundedActionSection(buildGroundedActionPlan(plan))!.body;
    expect(body).not.toContain('서로 다른 신호가 함께 잡힙니다');
    expect(body.includes('은(는)')).toBe(false);
  });

  it('I/J — a sentence shared by two buckets is shown once, and the rest survives', () => {
    const shared = '대궁에 흐름이 열리고 들어오는 힘이 들어옵니다.';
    const plan = planFor('DECISION', mkVerdict({
      axisVerdicts: [
        axis({ stance: 'FOR', conclusion: shared }),
        axis({
          domain: 'MOVEMENT',
          stance: 'AGAINST',
          conclusion: shared + ' 이 자리는 스스로 끌고 가기보다 맞은편 자리의 성향을 따라갑니다.',
        }),
      ],
    }));
    const lines = renderGroundedActionLines(buildGroundedActionPlan(plan));
    const proceed = lines.find((l) => l.label === LABELS.proceed)!;
    const hold = lines.find((l) => l.label === LABELS.hold)!;
    expect(proceed.text).toContain('흐름이 열리고 들어오는 힘이 들어옵니다');
    expect(hold.text).not.toContain('흐름이 열리고 들어오는 힘이 들어옵니다');
    expect(hold.text).toContain('맞은편 자리의 성향을 따라갑니다');
  });

  it('N/O — every rendered line still traces to the plan, and introduces no new fact', () => {
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as NarrativeIntent[]) {
      const plan = planFor(intent, BOTH_SIDES);
      const action = buildGroundedActionPlan(plan);
      const known = new Set(plan.claims.map((c) => c.id));
      for (const line of renderGroundedActionLines(action)) {
        expect(line.sourceClaimIds.length).toBeGreaterThan(0);
        for (const id of line.sourceClaimIds) {
          expect(known.has(id)).toBe(true);
          expect(action.sourceClaimIds).toContain(id);
        }
      }
      const section = renderGroundedActionSection(action);
      if (section) expect(untraceableFacts(section.body, plan)).toEqual([]);
    }
  });
});

describe('V5.2 — an unresolved line is not presented as a hold condition', () => {
  it('gets its own heading, because nothing has to change for it to lift', () => {
    const declined = mkVerdict({
      direction: 'INSUFFICIENT_EVIDENCE', confidence: 'LOW',
      primaryConclusion: '어느 쪽인지 방향을 정할 만한 신호가 잡히지 않습니다.',
      axisVerdicts: [axis({ stance: 'AGAINST', conclusion: '옮기는 쪽은 아직 막혀 있습니다', domain: 'MOVEMENT' })],
    });
    const lines = renderGroundedActionLines(buildGroundedActionPlan(planFor('DECISION', declined)));
    const unresolved = lines.find((l) => l.text.includes('한쪽으로 확정하지 마십시오'))!;
    expect(unresolved.label).toBe('지금은 정할 수 없는 것');
    expect(lines.some((l) => l.label === '보류해야 하는 조건')).toBe(false);
  });
});
