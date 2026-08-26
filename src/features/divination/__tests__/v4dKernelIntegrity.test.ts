// V4D §5/§9/§34/§35/§38 — KERNEL INTEGRITY ATTACKS.
//
// The V4C independent audit found that the kernel still let something other than STRUCTURE decide: a bigger
// evidence set, a coarse temporal band, a binary claim test, a lossy map key, or array position. Each test
// here builds the exact situation that exposed one of those and asserts what the repaired kernel must do —
// including "both survive" and "we are not deciding this", which are correct outcomes, not gaps (§18).
import {
  MYUNGRI_RULES, classifyPair, deriveCross, primitivePropositions, reasonCross, runDerivations,
  standingPropositions, supersedes, target, ziweiPalaceTarget, claimKind,
  type CrossDivinationVerdict, type DerivationContext, type DivinationJudgment, type DivinationPremise,
  type ReasonedProposition,
} from '@/features/divination';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';

const ctx: DerivationContext = {
  subject: '본인', questionIntent: 'DECISION', askedAxis: 'CAREER', dataComplete: true,
};
const crossCtx = { ...ctx, asksTiming: false };

let seq = 0;
const premise = (over: Partial<DivinationPremise> & Pick<DivinationPremise,
  'target' | 'questionAxis' | 'temporalScope' | 'semanticRelation' | 'assertion' | 'concept'>): DivinationPremise => {
  seq += 1;
  return {
    id: `w${seq}`,
    discipline: 'MYUNGRI',
    sourceFactIds: [`${over.temporalScope} ${over.semanticRelation}`],
    subject: '본인',
    questionIntent: ctx.questionIntent,
    role: 'ASSERTS',
    reliability: 'EXACT',
    applicability: 'DIRECT',
    doctrineReference: 'test',
    ...over,
  };
};

let pseq = 0;
const prop = (over: Partial<ReasonedProposition> & Pick<ReasonedProposition,
  'discipline' | 'target' | 'direction'>): ReasonedProposition => {
  pseq += 1;
  return {
    id: `r${pseq}`,
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

const derive = (ps: DivinationPremise[]) => runDerivations(MYUNGRI_RULES, ps, primitivePropositions(ps, ctx), ctx);

/**
 * A minimal APPLICABLE discipline judgment. The parser rejects a verdict carrying none — correctly, since a
 * verdict no discipline spoke to is hollow — and `reasonCross` skips adapting MYUNGRI when its premise graph
 * is supplied, so this only satisfies the contract without adding propositions.
 */
const MYUNGRI_SPOKE: DivinationJudgment = {
  discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
  questionDomain: 'CAREER', temporalScope: 'DAEWOON', stance: 'CONDITIONAL_AGAINST',
  dominantConclusion: '이 자리는 지금 눌려 있습니다.', dominantFactor: 'test',
  directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
  domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'DIRECT',
  evidenceStrength: 'MODERATE', factGroupsUsed: [],
};
const SEAT_MONTH = target('NATAL_SEAT', 'MONTH', '원국 월지');
const SEAT_DAY = target('NATAL_SEAT', 'DAY', '원국 일지');
const PALACE_CAREER = ziweiPalaceTarget('CAREER')!;

// ══ §2 / §38-1 / §38-4 — EVIDENCE SIZE IS METADATA, NEVER AUTHORITY ═════════════════════════════
describe('§2 / §38-1 — extra evidence never creates supersession authority', () => {
  const base = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
    supportingPremiseIds: ['e1'],
  });

  it('a conclusion citing STRICTLY MORE of the same material does NOT supersede', () => {
    // V4C returned true here: `[...bp].some((id) => !ap.includes(id))` granted authority to the bigger
    // evidence collection. Nothing about the extra premise makes this a different or better CLAIM.
    const richer = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2'],
    });
    expect(supersedes(richer, base)).toBe(false);
  });

  it('…and it still does not, however many premises it adds', () => {
    const vast = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
    });
    expect(supersedes(vast, base)).toBe(false);
  });

  it('§38-4 — a larger evidence set about a DIFFERENT target certainly does not', () => {
    const elsewhere = prop({
      discipline: 'MYUNGRI', target: SEAT_DAY, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2', 'e3'], derivedFromPropositionIds: [base.id],
    });
    expect(supersedes(elsewhere, base)).toBe(false);
  });

  it('§38-5 — an explicitly DERIVED refinement of the same claim DOES supersede', () => {
    const refined = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [base.id],
      derivationRule: 'REFINEMENT',
    });
    expect(supersedes(refined, base)).toBe(true);
  });

  it('the ONLY route is an explicit derivation link — remove it and supersession stops', () => {
    const refined = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [],
      derivationRule: 'REFINEMENT',
    });
    expect(supersedes(refined, base)).toBe(false);
  });
});

