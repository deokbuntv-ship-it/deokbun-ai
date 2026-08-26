// V4B §15/§18/§19/§20 — METAMORPHIC PROOF, PROPOSITION-SPECIFIC.
//
// V4A's version mutated whole premise GROUPS and accepted a change anywhere in the graph as proof, and it never
// mutated cross reasoning at all. Both are fixed: every mutation here targets one EXACT premise (or one exact
// parent proposition) and the assertion is about THAT conclusion, re-found by semantic identity rather than by
// its content-addressed id.
import {
  MYUNGRI_RULES, PRIMITIVE_RULE, classifyPair, primitivePropositions, runDerivations, screenSynthesis,
  standingPropositions, subordinate, target,
  type DataReliability, type DerivationContext, type DivinationPremise, type QuestionIntent,
  type ReasonedProposition, type SemanticRelation,
} from '@/features/divination';
import { certify, classifyPremiseMateriality, conclusionKey, myungriRederive } from './support/certify';

const ctx: DerivationContext = {
  subject: '본인', questionIntent: 'DECISION' as QuestionIntent, askedAxis: 'MONEY_RETENTION', dataComplete: true,
};

let seq = 0;
const premise = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
  'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'assertion' | 'concept'>): DivinationPremise => {
  seq += 1;
  return {
    id: `t${seq}`,
    discipline: 'MYUNGRI',
    sourceFactIds: [over.target.label],
    subject: '본인',
    questionIntent: ctx.questionIntent,
    role: 'ASSERTS',
    reliability: 'EXACT' as DataReliability,
    applicability: 'DIRECT',
    doctrineReference: 'test',
    ...over,
  };
};

const derive = (premises: DivinationPremise[], c: DerivationContext = ctx): ReasonedProposition[] =>
  runDerivations(MYUNGRI_RULES, premises, primitivePropositions(premises, c), c);
const ruleFired = (props: ReasonedProposition[], rule: string) => props.some((p) => p.derivationRule === rule);

// Named targets — the whole point of V4B is that these are IDENTITIES, not labels.
const SEAT_DAY = target('NATAL_SEAT', 'DAY', '원국 일지');
const SEAT_MONTH = target('NATAL_SEAT', 'MONTH', '원국 월지');
const FAM_WEALTH = target('TEN_GOD_FAMILY', 'WEALTH', '원국 재물');
const RIVAL = target('LUCK_LAYER', 'SEWOON:RIVAL', '올해 흐름의 겁재');

// ── §3 — SAME AXIS IS NOT SAME TARGET ────────────────────────────────────────────────────────────
describe('§3/§5 — a temporal split needs the SAME TARGET, not merely the same axis', () => {
  const open = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '큰 흐름이 사회 자리와 맞물린다.',
  });
  const strikeSameSeat = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 사회 자리를 흔든다.',
  });
  const strikeOtherSeat = premise({
    target: SEAT_DAY, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 배우자 자리를 흔든다.',
  });

  it('SAME target across time bands → the direction/execution split IS derived', () => {
    expect(ruleFired(derive([open, strikeSameSeat]), 'DIRECTION_VS_EXECUTION')).toBe(true);
  });

  it('DIFFERENT targets on the SAME axis → NO split (this was the V4A defect)', () => {
    expect(ruleFired(derive([open, strikeOtherSeat]), 'DIRECTION_VS_EXECUTION')).toBe(false);
  });

  it('the derived split names the exact target it is about', () => {
    const p = derive([open, strikeSameSeat]).find((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    expect(p.target.key).toBe(SEAT_MONTH.key);
  });
});

describe('§6 — a recurrence claim needs the SAME SEAT struck twice', () => {
  const natalWeak = premise({
    target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'NATAL', concept: 'NATAL_SEAT_STRAIN',
    semanticRelation: 'DESTABILIZES', assertion: '타고난 배우자 자리가 이미 흔들린다.',
  });
  const againSameSeat = premise({
    target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 같은 자리를 다시 흔든다.',
  });
  const elsewhereSameAxis = premise({
    target: SEAT_MONTH, questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 다른 자리를 흔든다.',
  });

  it('same seat struck again → the recurrence IS explained', () => {
    expect(ruleFired(derive([natalWeak, againSameSeat]), 'RECURRING_FRICTION_CAUSE')).toBe(true);
  });

  it('a DIFFERENT seat on the same axis → NOT a recurrence (this was the V4A defect)', () => {
    expect(ruleFired(derive([natalWeak, elsewhereSameAxis]), 'RECURRING_FRICTION_CAUSE')).toBe(false);
  });
});

