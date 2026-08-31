// CODEX RED TEAM BLOCKER CLOSURE V1 — the three structural properties the red team found missing.
//
// BLOCKER 1  an ACCEPTED answer could emit an ungrounded ordinary-Korean fact, because the grounded gate is
//            a technical LEXICON and "사업이 곧 크게 성장합니다" contains no technical token.
// BLOCKER 2  proceed/hold advice could be authorized by a NON-ASKED axis, because the compound-truth loop
//            skipped the asked axis and every direction-bearing claim was therefore off-axis.
// BLOCKER 3  the grounded fallback could DROP a labelled action bucket whose source claim the causal body
//            had already consumed, degrading to generic boundary prose the accepted path never shows.
//
// These are structural tests: none asserts a quality score, and none makes an external call. The model is a
// stub that returns fixed fabricated text.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import {
  actionDirectionOf, buildGroundedNarrativePlan, composeGroundedFallback, narrativeIntentOf,
  type GroundedNarrativePlan, type NarrativeIntent, type SharedActionSection,
} from '@/features/chat/server/groundedNarrative';
import {
  buildGroundedActionPlan, formatGroundedActionLine, renderGroundedActionLines, renderGroundedActionSection,
} from '@/features/chat/server/groundedActionPlan';
import { buildConsultationContentPlan } from '@/features/chat/server/consultationContentPlan';
import { applyConsumerDeliveryContract, applyVerdictAuthorityClamp } from '@/features/chat/server/buildServerConsultation';
import { realize } from '@/features/chat/server/koreanRealization';
import { buildDeclinedSummary } from '@/features/divination';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence,
} from '@/features/divination/contracts';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

// ── SYNTHETIC VERDICT BUILDERS ───────────────────────────────────────────────────────────────────────
function ev(o: Partial<JudgmentEvidence>): JudgmentEvidence {
  return {
    fact: '천이궁 화록', meaning: '움직이는 자리에 실익이 붙습니다', domain: 'OPPORTUNITY',
    temporalScope: 'NATAL', directness: 'DIRECT', ...o,
  };
}

function mkJudgment(o: Partial<DivinationJudgment>): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT', questionDomain: 'OPPORTUNITY',
    temporalScope: 'NATAL', stance: 'FOR', dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
    domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG',
    factGroupsUsed: [], ...o,
  };
}

const contribution = (o: Partial<DisciplineContribution>): DisciplineContribution =>
  ({ discipline: 'MYUNGRI', applied: true, stance: 'FOR', contribution: '테스트 기여', ...o });

const MYUNGRI = mkJudgment({
  directEvidence: [ev({ fact: '식상생재', meaning: '실행이 결과로 이어지는 결이 있습니다' })],
  counterEvidence: [ev({ fact: '편관 혼잡', meaning: '외부 압박이 함께 들어옵니다' })],
});

function mkVerdict(o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  const judgments = o.disciplineJudgments ?? [MYUNGRI];
  return {
    question: '지금 이 사업 시작해도 될까?', questionDomain: 'OPPORTUNITY', questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null, asksTiming: false, premises: [],
    primaryConclusion: '지금 구조에서는 규모를 줄여 시작하시는 편이 낫습니다.',
    headlinePropositionIds: [], direction: 'CONDITIONAL_FOR', dominantBasis: '명리',
    disciplineJudgments: judgments,
    contributions: judgments.map((j) => contribution({ discipline: j.discipline, stance: j.stance })),
    axisVerdicts: [], propositions: [], agreementPoints: [], contradictionPoints: [],
    contradictionResolutions: [], natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [],
    actionableInterpretation: '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.',
    confidence: 'MEDIUM', confidenceReason: '테스트', evidenceReferences: [], verdictVersion: 'test',
    ...o,
  } as CrossDivinationVerdict;
}

type Axis = CrossDivinationVerdict['axisVerdicts'][number];
const axis = (o: Partial<Axis>): Axis => ({
  domain: 'OPPORTUNITY', stance: 'FOR', conclusion: '이 자리는 열려 있습니다',
  dominantDiscipline: 'MYUNGRI', contested: false, ...o,
} as Axis);

const planFor = (intent: NarrativeIntent, v: CrossDivinationVerdict): GroundedNarrativePlan =>
  buildGroundedNarrativePlan(v, buildConsultationContentPlan(v), intent);

