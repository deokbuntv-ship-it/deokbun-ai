// V5 ROOT CAUSE 2 + RESIDUAL SYNTHESIS — structural tests for the grounded action source and the
// material-contributor synthesis mode. The properties asserted here are the ones that make the action
// section safe to ship: it introduces no fact, every line traces to a claim id, and the shape of the
// guidance follows the question that was asked rather than a decision template.
import {
  buildGroundedNarrativePlan, untraceableFacts, type GroundedNarrativePlan, type NarrativeIntent,
} from '@/features/chat/server/groundedNarrative';
import { buildGroundedActionPlan, renderGroundedActionSection } from '@/features/chat/server/groundedActionPlan';
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
    const action = buildGroundedActionPlan(planFor('DECISION'));
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
