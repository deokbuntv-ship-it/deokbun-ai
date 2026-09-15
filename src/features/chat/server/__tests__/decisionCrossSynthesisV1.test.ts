// DECISION CROSS SYNTHESIS V1 — what three independent judgments of ONE proposition add up to.
//
// These tests lock the two halves of the contract with equal weight. Opposite polarity that has a structural
// explanation (authority, role, time, outcome) is not a contradiction and must not be reported as one; two
// comparable direct judgments that genuinely disagree ARE a contradiction and must not be resolved by
// counting disciplines, ranking schools, or inventing a scale.
//
// Every fixture is SYNTHETIC and hand-built. None is copied from any benchmark.
import { synthesizeDecisionCross } from '@/features/divination';
import type {
  DecisionAssessment, DecisionJudgmentV1, JudgedProposition,
} from '@/features/divination';
import type {
  DataReliability, Discipline, JudgmentDomain, JudgmentEvidence, QuestionDirectness, Stance, TemporalScope,
} from '@/features/divination/contracts';
import type { AxisRole } from '@/features/divination/decisionJudgment';
import { propositionIdOf } from '@/features/divination';

// A single-action career proposition: PRIMARY = CAREER, CONSTRAINT = MOVEMENT.
const PROP: JudgedProposition = {
  kind: 'SHOULD_I_DO_X',
  requestedOutcome: 'DIRECTION',
  bearingAxes: [{ axis: 'CAREER', role: 'PRIMARY' }, { axis: 'MOVEMENT', role: 'CONSTRAINT' }],
  wholeDomain: false,
  options: [],
  optionComparability: 'NOT_A_COMPARISON',
  askedDomain: 'CAREER',
};
const PID = propositionIdOf(PROP);

const ev = (fact: string, domain: JudgmentDomain = 'CAREER'): JudgmentEvidence => ({
  fact, meaning: `${fact}에 대한 근거`, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

const assess = (over: Partial<DecisionAssessment> & { stance: Stance }): DecisionAssessment => ({
  axis: 'CAREER', role: 'PRIMARY', statement: '판단', evidence: [ev('근거')], counterEvidence: [],
  temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT', basis: 'AXIS_SUB_JUDGMENT',
  ...over,
});

const dj = (
  discipline: Discipline,
  over: Partial<DecisionJudgmentV1> = {},
): DecisionJudgmentV1 => ({
  discipline,
  propositionId: PID,
  propositionKind: PROP.kind,
  requestedOutcome: PROP.requestedOutcome,
  applicable: true,
  dataReliability: 'EXACT',
  decisionStance: 'FOR',
  primaryAssessment: assess({ stance: 'FOR' }),
  supportingAssessments: [],
  limitingAssessments: [],
  timingAssessments: [],
  unresolvedReasons: [],
  evidenceIds: ['근거'],
  confidence: 'MEDIUM',
  questionDirectness: 'DIRECT',
  evidenceStrength: 'MODERATE',
  optionComparability: 'NOT_A_COMPARISON',
  provenance: ['deokbunai.decision-judgment.v1'],
  ...over,
});

const synth = (judgments: DecisionJudgmentV1[], proposition: JudgedProposition = PROP) =>
  synthesizeDecisionCross({ proposition, propositionId: propositionIdOf(proposition), judgments });

/** A direct reading of the asked axis, in a given direction. */
const direct = (d: Discipline, stance: Stance, over: Partial<DecisionAssessment> = {}) =>
  dj(d, {
    decisionStance: stance.includes('FOR') ? 'FOR' : 'AGAINST',
    primaryAssessment: assess({ stance, ...over }),
  });

/** A bounded aggregate over the whole life domain, bound to the asked axis. */
const bounded = (d: Discipline, stance: Stance) =>
  dj(d, {
    decisionStance: stance.includes('FOR') ? 'FOR' : 'AGAINST',
    primaryAssessment: assess({ stance, basis: 'DOMAIN_JUDGE', directness: 'ADJACENT' }),
  });

// ════ 1–2. GENUINE AGREEMENT ════════════════════════════════════════════════════════════════════════
describe('independent judgments that point the same way', () => {
  it('1 — two direct same-proposition FOR judgments agree', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), direct('ZIWEI', 'FOR')]);
    expect(s.resolutionKind).toBe('AGREED');
    expect(s.finalStance).toBe('FOR');
    expect(s.primaryJudgments).toHaveLength(2);
    expect(s.conflictPairs).toHaveLength(0);
  });

  it('2 — two direct same-proposition AGAINST judgments agree', () => {
    const s = synth([direct('MYUNGRI', 'AGAINST'), direct('QIMEN', 'AGAINST')]);
    expect(s.resolutionKind).toBe('AGREED');
    expect(s.finalStance).toBe('AGAINST');
  });
});