/** The SHARED action section exactly as `buildServerConsultation` hands it to the fallback. */
function sharedAction(plan: GroundedNarrativePlan): SharedActionSection | null {
  const action = buildGroundedActionPlan(plan);
  const section = renderGroundedActionSection(action);
  if (!section) return null;
  return { title: section.title, lines: renderGroundedActionLines(action), format: formatGroundedActionLine };
}

const LABELS = {
  verify: '확인할 것', proceed: '진행해도 되는 조건', hold: '보류해야 하는 조건',
  timing: '시기 체크', unresolved: '지금은 정할 수 없는 것',
};
const linesFor = (plan: GroundedNarrativePlan) => renderGroundedActionLines(buildGroundedActionPlan(plan));
const labelFor = (plan: GroundedNarrativePlan, label: string) => linesFor(plan).find((l) => l.label === label);

// ── REAL-PATH FIXTURES ───────────────────────────────────────────────────────────────────────────────
const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
const deps = (answer: string): ServerConsultationDeps => ({
  digestProvider,
  nowEpochSeconds: SERVER_NOW,
  async callLLM() { return answer; },
});
const request = (question: string): ServerConsultationRequest => ({ birthInput: birth, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

// PROBE 1 — technically clean but FABRICATED. Every sentence is an ordinary-Korean factual proposition
// (outcome, cause, timing, action reason) and NOT ONE contains a technical token, so the lexicon gate has
// nothing to catch. Long enough to pass the substance gate and be ACCEPTED.
const FABRICATED_A = JSON.stringify({
  coreSummary: '사업이 곧 크게 성장합니다.',
  coreInterpretation:
    '올해 안에 승진하십니다. 헤어진 분과는 반드시 다시 만나게 됩니다. 매출이 두 배로 늘어납니다. '
    + '그동안 일이 풀리지 않았던 이유는 함께 일하던 사람이 몰래 돈을 빼돌렸기 때문입니다. '
    + '그러니 지금 바로 크게 투자하시면 됩니다. 늦출수록 손해만 커집니다.',
  disposition: '타고나기를 무조건 성공하는 분입니다.',
  strengths: ['곧 큰돈이 들어옵니다.', '경쟁자는 스스로 물러납니다.'],
  cautions: ['가족 중 한 분이 크게 아프게 됩니다.'],
  domainInterpretation: [{ title: '사업 전망', body: '내년 봄에 계약이 세 건 성사됩니다.' }],
  futureFlow: '다음 달부터 모든 것이 풀립니다.',
  followUps: ['언제쯤 시작하면 좋을까요?'],
});

// PROBE 2 — the SAME class of fabrication with a valid claim id bolted onto each sentence. A correct id
// attached to an unrelated proposition proves nothing about entailment; it must buy the sentence nothing.
const FABRICATED_B_WITH_CLAIM_IDS = JSON.stringify({
  coreSummary: '[C1] 이직하면 무조건 연봉이 오릅니다.',
  coreInterpretation:
    '[C1] 세 달 안에 새 자리에서 제안이 옵니다. [C2] 지금 회사가 곧 문을 닫기 때문에 남아 있으면 위험합니다. '
    + '[S1] 그래서 이번 주에 사표를 내시면 됩니다. [T1] 가을에는 이미 모든 것이 정리되어 있습니다. '
    + '[E1] 부모님께서 반대하셔도 결과는 좋게 나옵니다.',
  disposition: '[C1] 어디를 가든 인정받는 분입니다.',
  strengths: ['[C2] 새 직장에서 바로 팀장이 됩니다.'],
  cautions: ['[C2] 지금 회사에 남으면 급여가 밀립니다.'],
  domainInterpretation: [{ title: '직장', body: '[S1] 경쟁자보다 먼저 제안을 받습니다.' }],
  futureFlow: '[T1] 올가을에 정리됩니다.',
  followUps: ['어떤 회사가 좋을까요?'],
});

type Delivered = Awaited<ReturnType<typeof buildServerConsultation>>;

/** Every user-visible FACTUAL field of a delivered consultation, as one comparable object. */
const factualFields = (r: Delivered) => {
  if (!r.ok || !r.structuredResult) throw new Error('no structured result');
  const s = r.structuredResult;
  return {
    coreSummary: s.coreSummary,
    disposition: s.disposition,
    coreInterpretation: s.coreInterpretation,
    strengths: s.strengths,
    cautions: s.cautions,
    domainInterpretation: s.domainInterpretation,
    futureFlow: s.futureFlow,
    verifiedEvidence: s.verifiedEvidence,
  };
};

const deliveredText = (r: Delivered): string => {
  if (!r.ok) throw new Error('not ok');
  const s = r.structuredResult;
  return [
    r.text,
    ...(s?.verifiedEvidence ?? []).flatMap((v) => [v.title, v.body]),
    ...(s?.followUps ?? []),
  ].join('\n').replace(/\s+/g, '');
};

// The distinctive fabricated propositions, normalized. None may survive anywhere in the delivered product.
const FABRICATED_PROPOSITIONS = [
  '사업이 곧 크게 성장합니다', '올해 안에 승진하십니다', '헤어진 분과는 반드시 다시 만나게 됩니다',
  '매출이 두 배로 늘어납니다', '몰래 돈을 빼돌렸기 때문입니다', '지금 바로 크게 투자하시면 됩니다',
  '곧 큰돈이 들어옵니다', '경쟁자는 스스로 물러납니다', '가족 중 한 분이 크게 아프게 됩니다',
  '내년 봄에 계약이 세 건 성사됩니다', '다음 달부터 모든 것이 풀립니다', '무조건 성공하는 분입니다',
  '이직하면 무조건 연봉이 오릅니다', '세 달 안에 새 자리에서 제안이 옵니다', '곧 문을 닫기 때문에',
  '이번 주에 사표를 내시면 됩니다', '새 직장에서 바로 팀장이 됩니다', '지금 회사에 남으면 급여가 밀립니다',
].map((s) => s.replace(/\s+/g, ''));

// ── BLOCKER 1 ────────────────────────────────────────────────────────────────────────────────────────
describe('BLOCKER 1 — every user-visible factual proposition is SERVER-owned', () => {
  const QUESTIONS = ['지금 이 사업을 시작해도 될까요?', '이직해도 될까요?', '제 타고난 성격은 어떤가요?'];

  it('A/B — a fabricated plain-Korean outcome or cause never reaches the reader, technical tokens or not', async () => {
    for (const q of QUESTIONS) {
      const r = await buildServerConsultation(request(q), deps(FABRICATED_A));
      expect(r.ok).toBe(true);
      const text = deliveredText(r);
      for (const p of FABRICATED_PROPOSITIONS) expect(text.includes(p)).toBe(false);
    }
  });

  it('C — a VALID claim id attached to an unrelated sentence does not authorize that sentence', async () => {
    for (const q of QUESTIONS) {
      const r = await buildServerConsultation(request(q), deps(FABRICATED_B_WITH_CLAIM_IDS));
      const text = deliveredText(r);
      for (const p of FABRICATED_PROPOSITIONS) expect(text.includes(p)).toBe(false);
      // …and the id markers themselves are not product content either.
      expect(text).not.toMatch(/\[(C|S|T|E)\d+\]/);
    }
  });

  it('G — the model has NO authority over any factual field: two different answers deliver the same facts', async () => {
    // The strongest available proof, and it needs no lexicon: if the model's prose contributed even one
    // proposition, two wildly different accepted answers could not produce byte-identical factual fields.
    for (const q of QUESTIONS) {
      const a = factualFields(await buildServerConsultation(request(q), deps(FABRICATED_A)));
      const b = factualFields(await buildServerConsultation(request(q), deps(FABRICATED_B_WITH_CLAIM_IDS)));
      expect(a).toEqual(b);
      expect(a.coreSummary).toBeTruthy();
      expect(a.coreInterpretation).toBeTruthy();
    }
  });

  it('F — the whole factual body is REPRODUCIBLE from the claim catalog alone, with zero model input', async () => {
    const r = await buildServerConsultation(request('지금 이 사업을 시작해도 될까요?'), deps(FABRICATED_A));
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const verdict = r.structuredResult.decisionMeta?.divinationVerdict as CrossDivinationVerdict | undefined;
    expect(verdict).toBeDefined();
    // Rebuild the SERVER composition from the persisted authoritative verdict and nothing else. If any
    // delivered field carried model prose, it could not be reproduced this way.
    const intent = narrativeIntentOf(verdict!.questionIntent, false);
    const plan = buildGroundedNarrativePlan(verdict!, buildConsultationContentPlan(verdict!), intent);
    const composed = applyVerdictAuthorityClamp(
      { kind: 'ACCEPTED', result: composeGroundedFallback(plan, sharedAction(plan)) }, verdict!, intent,
    )!;
    // V6: the delivered answer additionally passes the deterministic consumer contract (internal-identifier
    // mapping + one sentence ledger across the whole page). It is pure and takes no model input, so the
    // reproduction runs it too — the property under test is unchanged.
    const delivered = applyConsumerDeliveryContract(composed, [])!.result!;
    const s = r.structuredResult;
    expect(s.coreSummary).toBe(delivered.coreSummary);
    expect(s.coreInterpretation).toBe(delivered.coreInterpretation);
    expect(s.strengths).toEqual(delivered.strengths);
    expect(s.cautions).toEqual(delivered.cautions);
    expect(s.futureFlow).toBe(delivered.futureFlow);
    expect(s.domainInterpretation).toEqual(delivered.domainInterpretation);
    // Non-vacuous: the answer really did carry supporting factual material.
    expect((s.strengths?.length ?? 0) + (s.cautions?.length ?? 0)).toBeGreaterThan(0);
  });

  it('D — under a DIRECTIONAL verdict the delivered conclusion IS the server headline', () => {
    const v = mkVerdict({ primaryConclusion: '지금 구조에서는 규모를 줄여 시작하시는 편이 낫습니다.' });
    const plan = planFor('DECISION', v);
    const composed = applyVerdictAuthorityClamp(
      { kind: 'ACCEPTED', result: composeGroundedFallback(plan, sharedAction(plan)) }, v, 'DECISION',
    )!;
    expect(composed.coreSummary).toBe(realize(v.primaryConclusion));
  });

  it('E — a DECLINED / INSUFFICIENT verdict keeps its server-authored conclusion too', () => {
    for (const direction of ['INSUFFICIENT_EVIDENCE', 'INSUFFICIENT_DATA'] as const) {
      const v = mkVerdict({
        direction, confidence: 'LOW',
        primaryConclusion: '어느 쪽인지 방향을 정할 만한 신호가 잡히지 않습니다.',
      });
      const plan = planFor('DECISION', v);
      const composed = applyVerdictAuthorityClamp(
        { kind: 'ACCEPTED', result: composeGroundedFallback(plan, sharedAction(plan)) }, v, 'DECISION',
      )!;
      expect(composed.coreSummary).toBe(buildDeclinedSummary(v, 'DECISION'));
    }
  });
});

// ── BLOCKER 2 ────────────────────────────────────────────────────────────────────────────────────────
describe('BLOCKER 2 — proceed/hold is authorized ONLY by an asked-axis directional claim', () => {
  it('H — an asked-axis directional claim may feed proceed/hold, in its own direction', () => {
    const plan = planFor('DECISION', mkVerdict({
      axisVerdicts: [
        axis({ domain: 'OPPORTUNITY', stance: 'FOR', conclusion: '이 일은 지금 열려 있습니다' }),
        axis({ domain: 'OPPORTUNITY', stance: 'AGAINST', conclusion: '벌리는 폭은 아직 막혀 있습니다' }),
      ],
    }));
    expect(labelFor(plan, LABELS.proceed)?.text).toContain('지금 열려 있습니다');
    expect(labelFor(plan, LABELS.hold)?.text).toContain('아직 막혀 있습니다');
  });

  it('I/L — an OFF-axis directional claim cannot become proceed/hold for the asked proposition', () => {
    // A career question carrying a favourable spouse-axis stance and an adverse movement-axis stance.
    const plan = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      axisVerdicts: [
        axis({ domain: 'RELATION_STABILITY', stance: 'FOR', conclusion: '배우자 자리는 지금 열려 있습니다' }),
        axis({ domain: 'MOVEMENT', stance: 'AGAINST', conclusion: '옮기는 쪽은 아직 막혀 있습니다' }),
      ],
    }));
    const directional = plan.claims.filter((c) => c.provenance.startsWith('CROSS:axisVerdicts:'));
    expect(directional.length).toBe(2);
    for (const c of directional) expect(actionDirectionOf(c, plan.askedAxis)).toBeNull();
    expect(labelFor(plan, LABELS.proceed)).toBeUndefined();
    expect(labelFor(plan, LABELS.hold)).toBeUndefined();
  });

  it('J — with NO asked-axis direction the proceed/hold buckets are OMITTED, never back-filled', () => {
    const plan = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      axisVerdicts: [axis({ domain: 'RELATION_STABILITY', stance: 'FOR', conclusion: '배우자 자리는 지금 열려 있습니다' })],
      // V6: an ON-AXIS observational claim, so "the answer is not left empty" still measures what it meant.
      // Before V6 that assertion passed on the OFF-AXIS claim above — which is the defect, not the property:
      // 확인할 것 is an instruction, and an unrelated axis must not become one (see ROOT CAUSE 2).
      riskFactors: [ev({ domain: 'CAREER', fact: '관록 화기', meaning: '사회·직업 자리가 이 흐름에 직접 흔들립니다' })],
    }));
    const labels = linesFor(plan).map((l) => l.label);
    expect(labels).not.toContain(LABELS.proceed);
    expect(labels).not.toContain(LABELS.hold);
    // The answer is not left empty: observational guidance still stands — on the asked axis.
    expect(labels).toContain(LABELS.verify);
    expect(labelFor(plan, LABELS.verify)?.text).toContain('사회·직업 자리');
    expect(labelFor(plan, LABELS.verify)?.text).not.toContain('배우자');
    const action = buildGroundedActionPlan(plan);
    expect(action.proceedCondition).toBeUndefined();
    expect(action.holdCondition).toBeUndefined();
  });

  // V6 §CROSS EXCEPTION — the fixture now quotes the off-axis assertion into the contradiction the way the
  // Cross reasoner actually builds one (crossReasoner's `conflict` interpolates both assertions verbatim).
  // That is what "Cross explicitly uses it as material" means, and it is the ONLY way an off-axis claim
  // reaches the reader: shown, framed with why it bears on this proposition, and still carrying no direction.
  it('K — off-axis material Cross tied in stays VISIBLE as qualification; it just carries no direction', () => {
    const plan = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      axisVerdicts: [axis({ domain: 'RELATION_STABILITY', stance: 'FOR', conclusion: '배우자 자리는 지금 열려 있습니다' })],
      contradictionResolutions: [{
        kind: 'DIFFERENT_DOMAIN', between: ['MYUNGRI', 'ZIWEI'],
        conflict: '명리는 "직업 축이 흔들립니다", 자미두수는 "배우자 자리는 지금 열려 있습니다"',
        resolution: '직업 쪽 판단은 관계 쪽 신호에 좌우되지 않습니다',
        dominant: 'MYUNGRI', whyOtherDidNotDominate: '테스트',
      }] as CrossDivinationVerdict['contradictionResolutions'],
    }));
    // Present in the catalog and in the server-owned synthesis material…
    expect(plan.claims.some((c) => c.authoritativeMeaning.includes('배우자 자리는 지금 열려 있습니다'))).toBe(true);
    expect(plan.contradictionClaims.length).toBeGreaterThan(0);
    // …and delivered as observational context, never as a direction to act on.
    const all = JSON.stringify(composeGroundedFallback(plan, sharedAction(plan)));
    expect(all).toContain('배우자 자리는 지금 열려 있습니다');
    expect(all).not.toContain('이 조건이 유지되는 동안은 진행하셔도 됩니다');
    expect(all).not.toContain('이 조건이 그대로면 확정은 미루십시오');
  });

  it('PROBE 3/4 — off-axis favourable on a career question and off-axis adverse on a money question are both refused', () => {
    const career = planFor('DECISION', mkVerdict({
      questionDomain: 'CAREER',
      axisVerdicts: [axis({ domain: 'RELATION_BOND', stance: 'FOR', conclusion: '인연 쪽은 활짝 열려 있습니다' })],
    }));
    expect(labelFor(career, LABELS.proceed)).toBeUndefined();

    const money = planFor('DECISION', mkVerdict({
      questionDomain: 'MONEY_INFLOW',
      axisVerdicts: [axis({ domain: 'CONFLICT', stance: 'AGAINST', conclusion: '주변과 부딪히는 자리가 섭니다' })],
    }));
    expect(labelFor(money, LABELS.hold)).toBeUndefined();
  });
});

