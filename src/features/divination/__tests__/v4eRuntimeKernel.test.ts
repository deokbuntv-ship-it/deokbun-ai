// V4E §11 — THE FINAL RUNTIME KERNEL FIXES, EACH PROVEN BY THE ATTACK THAT FOUND IT.
//
// Every case here is a defect the independent V4D audit demonstrated on the LIVE kernel — not a hypothetical.
// The worst was a paid verdict that flipped between FOR_BUT_LATER and CONDITIONAL_AGAINST when the proposition
// array was reversed. These tests reproduce each attack and pin the repaired behaviour.
import {
  classifyPair, deriveCross, extendGraph, refinementFailure, reasonCross, sideAdequacy, target,
  primitivePropositions, runDerivations, standingPropositions, MYUNGRI_RULES,
  type CrossDivinationVerdict, type DerivationContext, type DivinationJudgment, type DivinationPremise,
  type ReasonedProposition,
} from '@/features/divination';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';

const ctx: DerivationContext = { subject: '본인', questionIntent: 'DECISION', askedAxis: 'CAREER', dataComplete: true };
const crossCtx = { ...ctx, asksTiming: false };
const SEAT = target('NATAL_SEAT', 'MONTH', '원국 월지');
const SEAT_DAY = target('NATAL_SEAT', 'DAY', '원국 일지');

let n = 0;
const prop = (over: Partial<ReasonedProposition> & Pick<ReasonedProposition,
  'discipline' | 'target' | 'direction'>): ReasonedProposition => {
  n += 1;
  return {
    id: `v4e${n}`, subject: '본인', questionIntent: 'DECISION', questionAxis: 'CAREER',
    temporalScope: 'SEWOON', assertion: `a${n}`, conclusionType: 'DIRECTIONAL', answersAsked: true,
    supportingPremiseIds: [`s${n}`], opposingPremiseIds: [], derivedFromPropositionIds: [],
    unresolvedPremiseIds: [], doctrineReferences: ['t'], derivationRule: 'PRIMITIVE',
    adequacy: {
      supportAdequacy: 'ADEQUATE', counterAdequacy: 'NONE',
      dataCompleteness: 'COMPLETE', doctrineApplicability: 'ADOPTED',
    },
    ...over,
  };
};

let pn = 0;
const premise = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
  'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'concept' | 'assertion'>): DivinationPremise => {
  pn += 1;
  return {
    id: `w4e${pn}`, discipline: 'MYUNGRI', sourceFactIds: [over.assertion], subject: '본인',
    questionIntent: 'DECISION', role: 'ASSERTS', reliability: 'EXACT', applicability: 'DIRECT',
    doctrineReference: 'test', ...over,
  };
};

const MYUNGRI_SPOKE: DivinationJudgment = {
  discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT', questionDomain: 'CAREER',
  temporalScope: 'SEWOON', stance: 'CONDITIONAL_AGAINST', dominantConclusion: 'c', dominantFactor: 'f',
  directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
  domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'DIRECT',
  evidenceStrength: 'MODERATE', factGroupsUsed: [],
};

const run = (props: ReasonedProposition[]) => reasonCross({
  question: 'q', questionDomain: 'CAREER', questionIntent: 'DECISION', judgments: [MYUNGRI_SPOKE],
  asksTiming: false, evaluatedAtEpochSeconds: 1, premises: [], propositions: props,
});