// ════ 3–4. AUTHORITY — THE V1 DESIGN DECISION ═══════════════════════════════════════════════════════
describe('a bounded domain summary is not an equal counter-vote against a direct reading', () => {
  it('3 — DIRECT_PROPOSITION FOR beside BOUNDED_DOMAIN_SUMMARY AGAINST is not a standoff', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), bounded('ZIWEI', 'AGAINST')]);
    expect(s.resolutionKind).not.toBe('TRUE_STANDOFF');
    expect(s.finalStance).not.toBe('UNRESOLVED');
    // The direct reading decides; the summary stands aside from the decision.
    expect(s.primaryJudgments.map((p) => p.discipline)).toEqual(['MYUNGRI']);
    expect(s.qualifiers.map((p) => p.discipline)).toContain('ZIWEI');
  });

  it('4 — the summary is not deleted: it qualifies the answer and keeps its authority class', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), bounded('ZIWEI', 'AGAINST')]);
    expect(s.resolutionKind).toBe('QUALIFIED');
    expect(s.finalStance).toBe('QUALIFIED_FOR');
    const z = s.participatingJudgments.find((p) => p.discipline === 'ZIWEI')!;
    expect(z.authority).toBe('BOUNDED_DOMAIN_SUMMARY');
    expect(z.direction).toBe('UNFAVORABLE');
    // And when NO direct reading exists, the summary is the best authority there is and does decide.
    const alone = synth([bounded('ZIWEI', 'AGAINST')]);
    expect(alone.primaryJudgments.map((p) => p.discipline)).toEqual(['ZIWEI']);
  });
});

// ════ 5–7. ROLE, OUTCOME AND TIME SPLITS ════════════════════════════════════════════════════════════
describe('opposite polarity across different roles or scopes is not a contradiction', () => {
  it('5 — PRIMARY FOR with a CONSTRAINT AGAINST is qualified, not mechanically unresolved', () => {
    const s = synth([dj('MYUNGRI', {
      primaryAssessment: assess({ stance: 'FOR' }),
      limitingAssessments: [assess({
        axis: 'MOVEMENT', role: 'CONSTRAINT', stance: 'AGAINST',
        evidence: [], counterEvidence: [ev('역마 충', 'MOVEMENT')], statement: '움직임 자체는 걸립니다.',
      })],
    })]);
    expect(s.finalStance).not.toBe('UNRESOLVED');
    expect(['QUALIFIED', 'COMPOUND_MIXED']).toContain(s.resolutionKind);
    expect(s.limitingTruths).toHaveLength(1);
    expect(s.limitingTruths[0].role).toBe('CONSTRAINT');
  });

  it('6 — PRIMARY AGAINST with an OUTCOME FOR is an outcome split, not a polarity reversal', () => {
    const p: JudgedProposition = {
      ...PROP,
      bearingAxes: [{ axis: 'MOVEMENT', role: 'PRIMARY' }, { axis: 'CAREER', role: 'OUTCOME' }],
    };
    const j = dj('MYUNGRI', {
      propositionId: propositionIdOf(p),
      decisionStance: 'AGAINST',
      primaryAssessment: assess({ axis: 'MOVEMENT', stance: 'AGAINST' }),
      supportingAssessments: [assess({
        axis: 'CAREER', role: 'OUTCOME', stance: 'FOR', statement: '옮긴 뒤 자리는 열립니다.',
      })],
    });
    const s = synth([j], p);
    expect(s.resolutionKind).toBe('OUTCOME_SPLIT');
    expect(s.finalStance).toBe('COMPOUND');
    // Both halves survive as stated truths — the direction is NOT flipped to match the outcome.
    expect(s.outcomeQualifications).toHaveLength(1);
    expect(s.primaryJudgments[0].direction).toBe('UNFAVORABLE');
  });

  it('7 — a broad-flow FOR beside a near-term AGAINST is a temporal split', () => {
    const s = synth([
      direct('MYUNGRI', 'FOR', { temporalScope: 'NATAL' as TemporalScope }),
      direct('ZIWEI', 'AGAINST', { temporalScope: 'WOLWOON' as TemporalScope }),
    ]);
    expect(s.resolutionKind).toBe('TEMPORAL_SPLIT');
    expect(s.finalStance).toBe('COMPOUND');
    expect(s.conflictPairs[0].reconciledBy).toBe('TEMPORAL_SCOPE');
  });
});

