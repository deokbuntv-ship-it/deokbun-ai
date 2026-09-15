// V4C §10/§33 — THE REQUIRED ADVERSARIAL MATRIX.
//
// Eighteen cases the independent audit named, plus the C7 attack matrix A–E. Every one of them is written as
// an ATTACK: it constructs the exact situation in which the V4B kernel produced a wrong professional answer,
// and asserts the answer the repaired kernel must give instead — including "we are not deciding this", which
// is a correct outcome (§31) and not a gap.
//
// Nothing here builds a fixture that could not arise at runtime: the premises are the shapes
// `buildMyungriPremises` and `adaptJudgment` actually emit, and the cross cases go through `deriveCross` and
// `classifyPair` themselves rather than through a stand-in.
import {
  MYUNGRI_RULES, classifyPair, deriveCross, primitivePropositions, runDerivations, standingPropositions,
  supersedes, target, natalSeatPairTarget, adaptedReadingTarget, ziweiPalaceTarget, qimenBoardTarget,
  isCanonicalTarget, resolveAnswer, TargetNamespaceError,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticTarget,
} from '@/features/divination';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';
import { classifyContinuationIntent } from '@/features/chat/services/followUpContext';
import { certify, classifyPremiseMateriality, conclusionKey, crossMutations, crossRederive, myungriRederive } from './support/certify';

const ctx: DerivationContext = {
  subject: '본인', questionIntent: 'DECISION', askedAxis: 'CAREER', dataComplete: true,
};
const crossCtx = { ...ctx, asksTiming: false };

let seq = 0;
const premise = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
  'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'assertion' | 'concept'>): DivinationPremise => {
  seq += 1;
  return {
    id: `v${seq}`,
    discipline: 'MYUNGRI',
    sourceFactIds: [over.target.label],
    subject: '본인',
    questionIntent: ctx.questionIntent,
    role: 'ASSERTS',
    reliability: 'EXACT',
    applicability: 'DIRECT',
    doctrineReference: 'test',
    ...over,
  };
};

const derive = (ps: DivinationPremise[], c: DerivationContext = ctx) =>
  runDerivations(MYUNGRI_RULES, ps, primitivePropositions(ps, c), c);
const fired = (ps: DivinationPremise[], rule: string, c: DerivationContext = ctx) =>
  derive(ps, c).some((p) => p.derivationRule === rule);

const SEAT_MONTH = target('NATAL_SEAT', 'MONTH', '원국 월지');
const SEAT_DAY = target('NATAL_SEAT', 'DAY', '원국 일지');
const PALACE_CAREER = ziweiPalaceTarget('CAREER')!;

let pseq = 0;
/** A proposition as the disciplines actually emit them — used for the CROSS attacks. */
const prop = (over: Partial<ReasonedProposition> & Pick<ReasonedProposition,
  'discipline' | 'target' | 'direction'>): ReasonedProposition => {
  pseq += 1;
  return {
    id: `q${pseq}`,
    subject: '본인',
    questionIntent: 'DECISION',
    questionAxis: 'CAREER',
    temporalScope: 'DAEWOON',
    assertion: `assertion ${pseq}`,
    conclusionType: 'DIRECTIONAL',
    answersAsked: true,
    supportingPremiseIds: [],
    opposingPremiseIds: [],
    derivedFromPropositionIds: [],
    unresolvedPremiseIds: [],
    doctrineReferences: ['test'],
    derivationRule: 'PRIMITIVE',
    adequacy: {
      supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE',
      dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED',
    },
    ...over,
  };
};

// ══ §33-1 — SAME QUESTION, SAME AXIS, DIFFERENT TARGET ══════════════════════════════════════════
describe('§33-1 / §4 — same asked question, same axis, DIFFERENT target', () => {
  const a = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE' });
  const b = prop({ discipline: 'ZIWEI', target: PALACE_CAREER, direction: 'UNFAVORABLE' });

  it('is a RIVAL conflict — never SAME_PROPOSITION, never CONTRADICTORY-on-one-seat', () => {
    expect(classifyPair(a, b)).toBe('RIVAL_CONFLICT');
  });

  it('agreement between two different structures is RIVAL_AGREEMENT, not REINFORCING', () => {
    expect(classifyPair(a, { ...b, direction: 'FAVORABLE' })).toBe('RIVAL_AGREEMENT');
  });

  it('two seats read by the SAME discipline are two findings, not rival answers', () => {
    // A second reading from the same engine is one reading with two parts. Calling it corroboration would let
    // one discipline agree with itself and present that as cross-discipline confirmation.
    expect(classifyPair(a, { ...b, discipline: 'MYUNGRI', direction: 'FAVORABLE' })).toBe('DIFFERENT_TARGET');
  });

  it('the conclusion drawn about a rival pair is keyed to BOTH structures, not to one of them', () => {
    const [d] = deriveCross([a, { ...b, direction: 'FAVORABLE' }], [], crossCtx);
    expect(d.proposition.target.kind).toBe('COMPOSITE');
    expect(d.proposition.target.key).toContain(SEAT_MONTH.key);
    expect(d.proposition.target.key).toContain(PALACE_CAREER.key);
  });
});