// ══ §11-1 / §11-2 / §11-3 — REINFORCEMENT IS SYMMETRIC ══════════════════════════════════════════
describe('§1 — the proven verdict flip: TIMING + SCOPE on one seat', () => {
  const timing = prop({ discipline: 'MYUNGRI', target: SEAT, direction: 'RESTRICTED', restriction: 'TIMING' });
  const scope = prop({ discipline: 'ZIWEI', target: SEAT, direction: 'RESTRICTED', restriction: 'SCOPE' });

  it('a TIMING_WINDOW and a SCOPE_LIMIT are two different claims — never REINFORCING', () => {
    // V4D compared the direction ENUM: both 'RESTRICTED' → REINFORCING, and the reinforcement copied its
    // restriction from operand `a`. Measured: FOR_BUT_LATER forward, CONDITIONAL_AGAINST reversed, and the
    // timing conclusion appeared or vanished with it.
    expect(classifyPair(timing, scope)).toBe('SAME_PROPOSITION');
    expect(classifyPair(scope, timing)).toBe('SAME_PROPOSITION');
  });

  it('operand reversal NEVER flips the verdict (the audit\'s exact case)', () => {
    const fwd = run([timing, scope]).verdict;
    const rev = run([scope, timing]).verdict;
    expect(fwd.direction).toBe(rev.direction);
    expect(fwd.primaryConclusion).toBe(rev.primaryConclusion);
    expect(fwd.timingConclusion).toBe(rev.timingConclusion);
    // and specifically: the flip pair the audit proved can no longer occur
    expect(new Set([fwd.direction, rev.direction]).size).toBe(1);
  });

  it('two SAME-kind restrictions still reinforce, and symmetrically', () => {
    const t2 = prop({ discipline: 'ZIWEI', target: SEAT, direction: 'RESTRICTED', restriction: 'TIMING' });
    expect(classifyPair(timing, t2)).toBe('REINFORCING');
    const fwd = deriveCross([timing, t2], [], crossCtx).map((d) => d.proposition.id).sort();
    const rev = deriveCross([t2, timing], [], crossCtx).map((d) => d.proposition.id).sort();
    expect(fwd).toEqual(rev);
  });

  it('a RIVAL agreement requires the same claim kind AND the same moment', () => {
    // Different seats, both on the asked axis, same direction — but a 세운 opening and a 대운 opening are two
    // findings at two distances, and V4D's agreement copied the scope from whichever operand came first.
    const yearOpen = prop({ discipline: 'MYUNGRI', target: SEAT, direction: 'FAVORABLE', temporalScope: 'SEWOON' });
    const decadeOpen = prop({ discipline: 'ZIWEI', target: SEAT_DAY, direction: 'FAVORABLE', temporalScope: 'DAEWOON' });
    expect(classifyPair(yearOpen, decadeOpen)).toBe('DIFFERENT_TARGET');
    const sameMoment = prop({ discipline: 'ZIWEI', target: SEAT_DAY, direction: 'FAVORABLE', temporalScope: 'SEWOON' });
    expect(classifyPair(yearOpen, sameMoment)).toBe('RIVAL_AGREEMENT');
  });

  it('full reversal / rotation / discipline permutation yield one semantic verdict set', () => {
    const props = [
      timing, scope,
      prop({ discipline: 'QIMEN', target: target('BOARD_SEAT', 'QIMEN_BOARD', '기문 국'), direction: 'FAVORABLE' }),
      prop({ discipline: 'MYUNGRI', target: SEAT_DAY, direction: 'UNFAVORABLE', questionAxis: 'RELATION_STABILITY' }),
    ];
    const rotate = <T>(xs: T[], k: number): T[] => [...xs.slice(k), ...xs.slice(0, k)];
    const shape = (ps: ReasonedProposition[]) => {
      const v = run(ps).verdict;
      return {
        direction: v.direction,
        primary: v.primaryConclusion,
        headline: [...v.headlinePropositionIds].sort(),
        props: [...new Set(v.propositions.map((p) =>
          [p.derivationRule, p.target.key, p.direction, p.restriction ?? '-', p.temporalScope, p.assertion].join('|')))].sort(),
      };
    };
    const base = shape(props);
    for (const o of [[...props].reverse(), rotate(props, 1), rotate(props, 2), [props[2], props[0], props[3], props[1]]]) {
      expect(shape(o)).toEqual(base);
    }
  });
});

// ══ §11-5 — SUPPORT IS ASSERTION-RELATIVE ═══════════════════════════════════════════════════════
describe('§3 — DIRECTION_VS_EXECUTION cites its obstruction as SUPPORT', () => {
  const open = premise({
    target: SEAT, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '큰 흐름이 이 자리와 맞물린다.',
  });
  const strike = premise({
    target: SEAT, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 이 자리를 흔든다.',
  });

  it('the strikes SUPPORT "direction open but execution obstructed" — they establish its second half', () => {
    const dve = runDerivations(MYUNGRI_RULES, [open, strike], primitivePropositions([open, strike], ctx), ctx)
      .find((p) => p.derivationRule === 'DIRECTION_VS_EXECUTION')!;
    // V4D filed the strikes under `oppose` because their real-world valence is negative — blind polarity
    // mapping. The compound's own evidence was reported as the material arguing against it.
    expect(dve.supportingPremiseIds).toContain(open.id);
    expect(dve.supportingPremiseIds).toContain(strike.id);
    expect(dve.opposingPremiseIds).toEqual([]);
    // and the load-bearing structure is declared: the opening is REQUIRED, the strikes substitute
    expect(dve.supportGroups?.map((g) => g.role).sort()).toEqual(['ALTERNATIVE', 'REQUIRED']);
  });
});

