// CROSS DIVINATION JUDGE V1 (consultation layer) — synthesizes already-computed Myungri/Ziwei/Qimen
// consultation-domain results for the SAME routed domain into one compound proposition-level verdict.
// `judgeCrossConsultation` is a PURE function over already-typed `DomainJudgeResult`/`QimenDomainJudgeResult`
// objects (no chart/board/astrology involved), so fixtures here are literal, correctly-shaped result
// objects — exactly the same testing discipline already used for `consultationJudgeCore.ts`'s own
// `combineStatus` (tested indirectly via each discipline's consultation-judge suite, never via fabricated
// astrology). No score/vote/weight field exists anywhere in the type — every assertion here checks
// categorical status (FAVORABLE/CAUTION/MIXED/UNRESOLVED) and structured evidence, never a number.
import {
  judgeCrossConsultation,
  CROSS_CONSULTATION_JUDGE_V1_METHOD,
  type CrossConsultationJudgeInput,
} from '../crossConsultationJudge';
import type { DomainJudgeResult, DomainJudgeStatus, SyntheticInference } from '../consultationJudgeTypes';
import type { QimenDomainJudgeResult, QimenConsultationDomain } from '../qimenConsultationJudge';
import type { JudgmentEvidence, TemporalScope } from '../contracts';

const ev = (fact: string, meaning: string, domain: JudgmentEvidence['domain'], temporalScope: TemporalScope): JudgmentEvidence => ({
  fact, meaning, domain, temporalScope, directness: 'ADJACENT',
});

function domainResult(opts: {
  domain?: QimenConsultationDomain;
  status?: DomainJudgeStatus;
  supportingEvidence?: JudgmentEvidence[];
  counterEvidence?: JudgmentEvidence[];
  syntheticInferences?: SyntheticInference[];
  temporalDrivers?: string[];
  uncertaintyReasons?: string[];
  reasoningRuleIds?: string[];
  conclusion?: string;
} = {}): DomainJudgeResult {
  const supportingEvidence = opts.supportingEvidence ?? [];
  const counterEvidence = opts.counterEvidence ?? [];
  const status = opts.status
    ?? (supportingEvidence.length && counterEvidence.length ? 'MIXED' : supportingEvidence.length ? 'FAVORABLE' : counterEvidence.length ? 'CAUTION' : 'UNRESOLVED');
  return {
    domain: (opts.domain ?? 'BUSINESS') as DomainJudgeResult['domain'],
    status,
    conclusion: opts.conclusion ?? 'test conclusion',
    supportingEvidence,
    counterEvidence,
    syntheticInferences: opts.syntheticInferences ?? [],
    structuralDrivers: [],
    yongshinRelevance: [],
    temporalDrivers: opts.temporalDrivers ?? [],
    risks: [],
    opportunities: [],
    uncertaintyReasons: opts.uncertaintyReasons ?? [],
    reasoningRuleIds: opts.reasoningRuleIds ?? [],
    provenance: ['deokbunai.myungri-consultation-judge.v1'],
  };
}

function qimenResult(opts: {
  domain?: QimenConsultationDomain;
  status?: DomainJudgeStatus;
  supportingEvidence?: JudgmentEvidence[];
  counterEvidence?: JudgmentEvidence[];
  uncertaintyReasons?: string[];
  conclusion?: string;
} = {}): QimenDomainJudgeResult {
  const supportingEvidence = opts.supportingEvidence ?? [];
  const counterEvidence = opts.counterEvidence ?? [];
  const status = opts.status
    ?? (supportingEvidence.length && counterEvidence.length ? 'MIXED' : supportingEvidence.length ? 'FAVORABLE' : counterEvidence.length ? 'CAUTION' : 'UNRESOLVED');
  return {
    domain: opts.domain ?? 'BUSINESS',
    status,
    subjectTarget: null,
    objectTarget: null,
    conclusion: opts.conclusion ?? 'test qimen conclusion',
    supportingEvidence,
    counterEvidence,
    syntheticInferences: [],
    targetRelations: [],
    opportunities: [],
    risks: [],
    timingDrivers: [],
    uncertaintyReasons: opts.uncertaintyReasons ?? [],
    ruleIds: [],
    provenance: ['deokbunai.qimen-consultation-judge.v1'],
  };
}