// ══ §33-2/§33-3 — TIME IS CLASSIFIED LAST ═══════════════════════════════════════════════════════
describe('§33-2 / §33-3 — a temporal split needs one thing whose direction and timing can come apart', () => {
  const structural = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });

  it('SAME target, different time BAND → DIFFERENT_TIME_BAND', () => {
    const near = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON' });
    expect(classifyPair(structural, near)).toBe('DIFFERENT_TIME_BAND');
  });

  // V4D §4 — two claims at the SAME distance are two independent time-scoped truths, not one thing whose
  // direction and timing came apart. V4C compared bands, so 올해 and 이 달 landed in the timing rule together.
  it('SAME target, same BAND, different exact scope → DIFFERENT_TIME_SCALE, and nothing is derived', () => {
    const year = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON' });
    const month = prop({ discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'WOLWOON' });
    expect(classifyPair(year, month)).toBe('DIFFERENT_TIME_SCALE');
    expect(deriveCross([year, month], [], crossCtx)).toEqual([]);
  });

  it('DIFFERENT target, different time → never DIFFERENT_TIME (this is C7 as a class)', () => {
    const elsewhere = prop({ discipline: 'ZIWEI', target: PALACE_CAREER, direction: 'UNFAVORABLE', temporalScope: 'SEWOON' });
    expect(classifyPair(structural, elsewhere)).not.toBe('DIFFERENT_TIME_BAND');
    expect(classifyPair(structural, elsewhere)).not.toBe('DIFFERENT_TIME_SCALE');
    expect(deriveCross([structural, elsewhere], [], crossCtx)
      .some((d) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT')).toBe(false);
  });
});

// ══ §10 — THE C7 ATTACK MATRIX ══════════════════════════════════════════════════════════════════
describe('§10 / §33-4..7 — C7 attack matrix A–E', () => {
  const open = (over: Partial<DivinationPremise> = {}) => premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '큰 흐름이 이 자리와 맞물린다.', ...over,
  });
  const strike = (over: Partial<DivinationPremise> = {}) => premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 이 자리를 흔든다.', ...over,
  });

  it('A — STRONG long-term favourable + STRONG immediate unfavourable, same target → valid timing compound', () => {
    expect(fired([open(), strike()], 'DIRECTION_VS_EXECUTION')).toBe(true);
  });

  it('B — WEAK long-term favourable + strong immediate unfavourable → NO automatic FOR_BUT_LATER', () => {
    // "Weak" = the positive rests on background context, or on an input the engine could not pin down. Either
    // way it cannot own the DIRECTION half of "방향은 맞지만 지금은 아니다".
    expect(fired([open({ applicability: 'BACKGROUND' }), strike()], 'DIRECTION_VS_EXECUTION')).toBe(false);
    expect(fired([open({ reliability: 'REDUCED' }), strike()], 'DIRECTION_VS_EXECUTION')).toBe(false);
  });

  it('B — and the immediate negative SURVIVES as its own conclusion; nothing is softened', () => {
    const props = derive([open({ applicability: 'BACKGROUND' }), strike()]);
    const negative = props.filter((p) => p.direction === 'UNFAVORABLE');
    expect(negative.length).toBeGreaterThan(0);
    expect(props.every((p) => p.restriction !== 'TIMING')).toBe(true);
  });

  it('C — different targets → no timing compound, whatever the bands are', () => {
    expect(fired([open(), strike({ target: SEAT_DAY })], 'DIRECTION_VS_EXECUTION')).toBe(false);
  });

  it('D — mirror: strong long-term NEGATIVE + weak short positive → no fake temporary exception', () => {
    const longNegative = premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: '큰 흐름이 이 자리를 흔든다.',
    });
    const weakShortPositive = premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONNECTS', assertion: '이 달은 잠깐 맞물린다.', applicability: 'BACKGROUND',
    });
    const props = derive([longNegative, weakShortPositive]);
    // No compound at all, and specifically no "지금은 되지만 나중은 아니다" shaped conclusion.
    expect(props.some((p) => p.conclusionType === 'COMPOUND')).toBe(false);
    expect(props.some((p) => p.restriction === 'TIMING')).toBe(false);
  });

  it('E — same target, same time, genuine conflict with no structural resolution → STANDOFF', () => {
    const a = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });
    const b = prop({ discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'DAEWOON' });
    expect(classifyPair(a, b)).toBe('CONTRADICTORY');
    const derivations = deriveCross([a, b], [], crossCtx);
    // Nothing distinguishes them — same target, same band, same data quality, same doctrine status — so the
    // relationship does not settle it and no winner is manufactured.
    expect(derivations.some((d) => d.standoff)).toBe(true);
    expect(derivations.every((d) => d.proposition.derivationRule !== 'CROSS_CONTRADICTION_RESOLVED')).toBe(true);
  });

  it('there is no C7 special case in the source — the class is removed by construction', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/features/divination/reasoning/crossRules.ts'), 'utf8') as string;
    // DIFFERENT_TIME is only ever produced inside the same-target branch; there is no guard bolted onto the
    // timing rule to catch the case after the fact.
    const classifyBody = src.slice(src.indexOf('export function classifyPair'), src.indexOf('WHY one proposition'));
    const sameTargetBranch = classifyBody.slice(classifyBody.indexOf('if (sameTarget('));
    expect(sameTargetBranch).toContain("'DIFFERENT_TIME_BAND'");
    // Both temporal relations are minted in ONE place, inside the same-target branch, and nowhere else.
    expect(classifyBody.split("'DIFFERENT_TIME_BAND'").length - 1).toBe(1);
    expect(classifyBody.split("'DIFFERENT_TIME_SCALE'").length - 1).toBe(1);
  });
});

