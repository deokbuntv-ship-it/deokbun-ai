// CONSULTATION EXPRESSION ARCHITECTURE V1 + QUALITY-94 REPAIR + AUDIT-DRIVEN REMEDIATION V1 — determinism,
// evidence-budget, discipline attribution, and no-new-authority tests. The Content Plan is a pure
// presentation layer: it may select/prioritize/order/group/attribute information the Cross verdict already
// carries, and must never invent a fact, change the verdict, or turn uncertainty into certainty.
import * as fs from 'fs';
import * as path from 'path';

import {
  buildConsultationContentPlan, renderContentPlanDirective, renderVerifiedEvidenceSection, type ContentDomain,
} from '@/features/chat/server/consultationContentPlan';
import { applyVerdictAuthorityClamp } from '@/features/chat/server/buildServerConsultation';
import { renderVerdictDirective, buildDeclinedSummary, declinedReasonCategory, renderEvidenceDirective } from '@/features/divination/verdictDirective';
import type { ConsultationOutcome, ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import type {
  CrossDivinationVerdict, DivinationJudgment, DisciplineContribution, JudgmentDomain, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';

function ev(overrides: Partial<JudgmentEvidence>): JudgmentEvidence {
  return {
    fact: '일지 육합', meaning: '테스트 근거 의미', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL',
    ...overrides,
  };
}

function mkJudgment(overrides: Partial<DivinationJudgment>): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'OPPORTUNITY', temporalScope: 'NATAL', stance: 'FOR',
    dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [],
    timingSignals: [], domainSubJudgments: [],
    confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG',
    factGroupsUsed: [],
    ...overrides,
  };
}

function mkVerdict(overrides: Partial<CrossDivinationVerdict>): CrossDivinationVerdict {
  return {
    question: '지금 이 사업 시작해도 될까?',
    questionDomain: 'OPPORTUNITY',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '테스트 결론',
    headlinePropositionIds: [],
    direction: 'FOR',
    dominantBasis: '명리',
    disciplineJudgments: [
      mkJudgment({
        discipline: 'MYUNGRI',
        directEvidence: [
          ev({ fact: '재성 통근', meaning: '재물이 들어오는 통로가 열려 있습니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
          ev({ fact: '식상생재', meaning: '실행력이 결과로 이어지는 구조입니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'DAEWOON' }),
        ],
        counterEvidence: [
          ev({ fact: '편관 혼잡', meaning: '경쟁이나 외부 압박이 함께 옵니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
        ],
      }),
      mkJudgment({
        discipline: 'ZIWEI',
        directEvidence: [
          ev({ fact: '일지 육합', meaning: '협력 관계가 유리하게 작동합니다', domain: 'RELATION_BOND', directness: 'ADJACENT', temporalScope: 'SEWOON' }),
          ev({ fact: '월지 형', meaning: '초반에 마찰이 있을 수 있습니다', domain: 'CONFLICT', directness: 'GENERAL', temporalScope: 'NATAL' }),
        ],
      }),
      mkJudgment({
        discipline: 'QIMEN',
        directEvidence: [
          ev({ fact: '세운 재성', meaning: '올해 재물운이 함께 들어옵니다', domain: 'MONEY_INFLOW', directness: 'ADJACENT', temporalScope: 'SEWOON' }),
        ],
      }),
    ],
    contributions: [] as DisciplineContribution[],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: ['두 체계 모두 같은 방향을 가리킵니다'],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: '원국에 사업 확장의 바탕이 있습니다',
    currentFlow: '올해 흐름이 그 바탕을 지지합니다',
    timingConclusion: null,
    favorableFactors: [], // no longer the selection source (Root Cause 1 fix) — deliberately unused
    riskFactors: [],
    actionableInterpretation: '단계적으로 확장하며 검증하십시오',
    confidence: 'MEDIUM',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'MYUNGRI', lines: ['재성 통근 — 재물이 들어오는 통로'] }],
    verdictVersion: 'test',
    ...overrides,
  };
}

/** Build a verdict whose single applicable discipline directly supplies the given evidence pool — for tests
 *  that want precise control over what's available without redefining the whole default fixture. */
function verdictWithPool(pool: JudgmentEvidence[], overrides: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  return mkVerdict({ disciplineJudgments: [mkJudgment({ directEvidence: pool })], ...overrides });
}

describe('§1 — evidence budget: never more than 4 items TOTAL', () => {
  it('the default fixture (5 supporting across 3 disciplines + 1 counter) still yields <= 4 selected items', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });

  it('an even richer pool (10 supporting + 5 counter) still yields <= 4 selected items', () => {
    const bigSupport = Array.from({ length: 10 }, (_, i) => ev({ fact: `fact-${i}`, meaning: `meaning-${i}`, directness: 'DIRECT' }));
    const bigCounter = Array.from({ length: 5 }, (_, i) => ev({ fact: `risk-${i}`, meaning: `risk-meaning-${i}`, directness: 'DIRECT' }));
    const plan = buildConsultationContentPlan(mkVerdict({ disciplineJudgments: [mkJudgment({ directEvidence: bigSupport, counterEvidence: bigCounter })] }));
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });
});

describe('§11.2 — selected evidence always derives from the supplied verdict', () => {
  it('every selected item traces back to some applicable discipline\'s directEvidence/counterEvidence', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    const pool = verdict.disciplineJudgments.flatMap((j) => [...j.directEvidence, ...j.counterEvidence]);
    for (const item of plan.selectedEvidence) {
      expect(pool.some((e) => e.fact === item.canonicalTechnicalAnchor && e.meaning === item.canonicalMeaning)).toBe(true);
    }
  });

  it('directAnswerIntent/natalBaseline/periodContext/timingConclusion are verbatim passthroughs', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.directAnswerIntent).toBe(verdict.primaryConclusion);
    expect(plan.natalBaseline).toBe(verdict.natalBaseline);
    expect(plan.periodContext).toBe(verdict.currentFlow);
    expect(plan.timingConclusion).toBe(verdict.timingConclusion);
    expect(plan.proposition).toBe(verdict.question);
  });
});