const NATAL_FAVOR = ev('원국 재성 존재', '장기적으로 사업 구조가 갖춰져 있습니다.', 'OPPORTUNITY', 'NATAL');
const NATAL_COUNTER = ev('원국 일지 충', '타고난 바탕이 흔들리는 구조입니다.', 'OPPORTUNITY', 'NATAL');
const PERIOD_FAVOR = ev('大限 사화 록', '지금 10년 흐름이 사업에 힘을 보탭니다.', 'OPPORTUNITY', 'DAEWOON');
const PERIOD_COUNTER = ev('大限 화기', '지금 10년 흐름이 막히는 힘을 받습니다.', 'OPPORTUNITY', 'DAEWOON');
const NOW_FAVOR = ev('생문 값사궁', '지금 이 시점의 실행 문이 열려 있습니다.', 'OPPORTUNITY', 'PRESENT_MOMENT');
const NOW_COUNTER = ev('사문 값사궁', '지금 이 시점의 실행이 막혀 있습니다.', 'OPPORTUNITY', 'PRESENT_MOMENT');

const call = (input: CrossConsultationJudgeInput) => judgeCrossConsultation(input);

describe('scope alignment — different time scope is NOT a contradiction (§8)', () => {
  it('Myungri long-term FAVORABLE + Qimen current CAUTION → NOT a trueContradiction', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.trueContradictions).toEqual([]);
  });

  it('...instead produces a scope-separated compound truth', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.scopeSeparatedTruths.length).toBeGreaterThan(0);
  });

  it('baselineConclusion carries the Myungri favorable meaning', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.baselineConclusion).toContain('장기적으로 사업 구조가 갖춰져 있습니다');
  });

  it('currentSituationConclusion carries the Qimen counter meaning, unmodified by baseline', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.currentSituationConclusion).toContain('실행이 막혀 있습니다');
  });

  it('finalConclusion is the compound scope-separated truth, not a single-scope flattening', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.finalConclusion).toBe(r.scopeSeparatedTruths[0]);
  });
});

describe('true same-scope contradiction (§9/§41)', () => {
  it('Myungri NATAL support + Ziwei NATAL counter → a real trueContradiction', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      qimen: null,
    });
    expect(r.trueContradictions.length).toBeGreaterThan(0);
  });

  it('overall status becomes MIXED, not neutralized/averaged away', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      qimen: null,
    });
    expect(r.status).toBe('MIXED');
  });

  it('both sides are preserved in supportingEvidence/counterEvidence, neither dropped', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      qimen: null,
    });
    expect(r.supportingEvidence.some((e) => e.fact === NATAL_FAVOR.fact)).toBe(true);
    expect(r.counterEvidence.some((e) => e.fact === NATAL_COUNTER.fact)).toBe(true);
  });

  it('the contradiction text names both disciplines', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      qimen: null,
    });
    expect(r.trueContradictions[0]).toContain('명리');
    expect(r.trueContradictions[0]).toContain('자미두수');
  });

  it('single-scope-only input produces no scopeSeparatedTruths (nothing to separate across scopes)', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      qimen: null,
    });
    expect(r.scopeSeparatedTruths).toEqual([]);
  });

  it('a discipline\'s OWN internal MIXED (support+counter from the SAME discipline) is not reported as a trueContradiction by itself', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR], counterEvidence: [ev('원국 다른 신호', '같은 명리 안에서 갈리는 신호입니다.', 'OPPORTUNITY', 'NATAL')] }),
      ziwei: null,
      qimen: null,
    });
    expect(r.trueContradictions).toEqual([]);
  });
});

describe('no majority vote (§4/§5/§42)', () => {
  it('Myungri FAVORABLE + Ziwei FAVORABLE + Qimen CAUTION on the SAME scope → MIXED, never FAVORABLE by 2-vs-1', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [ev('명리 신호', '명리상 우호적입니다.', 'OPPORTUNITY', 'PRESENT_MOMENT')] }),
      ziwei: domainResult({ supportingEvidence: [ev('자미 신호', '자미두수상 우호적입니다.', 'OPPORTUNITY', 'PRESENT_MOMENT')] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.status).toBe('MIXED');
  });

  it('the same 2-favorable-vs-1-caution case still preserves the single counterevidence (not outvoted away)', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [ev('명리 신호', '명리상 우호적입니다.', 'OPPORTUNITY', 'PRESENT_MOMENT')] }),
      ziwei: domainResult({ supportingEvidence: [ev('자미 신호', '자미두수상 우호적입니다.', 'OPPORTUNITY', 'PRESENT_MOMENT')] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.counterEvidence.length).toBeGreaterThan(0);
  });

  it('result contains no score/weight/percent/rank numeric field anywhere', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ supportingEvidence: [PERIOD_FAVOR], temporalDrivers: ['大限'] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/"score"|"weight"|"percent"|"confidence"|"rank"/i);
  });
});