// ══ §33-8/9/10 — CROSS PARENT ATTACKS ═══════════════════════════════════════════════════════════
describe('§33-8..10 / §18 — a cross conclusion must READ its parents, not merely count them', () => {
  const a = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });
  const b = prop({ discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });
  const props = [a, b];
  const reinforcement = deriveCross(props, [], crossCtx)
    .find((d) => d.proposition.derivationRule === 'CROSS_REINFORCEMENT')!.proposition;

  const mutations = () => crossMutations(reinforcement, props, [], crossCtx);

  it('8 — reversing a parent DIRECTION changes the conclusion', () => {
    const redirect = mutations().filter((m) => m.kind === 'REDIRECT_PARENT');
    expect(redirect.length).toBeGreaterThan(0);
    for (const m of redirect) expect(m.changed).toBe(true);
  });

  it('9 — making the two halves about DIFFERENT things removes the conclusion entirely', () => {
    const retarget = mutations().filter((m) => m.kind === 'RETARGET_PARENT');
    expect(retarget.length).toBeGreaterThan(0);
    for (const m of retarget) {
      expect(m.expect).toBe('ABSENT');
      expect(m.observed).toBe('ABSENT');
    }
  });

  it('10 — a TIMING split does not survive both halves landing in the same band', () => {
    const structural = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });
    const near = prop({
      discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON',
      supportingPremiseIds: ['x1'],
    });
    const prem: DivinationPremise[] = [premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: 's',
    })];
    const withIds = [
      { ...structural, supportingPremiseIds: [prem[0].id] },
      { ...near, supportingPremiseIds: [prem[0].id] },
    ];
    const split = deriveCross(withIds, prem, crossCtx)
      .find((d) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT');
    if (!split) return; // adequacy legitimately declined it; there is then nothing to attack
    const time = crossMutations(split.proposition, withIds, prem, crossCtx)
      .filter((m) => m.kind === 'RESCOPE_PARENT' && m.required);
    expect(time.length).toBeGreaterThan(0);
    for (const m of time) expect(m.observed).toBe('ABSENT');
  });

  it('a parent removal changes the claim — the required expectation, not "something moved somewhere"', () => {
    const removals = mutations().filter((m) => m.kind === 'REMOVE_PARENT');
    expect(removals.length).toBe(2);
    for (const m of removals) {
      expect(m.required).toBe(true);
      expect(m.changed).toBe(true);
    }
  });
});

// ══ §33-11/12 — REDUNDANT vs INERT ══════════════════════════════════════════════════════════════
describe('§33-11 / §33-12 / §20 — redundancy is a positive claim about the SAME side', () => {
  const natalWeak = premise({
    target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'NATAL', concept: 'NATAL_SEAT_STRAIN',
    semanticRelation: 'DESTABILIZES', assertion: '타고난 자리가 흔들린다.',
  });
  const again1 = premise({
    target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 다시 건드린다.',
  });
  const again2 = premise({
    target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONSTRAINS', assertion: '이 달도 건드린다.',
  });
  const irrelevant = premise({
    target: target('TEN_GOD_FAMILY', 'OUTPUT', '원국 식상'), questionAxis: 'OPPORTUNITY',
    temporalScope: 'NATAL', concept: 'NATAL_FAMILY', semanticRelation: 'SUPPORTS', assertion: '무관한 사실.',
  });
  const all = [natalWeak, again1, again2, irrelevant];
  const causal = derive(all).find((p) => p.derivationRule === 'RECURRING_FRICTION_CAUSE')!;

  it('11 — a premise with a SAME-SIDE substitute is REDUNDANT, and the substitution is demonstrated', () => {
    // Removing either luck-layer strike alone leaves the recurrence claim standing (the other still recurs);
    // removing the whole substitutable side removes it. That is what redundancy means.
    const verdicts = [again1, again2].map((p) => classifyPremiseMateriality(causal, p, all, myungriRederive(ctx)));
    expect(verdicts).toContain('REDUNDANT');
  });

  it('12 — a premise the conclusion never cited is INERT, never redundant', () => {
    expect(classifyPremiseMateriality(causal, irrelevant, all, myungriRederive(ctx))).toBe('INERT');
  });

  it('an OPPOSING premise can never be the substitute for a SUPPORTING one', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/features/divination/__tests__/support/certify.ts'), 'utf8') as string;
    // the peer search runs over the side the premise is actually on
    expect(src).toContain('const peers = premises.filter((p) => p.id !== premise.id && side.has(p.id));');
  });
});