describe('§11.3/§11.4 — counter-evidence: preserved within budget, never forced', () => {
  it('a verdict with counterEvidence always includes exactly one COUNTER item within the 4-item budget', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const counters = plan.selectedEvidence.filter((e) => e.evidenceRole === 'COUNTER');
    expect(counters.length).toBe(1);
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });

  it('a verdict with NO counterEvidence anywhere selects zero counter items — never fabricated', () => {
    const noCounter = mkVerdict({
      disciplineJudgments: [mkJudgment({ directEvidence: [ev({ fact: 'x', meaning: 'y' })], counterEvidence: [] })],
    });
    const plan = buildConsultationContentPlan(noCounter);
    expect(plan.selectedEvidence.some((e) => e.evidenceRole === 'COUNTER')).toBe(false);
  });

  it('mustNotClaim only warns against hiding counter-evidence when one was actually selected', () => {
    const withRisk = buildConsultationContentPlan(mkVerdict({}));
    const withoutRisk = buildConsultationContentPlan(mkVerdict({
      disciplineJudgments: [mkJudgment({ directEvidence: [ev({ fact: 'x', meaning: 'y' })], counterEvidence: [] })],
    }));
    expect(withRisk.mustNotClaim.some((s) => /반대·주의 근거/.test(s))).toBe(true);
    expect(withoutRisk.mustNotClaim.some((s) => /반대·주의 근거/.test(s))).toBe(false);
  });
});