// ══ §11-6 — ADEQUACY IS A PROPERTY OF A PREMISE, NOT A FEATURE UNION ════════════════════════════
describe('§4 — DIRECT and EXACT cannot be synthesized from two different premises', () => {
  const directButReduced = premise({
    target: SEAT, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: 'a', applicability: 'DIRECT', reliability: 'REDUCED',
  });
  const exactButBackground = premise({
    target: SEAT, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: 'b', applicability: 'BACKGROUND', reliability: 'EXACT',
  });

  it('DIRECT-from-A plus EXACT-from-B is THIN, not ADEQUATE', () => {
    // V4D asked the two questions independently over the whole side, so a quality no single grounded support
    // had was manufactured by union.
    expect(sideAdequacy([directButReduced, exactButBackground])).toBe('THIN');
  });

  it('one premise that is both DIRECT and EXACT is what makes a side ADEQUATE', () => {
    const both = premise({
      target: SEAT, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: 'c', applicability: 'DIRECT', reliability: 'EXACT',
    });
    expect(sideAdequacy([both])).toBe('ADEQUATE');
    expect(sideAdequacy([directButReduced, exactButBackground, both])).toBe('ADEQUATE');
    expect(sideAdequacy([])).toBe('NONE');
  });
});

// ══ §11-7 / §11-8 / §11-9 — EXTENSION FAILS CLOSED ══════════════════════════════════════════════
describe('§5 — a refinement whose extension fails never becomes a fresh reading', () => {
  it('refinementFailure preserves the graph, the instant, and every judgment — and declines', () => {
    const g1 = {
      question: '사업을 확장할까?', questionDomain: 'OPPORTUNITY', questionIntent: 'DECISION',
      evaluatedAtEpochSeconds: 1_700_000_000, asksTiming: false,
      premises: [], propositions: [prop({ discipline: 'MYUNGRI', target: SEAT, direction: 'FAVORABLE' })],
      primaryConclusion: '열려 있습니다.', headlinePropositionIds: [], direction: 'FOR',
      disciplineJudgments: [MYUNGRI_SPOKE],
    } as unknown as CrossDivinationVerdict;
    const failed = refinementFailure(g1, 'MONEY_INFLOW');
    // The original graph and its clock are untouched — that is what "fail closed" means here.
    expect(failed.propositions).toBe(g1.propositions);
    expect(failed.premises).toBe(g1.premises);
    expect(failed.evaluatedAtEpochSeconds).toBe(1_700_000_000);
    expect(failed.question).toBe('사업을 확장할까?');
    expect(failed.disciplineJudgments).toBe(g1.disciplineJudgments);
    // …and the answer is a controlled decline on the asked axis, never a fresh primary conclusion.
    expect(failed.questionDomain).toBe('MONEY_INFLOW');
    expect(failed.direction).toBe('INSUFFICIENT_EVIDENCE');
    expect(failed.headlinePropositionIds).toEqual([]);
    expect(failed.primaryConclusion).toContain('앞선 판정');
  });

  it('the production catch uses refinementFailure(restored) — the fresh primary graph is not the fallback', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/features/chat/server/buildServerConsultation.ts'), 'utf8') as string;
    const catchBlock = src.slice(src.indexOf('graphExtended = true;'), src.indexOf('const priorAxisContext'));
    expect(catchBlock).toContain('refinementFailure(restored');
    // the V4D fail-open shape — a catch that only records the flag and keeps the fresh verdict — is gone
    expect(catchBlock).not.toMatch(/catch \{\s*graphExtended = false;\s*\}/);
  });
});

