// V4A §8/§27 — METAMORPHIC PROOF. THE central acceptance mechanism of this sprint.
//
// Every previous generation could show a conclusion with facts attached to it. None could show that the facts
// MATTERED. That is the whole difference between reasoning and decoration, and no static property of a
// proposition object can reveal it — you have to remove or reverse a premise and watch what happens.
//
// So each test here takes premises produced by the REAL builder, deletes or flips exactly one, re-runs the
// derivation, and asserts the conclusion moved in the expected direction. A premise whose removal changes
// nothing was decorative, and the inference it supposedly fed does not count.
import type { DataReliability, JudgmentDomain, QuestionIntent } from '@/features/divination';
import {
  MYUNGRI_RULES, PRIMITIVE_RULE, classifySynthesis, computeAdequacy, primitivePropositions, runDerivations,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type SemanticRelation,
} from '@/features/divination';

const ctx: DerivationContext = {
  subject: '본인', questionIntent: 'DECISION' as QuestionIntent, askedAxis: 'MONEY_RETENTION', dataComplete: true,
};

let seq = 0;
// `concept` is the STRUCTURED tag rules match on (never the Korean `target` text), so each fixture states the
// one its scenario is about. SEAT_CONTACT is the default because most fixtures below are 운→원국 relations.
const premise = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
  'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'assertion'>): DivinationPremise => {
  seq += 1;
  return {
    id: `t${seq}`,
    discipline: 'MYUNGRI',
    sourceFactIds: [over.target],
    subject: '본인',
    questionIntent: ctx.questionIntent,
    concept: 'SEAT_CONTACT',
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
const conclusionsOf = (props: ReasonedProposition[], rule: string) =>
  props.filter((p) => p.derivationRule === rule).map((p) => p.assertion);
const without = (premises: DivinationPremise[], id: string) => premises.filter((p) => p.id !== id);
const flip = (premises: DivinationPremise[], id: string, relation: SemanticRelation) =>
  premises.map((p) => (p.id === id ? { ...p, semanticRelation: relation } : p));

// ── The scenario the sprint brief names in §8 ────────────────────────────────────────────────────
describe('§8 — direction vs execution: each premise is provably material', () => {
  const A = premise({
    target: '원국 재물', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: '재물 쪽이 여러 자리에 걸쳐 있다.', role: 'DESCRIBES',
  });
  const B = premise({
    target: '올해 흐름의 겁재', questionAxis: 'INFLUENCE', temporalScope: 'SEWOON',
    concept: 'RIVAL_CLAIM', semanticRelation: 'OPPOSES', assertion: '올해 같은 몫을 두고 겨루는 기운이 들어온다.',
  });
  const C = premise({
    target: '원국 월주', questionAxis: 'MONEY_INFLOW', temporalScope: 'WOLWOON',
    semanticRelation: 'DESTABILIZES', assertion: '이 시기 흐름이 사회 자리를 정면으로 흔든다.',
  });
  const ALL = [A, B, C];

  it('A+B+C derives BOTH the contested-share compound and the direction/execution split', () => {
    const props = derive(ALL);
    expect(ruleFired(props, 'CONTESTED_SHARE')).toBe(true);
    expect(ruleFired(props, 'DIRECTION_VS_EXECUTION')).toBe(true);
  });

  it('remove C (the near-term strike) → the direction/execution split DISAPPEARS', () => {
    const props = derive(without(ALL, C.id));
    expect(ruleFired(props, 'DIRECTION_VS_EXECUTION')).toBe(false);
    expect(ruleFired(props, 'CONTESTED_SHARE')).toBe(true); // unrelated conclusion is untouched
  });

  it('remove B (the rival) → the contested-share compound DISAPPEARS', () => {
    const props = derive(without(ALL, B.id));
    expect(ruleFired(props, 'CONTESTED_SHARE')).toBe(false);
    expect(ruleFired(props, 'DIRECTION_VS_EXECUTION')).toBe(true); // unrelated conclusion is untouched
  });

  it('remove A (the thing being contested) → there is nothing to contest, so no contest is claimed', () => {
    const props = derive(without(ALL, A.id));
    expect(ruleFired(props, 'CONTESTED_SHARE')).toBe(false);
  });

  it('reverse A (재물 present → absent) → the conclusion changes KIND, not just wording', () => {
    const reversed = flip(ALL, A.id, 'ABSENT');
    const props = derive(reversed);
    expect(ruleFired(props, 'CONTESTED_SHARE')).toBe(false);
    // and a DIFFERENT rule now recognises the chart: an activated axis with nothing to receive it
    expect(ruleFired(props, 'DIRECTION_VS_EXECUTION')).toBe(false);
  });
});

describe('§8 — capacity flips the conclusion, it does not decorate it', () => {
  const strike = premise({
    target: '원국 일지', questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON',
    semanticRelation: 'DESTABILIZES', assertion: '올해 흐름이 배우자 자리를 흔든다.',
  });
  const rooted = premise({
    target: '일간의 뿌리', questionAxis: 'GENERAL', temporalScope: 'NATAL',
    concept: 'ROOTING', semanticRelation: 'STABILIZES', assertion: '뿌리가 단단하다.', role: 'QUALIFIES', applicability: 'CONTEXTUAL',
  });

  it('WITH capacity → 견딜 수 있다 (RESTRICTED)', () => {
    const p = derive([strike, rooted]).find((x) => x.derivationRule === 'PRESSURE_AGAINST_CAPACITY')!;
    expect(p.direction).toBe('RESTRICTED');
    expect(p.assertion).toMatch(/감당할 수 있다/);
  });

  it('WITHOUT capacity (reversed to WEAKENS) → 못 견딘다 (UNFAVORABLE): the direction itself flips', () => {
    const p = derive(flip([strike, rooted], rooted.id, 'WEAKENS')).find((x) => x.derivationRule === 'PRESSURE_AGAINST_CAPACITY')!;
    expect(p.direction).toBe('UNFAVORABLE');
    expect(p.assertion).toMatch(/무리가 된다/);
  });

  it('remove the capacity premise entirely → the rule cannot speak and stays silent', () => {
    expect(ruleFired(derive([strike]), 'PRESSURE_AGAINST_CAPACITY')).toBe(false);
  });
});

describe('§8 — an activated axis with nowhere to land', () => {
  const activate = premise({
    target: '올해 흐름의 재물', questionAxis: 'MONEY_INFLOW', temporalScope: 'SEWOON',
    concept: 'LAYER_ACTIVATION', semanticRelation: 'ACTIVATES', assertion: '올해 재물 쪽 기운이 들어와 이 축이 움직인다.',
  });
  const absent = premise({
    target: '원국 재물', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ABSENT', assertion: '재물 쪽을 받쳐 줄 자리가 원국에 없다.', role: 'QUALIFIES',
  });

  it('activation + absence → "기회는 오되 손에 남지 않는다"', () => {
    const p = derive([activate, absent]).find((x) => x.derivationRule === 'UNRECEIVED_OPPORTUNITY')!;
    expect(p.assertion).toMatch(/받아 둘 자리가 없어/);
    expect(p.restriction).toBe('CAPACITY');
  });

  it('give the chart a place to receive it → the limitation disappears', () => {
    expect(ruleFired(derive(flip([activate, absent], absent.id, 'ENABLES')), 'UNRECEIVED_OPPORTUNITY')).toBe(false);
  });

  it('remove the activation → nothing is arriving, so nothing is claimed to be lost', () => {
    expect(ruleFired(derive([absent]), 'UNRECEIVED_OPPORTUNITY')).toBe(false);
  });
});

describe('§8 — convergence is a different event from a single hit', () => {
  const sewoon = premise({
    target: '원국 일지', questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 배우자 자리를 흔든다.',
  });
  const wolwoon = premise({
    target: '원국 일지', questionAxis: 'RELATION_STABILITY', temporalScope: 'WOLWOON',
    semanticRelation: 'CONSTRAINS', assertion: '이 시기가 배우자 자리에 마찰을 만든다.',
  });

  it('two time layers on the SAME seat → convergence', () => {
    expect(ruleFired(derive([sewoon, wolwoon]), 'CONVERGENT_SEAT_PRESSURE')).toBe(true);
  });

  it('one layer alone → NOT convergence (a single hit is not a pattern)', () => {
    expect(ruleFired(derive([sewoon]), 'CONVERGENT_SEAT_PRESSURE')).toBe(false);
  });

  it('two layers on DIFFERENT seats → NOT convergence', () => {
    const elsewhere = { ...wolwoon, id: 'other', target: '원국 년주' };
    expect(ruleFired(derive([sewoon, elsewhere]), 'CONVERGENT_SEAT_PRESSURE')).toBe(false);
  });
});

describe('§8 — the causal rule needs BOTH a standing weakness and a fresh hit on it', () => {
  const cctx: DerivationContext = { ...ctx, questionIntent: 'CAUSE_WHY', askedAxis: 'CONFLICT' };
  const natal = premise({
    target: '원국 일지', questionAxis: 'RELATION_STABILITY', temporalScope: 'NATAL',
    concept: 'NATAL_SEAT_STRAIN', semanticRelation: 'DESTABILIZES', assertion: '타고난 배우자 자리가 이미 흔들린다.',
  });
  const now = premise({
    target: '원국 일지', questionAxis: 'RELATION_STABILITY', temporalScope: 'SEWOON',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 같은 자리를 다시 흔든다.',
  });

  it('standing weakness + fresh hit → the recurrence is EXPLAINED', () => {
    const p = derive([natal, now], cctx).find((x) => x.derivationRule === 'RECURRING_FRICTION_CAUSE')!;
    expect(p.conclusionType).toBe('CAUSAL');
    expect(p.direction).toBe('NONE'); // a cause is not a verdict
  });

  it('remove the standing weakness → nothing is recurring, only happening', () => {
    expect(ruleFired(derive([now], cctx), 'RECURRING_FRICTION_CAUSE')).toBe(false);
  });

  it('remove the fresh hit → an old weakness alone does not explain a recurrence now', () => {
    expect(ruleFired(derive([natal], cctx), 'RECURRING_FRICTION_CAUSE')).toBe(false);
  });
});

describe('§8 — the structural profile tracks what the chart actually contains', () => {
  const dctx: DerivationContext = { ...ctx, questionIntent: 'DESCRIPTIVE', askedAxis: 'GENERAL' };
  const rich = premise({
    target: '원국 재물', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: '재물 자리가 겹친다.', role: 'DESCRIBES',
  });
  const noOfficer = premise({
    target: '원국 자리·책임', questionAxis: 'CAREER', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ABSENT', assertion: '자리·책임 쪽이 비어 있다.', role: 'QUALIFIES',
  });

  it('a contrast chart is described as a contrast', () => {
    const [p] = conclusionsOf(derive([rich, noOfficer], dctx), 'STRUCTURAL_PROFILE');
    expect(p).toMatch(/재물/);
    expect(p).toMatch(/자리·책임/);
    expect(p).toMatch(/갈리는 구조/);
  });

  it('flip the gap to a strength → the description changes, it is not the same sentence', () => {
    const [before] = conclusionsOf(derive([rich, noOfficer], dctx), 'STRUCTURAL_PROFILE');
    const [after] = conclusionsOf(derive(flip([rich, noOfficer], noOfficer.id, 'ENABLES'), dctx), 'STRUCTURAL_PROFILE');
    expect(after).not.toBe(before);
    expect(after).toMatch(/어느 축을 잡아도/);
  });

  it('a single natal premise is not a profile — one fact describes nothing', () => {
    expect(ruleFired(derive([rich], dctx), 'STRUCTURAL_PROFILE')).toBe(false);
  });
});

// ── §23 — the synthesis classifier must be strict enough to reject decoration ────────────────────
describe('§23 — classification is strict, and a restatement can never pass as inference', () => {
  const byId = (ps: DivinationPremise[]) => new Map(ps.map((p) => [p.id, p]));
  const one = premise({
    target: '원국 재물', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: '재물 자리가 겹친다.',
  });

  it('a PRIMITIVE proposition is STATIC_RULE_OUTPUT, however many facts it lists', () => {
    const p = primitivePropositions([one], ctx)[0];
    expect(classifySynthesis(p, byId([one]))).toBe('STATIC_RULE_OUTPUT');
  });

  it('a conclusion that merely echoes one of its own premises is MULTI_FACT_SUMMARY', () => {
    const two = premise({
      target: '원국 자리·책임', questionAxis: 'CAREER', temporalScope: 'NATAL',
      concept: 'NATAL_FAMILY', semanticRelation: 'ABSENT', assertion: '자리·책임이 비어 있다.',
    });
    const echo: ReasonedProposition = {
      id: 'echo', discipline: 'MYUNGRI', subject: '본인', target: 't',
      questionIntent: 'DECISION', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
      assertion: one.assertion, // verbatim copy of a premise — exactly the V3 failure
      conclusionType: 'STRUCTURAL', direction: 'NONE',
      supportingPremiseIds: [one.id], opposingPremiseIds: [two.id],
      derivedFromPropositionIds: [], unresolvedPremiseIds: [], doctrineReferences: [],
      derivationRule: 'SOME_RULE',
      adequacy: computeAdequacy([one], [two], { dataComplete: true, doctrine: 'ADOPTED' }),
    };
    expect(classifySynthesis(echo, byId([one, two]))).toBe('MULTI_FACT_SUMMARY');
  });

  it('a conclusion with no grounding at all is UNSUPPORTED_INFERENCE', () => {
    const floating: ReasonedProposition = {
      id: 'f', discipline: 'MYUNGRI', subject: '본인', target: 't',
      questionIntent: 'DECISION', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
      assertion: '그냥 좋습니다.', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: [], opposingPremiseIds: [], derivedFromPropositionIds: [],
      unresolvedPremiseIds: [], doctrineReferences: [], derivationRule: 'MADE_UP',
      adequacy: computeAdequacy([], [], { dataComplete: true, doctrine: 'ADOPTED' }),
    };
    expect(classifySynthesis(floating, byId([]))).toBe('UNSUPPORTED_INFERENCE');
  });

  it('§25 — synthesis is NOT inferred from array length: two premises alone do not make it real', () => {
    // Same relation, same axis, same scope, same target → one distinct premise shape, not two.
    const a = premise({ target: 'x', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: 'a' });
    const b = premise({ target: 'x', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL', concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: 'b' });
    const p: ReasonedProposition = {
      id: 'z', discipline: 'MYUNGRI', subject: '본인', target: 'x',
      questionIntent: 'DECISION', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
      assertion: 'c', conclusionType: 'DIRECTIONAL', direction: 'FAVORABLE',
      supportingPremiseIds: [a.id, b.id], opposingPremiseIds: [],
      derivedFromPropositionIds: [], unresolvedPremiseIds: [], doctrineReferences: [],
      derivationRule: 'SOME_RULE',
      adequacy: computeAdequacy([a, b], [], { dataComplete: true, doctrine: 'ADOPTED' }),
    };
    expect(classifySynthesis(p, byId([a, b]))).toBe('MULTI_FACT_SUMMARY');
  });
});

// ── §11 — adequacy must never let opposition inflate support ─────────────────────────────────────
describe('§11 — counter-evidence can never raise support adequacy', () => {
  const support = premise({
    target: 's', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'NATAL_FAMILY', semanticRelation: 'ENABLES', assertion: 's',
  });
  const counter = premise({
    target: 'c', questionAxis: 'MONEY_INFLOW', temporalScope: 'NATAL',
    concept: 'RIVAL_CLAIM', semanticRelation: 'OPPOSES', assertion: 'c',
  });

  it('adding a counter-premise leaves supportAdequacy EXACTLY where it was', () => {
    const alone = computeAdequacy([support], [], { dataComplete: true, doctrine: 'ADOPTED' });
    const opposed = computeAdequacy([support], [counter], { dataComplete: true, doctrine: 'ADOPTED' });
    expect(opposed.supportAdequacy).toBe(alone.supportAdequacy);
    expect(opposed.counterAdequacy).toBe('ADEQUATE');
  });

  it('a claim with ONLY opposition has NO support adequacy (V3 would have called this supported)', () => {
    const a = computeAdequacy([], [counter], { dataComplete: true, doctrine: 'ADOPTED' });
    expect(a.supportAdequacy).toBe('NONE');
  });
});