describe('§2/§11.5 — question relevance: business-fit vs current-business-timing on the SAME chart', () => {
  const pool: JudgmentEvidence[] = [
    ev({ fact: '재성 통근', meaning: '구조적으로 사업 체질이 맞습니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ev({ fact: '질문시 국세', meaning: '지금 이 순간 실행하기 좋은 기운입니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'PRESENT_MOMENT' }),
  ];

  it('a fit-style question (asksTiming=false) ranks the NATAL item first', () => {
    const plan = buildConsultationContentPlan(verdictWithPool(pool, { asksTiming: false }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('NATAL');
  });

  it('a current-timing question (asksTiming=true) ranks the CURRENT item first', () => {
    const plan = buildConsultationContentPlan(verdictWithPool(pool, { asksTiming: true }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('CURRENT');
  });
});

describe('§9/§11.6 — question relevance: wealth-capacity vs current-investment on the SAME chart', () => {
  const pool: JudgmentEvidence[] = [
    ev({ fact: '재백 뿌리', meaning: '평생 재물을 담는 그릇 자체가 큽니다', domain: 'MONEY_INFLOW', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ev({ fact: '세운 재성 도달', meaning: '올해 투자처가 실제로 열립니다', domain: 'MONEY_INFLOW', directness: 'DIRECT', temporalScope: 'SEWOON' }),
  ];

  // V6: the asked axis is now stated on the verdict, matching the money questions this block asks. It used
  // to be left at the fixture default (OPPORTUNITY) while the pool carried MONEY_INFLOW — harmless while
  // ranking ignored relevance, but the V6 surface filter drops evidence about a proposition the question did
  // not ask about, so the fixture has to say which proposition that is.
  const asked = { questionDomain: 'MONEY_INFLOW' } as const;

  it('"재물 그릇이 큰가" (asksTiming=false) leads with the NATAL capacity fact', () => {
    const plan = buildConsultationContentPlan(verdictWithPool(pool, { ...asked, asksTiming: false, question: '재물 그릇이 큰가?' }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('NATAL');
  });

  it('"올해 투자해도 되나" (asksTiming=true) leads with the PERIOD/current fact', () => {
    const plan = buildConsultationContentPlan(verdictWithPool(pool, { ...asked, asksTiming: true, question: '올해 투자해도 되나?' }));
    expect(plan.selectedEvidence[0].temporalRole).not.toBe('NATAL');
  });

  it('the underlying facts are identical either way — only ranking changed, nothing invented', () => {
    const a = buildConsultationContentPlan(verdictWithPool(pool, { ...asked, asksTiming: false }));
    const b = buildConsultationContentPlan(verdictWithPool(pool, { ...asked, asksTiming: true }));
    const anchorsOf = (items: typeof a.selectedEvidence) => [...items.map((e) => e.canonicalTechnicalAnchor)].sort();
    expect(anchorsOf(a.selectedEvidence)).toEqual(anchorsOf(b.selectedEvidence));
  });
});

describe('§11.7 — natal / period / current-situation roles are not silently collapsed', () => {
  it('natalBaseline, periodContext, and timingConclusion stay three distinct fields, never merged', () => {
    const verdict = mkVerdict({ timingConclusion: '올해 하반기가 실행 적기입니다' });
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.natalBaseline).toBe(verdict.natalBaseline);
    expect(plan.periodContext).toBe(verdict.currentFlow);
    expect(plan.timingConclusion).toBe(verdict.timingConclusion);
    expect(new Set([plan.natalBaseline, plan.periodContext, plan.timingConclusion]).size).toBe(3);
  });

  it('evidence roles (NATAL/PERIOD/CURRENT) are individually preserved per item, not reduced to one flag', () => {
    const pool: JudgmentEvidence[] = [
      ev({ fact: 'a', meaning: 'a-meaning', temporalScope: 'NATAL', directness: 'DIRECT' }),
      ev({ fact: 'b', meaning: 'b-meaning', temporalScope: 'DAEWOON', directness: 'DIRECT' }),
      ev({ fact: 'c', meaning: 'c-meaning', temporalScope: 'PRESENT_MOMENT', directness: 'DIRECT' }),
    ];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const roles = new Set(plan.selectedEvidence.map((e) => e.temporalRole));
    expect(roles.size).toBeGreaterThan(1);
  });
});

describe('§11.8 — unresolved remains unresolved', () => {
  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])('direction=%s ⇒ verdictState=DECLINED, mustNotClaim forbids false certainty', (direction) => {
    const plan = buildConsultationContentPlan(mkVerdict({ direction }));
    expect(plan.verdictState).toBe('DECLINED');
    expect(plan.actionBoundary).toBe('CAUTIOUS');
    expect(plan.mustNotClaim.some((s) => /확정된 결론/.test(s))).toBe(true);
  });

  it('a directional verdict is never marked DECLINED', () => {
    expect(buildConsultationContentPlan(mkVerdict({ direction: 'FOR' })).verdictState).toBe('DIRECTIONAL');
  });

  it('no timing basis ⇒ mustNotClaim forbids inventing a date', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ timingConclusion: null }));
    expect(plan.mustNotClaim.some((s) => /날짜|시점/.test(s))).toBe(true);
  });
});

describe('§G/§10 — timing fidelity: a supplied timing conclusion is never disclaimed away', () => {
  it('when timingConclusion exists, mustNotClaim explicitly forbids saying "no timing basis"', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ timingConclusion: '이번 하반기가 실행 적기입니다' }));
    expect(plan.mustNotClaim.some((s) => /시기 근거가 없다/.test(s))).toBe(true);
    expect(plan.mustNotClaim.some((s) => /날짜·시점을 새로 만들지/.test(s))).toBe(false);
  });

  it('when no timingConclusion exists, mustNotClaim forbids inventing one instead', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ timingConclusion: null }));
    expect(plan.mustNotClaim.some((s) => /날짜·시점을 새로 만들지/.test(s))).toBe(true);
    expect(plan.mustNotClaim.some((s) => /시기 근거가 없다/.test(s))).toBe(false);
  });
});