// ── BLOCKER 3 ────────────────────────────────────────────────────────────────────────────────────────
describe('BLOCKER 3 — the labelled action contract survives fallback body dedup', () => {
  // PROBE 5/6/7 — each carries exactly ONE material direction-bearing or temporal claim, so the bucket it
  // produces is the SOLE one and its loss would be unmistakable.
  const SOLE_PROCEED = mkVerdict({
    axisVerdicts: [axis({ domain: 'OPPORTUNITY', stance: 'FOR', conclusion: '이 일은 지금 열려 있습니다' })],
  });
  const SOLE_HOLD = mkVerdict({
    axisVerdicts: [axis({ domain: 'OPPORTUNITY', stance: 'AGAINST', conclusion: '벌리는 폭은 아직 막혀 있습니다' })],
  });
  const SOLE_TIMING = mkVerdict({
    asksTiming: true, timingConclusion: '올해 하반기로 갈수록 압박이 옅어집니다.',
  });

  const bucketsOf = (plan: GroundedNarrativePlan) => {
    const action = buildGroundedActionPlan(plan);
    const accepted = renderGroundedActionLines(action).map((l) => l.label);
    const composed = composeGroundedFallback(plan, sharedAction(plan));
    const title = renderGroundedActionSection(action)?.title;
    const section = (composed.domainInterpretation ?? []).find((d) => d.title === title);
    const fallback = section ? section.body.split('\n').map((l) => l.split(' — ')[0]) : [];
    return { accepted, fallback, composed, section };
  };

  it('M — accepted and fallback expose the SAME material action bucket set, every intent', () => {
    const INTENTS: NarrativeIntent[] = ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'];
    for (const intent of INTENTS) {
      for (const v of [mkVerdict(), SOLE_PROCEED, SOLE_HOLD, SOLE_TIMING]) {
        const { accepted, fallback } = bucketsOf(planFor(intent, v));
        expect(fallback).toEqual(accepted);
      }
    }
  });

  it('N/O — a claim also used by the fallback body deletes the BODY occurrence, never the action bucket', () => {
    const plan = planFor('DECISION', SOLE_HOLD);
    const { fallback, composed } = bucketsOf(plan);
    expect(fallback).toContain(LABELS.hold);
    const claim = '벌리는 폭은 아직 막혀 있습니다'.replace(/\s+/g, '');
    const body = [composed.coreInterpretation, ...(composed.strengths ?? []), ...(composed.cautions ?? [])]
      .filter((x): x is string => typeof x === 'string').join('\n').replace(/\s+/g, '');
    // Exactly one appearance in the whole answer, and it is the labelled action line — not the body.
    expect(body.includes(claim)).toBe(false);
  });

  it('P/Q/R — a SOLE timing checkpoint / hold condition / proceed condition survives fallback', () => {
    expect(bucketsOf(planFor('TIMING', SOLE_TIMING)).fallback).toContain(LABELS.timing);
    expect(bucketsOf(planFor('DECISION', SOLE_HOLD)).fallback).toContain(LABELS.hold);
    expect(bucketsOf(planFor('DECISION', SOLE_PROCEED)).fallback).toContain(LABELS.proceed);
  });

  it('S — the fallback never degrades to a generic boundary while action lines exist', () => {
    const GENERIC = [
      '지금 확인된 근거 안에서 움직이시고, 근거가 닿지 않는 부분까지 한 번에 확정하지는 마십시오.',
      '되돌릴 수 있는 범위에서 준비·확인하시고, 큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오.',
      '위에 확인된 시기 근거가 닿는 범위까지만 계획을 잡으시고, 그보다 먼 시점은 아직 고정하지 마십시오.',
    ];
    for (const intent of ['DECISION', 'TIMING'] as NarrativeIntent[]) {
      for (const v of [mkVerdict(), SOLE_PROCEED, SOLE_HOLD, SOLE_TIMING]) {
        const plan = planFor(intent, v);
        if (!sharedAction(plan)) continue; // nothing to preserve — the section is legitimately absent
        const { section } = bucketsOf(plan);
        expect(section).toBeDefined();
        for (const g of GENERIC) expect(section!.body).not.toContain(g);
        for (const line of section!.body.split('\n')) expect(line).toMatch(/^[^—]+ — /);
      }
    }
  });
});