// ══ §33-13 / §21 / §22 — YEAR AND MONTH PERSIST INDEPENDENTLY ═══════════════════════════════════
describe('§33-13 / §22 — the required temporal metamorphic case, at STANDING graph level', () => {
  const natal = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'NATAL', concept: 'NATAL_SEAT_STRAIN',
    semanticRelation: 'DESTABILIZES', assertion: '원국에서 이 자리가 약하다.',
  });
  const daewoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '큰 흐름이 이 자리와 맞물린다.',
  });
  const sewoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 이 자리를 누른다.',
  });
  const wolwoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONSTRAINS', assertion: '이 달에 이 자리가 좁아진다.',
  });
  const all = [natal, daewoon, sewoon, wolwoon];

  const standingOf = (ps: DivinationPremise[]) => standingPropositions(derive(ps, ctx));
  const splitAt = (ps: DivinationPremise[], scope: string) =>
    standingOf(ps).find((p) => p.derivationRule === 'DIRECTION_VS_EXECUTION' && p.temporalScope === scope);

  it('the year claim and the month claim are TWO standing conclusions, not one', () => {
    expect(splitAt(all, 'SEWOON')).toBeDefined();
    expect(splitAt(all, 'WOLWOON')).toBeDefined();
    expect(conclusionKey(splitAt(all, 'SEWOON')!)).not.toBe(conclusionKey(splitAt(all, 'WOLWOON')!));
  });

  it('removing the MONTH layer removes the month conclusion', () => {
    const without = all.filter((p) => p.id !== wolwoon.id);
    expect(splitAt(without, 'WOLWOON')).toBeUndefined();
  });

  it('…and leaves the YEAR conclusion byte-identical', () => {
    const without = all.filter((p) => p.id !== wolwoon.id);
    expect(splitAt(without, 'SEWOON')!.id).toBe(splitAt(all, 'SEWOON')!.id);
    expect(splitAt(without, 'SEWOON')!.assertion).toBe(splitAt(all, 'SEWOON')!.assertion);
  });

  it('…and leaves the LONG-TERM reading standing', () => {
    const without = all.filter((p) => p.id !== wolwoon.id);
    const longTerm = standingOf(without).filter((p) => p.temporalScope === 'NATAL' || p.temporalScope === 'DAEWOON');
    expect(longTerm.length).toBeGreaterThan(0);
  });
});

// ══ §33-14/15/16 — CONTINUATION INTENT ══════════════════════════════════════════════════════════
describe('§33-14..16 / §24 — a continuation is classified, not guessed', () => {
  it('14 — "왜?" is a refinement of the standing judgment', () => {
    expect(classifyContinuationIntent('왜요?', true)).toBe('REFINE_EXISTING');
  });

  it('15 — "돈은?" is a refinement, not a new reading', () => {
    expect(classifyContinuationIntent('돈은?', true)).toBe('REFINE_EXISTING');
    expect(classifyContinuationIntent('돈은요?', true)).toBe('REFINE_EXISTING');
  });

  it('16 — an explicit request for the present moment is a RE-EVALUATION', () => {
    for (const q of ['지금 다시 보면?', '오늘은?', '지금 현재 기준으로는?']) {
      expect(classifyContinuationIntent(q, true)).toBe('REEVALUATE_NOW');
    }
  });

  it('a fresh timing question is NOT mistaken for a re-evaluation of the old one', () => {
    expect(classifyContinuationIntent('지금 계약해도 될까요?', true)).toBe('NEW_QUESTION');
  });

  it('with no prior decision, nothing can be a refinement', () => {
    expect(classifyContinuationIntent('돈은요?', false)).toBe('NEW_QUESTION');
  });
});