describe('§11.9 — the plan can never change the Cross verdict', () => {
  it('the verdict object is byte-for-byte untouched after building a plan from it', () => {
    const verdict = mkVerdict({});
    const frozen = JSON.parse(JSON.stringify(verdict));
    buildConsultationContentPlan(verdict);
    expect(verdict).toEqual(frozen);
  });

  it('calling twice with deep-equal (not same-reference) verdicts produces a deep-equal plan (determinism)', () => {
    expect(buildConsultationContentPlan(mkVerdict({}))).toEqual(buildConsultationContentPlan(mkVerdict({})));
  });
});

describe('§11.10 — the PROMPT directive is bounded and never dumps every fact', () => {
  it('the directive never renders more than 4 evidence bullet lines', () => {
    const bigFavorable = Array.from({ length: 12 }, (_, i) => ev({ fact: `fact-${i}`, meaning: `meaning-${i}`, directness: 'DIRECT' }));
    const plan = buildConsultationContentPlan(verdictWithPool(bigFavorable));
    const text = renderContentPlanDirective(plan);
    const bulletLines = text.split('\n').filter((l) => /^\s*- \[(뒷받침|반대\/주의)\]/.test(l));
    expect(bulletLines.length).toBeLessThanOrEqual(4);
  });

  it('at most 3 domain facets are ever mentioned, never the full reference list', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const text = renderContentPlanDirective(plan);
    const facetLine = text.split('\n').find((l) => l.includes('질문 영역'));
    const mentionedCount = plan.facets.filter((f) => facetLine?.includes(f.label)).length;
    expect(mentionedCount).toBeLessThanOrEqual(3);
  });

  it('opens with a direct-answer-first instruction, before any evidence/facet content', () => {
    const text = renderContentPlanDirective(buildConsultationContentPlan(mkVerdict({})));
    expect(text.split('\n')[0]).toMatch(/직접 답/);
  });

  it('an empty-evidence plan still renders a valid, non-crashing directive', () => {
    const plan = buildConsultationContentPlan(mkVerdict({
      disciplineJudgments: [mkJudgment({ directEvidence: [], counterEvidence: [] })],
    }));
    const text = renderContentPlanDirective(plan);
    expect(text).toContain(plan.domain);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('§H/§11.11 — Verdict Authority Clamp remains downstream and final', () => {
  const richResult: ParsedStructuredConsultation = {
    coreSummary: 'B가 안전합니다.',
    coreInterpretation: '기다리는 편이 낫습니다.',
    strengths: [], cautions: [], domainInterpretation: [], futureFlow: '', followUps: [],
  };
  const accepted = (result: ParsedStructuredConsultation): ConsultationOutcome => ({ kind: 'ACCEPTED', result });

  it('a declined verdict clamps coreSummary to a question-aware, non-directional sentence, regardless of any Content Plan content', () => {
    const verdict = mkVerdict({ direction: 'INSUFFICIENT_EVIDENCE' });
    buildConsultationContentPlan(verdict); // the plan runs; the clamp is a SEPARATE, later step and cannot see it
    const out = applyVerdictAuthorityClamp(accepted(richResult), verdict);
    expect(out?.coreSummary).toBe(buildDeclinedSummary(verdict));
    expect(out?.coreSummary).toMatch(/확정하기 어렵습니다/);
    expect(out?.coreSummary).not.toContain('안전합니다');
  });

  it('applyVerdictAuthorityClamp is still a pure, 2-argument, synchronous function (no new dependency on the Content Plan)', () => {
    expect(applyVerdictAuthorityClamp.length).toBe(2);
  });
});

describe('no numeric vote/scoring logic was introduced', () => {
  it('the implementation file contains no weighted-sum or vote-counting pattern', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8');
    expect(src).not.toMatch(/score\s*\+=|weight\s*\*|votes?\s*\+\+|\.reduce\(\(.*(score|weight|vote)/i);
  });

  it('ranking is a fixed 3-key ordinal tuple compare, not a summed/weighted number', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8');
    expect(src).toMatch(/a\[0\]\s*-\s*b\[0\]\s*\|\|\s*a\[1\]\s*-\s*b\[1\]\s*\|\|\s*a\[2\]\s*-\s*b\[2\]/);
  });
});

describe('§9 — cross-synthesis material is COMPLETE and surfaced only from the verdict\'s own fields', () => {
  it('synthesis.agreements carries ALL agreementPoints, not just the first', () => {
    const verdict = mkVerdict({ agreementPoints: ['첫 번째 일치', '두 번째 일치'] });
    expect(buildConsultationContentPlan(verdict).synthesis?.agreements).toEqual(['첫 번째 일치', '두 번째 일치']);
  });

  it('synthesis.scopeSeparations carries ALL contradictionResolutions, not just the first', () => {
    const verdict = mkVerdict({
      agreementPoints: [],
      contradictionResolutions: [
        { conflict: '명리는 유리, 기문은 불리', resolution: '원국은 유리하나 상황판은 지금 불리합니다', dominant: 'QIMEN', kind: 'DIFFERENT_TIMESCALE', between: ['MYUNGRI', 'QIMEN'], whyOtherDidNotDominate: '시점 축이 아니어서' },
        { conflict: '자미는 유리, 명리는 불리', resolution: '명궁은 유리하나 원국은 걸림', dominant: 'ZIWEI', kind: 'DIFFERENT_DOMAIN', between: ['MYUNGRI', 'ZIWEI'], whyOtherDidNotDominate: '축이 달라서' },
      ],
    });
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.synthesis?.scopeSeparations).toEqual([
      { conflict: '명리는 유리, 기문은 불리', resolution: '원국은 유리하나 상황판은 지금 불리합니다' },
      { conflict: '자미는 유리, 명리는 불리', resolution: '명궁은 유리하나 원국은 걸림' },
    ]);
  });

  it('no agreement and no contradiction resolution ⇒ synthesis is null, never fabricated', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ agreementPoints: [], contradictionResolutions: [] }));
    expect(plan.synthesis).toBeNull();
  });

  it('the directive requires ALL synthesis material be reflected, not cherry-picked, and never a flat per-system list', () => {
    const text = renderContentPlanDirective(buildConsultationContentPlan(mkVerdict({})));
    expect(text).toMatch(/종합하십시오/);
    expect(text).toMatch(/일부만 골라 쓰지 말고/);
  });
});