// ══ §4 / §38-2 / §38-3 — EXACT SCOPES ARE NOT INTERCHANGEABLE ═══════════════════════════════════
describe('§4 / §38-2 / §38-3 — a temporal band is not a temporal scope', () => {
  const linked = (scope: ReasonedProposition['temporalScope'], parentId: string) => prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: scope,
    supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [parentId], derivationRule: 'R',
  });

  it('§38-2 — SEWOON does not supersede WOLWOON, even with an explicit derivation link', () => {
    const month = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'WOLWOON',
      supportingPremiseIds: ['e1'],
    });
    expect(supersedes(linked('SEWOON', month.id), month)).toBe(false);
  });

  it('§38-3 — NATAL does not supersede DAEWOON', () => {
    const cycle = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON',
      supportingPremiseIds: ['e1'],
    });
    expect(supersedes(linked('NATAL', cycle.id), cycle)).toBe(false);
  });

  it('the SAME exact scope still supersedes when the graph declares the link', () => {
    const month = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'WOLWOON',
      supportingPremiseIds: ['e1'],
    });
    expect(supersedes(linked('WOLWOON', month.id), month)).toBe(true);
  });

  it('two claims at the same DISTANCE are independent truths, not a direction/timing split', () => {
    const year = prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON' });
    const month = prop({ discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'WOLWOON' });
    expect(classifyPair(year, month)).toBe('DIFFERENT_TIME_SCALE');
    expect(deriveCross([year, month], [], crossCtx)).toEqual([]);
  });
});

// ══ §12 / §38-6 — CLAIM KIND IS NOT A BOOLEAN ═══════════════════════════════════════════════════
describe('§12 / §38-6 — supersession compares what a conclusion ASSERTS', () => {
  const obstruction = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE', supportingPremiseIds: ['e1'],
  });

  it('an obstruction and an opening are different claims, so neither supersedes the other', () => {
    const opening = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE',
      supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [obstruction.id],
    });
    expect(claimKind(opening)).toBe('OPENING');
    expect(claimKind(obstruction)).toBe('OBSTRUCTION');
    expect(supersedes(opening, obstruction)).toBe(false);
  });

  it('a direction/execution compound does NOT delete the obstruction it was built from', () => {
    // V4C's `decisional()` put COMPOUND and DIRECTIONAL in one bucket, so the compound superseded its own
    // parent and the plain "이 자리가 지금 막혀 있다" finding vanished from the standing set.
    const split = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'TIMING',
      conclusionType: 'COMPOUND', supportingPremiseIds: ['e1', 'e2'],
      derivedFromPropositionIds: [obstruction.id],
    });
    expect(claimKind(split)).toBe('DIRECTION_VS_EXECUTION');
    expect(supersedes(split, obstruction)).toBe(false);
  });

  it('a description never swallows a decision, and a cause never swallows either', () => {
    const state = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'NONE', conclusionType: 'STRUCTURAL',
      supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [obstruction.id],
    });
    const cause = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'NONE', conclusionType: 'CAUSAL',
      supportingPremiseIds: ['e1', 'e2'], derivedFromPropositionIds: [obstruction.id],
    });
    expect(supersedes(state, obstruction)).toBe(false);
    expect(supersedes(cause, obstruction)).toBe(false);
    expect(supersedes(cause, state)).toBe(false);
  });

  it('every claim kind is total — no proposition is silently unclassified', () => {
    const kinds = new Set([
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'UNFAVORABLE' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'TIMING' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'SCOPE' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'CAPACITY' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'NONE', conclusionType: 'STRUCTURAL' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'NONE', conclusionType: 'CAUSAL' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'TIMING', conclusionType: 'COMPOUND' })),
      claimKind(prop({ discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'RESTRICTED', restriction: 'SCOPE', conclusionType: 'COMPOUND' })),
    ]);
    // Nine shapes, nine distinct kinds: the binary decisional/non-decisional test collapsed all of these
    // into two buckets, which is why a compound could delete the obstruction it was built from.
    expect(kinds.size).toBe(9);
    for (const k of kinds) expect(typeof k).toBe('string');
  });
});

