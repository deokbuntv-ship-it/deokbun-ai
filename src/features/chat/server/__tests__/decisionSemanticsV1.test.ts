// DECISION SEMANTICS V1 — the contract between a consumer question and what the system judges.
//
// The V6.1 census classified all 40 non-directional delivered consultations: 30 were proposition-targeting or
// forwarding failures and 0 were proven chart insufficiency. These tests lock the contract that closes them,
// and — just as importantly — lock the limits: options are preserved but never judged, and axis membership is
// never authority.
//
// Every fixture is SYNTHETIC, written for the intent family it exercises. None is copied from any benchmark.
import { createHash } from 'crypto';

import {
  buildDecisionProposition, contextAxes, decidingAxes, qualifyingAxes,
} from '@/features/chat/server/decisionProposition';
import { buildConclusionSurfacePlan, buildTemporalSurfacePlan } from '@/features/chat/server/consultationSurfacePlan';
import { resolveAskedTarget, resolveJudgmentDomain, resolveQuestionIntent } from '@/features/chat/services/consultationGrounding';
import { classifyTimingQuestion } from '@/features/chat/selectors/qimenActivation';
import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import { adaptJudgment } from '@/features/divination/reasoning/disciplineAdapter';
import { selectAnswerCandidates } from '@/features/divination/reasoning/crossReasoner';
import { judgeCross } from '@/features/divination';
import type {
  CrossDivinationVerdict, DivinationJudgment, JudgmentDomain, JudgmentEvidence,
} from '@/features/divination/contracts';
import type { ReasonedProposition } from '@/features/divination/reasoning/kernel';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

/** The proposition, resolved exactly as the server resolves it (same resolvers, same order). */
const propose = (q: string) => buildDecisionProposition(q, {
  askedAxis: resolveJudgmentDomain(q), intent: resolveQuestionIntent(q),
  asksTiming: classifyTimingQuestion(q), askedTarget: resolveAskedTarget(q),
});

// ── 1–3. THE PROPOSITION IS PRESERVED ────────────────────────────────────────────────────────────────
describe('the proposition the user actually asked is preserved', () => {
  it('1 — SHOULD_I_DO_X keeps the concrete decision object', () => {
    const p = propose('지금 하는 가게를 접지 않고 계속 끌고 가도 될까요?');
    expect(p.kind).toBe('SHOULD_I_DO_X');
    expect(p.requestedOutcome).toBe('DIRECTION');
    expect(p.decisionObject).toBeTruthy();
    expect(p.decisionObject).toMatch(/가게|계속|끌고/);
    expect(p.askedDomain).toBe('BUSINESS');
  });

  it('2 — A_VS_B preserves both named alternatives and invents no winner', () => {
    const p = propose('지금 회사에 남는 쪽과 다른 회사로 옮기는 쪽 중 어느 쪽이 나을까요?');
    expect(p.kind).toBe('A_VS_B');
    expect(p.options.length).toBeGreaterThanOrEqual(2);
    // REPRESENTATIONAL ONLY. The current Judge contract judges an axis, never an action, so nothing in the
    // proposition may rank the options — the shape carries no winner field at all.
    expect(Object.keys(p)).not.toContain('preferredOption');
    expect(Object.keys(p)).not.toContain('winner');
    expect(JSON.stringify(p)).not.toMatch(/better|우세|우위|승자/);
  });

  it('3 — WHEN_X keeps its subject domain and asks for a PERIOD', () => {
    const p = propose('이직은 언제 하는 게 좋을까요?');
    expect(p.kind).toBe('WHEN_X');
    expect(p.requestedOutcome).toBe('PERIOD');
    expect(p.askedDomain).toBe('CAREER');              // the subject survives the "when"
    expect(decidingAxes(p)).toContain('CAREER');       // and it is still what decides
    expect(contextAxes(p)).toContain('TIMING');        // TIMING bears, but only as timing
  });
});