// ── §7/§8/§9/§10 — the removed heuristics stay removed ───────────────────────────────────────────
describe('§7–§10 — heuristics that needed absent doctrine are GONE, not re-thresholded', () => {
  it('§7 — a natal absence no longer produces "기회를 받을 그릇이 없다"', () => {
    const activate = premise({
      target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'SEWOON', concept: 'LAYER_ACTIVATION',
      semanticRelation: 'ACTIVATES', assertion: '올해 재물 축이 움직인다.',
    });
    const absent = premise({
      target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY',
      semanticRelation: 'ABSENT', assertion: '재물 자리가 원국에 없다.', role: 'QUALIFIES',
    });
    const props = derive([activate, absent]);
    expect(ruleFired(props, 'UNRECEIVED_OPPORTUNITY')).toBe(false);
    expect(props.map((p) => p.assertion).join()).not.toMatch(/받아 둘 자리가 없어|그릇이 없/);
  });

  it('§7 — a WITHHELD doctrine result is never read as capacity absence', () => {
    const blocked = premise({
      target: target('DOCTRINE_GAP', 'STRENGTH_YONGSHIN', '일간 강약 · 억부용신'),
      questionAxis: 'GENERAL', temporalScope: 'NATAL', concept: 'DOCTRINE_BLOCK',
      semanticRelation: 'ABSENT', assertion: '강약은 채택 학파가 없어 판정을 보류한다.',
      role: 'DESCRIBES', applicability: 'BACKGROUND',
    });
    const activate = premise({
      target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'SEWOON', concept: 'LAYER_ACTIVATION',
      semanticRelation: 'ACTIVATES', assertion: '올해 재물 축이 움직인다.',
    });
    const derived = derive([blocked, activate]).filter((p) => p.derivationRule !== PRIMITIVE_RULE);
    expect(derived).toEqual([]); // a blocked doctrine grounds NOTHING
  });

  it('§8 — global rooting/season capacity no longer decides an unrelated seat', () => {
    const strike = premise({
      target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: '올해가 배우자 자리를 흔든다.',
    });
    const rooted = premise({
      target: target('DAY_MASTER_FOOTING', 'ROOT', '일간의 뿌리'),
      questionAxis: 'GENERAL', temporalScope: 'NATAL', concept: 'ROOTING',
      semanticRelation: 'STABILIZES', assertion: '뿌리가 단단하다.', role: 'QUALIFIES', applicability: 'CONTEXTUAL',
    });
    const props = derive([strike, rooted]);
    expect(ruleFired(props, 'PRESSURE_AGAINST_CAPACITY')).toBe(false);
    expect(props.map((p) => p.assertion).join()).not.toMatch(/감당할 수 있다|무리가 된다/);
  });

  it('§9 — count buckets no longer generate a chart description', () => {
    const rich = premise({
      target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY',
      semanticRelation: 'SUPPORTS', assertion: '재물 자리가 있다.', role: 'DESCRIBES',
    });
    const gap = premise({
      target: target('TEN_GOD_FAMILY', 'OFFICER', '원국 자리·책임'),
      questionAxis: 'CAREER', temporalScope: 'NATAL', concept: 'NATAL_FAMILY',
      semanticRelation: 'ABSENT', assertion: '자리·책임이 비어 있다.', role: 'QUALIFIES',
    });
    expect(ruleFired(derive([rich, gap]), 'STRUCTURAL_PROFILE')).toBe(false);
  });

  it('§10 — a family seat count no longer changes the premise relation', async () => {
    const { buildMyungriPremises } = await import('@/features/divination');
    const baseline = {
      familyPresence: { WEALTH: 3, OFFICER: 1, OUTPUT: 0, PEER: 0, RESOURCE: 0 },
      absentFamilies: [], natalHarmonyPositions: [],
      spouseSeatStrained: false, inCommand: null, anchored: 'UNKNOWN' as const, evidence: [],
      natalFrictions: [],
    };
    const ps = buildMyungriPremises({
      subject: '본인', questionIntent: 'DECISION', askedAxis: 'MONEY_INFLOW',
      baseline, layers: [], reliability: 'EXACT',
    });
    const three = ps.find((p) => p.target.key === FAM_WEALTH.key)!;
    const one = ps.find((p) => p.target.key === 'TEN_GOD_FAMILY:OFFICER')!;
    // 3 seats and 1 seat carry the SAME relation — the count is metadata, not significance.
    expect(three.semanticRelation).toBe(one.semanticRelation);
    expect(three.sourceFactIds[0]).toMatch(/3자리/); // …but the count is still reported as fact
  });
});