// ════ 8–9. WHO MAY NOT CREATE A CONFLICT ════════════════════════════════════════════════════════════
describe('non-deciding material cannot decide or manufacture a conflict', () => {
  it('8 — a CONTEXT_ONLY participant neither decides nor creates a conflict', () => {
    const contextOnly = dj('QIMEN', {
      decisionStance: 'UNRESOLVED', primaryAssessment: null, evidenceIds: [],
    });
    const s = synth([direct('MYUNGRI', 'FOR'), contextOnly]);
    expect(s.participatingJudgments.find((p) => p.discipline === 'QIMEN')!.authority).toBe('CONTEXT_ONLY');
    expect(s.primaryJudgments.map((p) => p.discipline)).toEqual(['MYUNGRI']);
    expect(s.qualifiers.some((p) => p.discipline === 'QIMEN')).toBe(false);
    expect(s.conflictPairs).toHaveLength(0);
    expect(s.finalStance).toBe('FOR');
  });

  it('9 — a non-applicable discipline cannot create a conflict', () => {
    const na = dj('QIMEN', {
      applicable: false, decisionStance: 'NOT_APPLICABLE', primaryAssessment: null,
      unresolvedReasons: ['국이 서지 않았습니다.'], evidenceIds: [],
    });
    const s = synth([direct('MYUNGRI', 'AGAINST'), na]);
    expect(s.conflictPairs).toHaveLength(0);
    expect(s.finalStance).toBe('AGAINST');
    expect(s.participatingJudgments.find((p) => p.discipline === 'QIMEN')!.authority).toBe('CONTEXT_ONLY');
  });
});

// ════ 10–12. WHAT MUST STAY A STANDOFF ══════════════════════════════════════════════════════════════
describe('genuine disagreement is neither resolved by counting nor by school', () => {
  it('10 — two comparable direct judgments in opposite directions remain a true standoff', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), direct('ZIWEI', 'AGAINST')]);
    expect(s.resolutionKind).toBe('TRUE_STANDOFF');
    expect(s.finalStance).toBe('UNRESOLVED');
    expect(s.conflictPairs).toHaveLength(1);
    expect(s.conflictPairs[0].reconciledBy).toBeNull();
  });

  it('11 — two-against-one does not become a majority winner', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), direct('QIMEN', 'FOR'), direct('ZIWEI', 'AGAINST')]);
    expect(s.resolutionKind).toBe('TRUE_STANDOFF');
    expect(s.finalStance).toBe('UNRESOLVED');
    // Both conflicting pairs are named — the outvoted side is never silently dropped.
    expect(s.conflictPairs).toHaveLength(2);
  });

  it('12 — no discipline has priority: swapping who holds which stance changes nothing', () => {
    const orders: [Discipline, Discipline][] = [['MYUNGRI', 'ZIWEI'], ['ZIWEI', 'MYUNGRI'], ['QIMEN', 'MYUNGRI'], ['ZIWEI', 'QIMEN']];
    for (const [pro, con] of orders) {
      const s = synth([direct(pro, 'FOR'), direct(con, 'AGAINST')]);
      expect(s.resolutionKind).toBe('TRUE_STANDOFF');
      expect(s.finalStance).toBe('UNRESOLVED');
    }
  });
});