describe('no system is universally superior (§13/§43/§44/§45)', () => {
  it('§43 — Qimen current CAUTION cannot rewrite an independently-supported baseline to CAUTION', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ supportingEvidence: [ev('자미 명반', '자미두수 구조도 우호적입니다.', 'OPPORTUNITY', 'NATAL')] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.baselineConclusion).toContain('장기적으로 사업 구조가 갖춰져 있습니다');
    expect(r.baselineConclusion).not.toContain('실행이 막혀');
  });

  it('§44 — a strong Myungri baseline cannot force CURRENT_SITUATION=FAVORABLE against Qimen counterevidence', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.currentSituationConclusion).toContain('실행이 막혀 있습니다');
    expect(r.currentSituationConclusion).not.toContain('갖춰져');
  });

  it('§45 — a favorable Ziwei period conclusion cannot erase concrete Qimen current obstruction', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: null,
      ziwei: domainResult({ supportingEvidence: [PERIOD_FAVOR], temporalDrivers: ['大限'] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.counterEvidence.some((e) => e.fact === NOW_COUNTER.fact)).toBe(true);
    expect(r.status).not.toBe('FAVORABLE');
  });

  it('§45 (cont.) — nor can it erase concrete Myungri baseline counterevidence', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ counterEvidence: [NATAL_COUNTER] }),
      ziwei: domainResult({ supportingEvidence: [PERIOD_FAVOR], temporalDrivers: ['大限'] }),
      qimen: null,
    });
    expect(r.counterEvidence.some((e) => e.fact === NATAL_COUNTER.fact)).toBe(true);
  });
});

describe('missing system does not block the whole result (§25)', () => {
  it('Qimen null, Myungri+Ziwei resolved → still a non-UNRESOLVED result', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ supportingEvidence: [ev('자미 신호', '자미두수도 우호적입니다.', 'OPPORTUNITY', 'NATAL')] }),
      qimen: null,
    });
    expect(r.status).not.toBe('UNRESOLVED');
  });

  it('the missing Qimen system reports NOT_APPLICABLE availability, never CAUTION', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: null,
    });
    const qimenContribution = r.systemContributions.find((c) => c.system === 'QIMEN')!;
    expect(qimenContribution.availability).toBe('NOT_APPLICABLE');
    expect(qimenContribution.domainStatus).toBeNull();
  });

  it('a NOT_APPLICABLE system contributes an explanatory uncertaintyReason, not silence', () => {
    const r = call({ domain: 'BUSINESS', myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }), ziwei: null, qimen: null });
    expect(r.uncertaintyReasons.some((u) => u.includes('자미두수') || u.includes('기문둔갑'))).toBe(true);
  });
});

describe('UNRESOLVED != CAUTION, NOT_APPLICABLE != CAUTION (§26)', () => {
  it('a discipline with status UNRESOLVED contributes NO counterEvidence', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ status: 'UNRESOLVED', uncertaintyReasons: ['근거 부족'] }),
      qimen: null,
    });
    expect(r.counterEvidence).toEqual([]);
    expect(r.status).toBe('FAVORABLE');
  });

  it('UNRESOLVED discipline is reported with availability UNRESOLVED (distinct from NOT_APPLICABLE)', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ status: 'UNRESOLVED', uncertaintyReasons: ['근거 부족'] }),
      qimen: null,
    });
    const z = r.systemContributions.find((c) => c.system === 'ZIWEI')!;
    expect(z.availability).toBe('UNRESOLVED');
  });

  it('all three systems null/UNRESOLVED → overall status UNRESOLVED, no fabricated content', () => {
    const r = call({ domain: 'BUSINESS', myungri: null, ziwei: null, qimen: null });
    expect(r.status).toBe('UNRESOLVED');
    expect(r.supportingEvidence).toEqual([]);
    expect(r.counterEvidence).toEqual([]);
    expect(r.syntheticInferences).toEqual([]);
  });
});