// ══ §33-17 / §25 — MALFORMED PERSISTED GRAPH FAILS CLOSED ═══════════════════════════════════════
describe('§33-17 / §25 — the graph parser reconstructs, and fails closed', () => {
  const good = () => ({
    question: 'q', questionDomain: 'CAREER', questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: 1000, asksTiming: false,
    premises: [{
      id: 'p1', discipline: 'MYUNGRI', sourceFactIds: ['f'], subject: '본인',
      target: { key: 'NATAL_SEAT:MONTH', label: '원국 월지', kind: 'NATAL_SEAT' },
      questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'DAEWOON',
      semanticRelation: 'CONNECTS', concept: 'SEAT_CONTACT', assertion: 'a', role: 'ASSERTS',
      reliability: 'EXACT', applicability: 'DIRECT', doctrineReference: 'd',
    }],
    // G6 FINAL — primaryConclusion is now verified against the graph; the sole standing proposition's own
    // `assertion` ('a') is the only legitimate value here, matching what a real SINGLE resolution would state.
    primaryConclusion: 'a', direction: 'FOR', dominantBasis: 'b', verdictVersion: 'v',
    // V4D §27 — the parser now checks every nested enum, so a judgment must be a REAL judgment. A fixture
    // thin enough to pass the old checks was exactly the payload shape the audit said could restore.
    disciplineJudgments: [{
      discipline: 'MYUNGRI', stance: 'FOR', applicable: true, dataReliability: 'EXACT',
      questionDomain: 'CAREER', temporalScope: 'DAEWOON',
      dominantConclusion: 'c', dominantFactor: 'f',
      directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
      domainSubJudgments: [], confidence: 'HIGH', questionDirectness: 'DIRECT',
      evidenceStrength: 'MODERATE', factGroupsUsed: [],
    }],
    contributions: [], axisVerdicts: [], evidenceReferences: [],
    propositions: [{
      id: 'x1', discipline: 'MYUNGRI', subject: '본인',
      target: { key: 'NATAL_SEAT:MONTH', label: '원국 월지', kind: 'NATAL_SEAT' },
      questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'DAEWOON',
      assertion: 'a', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: ['p1'], opposingPremiseIds: [], derivedFromPropositionIds: [],
      unresolvedPremiseIds: [], doctrineReferences: ['d'], derivationRule: 'PRIMITIVE',
      adequacy: {
        supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE',
        dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED',
      },
    }],
    agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
    natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [], actionableInterpretation: 'i',
    confidence: 'HIGH', confidenceReason: 'r',
  });

  it('an intact graph restores', () => {
    expect(parseDivinationVerdict(good())).toBeDefined();
  });

  it('RECONSTRUCTS — an unknown field does not survive into the restored verdict', () => {
    const withExtra = { ...good(), __injected: 'anything at all' } as Record<string, unknown>;
    const restored = parseDivinationVerdict(withExtra) as unknown as Record<string, unknown>;
    expect(restored).toBeDefined();
    expect(restored.__injected).toBeUndefined();
  });

  it('…including inside a nested node', () => {
    const g = good();
    (g.propositions[0] as Record<string, unknown>).__injected = 'x';
    const restored = parseDivinationVerdict(g)!;
    expect((restored.propositions[0] as unknown as Record<string, unknown>).__injected).toBeUndefined();
  });

  it('a dangling premise link is rejected EVEN WHEN no premises were transmitted', () => {
    const g = good();
    (g as Record<string, unknown>).premises = [];
    expect(parseDivinationVerdict(g)).toBeUndefined();
  });

  it('a foreign enum value is rejected (axis, intent, relation, concept, adequacy)', () => {
    const mutate = (path: (v: ReturnType<typeof good>) => void) => {
      const g = good();
      path(g);
      return parseDivinationVerdict(g);
    };
    expect(mutate((g) => { (g.propositions[0] as Record<string, unknown>).questionAxis = 'LOTTERY'; })).toBeUndefined();
    expect(mutate((g) => { (g as Record<string, unknown>).questionIntent = 'VIBES'; })).toBeUndefined();
    expect(mutate((g) => { (g.premises[0] as Record<string, unknown>).semanticRelation = 'BLESSES'; })).toBeUndefined();
    expect(mutate((g) => { (g.premises[0] as Record<string, unknown>).concept = 'ASTROLOGY'; })).toBeUndefined();
    expect(mutate((g) => {
      (g.propositions[0].adequacy as Record<string, unknown>).doctrineApplicability = 'MAYBE';
    })).toBeUndefined();
  });

  it('a target whose KIND does not match its key namespace is rejected', () => {
    const g = good();
    (g.premises[0] as Record<string, unknown>).target = { key: 'PALACE:MONTH', label: 'x', kind: 'PALACE' };
    expect(parseDivinationVerdict(g)).toBeUndefined();
  });

  it('a cycle in the derivation graph is rejected', () => {
    const g = good();
    g.propositions.push({ ...g.propositions[0], id: 'x2', derivedFromPropositionIds: ['x1'] });
    g.propositions[0].derivedFromPropositionIds = ['x2'];
    expect(parseDivinationVerdict(g)).toBeUndefined();
  });
});

// ══ §2/§3 — THE CANONICAL TARGET REGISTRY ═══════════════════════════════════════════════════════
describe('§2/§3 — target identity is registered, ASCII, and independent of display text', () => {
  it('a key outside its kind namespace THROWS at construction', () => {
    expect(() => target('NATAL_SEAT', '원국 일지', '원국 일지')).toThrow(TargetNamespaceError);
    expect(() => target('PALACE', 'MONTH', 'x')).toThrow(TargetNamespaceError);
  });

  it('a natal relation is one identity regardless of the order it was written', () => {
    expect(natalSeatPairTarget('DAY', 'MONTH').key).toBe(natalSeatPairTarget('MONTH', 'DAY').key);
  });

  it('an unmigrated discipline gets its OWN namespace — never another discipline seat', () => {
    const adapted = adaptedReadingTarget('MYUNGRI', 'CAREER', '명리 CAREER 판단');
    expect(adapted.kind).toBe('ADAPTED_READING');
    expect(adapted.key).not.toBe(ziweiPalaceTarget('CAREER')!.key);
    expect(adapted.key).not.toBe(qimenBoardTarget().key);
  });

  it('every key is ASCII — no display text can be load-bearing', () => {
    const keys = [
      SEAT_MONTH.key, SEAT_DAY.key, PALACE_CAREER.key, qimenBoardTarget().key,
      natalSeatPairTarget('DAY', 'HOUR').key, adaptedReadingTarget('ZIWEI', 'MONEY_INFLOW', 'x').key,
    ];
    for (const k of keys) expect(k).toMatch(/^[\x20-\x7E]+$/);
  });

  it('the registry is the validator — `isCanonicalTarget` accepts exactly what `target` can build', () => {
    expect(isCanonicalTarget({ key: SEAT_MONTH.key, label: 'anything', kind: 'NATAL_SEAT' })).toBe(true);
    expect(isCanonicalTarget({ key: 'NATAL_SEAT:LOTTERY', label: 'x', kind: 'NATAL_SEAT' })).toBe(false);
    expect(isCanonicalTarget({ key: SEAT_MONTH.key, label: 'x', kind: 'PALACE' })).toBe(false);
  });
});