// ── 4–6, 8. ROLE-AWARE AXES — MEMBERSHIP IS NOT AUTHORITY ────────────────────────────────────────────
describe('bearing axes carry a role, and only PRIMARY may decide', () => {
  it('4 — a same-domain sibling becomes PRIMARY only when the proposition is about it', () => {
    // Keeping money is a RETENTION proposition; earning is an INFLOW one. Both axes exist; the ask decides.
    const keep = propose('버는 건 그대로인데 남는 게 없습니다. 앞으로 돈이 좀 모일 수 있을까요?');
    expect(decidingAxes(keep)).toEqual(['MONEY_RETENTION']);
    expect(qualifyingAxes(keep)).toContain('MONEY_INFLOW');

    const earn = propose('올해 수입이 좀 늘어날 수 있을까요?');
    expect(decidingAxes(earn)).toEqual(['MONEY_INFLOW']);
    expect(qualifyingAxes(earn)).toContain('MONEY_RETENTION');

    // Same for the relationship pair: whether it LASTS is stability, meeting someone is bond.
    const lasts = propose('지금 만나는 분과 앞으로도 오래 이어질 수 있을까요?');
    expect(decidingAxes(lasts)).toEqual(['RELATION_STABILITY']);
    const meets = propose('올해 새로운 인연을 만날 수 있을까요?');
    expect(decidingAxes(meets)).toEqual(['RELATION_BOND']);
  });

  it('5 — a CONTEXT/TIMING binding can never decide the direction', () => {
    const p = propose('이직은 언제 하는 게 좋을까요?');
    for (const axis of contextAxes(p)) expect(decidingAxes(p)).not.toContain(axis);
    // The candidate set — the only thing `resolveAnswer` sees — is built from deciding axes alone.
    const props = [
      prop('CAREER', 'FAVORABLE', 'career-side reading'),
      prop('TIMING', 'UNFAVORABLE', 'timing-side reading'),
    ];
    const cands = selectAnswerCandidates(props, 'CAREER', 'DECISION', decidingAxes(p));
    expect(cands.map((c) => c.questionAxis)).toEqual(['CAREER']);
  });

  it('6 — a CONSTRAINT axis qualifies without replacing the answer', () => {
    // A relocation proposition. Work bears on it — a move is usually constrained by the job — but the answer
    // is about the move, so CAREER may qualify and may never decide.
    const p = propose('지금 사는 곳을 떠나 새 동네로 옮기는 게 맞을까요?');
    expect(decidingAxes(p)).toEqual(['MOVEMENT']);
    expect(qualifyingAxes(p)).toContain('CAREER');           // it bears …
    expect(decidingAxes(p)).not.toContain('CAREER');         // … but it does not decide
    // A CONSTRAINT-bound direction is not admitted to the candidate set the verdict is resolved from.
    const props = [prop('MOVEMENT', 'FAVORABLE', 'move reading'), prop('CAREER', 'UNFAVORABLE', 'work reading')];
    expect(selectAnswerCandidates(props, 'MOVEMENT', 'DECISION', decidingAxes(p)).map((c) => c.questionAxis))
      .toEqual(['MOVEMENT']);
  });

  it('8 — an unrelated same-domain direction is not a candidate merely by bearing', () => {
    const p = propose('버는 건 그대로인데 남는 게 없습니다. 앞으로 돈이 좀 모일 수 있을까요?');
    const props = [
      prop('MONEY_RETENTION', 'FAVORABLE', 'retention reading'),
      prop('MONEY_INFLOW', 'UNFAVORABLE', 'inflow reading'),   // an OUTCOME binding
    ];
    const cands = selectAnswerCandidates(props, 'MONEY_INFLOW', 'DECISION', decidingAxes(p));
    expect(cands).toHaveLength(1);
    expect(cands[0].questionAxis).toBe('MONEY_RETENTION');
  });

  it('exactly one PRIMARY axis is ever bound, so widening cannot manufacture a conflict', () => {
    for (const q of [
      '지금 하는 사업을 더 키워도 될까요?', '올해 수입이 늘어날까요?', '지금 회사에서 승진할 수 있을까요?',
      '올해 좋은 인연이 있을까요?', '헤어진 사람과 다시 이어질 수 있을까요?', '지금 이사해도 괜찮을까요?',
      '올해는 저한테 어떤 흐름인가요?',
    ]) expect(decidingAxes(propose(q))).toHaveLength(1);
  });
});