// ════ 13–15. IDENTITY AND DOUBLE COUNTING ═══════════════════════════════════════════════════════════
describe('one contribution is counted once, and only same-proposition judgments participate', () => {
  it('13 — a bounded summary and the sub-axes it aggregates are one contribution, not several', () => {
    const j = dj('ZIWEI', {
      primaryAssessment: assess({ stance: 'FOR', basis: 'DOMAIN_JUDGE', directness: 'ADJACENT' }),
      supportingAssessments: [assess({ axis: 'MOVEMENT', role: 'OUTCOME', stance: 'FOR' })],
    });
    const s = synth([j]);
    // ONE participant for the discipline, and its aggregate names the axes it was built over.
    expect(s.participatingJudgments.filter((p) => p.discipline === 'ZIWEI')).toHaveLength(1);
    const z = s.participatingJudgments[0];
    expect(z.authority).toBe('BOUNDED_DOMAIN_SUMMARY');
    expect(z.derivedFromAxes).toEqual(expect.arrayContaining(['CAREER', 'MOVEMENT']));
    expect(s.primaryJudgments).toHaveLength(1);
  });

  it('14 — a judgment of a sibling proposition cannot enter a same-proposition conflict', () => {
    const sibling: JudgedProposition = {
      ...PROP, bearingAxes: [{ axis: 'MOVEMENT', role: 'PRIMARY' }], askedDomain: 'CHANGE',
    };
    const other = dj('ZIWEI', {
      propositionId: propositionIdOf(sibling),
      decisionStance: 'AGAINST',
      primaryAssessment: assess({ axis: 'MOVEMENT', stance: 'AGAINST' }),
    });
    expect(propositionIdOf(sibling)).not.toBe(PID);
    const s = synth([direct('MYUNGRI', 'FOR'), other]);
    expect(s.participatingJudgments.map((p) => p.discipline)).toEqual(['MYUNGRI']);
    expect(s.conflictPairs).toHaveLength(0);
    expect(s.finalStance).toBe('FOR');
  });

  it('15 — a judgment for a different requestedOutcome is a different proposition and cannot merge', () => {
    const period: JudgedProposition = { ...PROP, kind: 'WHEN_X', requestedOutcome: 'PERIOD' };
    expect(propositionIdOf(period)).not.toBe(PID);
    const s = synth([
      direct('MYUNGRI', 'FOR'),
      dj('ZIWEI', { propositionId: propositionIdOf(period), primaryAssessment: assess({ stance: 'AGAINST' }) }),
    ]);
    expect(s.conflictPairs).toHaveLength(0);
    expect(s.requestedOutcome).toBe('DIRECTION');
  });
});