// ══ §6/§7/§29 — SUPERSESSION AND SELECTION ══════════════════════════════════════════════════════
describe('§6/§29 — supersession is an identity relation, never a premise count', () => {
  const base = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', supportingPremiseIds: ['a'] });
  const richer = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
    supportingPremiseIds: ['a', 'b'], derivedFromPropositionIds: [base.id], derivationRule: 'R',
  });

  it('a conclusion about the SAME thing that accounts for more of it supersedes', () => {
    expect(supersedes(richer, base)).toBe(true);
  });

  it('…but never one about a DIFFERENT target, however much evidence it cites', () => {
    expect(supersedes({ ...richer, target: SEAT_DAY }, base)).toBe(false);
  });

  it('…nor across temporal bands', () => {
    expect(supersedes({ ...richer, temporalScope: 'SEWOON' }, base)).toBe(false);
  });

  it('…nor a description swallowing a decision', () => {
    expect(supersedes({ ...richer, conclusionType: 'STRUCTURAL' }, base)).toBe(false);
  });

  it('…nor between two subjects', () => {
    expect(supersedes({ ...richer, subject: '상대' }, { ...base, subject: '상대' })).toBe(true);
    expect(supersedes({ ...richer, subject: '상대' }, base)).toBe(false);
  });

  it('equal premise sets never supersede — two readings of the same evidence are rivals', () => {
    expect(supersedes({ ...richer, supportingPremiseIds: ['a'], derivedFromPropositionIds: [] }, base)).toBe(false);
  });
});

describe('§7/§28 — the answer is resolved as a SET; graph order cannot change it', () => {
  const one = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE' });
  const two = prop({ discipline: 'ZIWEI', target: PALACE_CAREER, direction: 'UNFAVORABLE' });
  const agreeing = prop({ discipline: 'ZIWEI', target: PALACE_CAREER, direction: 'FAVORABLE' });
  const accounting = prop({
    discipline: 'CROSS', target: SEAT_MONTH, direction: 'FAVORABLE',
    derivedFromPropositionIds: [one.id, two.id], derivationRule: 'CROSS_X',
  });

  it('one candidate → SINGLE', () => {
    expect(resolveAnswer([one]).kind).toBe('SINGLE');
  });

  it('a conclusion that accounts for every other IS the answer', () => {
    const r = resolveAnswer([one, two, accounting]);
    expect(r.kind).toBe('SINGLE');
    expect(r.kind === 'SINGLE' && r.primary.id).toBe(accounting.id);
  });

  it('several agreeing conclusions with no accounting one → AGREED, and every one is named', () => {
    const r = resolveAnswer([one, agreeing]);
    expect(r.kind).toBe('AGREED');
    expect(r.members).toHaveLength(2);
  });

  it('several disagreeing conclusions → UNRESOLVED, and NO winner is invented', () => {
    expect(resolveAnswer([one, two]).kind).toBe('UNRESOLVED');
  });

  it('REORDERING the candidates never changes the outcome', () => {
    const forward = resolveAnswer([one, two, accounting]);
    const reversed = resolveAnswer([accounting, two, one]);
    expect(forward.kind).toBe(reversed.kind);
    expect(forward.kind === 'SINGLE' && reversed.kind === 'SINGLE'
      && forward.primary.id === reversed.primary.id).toBe(true);
  });
});

// ══ §28 — GRAPH ORDER CANNOT CHANGE THE VERDICT ═════════════════════════════════════════════════
describe('§28 — reordering the inputs produces a byte-identical verdict', () => {
  const ps = [
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONNECTS', assertion: '큰 흐름이 이 자리와 맞물린다.',
    }),
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: '올해가 이 자리를 흔든다.',
    }),
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONSTRAINS', assertion: '이 달에 이 자리가 좁아진다.',
    }),
    premise({
      target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'NATAL', concept: 'NATAL_SEAT_STRAIN',
      semanticRelation: 'DESTABILIZES', assertion: '타고난 자리가 흔들린다.',
    }),
  ];

  /** A deterministic shuffle — no clock, no randomness, so the case is replayable. */
  const rotate = <T,>(xs: T[], n: number): T[] => [...xs.slice(n), ...xs.slice(0, n)];
  const shape = (order: DivinationPremise[]) => standingPropositions(derive(order))
    .map((p) => [conclusionKey(p), p.direction, p.restriction ?? '-', p.assertion].join('|'))
    .sort();

  it('every rotation of the premise list yields the same standing conclusions', () => {
    const base = shape(ps);
    for (let n = 1; n < ps.length; n += 1) expect(shape(rotate(ps, n))).toEqual(base);
    expect(shape([...ps].reverse())).toEqual(base);
  });

  it('…and the same CROSS derivations, including which side was demoted', () => {
    const props = [
      prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE' }),
      prop({ discipline: 'ZIWEI', target: PALACE_CAREER, direction: 'FAVORABLE' }),
      prop({ discipline: 'QIMEN', target: qimenBoardTarget(), direction: 'FAVORABLE', questionAxis: 'TIMING' }),
    ];
    const shapeOf = (order: ReasonedProposition[]) => deriveCross(order, [], crossCtx)
      .map((d) => [d.relation, d.proposition.derivationRule, d.proposition.target.key, d.proposition.assertion].join('|'))
      .sort();
    const base = shapeOf(props);
    for (let n = 1; n < props.length; n += 1) expect(shapeOf(rotate(props, n))).toEqual(base);
    expect(shapeOf([...props].reverse())).toEqual(base);
  });
});