// ── 7. A VALID DIRECTIONAL JUDGE RESULT REACHES CROSS ────────────────────────────────────────────────
describe('a directional judge result on the asked axis cannot disappear before Cross', () => {
  it('7 — a top-level stance with evidence and no matching sub-judgment is forwarded', () => {
    // Exactly the shape the census found losing 2 declines: the discipline answered the asked axis with its
    // own headline stance and emitted no sub-judgment for it.
    const j = judgment({
      discipline: 'ZIWEI', questionDomain: 'TIMING', stance: 'CONDITIONAL_FOR',
      dominantConclusion: '지금 시점은 받쳐 주는 자리입니다.',
      directEvidence: [ev({ fact: '대한궁 화록', meaning: '이 시기 자리가 열립니다' })],
      domainSubJudgments: [],
    });
    const out = adaptJudgment(j, { subject: '본인', questionIntent: 'DECISION', askedAxis: 'TIMING' });
    const onAxis = out.propositions.filter((p) => p.questionAxis === 'TIMING' && p.direction !== 'NONE');
    expect(onAxis.length).toBeGreaterThan(0);
    expect(selectAnswerCandidates(out.propositions, 'TIMING', 'DECISION')).not.toHaveLength(0);
  });

  it('7 — the evidence guard is NOT weakened: a stance with no named fact still never enters', () => {
    const j = judgment({
      discipline: 'ZIWEI', questionDomain: 'TIMING', stance: 'FOR',
      dominantConclusion: '근거 없는 의견', directEvidence: [], counterEvidence: [], domainSubJudgments: [],
    });
    expect(adaptJudgment(j, { subject: '본인', questionIntent: 'DECISION', askedAxis: 'TIMING' }).propositions).toHaveLength(0);
  });

  it('7 — a sub-judgment already covering the axis is not duplicated by the top-level stance', () => {
    const j = judgment({
      discipline: 'ZIWEI', questionDomain: 'CAREER', stance: 'FOR', dominantConclusion: '자리 판단',
      directEvidence: [ev({ fact: '관록 화록', meaning: '자리가 열립니다' })],
      domainSubJudgments: [sub({ domain: 'CAREER', stance: 'FOR', conclusion: '자리가 열립니다', evidence: [ev({ fact: '관록 화록', meaning: '자리가 열립니다' })] })],
    });
    const out = adaptJudgment(j, { subject: '본인', questionIntent: 'DECISION', askedAxis: 'CAREER' });
    expect(out.propositions.filter((p) => p.questionAxis === 'CAREER')).toHaveLength(1);
  });

  it('the intent is read from the ask, so a narrated cause no longer disqualifies the direction', () => {
    // "…사람들 때문에 힘듭니다. 계속 버티는 게 의미가 있을까요?" — 때문 sits in the SITUATION; the ask is a
    // decision. Classifying it CAUSE_WHY made every directional proposition on the axis ineligible.
    expect(resolveQuestionIntent('같이 일하는 사람들 때문에 매일 힘듭니다. 계속 버티는 게 의미가 있을까요?')).not.toBe('CAUSE_WHY');
    expect(resolveQuestionIntent('성격은 잘 맞는데 사는 곳이 멉니다. 잘 될 수 있는 인연인가요?')).not.toBe('DESCRIPTIVE');
    // A genuine cause question is still a cause question.
    expect(resolveQuestionIntent('왜 자꾸 같은 일이 반복될까요?')).toBe('CAUSE_WHY');
  });
});