// ════ 16. ORDERED METADATA, USED ONLY WHERE IT IS ALREADY DECLARED ══════════════════════════════════
describe('reliability and directness settle a conflict only where the contract already orders them', () => {
  it('16 — equal metadata stays a standoff; strict dominance on the declared scales reconciles it', () => {
    // Equal on both declared scales → no ordering exists → the disagreement stands.
    const equal = synth([direct('MYUNGRI', 'FOR'), direct('ZIWEI', 'AGAINST')]);
    expect(equal.resolutionKind).toBe('TRUE_STANDOFF');
    // Strictly better on reliability, no worse on directness → the weaker becomes a qualifier, not a loser
    // chosen by preference. (DataReliability's ordering is declared in contracts.ts.)
    const dominated = synth([
      direct('MYUNGRI', 'FOR'),
      dj('ZIWEI', {
        dataReliability: 'MINIMAL' as DataReliability,
        decisionStance: 'AGAINST',
        primaryAssessment: assess({ stance: 'AGAINST', reliability: 'MINIMAL' as DataReliability }),
      }),
    ]);
    expect(dominated.resolutionKind).not.toBe('TRUE_STANDOFF');
    expect(dominated.conflictPairs[0].reconciledBy).toBe('STRICT_DOMINANCE');
    // A degraded judgment does not erase the direct one merely by existing — the answer survives.
    expect(dominated.finalStance).not.toBe('UNRESOLVED');
  });

  it('16b — a worse-on-one/better-on-the-other pair is NOT strict dominance and stays a standoff', () => {
    const s = synth([
      dj('MYUNGRI', {
        primaryAssessment: assess({ stance: 'FOR', directness: 'ADJACENT' as QuestionDirectness }),
      }),
      dj('ZIWEI', {
        dataReliability: 'REDUCED' as DataReliability,
        decisionStance: 'AGAINST',
        primaryAssessment: assess({ stance: 'AGAINST', reliability: 'REDUCED' as DataReliability }),
      }),
    ]);
    // MYUNGRI is less direct; ZIWEI is less reliable. Neither dominates, so nothing is invented.
    expect(s.resolutionKind).toBe('TRUE_STANDOFF');
  });
});

// ════ 17–19. NOTHING IS INVENTED ════════════════════════════════════════════════════════════════════
describe('the synthesis adds no fact, no relation and no timing', () => {
  it('17 — no timing appears that no judgment supplied', () => {
    const s = synth([direct('MYUNGRI', 'FOR'), direct('ZIWEI', 'FOR')]);
    expect(s.temporalQualifications).toHaveLength(0);
    expect(JSON.stringify(s)).not.toMatch(/\d{4}년|\d+월|\d+일/);
  });

  it('18–19 — every statement and evidence id traces to a judgment that supplied it', () => {
    const supplied = ['정관 통근', '관록궁 화기'];
    const s = synth([
      dj('MYUNGRI', { primaryAssessment: assess({ stance: 'FOR', statement: '자리는 열립니다.', evidence: [ev(supplied[0])] }) }),
      dj('ZIWEI', {
        decisionStance: 'FOR',
        primaryAssessment: assess({ stance: 'FOR', statement: '자리는 열립니다.', evidence: [ev(supplied[1])] }),
      }),
    ]);
    const ids = [
      ...s.supportingTruths, ...s.limitingTruths, ...s.temporalQualifications,
    ].flatMap((t) => t.evidenceIds);
    for (const id of ids) expect(supplied).toContain(id);
    for (const p of s.participatingJudgments) {
      if (p.statement) expect(['자리는 열립니다.', '판단']).toContain(p.statement);
    }
  });
});

// ════ 20–21. A STANDOFF MUST STILL BE USEFUL ════════════════════════════════════════════════════════
describe('an unresolved standoff is structured knowledge, not an empty decline', () => {
  const build = () => synth([
    dj('MYUNGRI', {
      primaryAssessment: assess({ stance: 'FOR', statement: '자리는 열립니다.', evidence: [ev('정관 통근')] }),
      limitingAssessments: [assess({
        axis: 'MOVEMENT', role: 'CONSTRAINT', stance: 'CONDITIONAL_AGAINST',
        statement: '움직임은 좁혀야 합니다.', evidence: [], counterEvidence: [ev('역마 충', 'MOVEMENT')],
      })],
    }),
    dj('ZIWEI', {
      decisionStance: 'AGAINST',
      primaryAssessment: assess({ stance: 'AGAINST', statement: '자리는 막힙니다.', counterEvidence: [ev('관록궁 화기')] }),
    }),
  ]);

  it('20 — both sides keep their own statement and provenance', () => {
    const s = build();
    expect(s.resolutionKind).toBe('TRUE_STANDOFF');
    const said = s.primaryJudgments.map((p) => p.statement);
    expect(said).toEqual(expect.arrayContaining(['자리는 열립니다.', '자리는 막힙니다.']));
    for (const p of s.primaryJudgments) expect(p.evidenceIds.length).toBeGreaterThan(0);
    expect(s.conflictPairs[0].directions).toEqual(['FAVORABLE', 'UNFAVORABLE']);
  });

  it('21 — the standoff still reports what is known, and says why it did not settle', () => {
    const s = build();
    expect(s.limitingTruths.length).toBeGreaterThan(0);
    expect(s.unresolvedReason).toBeTruthy();
    expect(s.participatingJudgments.length).toBe(2);
    // "Cannot judge" is exactly what it must NOT be: the material is all still here.
    expect(s.supportingTruths.length + s.limitingTruths.length).toBeGreaterThan(0);
  });
});