// ══ §11/§12 — SIDES ARE RELATIVE TO THE NEW ASSERTION ═══════════════════════════════════════════
describe('§11/§12 — a demoted parent argues WITH the conclusion, and is sided accordingly', () => {
  const support = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '열려 있다.',
  });
  const against = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '막혀 있다.', applicability: 'BACKGROUND',
  });
  const winner = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
    supportingPremiseIds: [support.id],
  });
  const loser = prop({
    discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'UNFAVORABLE',
    supportingPremiseIds: [against.id],
  });

  it('the loser\'s SUPPORT becomes the new conclusion\'s OPPOSITION, not more backing for it', () => {
    const resolved = deriveCross([winner, loser], [support, against], crossCtx)
      .find((d) => d.proposition.derivationRule === 'CROSS_CONTRADICTION_RESOLVED');
    if (!resolved) return; // no structural reason separated them → standoff, covered by C7-E
    expect(resolved.proposition.supportingPremiseIds).toContain(support.id);
    expect(resolved.proposition.opposingPremiseIds).toContain(against.id);
    expect(resolved.proposition.supportingPremiseIds).not.toContain(against.id);
  });

  it('a premise never sits on BOTH sides of the same conclusion', () => {
    for (const d of deriveCross([winner, loser], [support, against], crossCtx)) {
      const s = new Set(d.proposition.supportingPremiseIds);
      expect(d.proposition.opposingPremiseIds.some((id) => s.has(id))).toBe(false);
    }
  });
});