describe('domain differentiation — same verdict shape, different domain ⇒ different facets', () => {
  const DOMAINS: JudgmentDomain[] = ['OPPORTUNITY', 'MONEY_INFLOW', 'CAREER', 'RELATION_BOND', 'MOVEMENT'];
  const plans = DOMAINS.map((questionDomain) => buildConsultationContentPlan(mkVerdict({ questionDomain })));

  it('each domain resolves to a distinct ContentDomain', () => {
    expect(new Set(plans.map((p) => p.domain)).size).toBe(plans.length);
  });

  it('an unroutable domain (e.g. HEALTH_ENERGY) falls back to GENERAL, not a fabricated one', () => {
    expect(buildConsultationContentPlan(mkVerdict({ questionDomain: 'HEALTH_ENERGY' })).domain).toBe('GENERAL');
  });
});

describe('provenance — the plan identifies itself, and only itself, as its own source', () => {
  it('plan.provenance is the fixed content-plan tag, never a divination engine tag', () => {
    expect(buildConsultationContentPlan(mkVerdict({})).provenance).toEqual(['deokbunai.consultation-content-plan.v1']);
  });

  it('each catalog item carries the discipline + evidence-array it was pooled from', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    for (const item of plan.selectedEvidence) {
      expect(item.provenance).toMatch(/^(MYUNGRI|ZIWEI|QIMEN):(directEvidence|counterEvidence|timingSignals)$/);
      expect(item.provenance.startsWith(item.discipline)).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════
// §14 — AUDIT-DRIVEN REMEDIATION V1 required tests (A-I)
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('§14.A — Ziwei technical identity: no cross-palace/star substitution or invention', () => {
  it('부처 evidence cannot become 명궁 in the rendered verified evidence — only supplied facts appear', () => {
    const pool: JudgmentEvidence[] = [ev({ fact: '부처궁 태양 화록', meaning: '배우자 궁에 유리한 기운이 있습니다', directness: 'DIRECT' })];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    expect(rendered.some((r) => r.body.includes('부처궁'))).toBe(true);
    expect(rendered.some((r) => r.body.includes('명궁'))).toBe(false);
  });

  it('명궁 evidence cannot become 부처 in the rendered verified evidence', () => {
    const pool: JudgmentEvidence[] = [ev({ fact: '명궁 자미 화권', meaning: '본인 자리에 주도권이 들어옵니다', directness: 'DIRECT' })];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    expect(rendered.some((r) => r.body.includes('명궁'))).toBe(true);
    expect(rendered.some((r) => r.body.includes('부처'))).toBe(false);
  });

  it('no 관록 fact appears in verified evidence unless one was actually supplied', () => {
    const pool: JudgmentEvidence[] = [ev({ fact: '재백궁 무곡', meaning: '재물 자리에 안정적인 힘이 있습니다', directness: 'DIRECT' })];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    expect(rendered.some((r) => r.body.includes('관록'))).toBe(false);
  });

  it('no 화기 fact appears in verified evidence unless one was actually supplied', () => {
    const pool: JudgmentEvidence[] = [ev({ fact: '명궁 자미 화권', meaning: '본인 자리에 주도권이 들어옵니다', directness: 'DIRECT' })];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    expect(rendered.some((r) => r.body.includes('화기'))).toBe(false);
  });
});

describe('§14.B — technical relationship integrity: no cross-item recombination', () => {
  it('each rendered verified-evidence body contains exactly one item\'s own anchor, never a blend of two', () => {
    const pool: JudgmentEvidence[] = [
      ev({ fact: '재성 통근', meaning: '재물 통로가 열려 있습니다', directness: 'DIRECT' }),
      ev({ fact: '식상생재', meaning: '실행력이 결과로 이어집니다', directness: 'DIRECT' }),
    ];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    // V6 groups the citations by DISCIPLINE (the per-item "(E1)" heading put an internal id in front of the
    // reader), so two items from one system now share a section — as separate LINES. The property under test
    // is unchanged and still exact: an anchor never blends into another item's sentence.
    for (const line of rendered.flatMap((r) => r.body.split('\n'))) {
      const anchorsMentioned = ['재성 통근', '식상생재'].filter((a) => line.includes(a));
      expect(anchorsMentioned.length).toBe(1);
    }
  });
});

describe('§14.C — "전문근거" is built from the supplied VerifiedEvidenceCatalog, deterministically', () => {
  // V6 §INTERNAL TOKEN BAN — one section per DISCIPLINE, and the catalog id never reaches a heading. Every
  // item still renders its own exact anchor+meaning line, which is what "built from the catalog" meant.
  it('every catalog item renders its exact anchor+meaning, grouped under its discipline and with no id', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    const lines = rendered.flatMap((r) => r.body.split('\n'));
    expect(rendered.length).toBe(new Set(plan.selectedEvidence.map((e) => e.discipline)).size);
    for (const item of plan.selectedEvidence) {
      expect(lines).toContain(`${item.canonicalMeaning} (근거: ${item.canonicalTechnicalAnchor})`);
      for (const r of rendered) expect(r.title).not.toContain(item.id);
    }
  });

  it('each item carries a stable local id (E1, E2, …) in final selected order', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.selectedEvidence.map((e) => e.id)).toEqual(plan.selectedEvidence.map((_, i) => `E${i + 1}`));
  });

  it('calling the renderer twice on the same catalog produces byte-identical output — no LLM, no randomness', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(renderVerifiedEvidenceSection(plan.selectedEvidence)).toEqual(renderVerifiedEvidenceSection(plan.selectedEvidence));
  });
});