describe('per-domain compound truths (§17-23)', () => {
  it('REUNION — Qimen current opening + Myungri weak long-term stability → both preserved as a compound truth', () => {
    const r = call({
      domain: 'REUNION',
      myungri: domainResult({ domain: 'REUNION', counterEvidence: [ev('원국 배우자 자리 충', '장기적으로 안정된 재결합 구조가 약합니다.', 'RELATION_STABILITY', 'NATAL')] }),
      ziwei: null,
      qimen: qimenResult({ domain: 'REUNION', supportingEvidence: [ev('값부·값사 동궁', '지금 접촉이 열리는 흐름입니다.', 'RELATION_BOND', 'PRESENT_MOMENT')] }),
    });
    expect(r.status).toBe('MIXED');
    expect(r.scopeSeparatedTruths.length).toBeGreaterThan(0);
    expect(r.supportingEvidence.length).toBeGreaterThan(0);
    expect(r.counterEvidence.length).toBeGreaterThan(0);
  });

  it('MONEY — inflow opportunity and retention caution are both preserved distinctly, not neutralized', () => {
    const r = call({
      domain: 'MONEY',
      myungri: domainResult({
        domain: 'MONEY',
        supportingEvidence: [ev('원국 재성 존재', '돈이 들어오는 구조가 있습니다.', 'MONEY_INFLOW', 'NATAL')],
        counterEvidence: [ev('원국 비겁 과다', '들어온 돈이 남기 어려운 구조입니다.', 'MONEY_RETENTION', 'NATAL')],
      }),
      ziwei: null,
      qimen: null,
    });
    expect(r.status).toBe('MIXED');
    expect(r.supportingEvidence.some((e) => e.domain === 'MONEY_INFLOW')).toBe(true);
    expect(r.counterEvidence.some((e) => e.domain === 'MONEY_RETENTION')).toBe(true);
  });

  it('CHANGE — period pressure (support) + Qimen immediate execution caution → distinct compound conclusion', () => {
    const r = call({
      domain: 'CHANGE',
      myungri: null,
      ziwei: domainResult({ domain: 'CHANGE', supportingEvidence: [ev('大限 이동 사화', '지금 시기 흐름이 변화를 뒷받침합니다.', 'MOVEMENT', 'DAEWOON')], temporalDrivers: ['大限'] }),
      qimen: qimenResult({ domain: 'CHANGE', counterEvidence: [ev('사문 값사궁', '지금 당장의 실행은 막혀 있습니다.', 'MOVEMENT', 'PRESENT_MOMENT')] }),
    });
    expect(r.periodConclusion).toContain('변화를 뒷받침');
    expect(r.currentSituationConclusion).toContain('실행은 막혀');
    expect(r.scopeSeparatedTruths.length).toBeGreaterThan(0);
  });
});

describe('EVENT_SUCCESS — Qimen-only, no fabricated Myungri/Ziwei consensus (§24)', () => {
  it('Myungri/Ziwei null for EVENT_SUCCESS (they have no such judge) → both NOT_APPLICABLE', () => {
    const r = call({
      domain: 'EVENT_SUCCESS',
      myungri: null,
      ziwei: null,
      qimen: qimenResult({ domain: 'EVENT_SUCCESS', supportingEvidence: [NOW_FAVOR] }),
    });
    expect(r.systemContributions.find((c) => c.system === 'MYUNGRI')!.availability).toBe('NOT_APPLICABLE');
    expect(r.systemContributions.find((c) => c.system === 'ZIWEI')!.availability).toBe('NOT_APPLICABLE');
    expect(r.systemContributions.find((c) => c.system === 'QIMEN')!.availability).toBe('AVAILABLE');
  });

  it('status is driven by Qimen alone (one valid system), not neutralized by the two NOT_APPLICABLE systems', () => {
    const r = call({
      domain: 'EVENT_SUCCESS',
      myungri: null,
      ziwei: null,
      qimen: qimenResult({ domain: 'EVENT_SUCCESS', supportingEvidence: [NOW_FAVOR] }),
    });
    expect(r.status).toBe('FAVORABLE');
  });

  it('no synthetic cross-system inference is fabricated from a single applicable system (§27 gate)', () => {
    const r = call({
      domain: 'EVENT_SUCCESS',
      myungri: null,
      ziwei: null,
      qimen: qimenResult({ domain: 'EVENT_SUCCESS', supportingEvidence: [NOW_FAVOR] }),
    });
    expect(r.syntheticInferences).toEqual([]);
  });
});