// ── §18/§20 — proposition-specific materiality ───────────────────────────────────────────────────
describe('§18/§20 — materiality is proven per-proposition, and REDUNDANT is a positive claim', () => {
  const rival = premise({
    target: RIVAL, questionAxis: 'INFLUENCE', temporalScope: 'SEWOON', concept: 'RIVAL_CLAIM',
    semanticRelation: 'OPPOSES', assertion: '올해 같은 몫을 두고 겨루는 기운이 들어온다.',
  });
  const wealth = premise({
    target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY',
    semanticRelation: 'SUPPORTS', assertion: '재물 자리가 원국에 있다.', role: 'DESCRIBES',
  });
  const premises = [rival, wealth];

  it('CONTESTED_SHARE is certified REAL by its own premises moving it', () => {
    const p = derive(premises).find((x) => x.derivationRule === 'CONTESTED_SHARE')!;
    const c = certify(p, premises, myungriRederive(ctx));
    expect(c.klass).toBe('REAL_SYNTHETIC_INFERENCE');
    expect(c.removals.every((r) => r.changed)).toBe(true); // BOTH halves are required
  });

  it('each premise is MATERIAL to that exact conclusion', () => {
    const p = derive(premises).find((x) => x.derivationRule === 'CONTESTED_SHARE')!;
    for (const prem of premises) {
      expect(classifyPremiseMateriality(p, prem, premises, myungriRederive(ctx))).toBe('MATERIAL');
    }
  });

  it('an INERT premise is reported as INERT, never laundered into REDUNDANT', () => {
    const irrelevant = premise({
      target: target('LUCK_LAYER', 'DAEWOON', '지금의 큰 흐름'),
      questionAxis: 'GENERAL', temporalScope: 'DAEWOON', concept: 'LAYER_SILENT',
      semanticRelation: 'ABSENT', assertion: '큰 흐름이 원국과 관계를 맺지 않는다.',
      role: 'DESCRIBES', applicability: 'BACKGROUND',
    });
    const withNoise = [...premises, irrelevant];
    const p = derive(withNoise).find((x) => x.derivationRule === 'CONTESTED_SHARE')!;
    expect(classifyPremiseMateriality(p, irrelevant, withNoise, myungriRederive(ctx))).toBe('INERT');
  });

  it('a conclusion nothing can move is NOT certified REAL', () => {
    // A hand-built proposition citing premises no rule consumes: removing them changes nothing.
    const fake: ReasonedProposition = {
      id: 'fake', discipline: 'MYUNGRI', subject: '본인', target: FAM_WEALTH,
      questionIntent: 'DECISION', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
      assertion: '무언가 좋습니다.', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: [rival.id, wealth.id], opposingPremiseIds: [],
      derivedFromPropositionIds: [], unresolvedPremiseIds: [], doctrineReferences: [],
      derivationRule: 'INVENTED_RULE',
      adequacy: { supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE', dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED' },
    };
    expect(certify(fake, premises, myungriRederive(ctx)).klass).not.toBe('REAL_SYNTHETIC_INFERENCE');
  });
});