// ══ §11-10 — A PRIOR CROSS OUTPUT CANNOT AMPLIFY ════════════════════════════════════════════════
describe('§6 — a previous CROSS synthesis never re-enters derivation as discipline evidence', () => {
  it('a CROSS node paired with a discipline node derives NOTHING', () => {
    const crossNode = prop({
      discipline: 'CROSS', target: SEAT, direction: 'FAVORABLE', derivationRule: 'CROSS_REINFORCEMENT',
      derivedFromPropositionIds: ['x1', 'x2'],
    });
    const disciplineNode = prop({ discipline: 'ZIWEI', target: SEAT, direction: 'FAVORABLE' });
    // Before the guard this pair classified as cross-discipline REINFORCING — a synthesis corroborating with
    // its own inputs' sibling, then feeding the NEXT extension as though it were independent evidence.
    expect(deriveCross([crossNode, disciplineNode], [], crossCtx)).toEqual([]);
  });

  it('an extension of a graph carrying CROSS conclusions mints no derivation FROM them', () => {
    const m = prop({ discipline: 'MYUNGRI', target: SEAT, direction: 'FAVORABLE', questionAxis: 'MONEY_INFLOW' });
    const z = prop({ discipline: 'ZIWEI', target: SEAT_DAY, direction: 'FAVORABLE', questionAxis: 'MONEY_INFLOW' });
    const priorCross = prop({
      discipline: 'CROSS', target: SEAT, direction: 'FAVORABLE', questionAxis: 'OPPORTUNITY',
      derivationRule: 'CROSS_REINFORCEMENT', derivedFromPropositionIds: [m.id, z.id],
    });
    const g1 = {
      question: 'q', questionDomain: 'OPPORTUNITY', questionIntent: 'DECISION',
      evaluatedAtEpochSeconds: 1, asksTiming: false, premises: [],
      propositions: [m, z, priorCross], primaryConclusion: 'c', headlinePropositionIds: [priorCross.id],
      direction: 'FOR', disciplineJudgments: [MYUNGRI_SPOKE],
    } as unknown as CrossDivinationVerdict;
    const extended = extendGraph(g1, 'MONEY_INFLOW', 'DECISION', false);
    // whatever the extension derived, none of it cites the prior CROSS node as a parent
    for (const p of extended.propositions) {
      if (p.id === priorCross.id) continue;
      expect(p.derivedFromPropositionIds).not.toContain(priorCross.id);
    }
  });
});

// ══ §11-11 — SEMANTIC MALFORMATION FAILS CLOSED ═════════════════════════════════════════════════
describe('§7 — a graph that asserts what the kernel could never produce is rejected whole', () => {
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
    disciplineJudgments: [{
      discipline: 'MYUNGRI', stance: 'FOR', applicable: true, dataReliability: 'EXACT',
      questionDomain: 'CAREER', temporalScope: 'DAEWOON', dominantConclusion: 'c', dominantFactor: 'f',
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
  const mutated = (f: (g: ReturnType<typeof good>) => void) => {
    const g = good();
    f(g);
    return parseDivinationVerdict(JSON.parse(JSON.stringify(g)));
  };

  it('the intact graph restores (control)', () => {
    expect(parseDivinationVerdict(good())).toBeDefined();
  });

  it('a restriction on a non-RESTRICTED direction is a contradiction in terms', () => {
    expect(mutated((g) => { (g.propositions[0] as Record<string, unknown>).restriction = 'TIMING'; })).toBeUndefined();
  });

  it('a CROSS rule on a discipline proposition (and the reverse) was never minted by any reasoner', () => {
    expect(mutated((g) => { (g.propositions[0] as Record<string, unknown>).derivationRule = 'CROSS_TIMING_SPLIT'; })).toBeUndefined();
    expect(mutated((g) => { (g.propositions[0] as Record<string, unknown>).discipline = 'CROSS'; })).toBeUndefined();
  });

  it('a derived conclusion with no ancestry — or a PRIMITIVE with ancestry — cannot exist', () => {
    expect(mutated((g) => { (g.propositions[0] as Record<string, unknown>).derivationRule = 'CONTESTED_SHARE'; })).toBeUndefined();
    expect(mutated((g) => {
      g.propositions.push({ ...g.propositions[0], id: 'x2', derivedFromPropositionIds: ['x1'] });
    })).toBeUndefined();
  });

  it('adequacy must agree with the cited inputs: an empty side has NO adequacy, a cited side has some', () => {
    expect(mutated((g) => {
      (g.propositions[0].adequacy as Record<string, unknown>).counterAdequacy = 'THIN'; // no opposing cited
    })).toBeUndefined();
    expect(mutated((g) => {
      (g.propositions[0].adequacy as Record<string, unknown>).supportAdequacy = 'NONE'; // support IS cited
    })).toBeUndefined();
  });

  it('a premise about another person never supports this person\'s conclusion', () => {
    expect(mutated((g) => { (g.premises[0] as Record<string, unknown>).subject = '상대'; })).toBeUndefined();
  });
});