describe('§14.D — declined headline: question-specific, still non-directional', () => {
  it('two different questions produce two different declined headlines', () => {
    const a = buildDeclinedSummary(mkVerdict({ question: '올해 하반기 재물운은 어때?', direction: 'INSUFFICIENT_EVIDENCE' }));
    const b = buildDeclinedSummary(mkVerdict({ question: '지금 이 사람과 결혼해도 괜찮을까?', direction: 'INSUFFICIENT_EVIDENCE' }));
    expect(a).not.toBe(b);
  });

  it('the headline never contains a directional word regardless of verdict content', () => {
    const DIRECTIONAL_WORDS = /좋습니다|나쁩니다|추천합니다|하십시오|하세요\b|해야 합니다|낫습니다|안전합니다|권합니다/;
    for (const direction of ['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'] as Stance[]) {
      for (const question of ['올해 이직해도 될까?', '전 애인과 다시 만날 수 있을까?', '사업을 접어야 할까?']) {
        const summary = buildDeclinedSummary(mkVerdict({ question, direction }));
        expect(summary).not.toMatch(DIRECTIONAL_WORDS);
        expect(summary).toMatch(/확정하기 어렵습니다/);
      }
    }
  });

  it('declinedReasonCategory is a deterministic mapping of existing verdict fields, never a new status', () => {
    expect(declinedReasonCategory(mkVerdict({ contradictionPoints: ['상충'] }))).toBe('CROSS_SCOPE_CONFLICT');
    expect(declinedReasonCategory(mkVerdict({
      contradictionPoints: [],
      disciplineJudgments: [mkJudgment({ applicable: false })],
    }))).toBe('PARTIAL_COVERAGE');
    expect(declinedReasonCategory(mkVerdict({ contradictionPoints: [], disciplineJudgments: [mkJudgment({ applicable: true })] })))
      .toBe('DIRECT_EVIDENCE_INSUFFICIENT');
  });
});

