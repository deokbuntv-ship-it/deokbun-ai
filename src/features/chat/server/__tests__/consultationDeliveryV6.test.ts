// CONSULTATION DELIVERY V6 — the structural contracts the final Blind-84 remediation exists to hold.
//
// Every fixture here is SYNTHETIC and generalized: a verdict shape, a claim shape, an availability state.
// None carries a benchmark id, a benchmark subject, or a benchmark question — the defects these lock down
// are properties of the delivery layer, not of any particular case, and a test written against a specific
// question would pass while the class of defect walked straight back in through the next one.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import {
  buildGroundedNarrativePlan, composeGroundedFallback, narrativeIntentOf,
  type GroundedNarrativePlan, type NarrativeIntent, type SharedActionSection,
} from '@/features/chat/server/groundedNarrative';
import {
  buildGroundedActionPlan, formatGroundedActionLine, renderGroundedActionLines, renderGroundedActionSection,
} from '@/features/chat/server/groundedActionPlan';
import { buildConsultationContentPlan } from '@/features/chat/server/consultationContentPlan';
import {
  buildConclusionSurfacePlan, buildTemporalSurfacePlan, closingDirectionOf, conclusionStateOf,
  surfaceRelevanceOf, crossMaterialCorpus,
} from '@/features/chat/server/consultationSurfacePlan';
import { realize, realizeForConsumer, toConsumerIdentifiers } from '@/features/chat/server/koreanRealization';
import { buildUserVisibleAnswer } from '@/features/chat/presentation/userVisibleAnswer';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

// ── SYNTHETIC BUILDERS ───────────────────────────────────────────────────────────────────────────────
const ev = (o: Partial<JudgmentEvidence>): JudgmentEvidence => ({
  fact: '테스트 근거', meaning: '테스트 의미입니다', domain: 'OPPORTUNITY',
  temporalScope: 'NATAL', directness: 'DIRECT', ...o,
});

const mkJudgment = (o: Partial<DivinationJudgment>): DivinationJudgment => ({
  discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT', questionDomain: 'OPPORTUNITY',
  temporalScope: 'NATAL', stance: 'FOR', dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
  directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
  domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG',
  factGroupsUsed: [], ...o,
});

const contribution = (o: Partial<DisciplineContribution>): DisciplineContribution =>
  ({ discipline: 'MYUNGRI', applied: true, stance: 'FOR', contribution: '테스트 기여', ...o });