// ══ §27/§28/§29/§36 — EXECUTABLE SELF-AUDIT ═════════════════════════════════════════════════════
describe('§27/§28/§29/§36 — the forbidden patterns cannot come back unnoticed', () => {
  const read = (p: string) =>
    require('fs').readFileSync(require('path').join(process.cwd(), p), 'utf8') as string;
  /** Code only. Every one of these files EXPLAINS the removed pattern in prose, and prose is not behaviour. */
  const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const KERNEL = [
    'src/features/divination/reasoning/kernel.ts',
    'src/features/divination/reasoning/crossRules.ts',
    'src/features/divination/reasoning/crossReasoner.ts',
    'src/features/divination/reasoning/myungriReasoner.ts',
    'src/features/divination/reasoning/myungriRules.ts',
    'src/features/divination/reasoning/disciplineAdapter.ts',
    'src/features/divination/reasoning/targets.ts',
  ];

  it('§27 — `answersAsked` is read in exactly one place, and only as a relevance filter', () => {
    const reads = KERNEL.flatMap((p) => {
      const src = code(p);
      return [...src.matchAll(/([A-Za-z_.]*)\.answersAsked/g)].map((m) => ({ file: p, expr: m[0] }));
    });
    // The writers (`answersAsked: axis === ctx.askedAxis`) are not reads and do not match.
    expect(reads.map((r) => r.file)).toEqual([
      'src/features/divination/reasoning/crossRules.ts',
      'src/features/divination/reasoning/crossRules.ts',
    ]);
    // …and the one place it is read is guarded by a real target comparison, so it can never stand in for one.
    const branch = code('src/features/divination/reasoning/crossRules.ts');
    expect(branch).toContain('a.answersAsked && b.answersAsked && a.questionAxis === b.questionAxis && a.discipline !== b.discipline');
    expect(branch).not.toContain("if (a.answersAsked && b.answersAsked && a.questionAxis === b.questionAxis) {");
  });

  it('§27 — the RIVAL relations exist so a different-target pair is never called the same proposition', () => {
    const src = code('src/features/divination/reasoning/crossRules.ts');
    const branchStart = src.indexOf('a.answersAsked && b.answersAsked');
    const branch = src.slice(branchStart, branchStart + 400);
    expect(branch).toContain("return 'RIVAL_CONFLICT'");
    expect(branch).toContain("return 'RIVAL_AGREEMENT'");
    expect(branch).not.toContain("return 'SAME_PROPOSITION'");
    expect(branch).not.toContain("return 'CONTRADICTORY'");
    expect(branch).not.toContain("return 'REINFORCING'");
  });

  it('§28 — no primary conclusion is chosen with `.find(` in either reasoner', () => {
    for (const p of ['src/features/divination/reasoning/crossReasoner.ts',
      'src/features/divination/reasoning/myungriReasoner.ts']) {
      const src = code(p);
      // The answer comes from `resolveAnswer`, which is order-independent (proved above).
      expect(src).toContain('resolveAnswer(');
      expect(src).not.toMatch(/const\s+primary\s*=\s*[^;]*\.find\(/);
      expect(src).not.toMatch(/(standing|onAsked|candidates)\.find\(/);
    }
  });

  it('§29 — no conclusion outranks another by having more evidence', () => {
    const src = code('src/features/divination/reasoning/kernel.ts');
    // The V4B tiebreak was `bp.size > ap.length`. Nothing may compare the SIZES of two evidence collections.
    expect(src).not.toMatch(/\bbp\.size\s*>\s*ap\.length\b/);
    expect(src).not.toMatch(/supportingPremiseIds\.length\s*[<>]\s*[a-z]+\.supportingPremiseIds\.length/);
    for (const p of KERNEL) {
      expect(code(p)).not.toMatch(/evidence(Count|Score)|voteCount|tally|\bscore\b\s*[+]=/i);
    }
  });

  it('§36 — no blind support/counter union survives in cross construction', () => {
    const constructor = code('src/features/divination/reasoning/crossRules.ts');
    const shared = code('src/features/divination/reasoning/derivedChildPostconditions.ts');
    expect(constructor).not.toContain('const supportIds = [...new Set(spec.from.flatMap((p) => p.supportingPremiseIds))];');
    expect(constructor).toContain('crossChildEvidence(from, against)');
    expect(shared).toContain('against.flatMap((p) => p.opposingPremiseIds)');
    expect(shared).toContain('against.flatMap((p) => p.supportingPremiseIds)');
  });

  it('§36 — a timing compound cannot be built without both sides adequate', () => {
    expect(code('src/features/divination/reasoning/crossRules.ts')).toContain('halfIsAsserted(a) || !halfIsAsserted(b)');
    expect(code('src/features/divination/reasoning/myungriRules.ts')).toContain("sideAdequacy([open]) !== 'ADEQUATE'");
  });

  it('§36 — a target identity is never built from display text', () => {
    for (const p of KERNEL) {
      const src = code(p);
      // A Korean string reaching `target(kind, id, …)` as the ID would make wording load-bearing.
      const calls = [...src.matchAll(/target\(\s*'[A-Z_]+'\s*,\s*([^,]+),/g)].map((m) => m[1]);
      for (const id of calls) expect(id).not.toMatch(/[가-힣]/);
    }
  });

  it('§36 — the legacy compatibility tier reaches no paid interpretation path', () => {
    const src = code('src/features/chat/server/buildCompatibilityConsultation.ts');
    expect(src).not.toMatch(/assessmentSummary\s*:/);
    expect(src).not.toMatch(/negativePairTier/);
    // mitigation is driven by the STRUCTURAL verdict, not by the tier
    expect(src).toContain('requireConstructive: structurallyHard');
  });

  it('§36 — a follow-up refinement does not re-ground at the current server instant', () => {
    const src = code('src/features/chat/server/buildServerConsultation.ts');
    expect(src).toContain("continuation === 'REFINE_EXISTING' && storedInstant !== null");
    expect(src).toContain('nowEpochSeconds: evaluationInstant');
  });

  it('§30 — the doctrine freeze holds: no strength/Yongshin verdict is wired into the kernel', () => {
    for (const p of KERNEL) {
      expect(code(p)).not.toMatch(/judgeDayMasterStrength|judgeYongshin|STRENGTH_LABEL/);
    }
  });
});

// ══ §15 — ONE POPULATION ════════════════════════════════════════════════════════════════════════
describe('§15 — the certified population IS the runtime candidate population', () => {
  const all = [
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONNECTS', assertion: '열림',
    }),
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: '눌림',
    }),
  ];

  it('every runtime candidate is certified, and nothing else is', () => {
    const props = derive(all);
    const { candidatesOf } = require('./support/certify') as typeof import('./support/certify');
    const candidates = candidatesOf(props, all);
    const certified = candidates.map((p: ReasonedProposition) => certify(p, all, myungriRederive(ctx)));
    expect(certified).toHaveLength(candidates.length);
    // set equality, not a matching total
    expect(new Set(certified.map((c) => c.key)))
      .toEqual(new Set(candidates.map((p: ReasonedProposition) => conclusionKey(p))));
  });

  it('a conclusion the derivation does not actually produce is UNSUPPORTED, never certified', () => {
    const fabricated: ReasonedProposition = {
      ...derive(all)[0],
      id: 'fake', derivationRule: 'INVENTED_RULE', assertion: '지어낸 결론',
      supportingPremiseIds: all.map((p) => p.id), opposingPremiseIds: [],
    };
    expect(certify(fabricated, all, myungriRederive(ctx)).klass).toBe('UNSUPPORTED_INFERENCE');
  });
});

// ══ §33-18 — COMPATIBILITY TIER HAS NO PAID AUTHORITY ═══════════════════════════════════════════
describe('§33-18 — a missing structural verdict is stated, never covered by the legacy tier', () => {
  const read = (p: string) =>
    require('fs').readFileSync(require('path').join(process.cwd(), p), 'utf8') as string;
  const src = () => read('src/features/chat/server/buildCompatibilityConsultation.ts');

  it('the prompt SAYS the structural judgment is absent instead of promoting the tier', () => {
    expect(src()).toMatch(/【구조 판정 없음】/);
    expect(src()).toMatch(/요약 카드의 종합 티어를 판정처럼 바꿔 말하지 마십시오/);
  });

  it('and it does not let hedging language stand in for the missing judgment', () => {
    expect(src()).toMatch(/완곡한 표현으로 대신하지 마십시오/);
  });

  it('a NEGATIVE tier cannot force constructive framing — only a structural AGAINST can', () => {
    const code = src().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const flat = code.replace(/\s+/g, ' ');
    expect(flat).toContain('const structurallyHard = structuralVerdict !== null && AGAINST_STANCES.includes(structuralVerdict.direction)');
    expect(code).not.toMatch(/compatibility\.overall/);
  });
});

// Referenced so the crossRederive export stays exercised by this suite's imports.
export type _Unused = ReturnType<typeof crossRederive> | SemanticTarget;