describe('§14.E — coverage gap != calculation failure', () => {
  it('the non-applied-discipline directive line forbids "실패"/"오류" wording and states applicability-only framing', () => {
    const verdict = mkVerdict({
      contributions: [{ discipline: 'QIMEN', applied: false, stance: 'NOT_APPLICABLE', contribution: '이번 질문에는 적용 범위 밖입니다' }],
    });
    const text = renderVerdictDirective(verdict);
    expect(text).toContain('계산 실패');
    expect(text).toContain('오류');
    expect(text).toMatch(/판단 경로가 없습니다/);
    // the forbidding instruction names the words to avoid; it must not itself read as an engine-malfunction claim
    expect(text).not.toMatch(/기문둔갑\s*계산\s*(은|이)\s*실패로 제공되지/);
  });
});

describe('§14.F — atomic stance: two-clause meanings survive whole, never split', () => {
  it('a supporting+limiting two-clause meaning is rendered verbatim, both halves present', () => {
    const twoSided = '연락 가능성은 있지만 지금은 밀어붙일 때가 아닙니다';
    const pool: JudgmentEvidence[] = [ev({ fact: '재회 궁 형충', meaning: twoSided, directness: 'DIRECT' })];
    const plan = buildConsultationContentPlan(verdictWithPool(pool));
    const rendered = renderVerifiedEvidenceSection(plan.selectedEvidence);
    expect(rendered[0].body).toContain(twoSided); // whole string, not truncated at "있지만"
  });
});

describe('§14.G — supplied timing conclusion is never rendered as absent', () => {
  it('renderVerdictDirective includes the actual timingConclusion text when one exists, not a "no basis" line', () => {
    const verdict = mkVerdict({ timingConclusion: '이번 대운 동안은 실행에 유리합니다' });
    const text = renderVerdictDirective(verdict);
    expect(text).toContain('이번 대운 동안은 실행에 유리합니다');
    expect(text).not.toContain('시기 근거는 없습니다');
  });
});