// ── 9–12. CONCLUSION SURFACE ─────────────────────────────────────────────────────────────────────────
describe('the conclusion answers the proposition, and direction matches action', () => {
  it('9 — a primitive engine relation never stands as the whole headline', () => {
    const v = verdict({
      direction: 'CONDITIONAL_AGAINST', questionDomain: 'CAREER',
      dominantBasis: '단일 근거 · 원국 월주',
      primaryConclusion: '올해 흐름이 원국 월주 자형에 마찰을 일으킨다.',
    });
    const plan = buildConclusionSurfacePlan(v);
    expect(plan.headlineOverride).toBeTruthy();
    expect(plan.headlineOverride).not.toContain('원국 월주 자형');
    expect(plan.headlineOverride).toContain('자리·직업');
  });

  it('9 — a synthesised conclusion is left exactly as the verdict stated it', () => {
    const v = verdict({ direction: 'FOR', dominantBasis: 'CROSS_AXIS_COMPOUND · 기회', primaryConclusion: '열려 있는 자리입니다.' });
    expect(buildConclusionSurfacePlan(v).headlineOverride).toBeNull();
  });

  it('10 — an AGREED FOR verdict cannot carry a HOLD action', () => {
    const v = agreedVerdict('FOR');
    expect(v.direction).toBe('FOR');
    expect(v.actionableInterpretation).not.toMatch(/유지하시는 편이 낫습니다|방향을 틀기보다/);
    expect(buildConclusionSurfacePlan(v).closing).toBe(v.actionableInterpretation);
  });

  it('11 — an AGREED AGAINST verdict cannot carry a PROCEED action', () => {
    const v = agreedVerdict('AGAINST');
    expect(v.direction).toBe('AGAINST');
    expect(v.actionableInterpretation).not.toMatch(/그대로 밀고 가|진행하셔도/);
  });

  it('12 — mixed and unresolved stay mixed and unresolved', () => {
    expect(buildConclusionSurfacePlan(verdict({ direction: 'CONDITIONAL_FOR' })).state).toBe('MIXED');
    expect(buildConclusionSurfacePlan(verdict({ direction: 'INSUFFICIENT_EVIDENCE' })).state).toBe('UNRESOLVED');
    expect(buildConclusionSurfacePlan(verdict({ direction: 'INSUFFICIENT_DATA' })).state).toBe('INSUFFICIENT');
    for (const d of ['CONDITIONAL_FOR', 'INSUFFICIENT_EVIDENCE', 'INSUFFICIENT_DATA'] as const) {
      expect(buildConclusionSurfacePlan(verdict({ direction: d })).directional).toBe(false);
    }
  });
});

// ── 13–15. FOLLOW-UP AUTHORITY + ZERO-GROUNDING GUARD ────────────────────────────────────────────────
const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
const BIRTH: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
// Unknown birth time on a solar-term boundary date: every engine legitimately fail-closes.
const UNGROUNDABLE = {
  ...BIRTH, birthYear: '1996', birthMonth: '10', birthDay: '8',
  birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null,
} as unknown as BirthInfoDraft;
const ANSWER = JSON.stringify({
  coreSummary: '차분히 보셔도 좋습니다.',
  coreInterpretation: '지금 흐름은 무리하지 않는 선에서 움직이면 결과가 따라오는 결입니다. 속도를 조절하시면 준비한 만큼 이어집니다.',
});
const deps = (over: Partial<ServerConsultationDeps> = {}): ServerConsultationDeps =>
  ({ digestProvider, nowEpochSeconds: NOW, async callLLM() { return ANSWER; }, ...over });