// ── §15 — THE C7 ATTACK MATRIX ───────────────────────────────────────────────────────────────────
describe('§15 — C7 attacks (no special-case code exists for any of them)', () => {
  const prop = (over: Partial<ReasonedProposition> & Pick<ReasonedProposition,
    'id' | 'target' | 'questionAxis' | 'temporalScope' | 'direction'>): ReasonedProposition => ({
    discipline: 'MYUNGRI', subject: '본인', questionIntent: 'DECISION',
    assertion: over.id, conclusionType: 'DIRECTIONAL',
    supportingPremiseIds: [`s_${over.id}`], opposingPremiseIds: [],
    derivedFromPropositionIds: [], unresolvedPremiseIds: [], doctrineReferences: [],
    derivationRule: PRIMITIVE_RULE,
    adequacy: { supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE', dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED' },
    ...over,
  });

  it('A — SAME target, long-term favourable + immediate unfavourable → a valid temporal decomposition', () => {
    const longTerm = prop({ id: 'A1', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', direction: 'FAVORABLE' });
    const now = prop({ id: 'A2', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'UNFAVORABLE', discipline: 'ZIWEI' });
    expect(classifyPair(longTerm, now)).toBe('DIFFERENT_TIME');
  });

  it('B — DIFFERENT targets, same shape → NOT a temporal decomposition', () => {
    const longTerm = prop({ id: 'B1', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', direction: 'FAVORABLE' });
    const now = prop({ id: 'B2', target: SEAT_DAY, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'UNFAVORABLE', discipline: 'ZIWEI' });
    expect(classifyPair(longTerm, now)).toBe('DIFFERENT_TARGET');
  });

  it('C — a weak broad structural positive does not manufacture FOR_BUT_LATER on the same target', () => {
    const premisesMap = new Map<string, DivinationPremise>();
    const weakStructural = prop({
      id: 'C1', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'NATAL', direction: 'FAVORABLE',
      supportingPremiseIds: [], // rests on nothing
      adequacy: { supportAdequacy: 'NONE', counterAdequacy: 'NONE', dataCompleteness: 'PARTIAL', doctrineApplicability: 'ADOPTED' },
    });
    const strongNow = prop({
      id: 'C2', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'UNFAVORABLE', discipline: 'ZIWEI',
    });
    // The relation is temporal, but the timing rule requires BOTH halves grounded — so no split is produced.
    expect(classifyPair(weakStructural, strongNow)).toBe('DIFFERENT_TIME');
    const { deriveCross } = require('@/features/divination');
    const out = deriveCross([weakStructural, strongNow], [...premisesMap.values()], { ...ctx, askedAxis: 'CAREER' });
    expect(out.some((d: { proposition: ReasonedProposition }) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT')).toBe(false);
  });

  it('D — MIRROR: weak near-term positive + strong structural negative behaves the same way', () => {
    const weakNow = prop({
      id: 'D1', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'FAVORABLE',
      supportingPremiseIds: [],
      adequacy: { supportAdequacy: 'NONE', counterAdequacy: 'NONE', dataCompleteness: 'PARTIAL', doctrineApplicability: 'ADOPTED' },
    });
    const strongStructural = prop({
      id: 'D2', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'NATAL', direction: 'UNFAVORABLE', discipline: 'ZIWEI',
    });
    const { deriveCross } = require('@/features/divination');
    const out = deriveCross([weakNow, strongStructural], [], { ...ctx, askedAxis: 'CAREER' });
    expect(out.some((d: { proposition: ReasonedProposition }) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT')).toBe(false);
  });

  it('E — SAME target, SAME time, opposed → a true contradiction (not a temporal split)', () => {
    const a = prop({ id: 'E1', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'FAVORABLE' });
    const b = prop({ id: 'E2', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'UNFAVORABLE', discipline: 'ZIWEI' });
    expect(classifyPair(a, b)).toBe('CONTRADICTORY');
  });

  it('E2 — a true contradiction with NOTHING to distinguish the sides stays a standoff', () => {
    const a = prop({ id: 'E3', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'FAVORABLE' });
    const b = prop({ id: 'E4', target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', direction: 'UNFAVORABLE', discipline: 'ZIWEI' });
    // identical adequacy, identical premise applicability (none registered) → no reason applies
    expect(subordinate(a, b, new Map(), { askedAxis: 'CAREER', asksTiming: false })).toBeNull();
  });
});

// ── §12/§13 — adequacy and arbitration ───────────────────────────────────────────────────────────
describe('§12/§13 — adequacy does not choose, and no ordered ladder picks a winner', () => {
  const base = (over: Partial<ReasonedProposition>): ReasonedProposition => ({
    id: 'x', discipline: 'MYUNGRI', subject: '본인', target: SEAT_MONTH,
    questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'SEWOON',
    assertion: 'a', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
    supportingPremiseIds: [], opposingPremiseIds: [], derivedFromPropositionIds: [],
    unresolvedPremiseIds: [], doctrineReferences: [], derivationRule: PRIMITIVE_RULE,
    adequacy: { supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE', dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED' },
    ...over,
  });

  it('applicable reasons that DISAGREE produce a standoff, not a priority-ordered winner', () => {
    const pA = { id: 'pa', applicability: 'DIRECT' as const };
    const premises = new Map<string, DivinationPremise>([
      ['pa', { applicability: 'DIRECT' } as DivinationPremise],
      ['pb', { applicability: 'BACKGROUND' } as DivinationPremise],
    ]);
    // A wins on directness; B wins on data completeness. V4A's ladder would have returned A (first hit).
    const a = base({ id: 'a', supportingPremiseIds: [pA.id], adequacy: { supportAdequacy: 'THIN', counterAdequacy: 'NONE', dataCompleteness: 'PARTIAL', doctrineApplicability: 'ADOPTED' } });
    const b = base({ id: 'b', direction: 'UNFAVORABLE', supportingPremiseIds: ['pb'] });
    expect(subordinate(a, b, premises, { askedAxis: 'CAREER', asksTiming: false })).toBeNull();
  });

  it('when the applicable reasons AGREE, subordination holds and reports ALL of them', () => {
    const premises = new Map<string, DivinationPremise>([
      ['pa', { applicability: 'DIRECT' } as DivinationPremise],
      ['pb', { applicability: 'BACKGROUND' } as DivinationPremise],
    ]);
    const a = base({ id: 'a', supportingPremiseIds: ['pa'] });
    const b = base({
      id: 'b', direction: 'UNFAVORABLE', supportingPremiseIds: ['pb'],
      adequacy: { supportAdequacy: 'THIN', counterAdequacy: 'NONE', dataCompleteness: 'PARTIAL', doctrineApplicability: 'ADOPTED' },
    });
    const r = subordinate(a, b, premises, { askedAxis: 'CAREER', asksTiming: false })!;
    expect(r.dominant.id).toBe('a');
    expect(r.reasons.length).toBeGreaterThan(1); // every applicable reason, not just the first
  });

  it('§12 — time only subordinates when the QUESTION is about a moment', () => {
    const premises = new Map<string, DivinationPremise>();
    const near = base({ id: 'n', temporalScope: 'SEWOON' });
    const far = base({ id: 'f', temporalScope: 'NATAL', direction: 'UNFAVORABLE' });
    expect(subordinate(near, far, premises, { askedAxis: 'CAREER', asksTiming: false })).toBeNull();
    expect(subordinate(near, far, premises, { askedAxis: 'CAREER', asksTiming: true })?.dominant.id).toBe('n');
  });
});

// ── §16/§17 — the runtime may nominate, never certify ────────────────────────────────────────────
describe('§16/§17 — the runtime cannot award itself REAL', () => {
  it('screening returns CANDIDATE at best, never REAL', () => {
    const p = premise({
      target: FAM_WEALTH, questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY',
      semanticRelation: 'SUPPORTS', assertion: 'a',
    });
    const prim = primitivePropositions([p], ctx)[0];
    const screened = screenSynthesis(prim, new Map([[p.id, p]]));
    expect(screened).toBe('STATIC_RULE_OUTPUT');
    expect(['CANDIDATE_SYNTHESIS', 'STATIC_RULE_OUTPUT', 'MULTI_FACT_SUMMARY', 'UNSUPPORTED_INFERENCE'])
      .toContain(screened);
  });

  it('distinctness counts the TARGET, so two premises about different things are two premises', () => {
    const a = premise({ target: SEAT_DAY, questionAxis: 'CAREER', temporalScope: 'NATAL', concept: 'SEAT_CONTACT', semanticRelation: 'SUPPORTS', assertion: 'a' });
    const b = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'NATAL', concept: 'SEAT_CONTACT', semanticRelation: 'SUPPORTS', assertion: 'b' });
    const p: ReasonedProposition = {
      id: 'z', discipline: 'MYUNGRI', subject: '본인', target: SEAT_DAY,
      questionIntent: 'DECISION', questionAxis: 'CAREER', temporalScope: 'NATAL',
      assertion: 'c', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: [a.id, b.id], opposingPremiseIds: [],
      derivedFromPropositionIds: [], unresolvedPremiseIds: [], doctrineReferences: [],
      derivationRule: 'SOME_RULE',
      adequacy: { supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE', dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED' },
    };
    expect(screenSynthesis(p, new Map([[a.id, a], [b.id, b]]))).toBe('CANDIDATE_SYNTHESIS');
  });

  it('conclusion identity is semantic, so a re-derived conclusion is still recognisable', () => {
    const open = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT', semanticRelation: 'CONNECTS', assertion: 'o' });
    const hit = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT', semanticRelation: 'DESTABILIZES', assertion: 'h' });
    // A SECOND strike IN THE SAME LAYER is cited by the same conclusion, so the content-addressed id moves.
    const hit2 = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT', semanticRelation: 'CONSTRAINS', assertion: 'h2' });
    const p1 = derive([open, hit]).find((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    const p2 = derive([open, hit, hit2]).find((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    expect(p1.id).not.toBe(p2.id); // content-addressed ids differ…
    expect(conclusionKey(p1)).toBe(conclusionKey(p2)); // …but the conclusion is the same conclusion
  });

  // V4C §21 — a strike in a DIFFERENT layer is a DIFFERENT conclusion, not more evidence for this one.
  it('a strike in another layer derives its OWN conclusion instead of joining this one', () => {
    const open = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT', semanticRelation: 'CONNECTS', assertion: 'o' });
    const year = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT', semanticRelation: 'DESTABILIZES', assertion: 'y' });
    const month = premise({ target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT', semanticRelation: 'CONSTRAINS', assertion: 'm' });
    const both = derive([open, year, month]).filter((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION');
    expect(both).toHaveLength(2);
    expect(new Set(both.map((p) => p.temporalScope))).toEqual(new Set(['SEWOON', 'WOLWOON']));
    // Two conclusions about the same seat in different layers are two IDENTITIES, or one would shadow the other.
    expect(new Set(both.map(conclusionKey)).size).toBe(2);
    // The year conclusion is byte-identical to the one derived without the month layer at all.
    const yearOnly = derive([open, year]).find((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    expect(both.find((p) => p.temporalScope === 'SEWOON')!.id).toBe(yearOnly.id);
  });
});

// ── §21 — temporal ownership ─────────────────────────────────────────────────────────────────────
describe('§21 — exact temporal scopes are preserved, not flattened to STRUCTURAL/NEAR', () => {
  const mk = (scope: DivinationPremise['temporalScope'], rel: SemanticRelation, t = SEAT_MONTH) => premise({
    target: t, questionAxis: 'CAREER', temporalScope: scope, concept: 'SEAT_CONTACT',
    semanticRelation: rel, assertion: `${scope} ${rel}`,
  });

  it('a derived conclusion keeps the EXACT source scope, not a band', () => {
    const p = derive([mk('DAEWOON', 'CONNECTS'), mk('WOLWOON', 'DESTABILIZES')])
      .find((x) => x.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    expect(p.temporalScope).toBe('WOLWOON'); // not "NEAR"
  });

  it('removing the MONTH layer changes the month conclusion while the year pressure survives', () => {
    const natal = mk('NATAL', 'CONNECTS');
    const daewoon = mk('DAEWOON', 'CONNECTS');
    const sewoon = mk('SEWOON', 'DESTABILIZES');
    const wolwoon = mk('WOLWOON', 'DESTABILIZES');
    const all = [natal, daewoon, sewoon, wolwoon];

    const before = derive(all).filter((p) => p.derivationRule === 'CONVERGENT_SEAT_PRESSURE');
    expect(before).toHaveLength(1);
    // V4C §21 — the NARROWEST layer owns a multi-layer conclusion, decided by the layers themselves.
    // V4B took `group.find(NEAR)`, i.e. whichever near premise the array yielded first, so the same situation
    // could be reported as a 세운 claim or a 월운 claim depending on premise emission order.
    expect(before[0].temporalScope).toBe('WOLWOON');

    const withoutMonth = derive(all.filter((p) => p.id !== wolwoon.id));
    // the year-level pressure is gone as CONVERGENCE (one layer is not convergence) …
    expect(withoutMonth.some((p) => p.derivationRule === 'CONVERGENT_SEAT_PRESSURE')).toBe(false);
    // … while the long-term direction/execution reading survives, still owned by SEWOON
    const split = withoutMonth.find((p) => p.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    expect(split.temporalScope).toBe('SEWOON');
  });
});