function mkVerdict(o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  const judgments = o.disciplineJudgments ?? [mkJudgment({
    directEvidence: [ev({ fact: '식상생재', meaning: '실행이 결과로 이어지는 결이 있습니다' })],
    counterEvidence: [ev({ fact: '편관 혼잡', meaning: '외부 압박이 함께 들어옵니다' })],
  })];
  return {
    question: '지금 이 일을 시작해도 될까요?', questionDomain: 'OPPORTUNITY', questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null, asksTiming: false, premises: [],
    primaryConclusion: '지금 구조에서는 진행하실 만합니다.',
    headlinePropositionIds: [], direction: 'FOR', dominantBasis: '명리',
    disciplineJudgments: judgments,
    contributions: judgments.map((j) => contribution({ discipline: j.discipline, stance: j.stance })),
    axisVerdicts: [], propositions: [], agreementPoints: [], contradictionPoints: [],
    contradictionResolutions: [], natalBaseline: null, currentFlow: null, timingConclusion: null,
    favorableFactors: [], riskFactors: [],
    actionableInterpretation: '지금 흐름을 그대로 밀고 가셔도 됩니다.',
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

function sharedAction(plan: GroundedNarrativePlan): SharedActionSection | null {
  const action = buildGroundedActionPlan(plan);
  const section = renderGroundedActionSection(action);
  if (!section) return null;
  return { title: section.title, lines: renderGroundedActionLines(action), format: formatGroundedActionLine };
}

/** The whole composition as one searchable string — how the reader meets it, not field by field. */
const composedText = (plan: GroundedNarrativePlan): string => {
  const c = composeGroundedFallback(plan, sharedAction(plan));
  return [
    c.coreSummary, c.coreInterpretation, c.disposition,
    ...(c.strengths ?? []), ...(c.cautions ?? []),
    ...(c.domainInterpretation ?? []).flatMap((d) => [d.title, d.body]),
    c.futureFlow, ...(c.followUps ?? []),
  ].filter((x): x is string => typeof x === 'string').join('\n');
};

// The generic directional tails the Cross reasoner emits when NO single conclusion owns the direction. They
// are the product's own sentences, quoted here as the exact artifact that must not close an answer whose
// asked-axis authority did not make that call.
const GENERIC_HOLD = '지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.';
const GENERIC_PROCEED = '지금 흐름을 그대로 밀고 가셔도 됩니다.';

// ══ ROOT CAUSE 1 — ONE AUTHORITATIVE CONCLUSION SURFACE ══════════════════════════════════════════════
describe('V6 ROOT CAUSE 1 — the closing sentence is never an independent decision', () => {
  it('A — an OPEN asked-axis verdict cannot end with generic hold/maintain advice', () => {
    const v = mkVerdict({ direction: 'FOR', actionableInterpretation: GENERIC_HOLD });
    expect(conclusionStateOf(v)).toBe('OPEN');
    const surface = buildConclusionSurfacePlan(v);
    expect(surface.closing).not.toBe(GENERIC_HOLD);
    expect(closingDirectionOf(surface.closing!)).not.toBe('HOLD');
    expect(composedText(planFor('DECISION', v))).not.toContain('유지하시는 편이 낫습니다');
  });

  it('B — a BLOCKED asked-axis verdict cannot end with generic proceed advice', () => {
    const v = mkVerdict({
      direction: 'AGAINST', primaryConclusion: '지금은 하지 않으시는 편이 낫습니다.',
      actionableInterpretation: GENERIC_PROCEED,
    });
    expect(conclusionStateOf(v)).toBe('BLOCKED');
    const surface = buildConclusionSurfacePlan(v);
    expect(surface.closing).not.toBe(GENERIC_PROCEED);
    expect(closingDirectionOf(surface.closing!)).not.toBe('PROCEED');
    expect(composedText(planFor('DECISION', v))).not.toContain('그대로 밀고 가셔도 됩니다');
  });

  it('B2 — a consistent directional close is kept verbatim; the surface substitutes, it never rewrites', () => {
    const open = buildConclusionSurfacePlan(mkVerdict({ direction: 'FOR', actionableInterpretation: GENERIC_PROCEED }));
    expect(open.closing).toBe(GENERIC_PROCEED);
    const blocked = buildConclusionSurfacePlan(mkVerdict({ direction: 'AGAINST', actionableInterpretation: GENERIC_HOLD }));
    expect(blocked.closing).toBe(GENERIC_HOLD);
  });

  it('C — MIXED stays MIXED from the headline through the closing sentence', () => {
    for (const d of ['CONDITIONAL_FOR', 'FOR_BUT_LATER', 'AGAINST_FOR_NOW', 'CONDITIONAL_AGAINST'] as Stance[]) {
      const v = mkVerdict({ direction: d, actionableInterpretation: GENERIC_HOLD });
      const surface = buildConclusionSurfacePlan(v);
      expect(conclusionStateOf(v)).toBe('MIXED');
      expect(surface.directional).toBe(false);
      expect(closingDirectionOf(surface.closing!)).toBe('NEUTRAL');
      const text = composedText(planFor('DECISION', v));
      expect(text).toContain(realize(v.primaryConclusion)); // the compound headline survives
      expect(text).not.toContain('유지하시는 편이 낫습니다');
    }
  });

  it('D — UNRESOLVED and INSUFFICIENT stay non-directional end to end', () => {
    for (const d of ['INSUFFICIENT_EVIDENCE', 'INSUFFICIENT_DATA'] as Stance[]) {
      const v = mkVerdict({ direction: d, actionableInterpretation: GENERIC_HOLD });
      const surface = buildConclusionSurfacePlan(v);
      expect(surface.directional).toBe(false);
      expect(closingDirectionOf(surface.closing!)).toBe('NEUTRAL');
      expect(composedText(planFor('DECISION', v))).not.toContain('유지하시는 편이 낫습니다');
    }
  });

  it('T — polarity-reversal fixtures stay faithful from headline through closing, both directions', () => {
    // The two HARD_FAIL shapes, generalized: a favourable headline closed with a hold instruction, and an
    // adverse headline closed with a proceed instruction. Neither may survive into the delivered text.
    const favourable = planFor('DECISION', mkVerdict({
      direction: 'FOR', primaryConclusion: '지금은 진행하셔도 좋은 자리입니다.',
      actionableInterpretation: GENERIC_HOLD,
    }));
    const adverse = planFor('DECISION', mkVerdict({
      direction: 'AGAINST', primaryConclusion: '지금은 벌리지 않으시는 편이 낫습니다.',
      actionableInterpretation: GENERIC_PROCEED,
    }));
    const fav = composedText(favourable);
    expect(fav).toContain('진행하셔도 좋은 자리입니다');
    expect(closingDirectionOf(favourable.conclusionSurface.closing!)).not.toBe('HOLD');
    const adv = composedText(adverse);
    expect(adv).toContain('벌리지 않으시는 편이 낫습니다');
    expect(closingDirectionOf(adverse.conclusionSurface.closing!)).not.toBe('PROCEED');
  });
});

// ══ ROOT CAUSE 2 — QUESTION-AXIS EVIDENCE SURFACE ════════════════════════════════════════════════════
const SPOUSE = ev({
  domain: 'RELATION_STABILITY', fact: '일지 충', meaning: '타고난 배우자 자리 자체가 흔들리는 구조입니다',
});
const ON_AXIS_CAREER = ev({ domain: 'CAREER', fact: '관록 화기', meaning: '사회·직업 자리가 이 흐름에 직접 흔들립니다' });
const ON_AXIS_MONEY = ev({ domain: 'MONEY_INFLOW', fact: '재성 통근', meaning: '재물이 들어오는 통로가 열려 있습니다' });

describe('V6 ROOT CAUSE 2 — grounded is not the same as relevant', () => {
  it('E — off-axis relationship evidence is excluded from an unrelated CAREER answer', () => {
    const v = mkVerdict({
      questionDomain: 'CAREER', question: '지금 회사에 계속 있어도 될까요?',
      disciplineJudgments: [mkJudgment({ directEvidence: [SPOUSE, ON_AXIS_CAREER] })],
    });
    const plan = planFor('DECISION', v);
    expect(composedText(plan)).not.toContain('배우자');
    expect(buildConsultationContentPlan(v).selectedEvidence.map((e) => e.canonicalMeaning))
      .not.toContain(SPOUSE.meaning);
  });

  it('F — off-axis relationship evidence is excluded from an unrelated MONEY answer', () => {
    const v = mkVerdict({
      questionDomain: 'MONEY_INFLOW', question: '마진을 더 남길 수 있을까요?',
      disciplineJudgments: [mkJudgment({ directEvidence: [SPOUSE, ON_AXIS_MONEY] })],
    });
    const plan = planFor('DECISION', v);
    expect(composedText(plan)).not.toContain('배우자');
    // Non-vacuous: the on-axis material really did reach the reader.
    expect(composedText(plan)).toContain('재물이 들어오는 통로');
  });

  it('G — off-axis evidence Cross explicitly ties in STAYS, and is framed with why it matters', () => {
    const v = mkVerdict({
      questionDomain: 'CAREER', question: '이직해도 될까요?',
      disciplineJudgments: [mkJudgment({ directEvidence: [SPOUSE, ON_AXIS_CAREER] })],
      // Exactly how crossReasoner builds a resolution: both assertions quoted verbatim into `conflict`.
      contradictionResolutions: [{
        kind: 'DIFFERENT_DOMAIN', between: ['MYUNGRI', 'ZIWEI'],
        conflict: `명리는 "${ON_AXIS_CAREER.meaning}", 자미두수는 "${SPOUSE.meaning}"`,
        resolution: '직업 쪽 결정은 이 관계 조건이 정리된 뒤에 보시는 편이 맞습니다',
        dominant: 'MYUNGRI', whyOtherDidNotDominate: '테스트',
      }] as CrossDivinationVerdict['contradictionResolutions'],
    });
    const material = crossMaterialCorpus(v);
    expect(surfaceRelevanceOf(
      { domain: SPOUSE.domain, authoritativeMeaning: SPOUSE.meaning }, v.questionDomain, material,
    )).toBe('CROSS_MATERIAL_QUALIFIER');
    const text = composedText(planFor('DECISION', v));
    expect(text).toContain('배우자');
    expect(text).toContain('이 판단에 함께 걸리는 다른 축입니다'); // never an unexplained unrelated fact
  });

  it('H — an action item can never originate from off-axis non-material evidence', () => {
    const v = mkVerdict({
      questionDomain: 'CAREER', question: '승진할 수 있을까요?',
      riskFactors: [{ fact: SPOUSE.fact, meaning: SPOUSE.meaning, domain: SPOUSE.domain, temporalScope: 'NATAL' }],
    } as Partial<CrossDivinationVerdict>);
    const plan = planFor('DECISION', v);
    const action = buildGroundedActionPlan(plan);
    const everyItem = [
      ...action.verifyItems, ...action.supportConditions, ...action.cautionConditions,
      action.proceedCondition, action.holdCondition, action.timingCheckpoint,
    ].filter(Boolean).map((i) => i!.text).join('\n');
    expect(everyItem).not.toContain('배우자');
    expect(renderGroundedActionSection(action)?.body ?? '').not.toContain('배우자');
  });

  it('an unroutable asked axis fails OPEN — nothing is called off-axis when there is no axis to be off', () => {
    const v = mkVerdict({ questionDomain: 'GENERAL' });
    const material = crossMaterialCorpus(v);
    expect(surfaceRelevanceOf(
      { domain: 'RELATION_STABILITY', authoritativeMeaning: SPOUSE.meaning }, v.questionDomain, material,
    )).toBe('SUPPORTING_CONTEXT');
  });
});

// ══ ROOT CAUSE 3 — CONSUMER REALIZATION ══════════════════════════════════════════════════════════════
describe('V6 ROOT CAUSE 3 — no internal identifier reaches the reader', () => {
  // The exact shapes the reasoning layer builds as source-fact ids (see reasoning/myungriPremises.ts).
  const ANCHORS = [
    '일간 강약: STRONG_LEANING (Myungri Structural V2)',
    '상담판정 CAREER: MIXED (Myungri Consultation Judge V1)',
    '억부용신: SELECTED (Myungri Yongshin V1)',
    '자미 판정 (Ziwei Consultation Judge V1)',
    '기문 판정 (Qimen Consultation Judge V1)',
  ];

  it('I — enum, judge-class and version identifiers are mapped to Korean, never delivered raw', () => {
    for (const anchor of ANCHORS) {
      const out = toConsumerIdentifiers(anchor);
      expect(out).not.toMatch(/[A-Z][A-Z0-9]*_[A-Z0-9]+/); // no SCREAMING_SNAKE survives
      expect(out).not.toMatch(/Myungri|Ziwei|Qimen|Judge V\d|Structural V\d/);
    }
    expect(toConsumerIdentifiers(ANCHORS[0])).toContain('명리 판단');
    expect(toConsumerIdentifiers(ANCHORS[1])).toContain('직업');
    expect(toConsumerIdentifiers('UNRESOLVED')).toBe('아직 한 방향으로 단정하기 어려움');
  });

  it('I — the internal derivation arrow never reaches a delivered sentence', () => {
    expect(toConsumerIdentifiers('신호가 함께 잡힙니다. → 원국 월주가 흔들립니다.')).not.toContain('→');
  });

  it('I — a real end-to-end answer carries zero internal identifiers', async () => {
    const r = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?'), realDeps(GOOD_ANSWER));
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const visible = buildUserVisibleAnswer(r.structuredResult).text;
    expect(visible).not.toMatch(/[A-Z][A-Z0-9]*_[A-Z0-9]+/);
    expect(visible).not.toMatch(/Myungri|Ziwei|Qimen|Consultation Judge|Structural V\d|Yongshin V\d/);
    expect(visible).not.toMatch(/\(E\d\)/); // the catalog's own join key is not a consumer label
    expect(visible).not.toContain('→');
  });

  it('J — one claim cannot produce three redundant visible bullets across sections', async () => {
    const r = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?'), realDeps(GOOD_ANSWER));
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const answer = buildUserVisibleAnswer(r.structuredResult);
    // Explanatory sentences are counted; instructions and citations are deliberately allowed to restate a
    // claim, because an action line stripped of its reason is worse than a repeat (see the delivery contract).
    const INSTRUCTIONAL = /^(이렇게 |어느 쪽을 |시점을 |이 결을 |한마디|시기$|전문근거)/;
    const counts = new Map<string, number>();
    for (const s of answer.sections) {
      if (INSTRUCTIONAL.test(s.title)) continue;
      for (const sentence of s.body.split(/\n|(?<=[.!?])\s+/)) {
        const key = sentence.trim().replace(/\s+/g, '');
        if (key.length < 12) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    for (const [, n] of counts) expect(n).toBeLessThan(2);
  });

  it('K — the recurring engine-template morphology defects are repaired', () => {
    // Both come from a status LABEL joined to a fixed particle: a 하다-verbal noun given the noun form, and
    // a consonant-final label given the vowel-final 로.
    expect(realize('원국은 주의가 필요이나, 지금 흐름은 우호적로 나타납니다.'))
      .toBe('원국은 주의가 필요하나, 지금 흐름은 우호적으로 나타납니다.');
    expect(realize('판단 근거 부족로 봅니다.')).toBe('판단 근거 부족으로 봅니다.');
    expect(realize('기회와 리스크가 함께 존재이나 지금은 좁습니다.'))
      .toContain('함께 존재하나');
    // ㄹ-final and vowel-final are already correct and must not be touched.
    expect(realize('이 결과로 봅니다.')).toBe('이 결과로 봅니다.');
    expect(realize('스스로 정하십시오.')).toBe('스스로 정하십시오.');
  });

  it('the consumer pass is idempotent — running it twice changes nothing', () => {
    const s = '일간이 힘을 받는 구조입니다. (근거: 일간 강약: STRONG_LEANING (Myungri Structural V2))';
    expect(realizeForConsumer(realizeForConsumer(s))).toBe(realizeForConsumer(s));
  });
});

// ══ ROOT CAUSE 4 — TEMPORAL SURFACE ══════════════════════════════════════════════════════════════════
const NO_TIME = { years: [], months: [], referenceYear: null, referenceMonth: null, ageMin: null, ageMax: null, timingConclusion: null };

describe('V6 ROOT CAUSE 4 — authoritative timing is surfaced, absent timing is admitted', () => {
  it('L — a grounded month is named, at the narrowest precision the engines produced', () => {
    const plan = buildTemporalSurfacePlan({ ...NO_TIME, years: [2026], months: [202603], referenceYear: 2026 }, false);
    expect(plan.precision).toBe('NARROW');
    expect(plan.text).toContain('2026년 3월');
  });

  it('L — a grounded year is named when no month exists', () => {
    const plan = buildTemporalSurfacePlan({ ...NO_TIME, years: [2027], referenceYear: 2026 }, false);
    expect(plan.precision).toBe('NARROW');
    expect(plan.text).toContain('2027년');
  });

  it('L — only a 대운 span exists ⇒ the broad period is shown WITH its precision limit', () => {
    const plan = buildTemporalSurfacePlan({ ...NO_TIME, ageMin: 28, ageMax: 37 }, false);
    expect(plan.precision).toBe('BROAD');
    expect(plan.text).toContain('28~37세');
    expect(plan.text).toContain('좁은 시점은 지금 근거로는 나누기 어렵습니다');
  });

  it('M — with no temporal authority the answer SAYS so, and offers the grounded checkpoint instead', () => {
    const bare = buildTemporalSurfacePlan(NO_TIME, false);
    expect(bare.precision).toBe('NONE');
    expect(bare.text).toContain('시점을 좁혀 말씀드릴 수 없습니다');
    expect(bare.text).not.toMatch(/\d{4}\s*년|\d{1,2}\s*월|\d{1,3}\s*세/); // nothing invented
    const withCheckpoint = buildTemporalSurfacePlan(NO_TIME, true);
    expect(withCheckpoint.text).toContain('시점 대신 기준으로 삼으십시오');
  });

  it('a timing question delivers the temporal section end to end', async () => {
    const r = await buildServerConsultation(realRequest('언제쯤 움직이는 게 좋을까요?'), realDeps(GOOD_ANSWER));
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const answer = buildUserVisibleAnswer(r.structuredResult);
    const timing = answer.sections.find((s) => s.title === '시기');
    expect(timing).toBeDefined();
    expect(timing!.body.length).toBeGreaterThan(0);
  });
});

// ══ ROOT CAUSE 5 — GROUNDING AVAILABILITY ════════════════════════════════════════════════════════════
const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const SERVER_NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
const EXACT_BIRTH: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
// A SUPPORTED partial profile: the birth time is only approximately known. 자미두수 needs the hour and
// truthfully reports missing_birth_time; 명리 and 기문 do not, and must still be read.
const APPROXIMATE_BIRTH = {
  ...EXACT_BIRTH, birthTimeAccuracy: 'approximate', birthHour: null, birthMinute: null,
  approximateTimePeriod: 'morning',
} as unknown as BirthInfoDraft;
// An UNSUPPORTABLE profile: no birth time AND a birth date on a solar-term boundary, where the 월주 cannot
// be attributed to either side. The engine correctly refuses to invent one — no chart exists at all.
const UNGROUNDABLE_BIRTH = {
  ...EXACT_BIRTH, birthYear: '1996', birthMonth: '10', birthDay: '8',
  birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null, approximateTimePeriod: null,
} as unknown as BirthInfoDraft;

const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분히 진행하실 만한 자리입니다.',
  coreInterpretation: '지금 흐름은 크게 무리하지 않는 선에서 움직이면 결과가 따라오는 결입니다. '
    + '속도를 조절하시면 준비한 만큼 그대로 이어질 수 있고, 서두르면 도리어 흐트러지기 쉽습니다.',
  strengths: ['꾸준함이 힘이 됩니다.'],
  cautions: ['한 번에 크게 벌리지는 마십시오.'],
});
const realDeps = (answer: string, over: Partial<ServerConsultationDeps> = {}): ServerConsultationDeps =>
  ({ digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return answer; }, ...over });
const realRequest = (question: string, birthInput: BirthInfoDraft = EXACT_BIRTH): ServerConsultationRequest =>
  ({ birthInput, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('V6 ROOT CAUSE 5 — a reading with no basis is not a reading', () => {
  it('N — a supported incomplete-time profile uses every legitimately available engine, and claims no other', async () => {
    const r = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?', APPROXIMATE_BIRTH), realDeps(GOOD_ANSWER));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.groundingMeta.grounded).toBe(true);
    expect(r.groundingMeta.engines.myungri).toBe('available');
    // 자미두수 truthfully reports WHY it could not run — never 'available', and never silently counted in.
    expect(r.groundingMeta.engines.ziwei).not.toBe('available');
    expect(r.groundingMeta.engines.ziwei).toBe('missing_birth_time');
  });

  it('O — a zero-engine profile cannot become a successful generic consultation', async () => {
    const r = await buildServerConsultation(
      realRequest('장사가 잘되려면 뭘 먼저 챙겨야 할까요?', UNGROUNDABLE_BIRTH),
      realDeps(GOOD_ANSWER),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    // This fixture is 1996-10-08 with no time — the 절기 경계일 case — so the typed non-success now carries
    // the NARROWER reason. Same outcome (no delivery, no charge); the code just names the fixable input.
    expect(r.reason).toBe('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
    expect(r.message).toContain('태어난 시각');
  });

  it('O — the zero-engine path never calls the model, so no coaching prose can be composed at all', async () => {
    let called = 0;
    const r = await buildServerConsultation(
      realRequest('사업을 시작해도 될까요?', UNGROUNDABLE_BIRTH),
      realDeps(GOOD_ANSWER, { async callLLM() { called += 1; return GOOD_ANSWER; } }),
    );
    expect(r.ok).toBe(false);
    expect(called).toBe(0);
    expect(r).not.toHaveProperty('text');
    expect(r).not.toHaveProperty('structuredResult');
  });
});

// ══ ROOT CAUSE 6 — DELIVERY ══════════════════════════════════════════════════════════════════════════
const EDGE = readFileSync(resolve(process.cwd(), 'supabase/functions/chat/index.ts'), 'utf8');

describe('V6 ROOT CAUSE 6 — the language model is not a delivery single point of failure', () => {
  it('Q — an LLM timeout still delivers the deterministic grounded consultation', async () => {
    const timeout = realDeps('', { async callLLM() { throw new Error('AbortError: timed out'); } });
    const r = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?'), timeout);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.diagnostics?.llmUnavailable).toBe(true);
    expect(r.diagnostics?.groundedFallback).toBe(true);
    expect(r.structuredResult).toBeDefined();
    expect(buildUserVisibleAnswer(r.structuredResult!).text.length).toBeGreaterThan(0);
  });

  it('Q — the deterministic delivery is byte-identical to the same request answered normally-composed', async () => {
    const a = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?'), realDeps(''));
    clearZiweiCache(); clearQimenCache();
    const b = await buildServerConsultation(realRequest('지금 이 일을 시작해도 될까요?'), realDeps(''));
    if (!a.ok || !b.ok) throw new Error('no result');
    expect(a.text).toBe(b.text); // deterministic ⇒ R's idempotent replay is a replay of the same bytes
  });

  it('Q — no regeneration is attempted after an LLM fault; a missed deadline is not retried into it', async () => {
    let calls = 0;
    const r = await buildServerConsultation(
      realRequest('지금 이 일을 시작해도 될까요?'),
      realDeps('', { async callLLM() { calls += 1; return ''; } }),
    );
    expect(r.ok).toBe(true);
    expect(calls).toBe(1);
  });

  it('Q — an internal deadline is enforced on the provider call, ahead of the platform timeout', () => {
    expect(EDGE).toContain('LLM_DEADLINE_MS');
    expect(EDGE).toContain('AbortSignal.timeout(remainingMs)');
    // A TOTAL budget anchored to the server receipt time, so a regeneration cannot extend past it.
    expect(EDGE).toContain('const llmDeadlineAt = startedAt + LLM_DEADLINE_MS');
    expect(EDGE).toContain('callOpenAI(messages, consultationCfg, llmDeadlineAt)');
  });

  it('R — the deterministic answer takes the SAME completion path, so it persists and replays', () => {
    // There is exactly one completion seam; a deterministic answer is an ok result like any other and
    // therefore reaches `complete*` and is stored in `response_json` for the idempotent replay.
    expect(EDGE).toContain("if (row.outcome === 'COMPLETED' && row.response_json");
    expect(EDGE).toContain("return { status: 'completed', response: row.response_json as Record<string, unknown> };");
    expect(EDGE).not.toContain('llmUnavailable'); // the Edge does not branch on it — one delivery path
  });

  it('S — a request that ends without a response records a terminal state instead of staying PROCESSING', () => {
    expect(EDGE).toContain('let heldPaidRequest: PaidRequestContext | null = null;');
    expect(EDGE).toContain('heldPaidRequest = paid.context;');
    expect(EDGE).toContain('if (heldPaidRequest) await releasePaidRequest(heldPaidRequest).catch(() => {});');
  });

  it('P — the no-grounding outcome releases the reservation and commits no Duk', () => {
    // AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED shares this exact branch on purpose — the release calls must
    // stay one code path, so this scan covers both reasons at once.
    const branch = EDGE.slice(
      EDGE.indexOf("if (result.reason === 'GROUNDING_UNAVAILABLE' || result.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED')"),
      EDGE.indexOf('// SUBJECT_FORBIDDEN(403)'),
    );
    expect(branch).toContain('await releasePaidRequest(paid.context);');
    expect(branch).toContain('await releaseDukIfHeld();');
    expect(branch).not.toContain('completeConsultationWithBilling');
    expect(branch).not.toContain('completePaidRequest');
  });
});

// ══ OVERFIT GUARD ════════════════════════════════════════════════════════════════════════════════════
describe('V6 — the repair is structural, never case-specific', () => {
  it('no production source references a benchmark id, subject or question', () => {
    const files = [
      'src/features/chat/server/consultationSurfacePlan.ts',
      'src/features/chat/server/groundedNarrative.ts',
      'src/features/chat/server/groundedActionPlan.ts',
      'src/features/chat/server/consultationContentPlan.ts',
      'src/features/chat/server/koreanRealization.ts',
      'src/features/chat/server/buildServerConsultation.ts',
      'supabase/functions/chat/index.ts',
    ];
    for (const f of files) {
      const src = readFileSync(resolve(process.cwd(), f), 'utf8');
      expect(src).not.toMatch(/B84-\d/);
      expect(src).not.toMatch(/SUBJ-\d/);
    }
  });
});