describe('determinism (§31)', () => {
  it('same input twice → deep-equal result', () => {
    const input: CrossConsultationJudgeInput = {
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: domainResult({ supportingEvidence: [PERIOD_FAVOR], temporalDrivers: ['大限'] }),
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    };
    const a = call(JSON.parse(JSON.stringify(input)));
    const b = call(JSON.parse(JSON.stringify(input)));
    expect(a).toEqual(b);
  });

  it('does not mutate its inputs', () => {
    const myungri = domainResult({ supportingEvidence: [NATAL_FAVOR] });
    const before = JSON.parse(JSON.stringify(myungri));
    call({ domain: 'BUSINESS', myungri, ziwei: null, qimen: null });
    expect(myungri).toEqual(before);
  });
});

describe('system verdict immutability (§35/§38)', () => {
  it('systemContributions.domainStatus mirrors each input result\'s OWN status, never recomputed', () => {
    const myungri = domainResult({ status: 'MIXED', supportingEvidence: [NATAL_FAVOR], counterEvidence: [NATAL_COUNTER] });
    const r = call({ domain: 'BUSINESS', myungri, ziwei: null, qimen: null });
    expect(r.systemContributions.find((c) => c.system === 'MYUNGRI')!.domainStatus).toBe('MIXED');
  });

  it('the SAME underlying fact appearing once is never double-counted into supportingEvidence twice', () => {
    const sharedFact = ev('공유 근거', '두 체계가 같은 사실을 언급합니다.', 'OPPORTUNITY', 'NATAL');
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [sharedFact] }),
      ziwei: domainResult({ supportingEvidence: [sharedFact] }),
      qimen: null,
    });
    expect(r.supportingEvidence.filter((e) => e.fact === sharedFact.fact).length).toBe(1);
  });
});

describe('genuine synthetic inference quality (§27/§47)', () => {
  it('2+ contributing disciplines with different-scope evidence → at least one syntheticInference', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.syntheticInferences.length).toBeGreaterThanOrEqual(1);
  });

  it('the inference conclusion is NOT a mere concatenation of its own premises', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    const inf = r.syntheticInferences[0];
    expect(inf.conclusion).not.toBe(inf.premises.join(''));
    expect(inf.conclusion).not.toBe(inf.premises.join(' '));
  });

  it('the inference has 2+ named premises when 2 disciplines contributed', () => {
    const r = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }),
      ziwei: null,
      qimen: qimenResult({ counterEvidence: [NOW_COUNTER] }),
    });
    expect(r.syntheticInferences[0].premises.length).toBeGreaterThanOrEqual(2);
  });

  it('a single-discipline result never fabricates a synthetic inference', () => {
    const r = call({ domain: 'BUSINESS', myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }), ziwei: null, qimen: null });
    expect(r.syntheticInferences).toEqual([]);
  });
});

describe('generic-output gate — output actually depends on the real inputs (§46)', () => {
  it('two different fixtures with different evidence text produce different finalConclusion strings', () => {
    const a = call({ domain: 'BUSINESS', myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }), ziwei: null, qimen: null });
    const b = call({
      domain: 'BUSINESS',
      myungri: domainResult({ supportingEvidence: [ev('전혀 다른 근거', '전혀 다른 의미입니다.', 'OPPORTUNITY', 'NATAL')] }),
      ziwei: null, qimen: null,
    });
    expect(a.finalConclusion).not.toBe(b.finalConclusion);
  });

  it('two different fixtures produce different status when their evidence genuinely differs', () => {
    const favorable = call({ domain: 'BUSINESS', myungri: domainResult({ supportingEvidence: [NATAL_FAVOR] }), ziwei: null, qimen: null });
    const caution = call({ domain: 'BUSINESS', myungri: domainResult({ counterEvidence: [NATAL_COUNTER] }), ziwei: null, qimen: null });
    expect(favorable.status).toBe('FAVORABLE');
    expect(caution.status).toBe('CAUTION');
  });
});

describe('provenance and shared routing reuse', () => {
  it('carries its own method-version provenance string', () => {
    const r = call({ domain: 'BUSINESS', myungri: null, ziwei: null, qimen: null });
    expect(r.provenance).toEqual([CROSS_CONSULTATION_JUDGE_V1_METHOD]);
  });

  it('questionProposition is domain-specific, not a generic placeholder', () => {
    const business = call({ domain: 'BUSINESS', myungri: null, ziwei: null, qimen: null });
    const love = call({ domain: 'LOVE', myungri: null, ziwei: null, qimen: null });
    expect(business.questionProposition).not.toBe(love.questionProposition);
  });
});