const req = (question: string, birthInput: BirthInfoDraft = BIRTH): ServerConsultationRequest => ({ birthInput, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('follow-up authority requires a persisted decision, not wording', () => {
  it('13 — a first-turn "어느 쪽" question is NOT treated as a follow-up', async () => {
    const r = await buildServerConsultation(req('남는 쪽과 옮기는 쪽 중 어느 쪽이 나을까요?'), deps());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.diagnostics?.followUp).toBeUndefined();
  });

  it('14 — a real follow-up with a persisted previous decision still works', async () => {
    let loaded = false;
    const first = await buildServerConsultation(req('지금 이 일을 시작해도 될까요?'), deps());
    if (!first.ok || !first.structuredResult?.decisionMeta) throw new Error('no first turn');
    const meta = first.structuredResult.decisionMeta;
    clearZiweiCache(); clearQimenCache();
    const r = await buildServerConsultation(req('왜 그렇게 보시나요?'), deps({
      async loadPreviousDecision() { loaded = true; return { status: 'VALID', meta }; },
    }));
    expect(loaded).toBe(true);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.diagnostics?.followUp).toBe('WHY');
  });

  it('15 — zero engines + first-turn follow-up-like wording refuses and commits no Duk', async () => {
    let called = 0;
    const r = await buildServerConsultation(
      req('다시 연락해볼지, 아니면 정리할지 어느 쪽으로 마음을 정하는 게 나을까요?', UNGROUNDABLE),
      deps({ async callLLM() { called += 1; return ANSWER; } }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('GROUNDING_UNAVAILABLE');
    expect(called).toBe(0);                       // no model call ⇒ nothing to charge for
    expect(r).not.toHaveProperty('structuredResult');
  });
});

// ── 16–17. TEMPORAL PRECISION ────────────────────────────────────────────────────────────────────────
const NO_TIME = { years: [], months: [], referenceYear: null, referenceMonth: null, ageMin: null, ageMax: null, timingConclusion: null };

describe('temporal precision is preserved without inventing a future month', () => {
  it('16 — a populated referenceMonth is not discarded behind the year branch', () => {
    const plan = buildTemporalSurfacePlan({ ...NO_TIME, years: [2026], referenceYear: 2026, referenceMonth: 9 }, false);
    expect(plan.text).toContain('2026년');
    expect(plan.text).toContain('9월');
  });

  it('17 — the month is stated as the anchor, never as a chosen best future month', () => {
    const plan = buildTemporalSurfacePlan({ ...NO_TIME, years: [2026], referenceYear: 2026, referenceMonth: 9 }, false);
    expect(plan.text).toContain('기준으로 본 것');
    expect(plan.text).toContain('특정 달을 짚을 근거는 아직 없습니다');
    expect(plan.text).not.toMatch(/가장 좋은 달|추천하는 달|이 달에 하십시오/);
  });

  it('17 — with no temporal authority at all nothing is named', () => {
    const plan = buildTemporalSurfacePlan(NO_TIME, false);
    expect(plan.precision).toBe('NONE');
    expect(plan.text).not.toMatch(/\d{4}\s*년|\d{1,2}\s*월/);
  });
});

// ── 18. V6/V6.1 INVARIANTS SURVIVE ───────────────────────────────────────────────────────────────────
describe('18 — the V6/V6.1 protections are intact', () => {
  it('an off-axis directional proposition still cannot become a candidate', () => {
    const props = [prop('RELATION_STABILITY', 'FAVORABLE', 'spouse-seat reading')];
    expect(selectAnswerCandidates(props, 'CAREER', 'DECISION', ['CAREER'])).toHaveLength(0);
  });

  it('the router still keeps a subject axis under a "when" question', () => {
    expect(resolveJudgmentDomain('이직은 언제 하는 게 좋을까요?')).not.toBe('TIMING');
    expect(propose('이직은 언제 하는 게 좋을까요?').askedDomain).toBe('CAREER');
  });

  it('a genuinely ambiguous question still resolves to no domain rather than a guess', () => {
    expect(propose('그냥 한번 봐주세요.').askedDomain).toBeNull();
  });

  it('the whole path still produces a grounded answer end to end', async () => {
    const r = await buildServerConsultation(req('올해 수입이 좀 늘어날 수 있을까요?'), deps());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.groundingMeta.grounded).toBe(true);
      expect(r.structuredResult).toBeDefined();
    }
  });
});

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────
function ev(o: Partial<JudgmentEvidence>): JudgmentEvidence {
  return { fact: '테스트 근거', meaning: '테스트 의미', domain: 'CAREER', temporalScope: 'NATAL', directness: 'DIRECT', ...o };
}
function sub(o: Partial<DivinationJudgment['domainSubJudgments'][number]>) {
  return {
    domain: 'CAREER' as JudgmentDomain, stance: 'FOR' as const, conclusion: '테스트 결론',
    temporalScope: 'NATAL' as const, directness: 'DIRECT' as const, reliability: 'EXACT' as const,
    evidence: [], counterEvidence: [], ...o,
  };
}
function judgment(o: Partial<DivinationJudgment>): DivinationJudgment {
  return {
    discipline: 'ZIWEI', applicable: true, dataReliability: 'EXACT', questionDomain: 'CAREER',
    temporalScope: 'NATAL', stance: 'FOR', dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
    domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG',
    factGroupsUsed: [], ...o,
  } as DivinationJudgment;
}
function prop(axis: JudgmentDomain, direction: string, assertion: string): ReasonedProposition {
  return {
    id: `t_${axis}_${direction}`, discipline: 'ZIWEI', subject: '본인',
    target: { kind: 'ADAPTED_READING', key: `ZIWEI:${axis}`, label: `${axis} 판단` },
    questionIntent: 'DECISION', questionAxis: axis, temporalScope: 'NATAL', assertion,
    conclusionType: 'DIRECTIONAL', answersAsked: true, direction,
    supportingPremiseIds: ['x'], opposingPremiseIds: [], derivedFromPropositionIds: [], unresolvedPremiseIds: [],
    doctrineReferences: ['t'], derivationRule: 'PRIMITIVE',
    adequacy: { dataCompleteness: 'COMPLETE', supportAdequacy: 'ADEQUATE', doctrineCoverage: 'PARTIAL' },
  } as unknown as ReasonedProposition;
}
function verdict(o: Partial<CrossDivinationVerdict>): CrossDivinationVerdict {
  return {
    question: '테스트 질문', questionDomain: 'CAREER', questionIntent: 'DECISION', evaluatedAtEpochSeconds: null,
    asksTiming: false, premises: [], primaryConclusion: '테스트 결론', headlinePropositionIds: [],
    direction: 'FOR', dominantBasis: 'CROSS_AXIS_COMPOUND · 테스트', disciplineJudgments: [], contributions: [],
    axisVerdicts: [], propositions: [], agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
    natalBaseline: null, currentFlow: null, timingConclusion: null, favorableFactors: [], riskFactors: [],
    actionableInterpretation: '지금 흐름을 그대로 밀고 가셔도 됩니다.', confidence: 'MEDIUM',
    confidenceReason: '테스트', evidenceReferences: [], verdictVersion: 'test', ...o,
  } as CrossDivinationVerdict;
}
/** A real AGREED verdict: two independent same-direction judgments, no single derivation top. */
function agreedVerdict(dir: 'FOR' | 'AGAINST'): CrossDivinationVerdict {
  const stance = dir === 'FOR' ? 'FOR' : 'AGAINST';
  const mk = (d: DivinationJudgment['discipline'], fact: string) => judgment({
    discipline: d, questionDomain: 'CAREER', stance,
    dominantConclusion: dir === 'FOR' ? '자리가 열려 있습니다.' : '지금은 자리가 막혀 있습니다.',
    directEvidence: [ev({ fact, meaning: '판단 근거' })],
    domainSubJudgments: [sub({
      domain: 'CAREER', stance, conclusion: dir === 'FOR' ? '자리가 열립니다.' : '자리가 막힙니다.',
      evidence: [ev({ fact, meaning: '판단 근거' })],
    })],
  });
  return judgeCross({
    question: '지금 자리에서 계속 가도 될까요?', questionDomain: 'CAREER', subject: '본인',
    questionIntent: 'DECISION', asksTiming: false,
    judgments: [mk('ZIWEI', '관록 화록'), mk('QIMEN', '값사 開門')],
  });
}