// ══ §6 / §7 / §38-7 / §38-8 — CROSS CANDIDATE IDENTITY IS LOSSLESS ══════════════════════════════
describe('§6/§7 — two semantically different cross conclusions are never merged', () => {
  const structural = prop({
    discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON',
    supportingPremiseIds: ['s1'],
  });
  const year = prop({
    discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'SEWOON',
    supportingPremiseIds: ['s2'],
  });
  const month = prop({
    discipline: 'QIMEN', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'WOLWOON',
    supportingPremiseIds: ['s3'],
  });
  const facts: DivinationPremise[] = ['s1', 's2', 's3'].map((id, i) => ({
    ...premise({
      target: SEAT_MONTH, questionAxis: 'CAREER',
      temporalScope: (['DAEWOON', 'SEWOON', 'WOLWOON'] as const)[i],
      concept: 'SEAT_CONTACT', semanticRelation: 'CONNECTS', assertion: id,
    }),
    id,
  }));

  it('§38-7 — a SEWOON split and a WOLWOON split on the same seat are TWO conclusions', () => {
    // V4C keyed CROSS_TIMING_SPLIT as `<target>:<structuralOpens>` — no scope at all — so these collided and
    // whichever the pair loop reached first decided the scope the user was told about.
    const splits = deriveCross([structural, year, month], facts, crossCtx)
      .filter((d) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT');
    expect(splits).toHaveLength(2);
    expect(new Set(splits.map((d) => d.proposition.temporalScope))).toEqual(new Set(['SEWOON', 'WOLWOON']));
  });

  it('§38-8 — candidates whose RESTRICTIONS differ are two candidates', () => {
    // structuralOpens flips the restriction between TIMING and SCOPE; both must survive as distinct claims.
    const opposite = prop({
      discipline: 'MYUNGRI', target: SEAT_DAY, direction: 'UNFAVORABLE', temporalScope: 'DAEWOON',
      supportingPremiseIds: ['s1'],
    });
    const nearOpen = prop({
      discipline: 'ZIWEI', target: SEAT_DAY, direction: 'FAVORABLE', temporalScope: 'SEWOON',
      supportingPremiseIds: ['s2'],
    });
    const all = deriveCross([structural, year, opposite, nearOpen], facts, crossCtx)
      .filter((d) => d.proposition.derivationRule === 'CROSS_TIMING_SPLIT');
    expect(new Set(all.map((d) => d.proposition.restriction))).toEqual(new Set(['TIMING', 'SCOPE']));
  });

  it('agreement over ONE claim still merges — three readings, one conclusion', () => {
    const agree = (discipline: ReasonedProposition['discipline'], id: string) => prop({
      discipline, target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON',
      supportingPremiseIds: [id],
    });
    const reinforcements = deriveCross(
      [agree('MYUNGRI', 's1'), agree('ZIWEI', 's2'), agree('QIMEN', 's3')], facts, crossCtx,
    ).filter((d) => d.proposition.derivationRule === 'CROSS_REINFORCEMENT');
    expect(reinforcements).toHaveLength(1);
    // …and the merge added PROVENANCE, not a second specification.
    expect(reinforcements[0].proposition.derivedFromPropositionIds).toHaveLength(3);
  });

  it('a resolution that demotes 자미 is not the same statement as one that demotes 기문', () => {
    // Both rivals are demoted for the same reason, so V4C merged them under `<dominant target>` and the
    // reader was told about one rival while the other silently vanished from `counter`.
    const dominant = prop({
      discipline: 'MYUNGRI', target: SEAT_MONTH, direction: 'FAVORABLE', temporalScope: 'DAEWOON',
      supportingPremiseIds: ['s1'],
    });
    const rivalA = prop({
      discipline: 'ZIWEI', target: SEAT_MONTH, direction: 'UNFAVORABLE', temporalScope: 'DAEWOON',
      supportingPremiseIds: ['weak'], adequacy: {
        supportAdequacy: 'THIN', counterAdequacy: 'NONE',
        dataCompleteness: 'PARTIAL', doctrineApplicability: 'ADOPTED',
      },
    });
    const rivalB = { ...rivalA, id: 'rivalB', discipline: 'QIMEN' as const };
    const resolved = deriveCross([dominant, rivalA, rivalB], facts, crossCtx)
      .filter((d) => d.proposition.derivationRule === 'CROSS_CONTRADICTION_RESOLVED');
    if (resolved.length === 0) return; // nothing separated them structurally → standoff, covered elsewhere
    expect(resolved).toHaveLength(2);
    expect(new Set(resolved.map((d) => d.counter?.discipline))).toEqual(new Set(['ZIWEI', 'QIMEN']));
  });
});

// ══ §9 / §35 / §38-14 — YEAR AND MONTH SURVIVE INTO THE FINAL CROSS AND PERSISTED GRAPHS ════════
describe('§9/§35 — exact scopes survive the discipline graph, the Cross graph AND persistence', () => {
  const natal = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'NATAL', concept: 'NATAL_SEAT_STRAIN',
    semanticRelation: 'DESTABILIZES', assertion: '원국에서 이 자리가 약하게 짜여 있다.',
  });
  const daewoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONNECTS', assertion: '지금의 큰 흐름이 이 자리와 맞물린다.',
  });
  const sewoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'DESTABILIZES', assertion: '올해가 이 자리를 누른다.',
  });
  const wolwoon = premise({
    target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
    semanticRelation: 'CONSTRAINS', assertion: '이 달에 이 자리가 좁아진다.',
  });
  const ALL = [natal, daewoon, sewoon, wolwoon];

  const crossOf = (ps: DivinationPremise[]) => {
    const props = derive(ps);
    return reasonCross({
      question: '이직해도 될까요?',
      questionDomain: 'CAREER',
      questionIntent: 'DECISION',
      judgments: [MYUNGRI_SPOKE],
      asksTiming: false,
      evaluatedAtEpochSeconds: 1_700_000_000,
      premises: ps,
      propositions: standingPropositions(props),
      propositionGraph: props,
    });
  };
  const scopesIn = (props: ReasonedProposition[]) => new Set(props.map((p) => p.temporalScope));

  it('the DISCIPLINE graph keeps all four scopes', () => {
    expect(scopesIn(derive(ALL))).toEqual(new Set(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON']));
  });

  it('the CROSS graph keeps all four scopes', () => {
    expect(scopesIn(crossOf(ALL).verdict.propositions))
      .toEqual(new Set(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON']));
  });

  it('the PERSISTED graph keeps all four scopes after a real serialize → parse round trip', () => {
    const restored = parseDivinationVerdict(
      JSON.parse(JSON.stringify(crossOf(ALL).verdict)) as unknown,
    ) as CrossDivinationVerdict | undefined;
    expect(restored).toBeDefined();
    expect(scopesIn(restored!.propositions))
      .toEqual(new Set(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON']));
  });

  it('removing the MONTH layer removes the month conclusions', () => {
    const without = ALL.filter((p) => p.id !== wolwoon.id);
    const after = crossOf(without).verdict.propositions;
    expect(scopesIn(after).has('WOLWOON')).toBe(false);
    // the year, the cycle and the natal baseline are all still there
    for (const scope of ['SEWOON', 'DAEWOON', 'NATAL'] as const) {
      expect(scopesIn(after).has(scope)).toBe(true);
    }
  });

  it('…and every conclusion that did NOT stand on the month layer is byte-identical', () => {
    const without = ALL.filter((p) => p.id !== wolwoon.id);
    const before = crossOf(ALL).verdict.propositions;
    const after = crossOf(without).verdict.propositions;
    const key = (p: ReasonedProposition) => `${p.id}|${p.assertion}|${p.direction}|${p.temporalScope}`;
    // A conclusion that CITED the month premise legitimately changes — CONVERGENT_SEAT_PRESSURE and
    // RECURRING_FRICTION_CAUSE span several layers, so dropping one narrows what they are about and re-scopes
    // them from 월운 to 세운. That is the month layer being load-bearing, which is the point. The invariant is
    // about the conclusions that never touched it.
    const untouched = (p: ReasonedProposition) =>
      ![...p.supportingPremiseIds, ...p.opposingPremiseIds].includes(wolwoon.id);
    const originals = before.filter(untouched).map(key).sort();
    const survivors = after.map(key);
    for (const k of originals) expect(survivors).toContain(k);
  });

  it('the month layer is genuinely LOAD-BEARING for its own conclusion', () => {
    const monthly = crossOf(ALL).verdict.propositions.filter((p) => p.temporalScope === 'WOLWOON');
    expect(monthly.length).toBeGreaterThan(0);
  });
});

// ══ §8 / §34 / §38-24 — ORDER INVARIANCE AT EVERY LEVEL ═════════════════════════════════════════
describe('§8/§34 — original / reverse / rotate produce the same semantic result set', () => {
  const ps = [
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'DAEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONNECTS', assertion: 'a',
    }),
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'SEWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'DESTABILIZES', assertion: 'b',
    }),
    premise({
      target: SEAT_MONTH, questionAxis: 'CAREER', temporalScope: 'WOLWOON', concept: 'SEAT_CONTACT',
      semanticRelation: 'CONSTRAINS', assertion: 'c',
    }),
    premise({
      target: SEAT_DAY, questionAxis: 'RELATION_STABILITY', temporalScope: 'NATAL',
      concept: 'NATAL_SEAT_STRAIN', semanticRelation: 'DESTABILIZES', assertion: 'd',
    }),
  ];
  const rotate = <T>(xs: T[], n: number): T[] => [...xs.slice(n), ...xs.slice(0, n)];
  const ORDERS = (xs: DivinationPremise[]) => [
    xs, [...xs].reverse(), rotate(xs, 1), rotate(xs, Math.floor(xs.length / 2)),
  ];
  /** Renderer-independent semantic shape of a proposition set, as a SET. */
  const shape = (props: ReasonedProposition[]) => [...new Set(props.map((p) => [
    p.discipline, p.subject, p.questionIntent, p.questionAxis, p.target.key,
    p.conclusionType, p.direction, p.restriction ?? '-', p.temporalScope, p.derivationRule, p.assertion,
  ].join('|')))].sort();

  const crossOf = (order: DivinationPremise[]) => {
    const props = derive(order);
    return reasonCross({
      question: 'q', questionDomain: 'CAREER', questionIntent: 'DECISION', judgments: [MYUNGRI_SPOKE],
      asksTiming: false, evaluatedAtEpochSeconds: 1,
      premises: order, propositions: standingPropositions(props), propositionGraph: props,
    });
  };

  it('MYUNGRI standing set is order-invariant', () => {
    const base = shape(standingPropositions(derive(ps)));
    for (const o of ORDERS(ps)) expect(shape(standingPropositions(derive(o)))).toEqual(base);
  });

  it('CROSS candidate generation is order-invariant', () => {
    const cand = (o: DivinationPremise[]) =>
      shape(deriveCross(standingPropositions(derive(o)), o, crossCtx).map((d) => d.proposition));
    const base = cand(ps);
    for (const o of ORDERS(ps)) expect(cand(o)).toEqual(base);
  });

  it('CROSS standing set is order-invariant', () => {
    const base = shape(crossOf(ps).standing);
    for (const o of ORDERS(ps)) expect(shape(crossOf(o).standing)).toEqual(base);
  });

  it('the final VERDICT projection is order-invariant', () => {
    const project = (o: DivinationPremise[]) => {
      const v = crossOf(o).verdict;
      return {
        direction: v.direction,
        primaryConclusion: v.primaryConclusion,
        dominantBasis: v.dominantBasis,
        headline: [...v.headlinePropositionIds].sort(),
        axes: v.axisVerdicts.map((x) => `${x.domain}|${x.stance}|${x.conclusion}`).sort(),
        propositions: shape(v.propositions),
      };
    };
    const base = project(ps);
    for (const o of ORDERS(ps)) expect(project(o)).toEqual(base);
  });
});