// ════ 22. PRIOR INVARIANTS ══════════════════════════════════════════════════════════════════════════
describe('previous safety invariants hold', () => {
  it('22 — a non-direction request is never run through directional conflict resolution', () => {
    const descriptive: JudgedProposition = { ...PROP, kind: 'WHAT_AM_I', requestedOutcome: 'DESCRIPTION' };
    const s = synth([
      dj('MYUNGRI', { propositionId: propositionIdOf(descriptive), requestedOutcome: 'DESCRIPTION', decisionStance: 'DESCRIPTIVE' }),
      dj('ZIWEI', {
        propositionId: propositionIdOf(descriptive), requestedOutcome: 'DESCRIPTION', decisionStance: 'DESCRIPTIVE',
        primaryAssessment: assess({ stance: 'AGAINST' }),
      }),
    ], descriptive);
    expect(s.resolutionKind).toBe('NON_DIRECTIONAL');
    expect(s.conflictPairs).toHaveLength(0);
    expect(s.primaryJudgments).toHaveLength(0);
  });

  it('22b — nothing at all to decide on is reported as such, never as a standoff', () => {
    const s = synth([dj('MYUNGRI', { primaryAssessment: null, decisionStance: 'UNRESOLVED', evidenceIds: [] })]);
    expect(s.resolutionKind).toBe('NO_APPLICABLE_JUDGMENT');
    expect(s.finalStance).toBe('UNRESOLVED');
    expect(s.unresolvedReason).toBeTruthy();
  });
});

// ════ LIVE PATH ═════════════════════════════════════════════════════════════════════════════════════
describe('the synthesis is reachable on the real paid path, and changes no verdict', () => {
  it('a real three-engine turn attaches the synthesis, and the verdict direction is untouched by it', async () => {
    const { createHash } = await import('crypto');
    const { buildConsultationGrounding } = await import('@/features/chat/services/consultationGrounding');
    const { clearZiweiCache } = await import('@/features/ziwei');
    const { clearQimenCache } = await import('@/features/qimen');
    const { judgeCross } = await import('@/features/divination');
    clearZiweiCache(); clearQimenCache();
    const draft = {
      subject: { id: 's1', displayName: '테스트', relationship: null },
      birthInfo: {
        displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
        birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact',
        birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
      },
    } as never;
    const g = await buildConsultationGrounding(draft, {
      digestProvider: { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } },
      nowEpochSeconds: Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000),
    }, '지금 다니는 곳을 그만두고 다른 데로 옮겨도 될까요?');
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    const v = g.divinationVerdict!;
    expect(v.decisionCrossSynthesis).toBeTruthy();
    const s = v.decisionCrossSynthesis!;
    expect(s.propositionId).toBeTruthy();
    // Every participant is one of the three disciplines, once.
    expect(new Set(s.participatingJudgments.map((p) => p.discipline)).size)
      .toBe(s.participatingJudgments.length);
    // THIS VERSION IS STRUCTURED DATA ONLY. Re-judging without the synthesis must reach the same direction,
    // so the graph remains the sole verdict authority and the restore path re-derives exactly what it did.
    const reJudged = judgeCross({
      question: v.question, questionDomain: v.questionDomain, subject: '테스트',
      judgments: v.disciplineJudgments, asksTiming: v.asksTiming, questionIntent: v.questionIntent,
      decidingAxes: v.decidingAxes, evaluatedAtEpochSeconds: v.evaluatedAtEpochSeconds,
    });
    expect(reJudged.direction).toBe(v.direction);
  });
});