describe('§14.H — Cross verdict authority: unchanged by any presentation-layer step', () => {
  it('building a content plan does not touch disciplineJudgments/contributions/direction', () => {
    const verdict = mkVerdict({});
    const before = JSON.parse(JSON.stringify(verdict));
    buildConsultationContentPlan(verdict);
    renderVerifiedEvidenceSection(buildConsultationContentPlan(verdict).selectedEvidence);
    expect(verdict).toEqual(before);
  });
});

describe('§14.I — fabricated technical facts are structurally impossible through the normal render path', () => {
  it('renderVerifiedEvidenceSection takes no free-text/LLM parameter — its only input is the catalog itself', () => {
    expect(renderVerifiedEvidenceSection.length).toBe(1);
  });

  it('an empty catalog renders an empty section list, never a placeholder fact', () => {
    expect(renderVerifiedEvidenceSection([])).toEqual([]);
  });
});

// Type-level smoke: ContentDomain must stay assignable from the 7 judge domains + GENERAL.
const _domainCheck: ContentDomain[] = ['BUSINESS', 'MONEY', 'CAREER', 'LOVE', 'REUNION', 'CHANGE', 'TIMING', 'GENERAL'];
void _domainCheck;

// NULL-CONTRIBUTOR REPAIR — a discipline that only reported a COVERAGE GAP is not a third opinion. Before
// this, REUNION-09's Myungri judgment carried exactly one line ("명리에서 이 축을 직접 보는 경로가 아직
// 채택되어 있지 않습니다"), which became "전문근거 · 명리 (E1)" and was offered to the composer as a fact to
// cite — so the answer was composed, and scored, against a system holding nothing.
describe('coverage-gap judgments do not enter the evidence pool', () => {
  const gap = ev({
    fact: '질문 축 REUNION', meaning: '명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않다.',
    domain: 'GENERAL', directness: 'DIRECT', temporalScope: 'UNSCOPED', coverageGap: true,
  });
  const nullMyungri = mkJudgment({
    discipline: 'MYUNGRI', stance: 'INSUFFICIENT_EVIDENCE', evidenceStrength: 'NONE',
    dominantConclusion: '명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.',
    directEvidence: [gap],
  });
  const realZiwei = mkJudgment({
    discipline: 'ZIWEI',
    directEvidence: [ev({ fact: '천이궁 화록', meaning: '움직이는 자리에 실익이 붙습니다', domain: 'OPPORTUNITY', directness: 'DIRECT' })],
  });

  it('drops the gap line instead of materializing it as user-facing 전문근거', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ disciplineJudgments: [nullMyungri, realZiwei] }));
    expect(plan.selectedEvidence.map((e) => e.discipline)).toEqual(['ZIWEI']);
    expect(renderVerifiedEvidenceSection(plan.selectedEvidence)
      .some((s) => s.body.includes('채택되어 있지'))).toBe(false);
  });

  it('keeps a gap-carrying discipline whose OTHER lines are real findings', () => {
    const mixed = mkJudgment({
      discipline: 'MYUNGRI', stance: 'INSUFFICIENT_EVIDENCE', evidenceStrength: 'NONE',
      directEvidence: [gap, ev({ fact: '일간 강약', meaning: '일간이 신약한 구조입니다', domain: 'OPPORTUNITY', directness: 'DIRECT' })],
    });
    const plan = buildConsultationContentPlan(mkVerdict({ disciplineJudgments: [mixed, realZiwei] }));
    expect(plan.selectedEvidence.map((e) => e.canonicalTechnicalAnchor).sort()).toEqual(['일간 강약', '천이궁 화록']);
  });

  it('does not offer a null contributor as a fact the composer may cite', () => {
    const verdict = mkVerdict({
      disciplineJudgments: [nullMyungri, realZiwei],
      evidenceReferences: [
        { discipline: 'MYUNGRI', lines: ['명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.'] },
        { discipline: 'ZIWEI', lines: ['천이궁 화록 — 움직이는 자리에 실익이 붙습니다'] },
      ],
    });
    const directive = renderEvidenceDirective(verdict);
    expect(directive).toContain('천이궁 화록');
    expect(directive).not.toContain('채택되어 있지');
    // The record itself is untouched — the withholding stays visible and the fact corpus stays as wide.
    expect(verdict.evidenceReferences).toHaveLength(2);
  });
});
